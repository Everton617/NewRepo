import { prisma } from "lib/prisma";

const _selects = {id: true, name: true, createdAt: true};

export async function getAllInventorySubCategories(teamId: string) {
    return await prisma.inventorySubCategory.findMany({
        where: {teamId: teamId},
        select: _selects
    });
}

export async function createInventorySubCategory(teamId: string, data: any) {
    return await prisma.inventorySubCategory.create({
        data: {teamId: teamId, ...data},
        select: _selects
    });
}

export async function getUniqueInventorySubCategory(teamId: string, id: string) {
    return await prisma.inventorySubCategory.findFirst({
        where: {teamId: teamId, id: id},
        select: _selects
    });
}

export async function getManyInventorySubCategory(teamId: string, data: any) {
    return await prisma.inventorySubCategory.findMany({
        where: {
            teamId: teamId,
            id: {in: data}
        } 
    })
}

export async function deleteUniqueInventorySubCategory(teamId: string, id: string) {
    return await prisma.inventorySubCategory.delete({
        where: {teamId: teamId, id: id}
    })
}
