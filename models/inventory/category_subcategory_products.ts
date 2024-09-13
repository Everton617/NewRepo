import { prisma } from"lib/prisma";

interface ICatSubcatProductData {
    teamId: string,
    category_product_id: string,
    category_subcategory_id: string
}

interface ICategorySubcategoryProductWhere {
    teamId: string,
    category_product_id?: string,
    category_subcategory_id?: string,
    category_product?: { productId?: string }, 
}

const selects = {
      id: true,
      teamId: true,
      category_product_id: true,
      category_subcategory_id: true,
      createdAt: true,
      updatedAt: true,
};

export async function createCategory_SubCategory_Product(_data: ICatSubcatProductData) {
    return await prisma.category_SubCategory_Product.create({
        data: _data
    });
}

export async function createManyCategory_SubCategory_Product(_data: ICatSubcatProductData[]) {
    return await prisma.category_SubCategory_Product.createManyAndReturn({
        data: _data,
        select: {
          id: true,
          category_subcategory: {
            select: {
              id: true,
              createdAt: true,
              subcategory: {
                select: {id: true, name: true, createdAt: true}
              }
            }
          }
        }
    })
}

export async function getAllCategorySubCategoryProducts(teamId: string, id: string) {
    return await prisma.category_SubCategory_Product.findMany({
        where: {teamId, category_subcategory_id: id},
        select: {category_product: {select: {product: true}}}
    });
}

export async function getUniqueCategorySubcategoryProduct(teamId: string, id: string) {
    return await prisma.category_SubCategory_Product.findFirst({
        where: {teamId, id}
    });
}

export async function removeProductFromCategorySubcategory(teamId: string, id: string) {
    return await prisma.category_SubCategory_Product.delete({
        where: {teamId, id}
    });
}

export async function findCategorySubcategoryProductsByFilters(_where: ICategorySubcategoryProductWhere) {
    return await prisma.category_SubCategory_Product.findMany({
        where: _where,
        select: selects,
    });
}
