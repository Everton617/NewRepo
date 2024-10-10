import { prisma } from "lib/prisma";
import { createMocks } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";

export async function seedUniqueUser(authHandler: any, {teamName, slug, name}: any) {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        body: {
            name: "hierro",
            password: "12345678",
            email: "hierro@hierro.com",
            team: teamName,
            telephone: "987522972",
            category: "Pessoa Física",
            idNumber: "06607061486",
            cep: "59158210",
            address: "Rua Senador Agenor Maria",
            storeQuantity: "Mais de uma loja",
            orderQuantity: "≅50",
        },
        method: "POST",
    });

    await authHandler(req, res);

    const team = await prisma.team.findFirst({where: {slug}});
    const user = await prisma.user.findFirst({where: {name}});

    if (!team) throw new Error("team not found");
    if (!user) throw new Error("user not found");

    return {
        user,
        team
    }
};
