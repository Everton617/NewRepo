import { prisma } from "lib/prisma";
import { deleteEvoInstance } from "models/evoInstance";

export async function wipeAccount(slug: string) {
    const team = await prisma.team.findFirst({where: {slug}});
    if (!team) throw new Error("team not found");
    await deleteEvoInstance(team.slug);
    await prisma.user.deleteMany({});
    await prisma.team.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.teamMember.deleteMany({});
}
