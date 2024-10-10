import { ApiError } from '@/lib/errors';
import { throwIfNoAccessToApiKey } from '@/lib/guards/team-api-key'; // Adjust the import path based on your project structure
import { throwIfNoTeamAccess } from 'models/team';
import { getOrders } from 'models/order';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import NextAuth  from 'next-auth';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { teamId } = await throwIfNoTeamAccess(req, res);
    console.log("TEAM ID: ", teamId)
    switch (req.method) {
      case 'GET':
        await handleGET(req, res, teamId);
        break;
      default:
        res.setHeader('Allow', 'GET, POST, DELETE, PATCH');
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;
    res.status(status).json({ error: { message } });
  }
}
async function handleGET(req: NextApiRequest, res: NextApiResponse, teamId: string) {
  try {
    const apiKeyId = req.headers['api-key'] as string;
    if (!apiKeyId) {
      throw new ApiError(400, 'API key ID is required in the headers');
    }
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new ApiError(401, 'Authorization header is required');
    }
    await throwIfNoAccessToApiKey(apiKeyId, teamId);
    const token = authHeader.split(' ')[1]; // Extract Bearer token from 'Bearer <token>'
    if (!token) {
      throw new ApiError(401, 'Bearer token is missing');
    }
    const orders = Array.from(await getOrders(teamId));
    console.log('Got orders successfully:', orders);
    return res.status(200).json({ orders });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.status).json({ error: { message: error.message } });
    }
    return res.status(500).json({ error: { message: 'Failed to fetch orders' } });
  }
}