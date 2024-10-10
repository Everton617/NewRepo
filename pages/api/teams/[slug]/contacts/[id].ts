import { ApiError } from '@/lib/errors';
import { deleteUniqueTeamContact, getCurrentUserWithTeam, getUniqueTeamContact, throwIfNoTeamAccess, updateTeamContact } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await throwIfNoTeamAccess(req, res);

    switch (req.method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'POST':
      case 'PUT':
        await handlePUT(req, res);
        break;
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, PUT, DELETE');
        res.status(405).json({
          error: { message: `Method ${req.method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_contact", "read");

    const contactId = req.query.id;
    const withLabel = req.query.withLabels === "true" ? true : false;
    if (!contactId) throw new ApiError(500, "contact id not provided");
    const teamContact =  await getUniqueTeamContact(contactId as string, user.team.id, withLabel);

    if (!teamContact) return res.status(404).json({message: "team contact not found"});
    return res.json({contact: teamContact});
}

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_contact", "update");

    const contactId = req.query.id;
    if (!contactId) throw new ApiError(500, "contact id not provided");

    if (!await getUniqueTeamContact(contactId as string, user.team.id, false)) return res.status(404).json({message: "team contact not found"});

    const contactData = req.body.contact;
    if (!contactData) return res.status(500).json({message: "contact data to be updated must be provided"});

    await updateTeamContact(contactId as string, user.team.id, contactData);

    return res.json({message: "contact updated!"});
}

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);

    throwIfNotAllowed(user, "team_contact", "delete");

    const contactId = req.query.id;
    if (!contactId) throw new ApiError(500, "contact id is required");
    if (!await getUniqueTeamContact(contactId as string, user.team.id, false))
        return res.status(404).json({message: "this contact was already deleted or does not exist"});
    await deleteUniqueTeamContact(contactId as string, user.team.id);

    return res.json({message: "contact deleted!"});
}

