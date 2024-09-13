import { ApiError } from '@/lib/errors';
import { createUniqueContactLabel, getContactLabelByLC, getUniqueContactLabel, removeLabelfromContact } from 'models/contactLabel';
import { getCurrentUserWithTeam, throwIfNoTeamAccess } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await throwIfNoTeamAccess(req, res);

    switch (req.method) {
      case 'POST':
        await handlePOST(req, res);
        break;
      case 'DELETE':
        await handleDELETE(req, res);
        break;
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

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);

    // throw if not allowed?
    const labelId = req.body.labelId;
    const contactId = req.body.contactId;

    if (!labelId || !contactId) throw new Error("invalid argument");
    
    // prevent user from registered the same contactLabel
    if (await getContactLabelByLC(labelId, contactId, user.team.id)) throw new ApiError(500, "label already in the contact");

    await createUniqueContactLabel(labelId, contactId, user.team.id);
    return res.json({message: "label saved successfully to the contact"});
}


async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    
    // throw if not allowed?
    const contactLabelId = req.body.contactLabelId;

    if (!contactLabelId) throw new Error("invalid argument");

    if (!await getUniqueContactLabel(contactLabelId, user.team.id)) throw new Error("label is not in the contact's labels or does not exist");

    await removeLabelfromContact(contactLabelId);

    return res.json({message: "label removed from contact!"});
}
