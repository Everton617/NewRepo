import { prisma } from "@/lib/prisma";

const selects = {
    id: true,
    name: true,
    imageUrl: true,
    code: true,
    description: true,
    supplier: true,
    unitOfMeasure: true,
    salePrice: true,
    purchasePrice: true,
    stockQuant: true,
}

export async function getAllInventoryProducts(teamId: string, where: any) {
    where["teamId"] = teamId;
    return await prisma.inventoryProduct.findMany({
        where: where,
        select: {
          ...selects,
          Category_Product: {
            select: {
              id: true,
              createdAt: true,
              category: {select: {id: true, name: true, createdAt: true}},
              Category_SubCategory_Product: {
                select: {
                  id: true,
                  createdAt: true,
                  category_subcategory: {
                    select: {
                      id: true,
                      createdAt: true,
                      subcategory: {select: {id: true, name: true, createdAt: true}}
                    }
                  }
                }
              }
            }
          }
        } 
    });
}

export async function createInventoryProduct(product: any, teamId: string) {
    return await prisma.inventoryProduct.create({
        data: {
            ...product,
            teamId: teamId
        },
        select: {
            ...selects,
        }
    })
}

export async function getInventoryProductById(id: string, teamId: string) {
    return await prisma.inventoryProduct.findFirst({
        where: {id: id, teamId: teamId},
        select: {...selects, createdAt: true} 
    })
}

export async function getInventoryProductByCode(code: string, teamId: string) {
    return await prisma.inventoryProduct.findUnique({
        where: {code: code, teamId: teamId}
    })
}

export async function deleteInventoryProduct(id: string, teamId: string) {
    return await prisma.inventoryProduct.delete({
        where: {id: id, teamId: teamId}
    });
}

export async function updateInventoryProduct(id: string, teamId: string, data: any) {
    return await prisma.inventoryProduct.update({
        where: {id: id, teamId: teamId},
        data: data,
        select: selects
    });
}
