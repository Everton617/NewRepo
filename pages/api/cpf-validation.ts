import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method !== "GET") return res.status(403).json({message: "method not allowed"});
    const cpf = req.body.cpf;

    const response = await fetch(`https://api.invertexto.com/v1/validator?token=8410%7CT9nBXqRqA1voBGFBrHUZF6VHuSPu7sTc&value=${cpf}`);
    if (!response.ok) throw new Error("error in cpf validation");

    const data = await response.json();
    if (data.status === 'valid') {
      return res.status(200).json({ valid: true });
  } else {
      return res.status(200).json({ valid: false });
  }

}
