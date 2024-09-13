import { prisma } from "lib/prisma";

interface ICategorySubcategoryData {
    teamId: string,
    categoryId: string,
    subCategoryId: string
}

export async function getAllCategorySubcategories(teamId: string, categoryId: string) {
    return await prisma.category_SubCategory.findMany({
        where: {teamId, categoryId},
        select: {
          id: true,
          createdAt: true,
          category: {
            select: {id: true, name: true, createdAt: true},
          },
          subcategory: {
            select: {id: true, name: true, createdAt: true}
          }
        }
    });
}

export async function getManyCategorySubcategories(teamId: string, _ids: string[]) {
    return await prisma.category_SubCategory.findMany({
        where: {
            teamId,
            id: {in: _ids}
        }
    });
}

export async function createCategorySubcategory(_data: ICategorySubcategoryData) {
    return await prisma.category_SubCategory.create({
        data: _data,
        select: {
            id: true,
            category: true,
            subcategory: true
        }
    });
}

export async function subcategoryAlreadyInCategory(_data: ICategorySubcategoryData) {
    return await prisma.category_SubCategory.findFirst({where: _data});
}

export async function getUniqueCategorySubcategory(teamId: string, id: string) {
    return await prisma.category_SubCategory.findFirst({
        where: {teamId, id},
    });
}
