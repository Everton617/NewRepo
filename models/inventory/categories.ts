import { prisma } from "lib/prisma";

const _selects = {id: true, name: true};

interface ICategoryWhereFilter {
    teamId: string,
    name?: string
};

export async function getAllInventoryCategories(teamId: string) {
    return await prisma.inventoryCategory.findMany({
        where: { teamId: teamId },
        select: _selects
    });
}

export async function getInventoryCategoriesByFilters(_where: ICategoryWhereFilter) {
    return await prisma.inventoryCategory.findFirst({
        where: _where
    })
}

export async function getUniqueInventoryCategory(teamId: string, id: string) {
    return await prisma.inventoryCategory.findFirst({
        where: {id: id, teamId: teamId},
        select: _selects
    });
}

export async function createInventoryCategory(teamId: string, data: any) {
    return await prisma.inventoryCategory.create({
        data: { ...data, teamId: teamId },
        select: _selects
    });
}

export async function deleteCategory(teamId: string, id: string) {
    return await prisma.inventoryCategory.delete({
        where: {teamId: teamId, id: id}
    });
}
