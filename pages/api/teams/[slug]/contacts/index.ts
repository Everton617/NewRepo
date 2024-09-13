import { validateWithSchema } from '@/lib/zod';
import { newLabelsSchema } from '@/lib/zod/label.schema';
import { newContactSchema } from '@/lib/zod/teamContact.schema';
import { createContactLabels } from 'models/contactLabel';
import { createTeamContact, getAllTeamContacts, getCurrentUserWithTeam, throwIfNoTeamAccess } from 'models/team';
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
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST');
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
  console.log(req.query);  
  throwIfNotAllowed(user, "team_contact", "read");  

  const where = {};  
  if (req.query.name) where['name'] = { contains: req.query.name };  
  if (req.query.labels) {  
      const reqLabels = req.query.labels;  
      const labels = Array.isArray(reqLabels) ? reqLabels : reqLabels.split(",");  
      where['ContactLabel'] = { some: { label: { name: { in: labels } } } };  
  }  
  const withLabels = req.query.withLabels === "true" ? true : false;  

  const contacts = await getAllTeamContacts(user.team.id, withLabels, where);  
  console.log('Contacts with labels:', contacts); // Log para verificar os dados retornados  
  return res.json({ contacts });  
}  

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);

    throwIfNotAllowed(user, "team_contact", "create");

    // validate with schema
    console.log(user);
    console.log(req.body.contact);
    const contactInfo = validateWithSchema(newContactSchema, req.body.contact);
    const labels = req.body.labels ?? [];

    // check if contact is already registered
    const newContact = await createTeamContact(contactInfo, user.team.id);


    if (labels.length > 0) await createContactLabels(
        validateWithSchema(newLabelsSchema, labels), 
        newContact.id, 
        user.team.id
    );

    return res.json({message: "contact created!", newContact: {...newContact, labels}});
}