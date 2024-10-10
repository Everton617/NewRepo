import { prisma } from "@/lib/prisma";  
  
export interface IContainer {  
    id?: string,  
    name: string,  
};  
  
const containerSelects = {  
    id: true,  
    name: true,
}  
  
export async function createContainer(container: any) {  
    return await prisma.container.create({  
        data: container  
    });  
}  
  
export async function deleteContainer(containerId: string) {  
    return await prisma.container.delete({  
        where: { id: containerId }  
    })  
}  
  
export async function updateContainer(id: string, container: any) {  
    return await prisma.container.update({  
        where: { id: id },  
        data: container,
        select: containerSelects
    })  
}  
  
export async function getContainers(teamId: string) {  
    return await prisma.container.findMany({  
        where: { teamId: teamId },
        select: containerSelects
    })  
}  
  
export async function getUniqueContainer(id: string, teamId: string) {  
    return await prisma.container.findFirst({  
        where: { id: id, teamId: teamId },
        select: containerSelects
    });  
}  
  

