import { ApiError } from '@/lib/errors';
import { getAllEvoContacts } from 'models/evoInstance';
import { getCurrentUserWithTeam, throwIfNoTeamAccess } from 'models/team';
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
      case 'DELETE':
      default:
        res.setHeader('Allow', 'POST, DELETE');
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

    if (!user.team.evo_instance_key) throw new ApiError(500, "no instance key available");
    // create an instance if dont exist, for some reason, with the team slug 
    
    const contacts = await getAllEvoContacts(user.team.slug, user.team.evo_instance_key);
    const message = contacts.length === 0 ? "you dont have contacts or you are not connected" : "GET contacts successfully";
    return res.json({message, contacts: contacts.map((contact: any) => {
        return {
            evoId: contact.id, contactName: contact.pushName, profilePicUrl: contact.profilePictureUrl,
        }
    })});
}
