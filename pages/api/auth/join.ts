import { hashPassword } from '@/lib/auth';
import { slugify } from '@/lib/server-common';
import { sendVerificationEmail } from '@/lib/email/sendVerificationEmail';
import { isEmailAllowed } from '@/lib/email/utils';
import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { createTeam, getTeam, isTeamExists} from 'models/team';
import { createUser, getUser } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { getInvitation, isInvitationExpired } from 'models/invitation';
import { validateRecaptcha } from '@/lib/recaptcha';
import { slackNotify } from '@/lib/slack';
import { Team } from '@prisma/client';
import { createVerificationToken } from 'models/verificationToken';
import { userJoinSchema, validateWithSchema } from '@/lib/zod';
import { createEvoInstance } from 'models/evoInstance';

// TODO:
// Add zod schema validation

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'POST');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Signup the user
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.accountFeatures.creation) throw new ApiError(402, "'Account creation' not available");
  const { 
      name, password, team, 
      telephone,category, idNumber, cep, address,
      storeQuantity, orderQuantity, 
      inviteToken, recaptchaToken } = req.body;

  await validateRecaptcha(recaptchaToken);

  const invitation = inviteToken
    ? await getInvitation({ token: inviteToken })
    : null;

  let email: string = req.body.email;

  // When join via invitation
  if (invitation) {
    if (await isInvitationExpired(invitation.expires)) {
      throw new ApiError(400, 'O convite expirou. Por Favor solicite um novo.');
    }

    if (invitation.sentViaEmail) {
      email = invitation.email!;
    }
  }

  validateWithSchema(userJoinSchema, {
    name, email, password,
    telephone, category, idNumber,
    cep, address, storeQuantity, orderQuantity
  });

  if (!isEmailAllowed(email)) {
    throw new ApiError(
      400,
      `Atualmente, aceitamos apenas endereços de e-mail comerciais para inscrição. Use seu e-mail comercial para criar uma conta. Se você não tiver um e-mail comercial, sinta-se à vontade para entrar em contato com nossa equipe de suporte para obter assistência.`
    );
  }

  if (await getUser({ email })) {
    throw new ApiError(400, 'Já existe um usuário com este e-mail.');
  }

  // Check if team name is available
  if (!invitation) {
    if (!team) {
      throw new ApiError(400, 'É necessário um nome para a sua Loja.');
    }

    const slug = slugify(team);

    validateWithSchema(userJoinSchema, { team, slug });

    const slugCollisions = await isTeamExists(slug);

    if (slugCollisions > 0) {
      throw new ApiError(400, 'Já existe uma Loja com esse nome.');
    }
  }

  const user = await createUser({
    name, email,
    password: await hashPassword(password),
    emailVerified: invitation ? new Date() : null,
    telephone: telephone, 
    category: category,
    idNumber: idNumber, 
    cep: cep, 
    address: address, 
    storeQuantity: storeQuantity, 
    orderQuantity: orderQuantity
  });

  let userTeam: Team | null = null;

  // Create team if user is not invited
  // So we can create the team with the user as the owner
  if (!invitation) {
    userTeam = await createTeam({
      userId: user.id,
      name: team,
      slug: slugify(team),
    });


    await createEvoInstance(team);

  } else {
    userTeam = await getTeam({ slug: invitation.team.slug });
  }

  // Send account verification email
  if (env.confirmEmail && !user.emailVerified) {
    const verificationToken = await createVerificationToken({
      identifier: user.email,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await sendVerificationEmail({ user, verificationToken });
  }

  recordMetric('user.signup');

  slackNotify()?.alert({
    text: invitation
      ? 'Novo usuário cadastrado por meio de convite'
      : 'Novo usuário cadastrado',
    fields: {
      Name: user.name,
      Email: user.email,
      Team: userTeam?.name,
    },
  });

  res.status(201).json({
    data: {
      confirmEmail: env.confirmEmail && !user.emailVerified,
    },
  });
};
