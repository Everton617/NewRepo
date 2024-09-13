import { prisma } from "lib/prisma";

export async function seedProducts(teamId: string) {
    const products = await prisma.inventoryProduct.createManyAndReturn({
        data: [
            {name: "suco", code: "125", salePrice: 2.9, stockQuant: 2, teamId: teamId},
            {name: "feijao", salePrice: 2.9, stockQuant: 2, teamId: teamId},
            {name: "cuzcuz", salePrice: 2.9, stockQuant: 2, teamId: teamId},
        ]
    });

    const category = await prisma.inventoryCategory.create({
        data: {name: "Chaves", teamId}
    });

    const subcategory = await prisma.inventorySubCategory.create({
        data: {name: "ferro", teamId}
    });

    const categorySubcategory = await prisma.category_SubCategory.create({
        data: {categoryId: category.id, subCategoryId: subcategory.id, teamId}
    });

    const datamap = products.map(prod => ({
        productId: prod.id,
        teamId,
        categoryId: category.id
    }));

    const categoryProducts = await prisma.category_Product.createManyAndReturn({
        data: datamap
    });

    await prisma.category_SubCategory_Product.create({
        data: {
            category_subcategory_id: categorySubcategory.id,
            category_product_id: categoryProducts[0].id,
            teamId
        }
    });

    return products;
}

export async function seedSubcategories(teamId: string) {
    return await prisma.inventorySubCategory.createManyAndReturn({
        data: [
            {name: "sucos", teamId},
            {name: "refrigerantes", teamId},
            {name: "petiscos", teamId},
        ],
        select: {id: true, name: true, createdAt: true}
    });
}

export async function seedCategories(teamId: string) {
    return await prisma.inventoryCategory.createMany({
        data: [
            {name: "Bebidas", teamId},
            {name: "Carnes", teamId},
            {name: "Combos", teamId},
            {name: "Especiais", teamId},
        ]
    });
}
