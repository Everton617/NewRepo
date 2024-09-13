import { prisma } from"lib/prisma";

interface ICategoryProductData {
    teamId: string,
    productId: string,
    categoryId: string,
}

export async function addProductToCategory(_data: ICategoryProductData) {
    return await prisma.category_Product.create({
        data: _data,
        select: {
            id: true,
            category: true,
            product: true
        }
    });
};

export async function productAlreadyInCategory(_data: ICategoryProductData) {
    if (await prisma.category_Product.findFirst({where: _data})) return true;
    return false;
}

export async function getAllCategoryProducts(teamId: string, categoryId: string) {
    return await prisma.category_Product.findMany({
        where: {teamId: teamId, categoryId: categoryId},
        select: {id: true, createdAt: true, product: true}
    })
}

export async function getUniqueCategoryProduct(id: string) {
    return await prisma.category_Product.findFirst({
        where: {id}
    });
}

export async function removeProductFromCategory(teamId: string, id: string) {
    return await prisma.category_Product.delete({
        where: {teamId: teamId, id}
    })
}

export async function deleteCategoryProductByProductId(teamId: string, productId: string) {
  return await prisma.category_Product.deleteMany({
    where: {teamId, productId}
  })
}
