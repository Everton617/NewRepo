import { prisma } from '@/lib/prisma';

export async function getAllLabels(teamId: string, where: any) {
    where['teamId'] = teamId;
    return await prisma.label.findMany({
        where: where,
        select: {
            id: true,
            name: true,
            emoji: true
        }
    });
}

export async function createLabel({name, emoji}: any, teamId: string){
    return await prisma.label.create({
        data: {
            name: name,
            emoji: emoji,
            teamId: teamId
        } 
    });
}

export async function getUniqueLabel(id: string, teamId: string){
    return await prisma.label.findFirst({
        where: {id: id, teamId: teamId}
    })
}

export async function deleteUniqueLabel(id: string, teamId: string){
    return await prisma.label.delete({
        where: {id: id, teamId: teamId}
    })
}
export async function updateLabel(labelId: string, labelData: any, teamId: string){
    return await prisma.label.update({
        where: {id: labelId, teamId: teamId},
        data: labelData
    })
}
