import { prisma } from '@/lib/prisma';

export async function getAllContactLabels(){}
export async function getContactLabelByLC(labelId: string, contactId: string, teamId: string) {
    return await prisma.contactLabel.findFirst({
        where: {
            labelId: labelId,
            contactId: contactId,
            teamId: teamId
        }
    });
}
export async function getUniqueContactLabel(id: string, teamId: string) {
    return await prisma.contactLabel.findFirst({
        where: {
            id: id,
            teamId: teamId
        }
    });
}
export async function createUniqueContactLabel(labelId: string, contactId: string, teamId: string) {
    return await prisma.contactLabel.create({
        data: {
            contactId: contactId, 
            labelId: labelId,
            teamId: teamId
        }
    });
}
export async function createContactLabels(labelsData: any[], contactId: string, teamId: string){
    const labels = labelsData.map(label => {return {labelId: label.labelId, contactId: contactId, teamId: teamId}});

    return await prisma.contactLabel.createMany({
        data: labels 
    });
}
export async function removeLabelfromContact(id: string){
    return await prisma.contactLabel.delete({
        where: {id: id}
    })   
}
