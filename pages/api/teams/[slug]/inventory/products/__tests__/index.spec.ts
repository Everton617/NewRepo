import { createMocks } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "lib/prisma";

import authHandler from "pages/api/auth/join";
import indexHandler from "../index";
import { getAllInventoryProducts } from "models/inventory/products";
import { seedProducts } from "lib/utils/seeds";
import { getCurrentUserWithTeam } from "models/team";
import { findCategorySubcategoryProductsByFilters } from "models/inventory/category_subcategory_products";
import { seedUniqueUser } from "@/lib/utils/user";
import { wipeAccount } from "@/lib/utils/database";

import util from "node:util";

jest.mock("models/team", () => {
    const teamModels = jest.requireActual("models/team");

    return {
        ...teamModels,
        getCurrentUserWithTeam: jest.fn(),
        throwIfNoTeamAccess: jest.fn(() => true)
    }
});

describe("\n > (integration) inventory/products/index\n", () => {

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    describe("GET", () => {
        it("(200) should return all inventory products", async () => {
            await seedProducts(global.team.id);
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
            });

            await indexHandler(req, res);
            const productsDB = await getAllInventoryProducts(global.team.id, {});
            const response = res._getJSONData();
            console.log(util.inspect(response, {showHidden: false, depth: null, showProxy: false}));
            expect(Array.isArray(response.inventoryProducts)).toBe(true);
            expect(productsDB.length).toBe(response.inventoryProducts.length);
        });

        it.todo("(200) should return all products with name filtering");
        it.todo("(200) should return all products with code filtering");
    }) 

    describe("POST", () => {
        it("(200) should create a new product and return it", async () => {
            const category = await prisma.inventoryCategory.create({
                data: {
                    name: "Bebidas",
                    teamId: global.team.id
                }
            }); 
            const productToCreate = {
                name: "coca",
                salePrice: 5.90,
                stockQuant: 2,
            };
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                body: {
                    product: productToCreate,
                    categoryId: category.id
                },
                method: "POST",
            });
            
            await indexHandler(req, res);
            const response = res._getJSONData();
            expect(res._getStatusCode()).toBe(200);
            expect(req.body.product).toStrictEqual(productToCreate);
            expect(response.product.id).toBe(response.category_product.product.id);
            expect(response).toStrictEqual(expect.objectContaining({
                message: "product created successfully",
                product: {
                    id: expect.any(String),
                    name: productToCreate.name,
                    imageUrl: null,
                    code: null,
                    description: null,
                    purchasePrice: null,
                    salePrice: productToCreate.salePrice,
                    stockQuant: productToCreate.stockQuant,
                    supplier: null,
                    unitOfMeasure: null,
                }
            }));
        });


        it("(200) should create a new product, add it to its category subcategories, and return it", async () => {
            const subcategory = await prisma.inventorySubCategory.create({data: {name: "sucos", teamId: global.team.id}});
            const category = await prisma.inventoryCategory.create({data: {name: "Bebidas",teamId: global.team.id}}); 
            const category_subcategory = await prisma.category_SubCategory.create({
                data: {teamId: global.team.id, categoryId: category.id, subCategoryId: subcategory.id}
            });
            const productToCreate = {
                name: "coca",
                salePrice: 5.90,
                stockQuant: 2,
            };
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                body: {
                    product: productToCreate,
                    categoryId: category.id,
                    category_subcategories: [category_subcategory.id]
                },
                method: "POST",
            });
            
            await indexHandler(req, res);

            const category_subcategory_products = await prisma.category_SubCategory_Product.findMany({});
            const response = res._getJSONData();
            const data = await findCategorySubcategoryProductsByFilters({
                teamId: global.team.id,
                category_product_id: response.category_product.id
            })

            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
            expect(res._getStatusCode()).toBe(200);
            expect(category_subcategory_products.length).toBeGreaterThan(0);

        });

        it("(403) should return not authorized in attempts to create a product with a code that is already registered.", async () => {
            const category = await prisma.inventoryCategory.create({data: {name: "Bebidas",teamId: global.team.id}}); 
            const productToCreate = {
                name: "feijoada",
                code: "125",
                salePrice: 5.90,
                stockQuant: 2,
            };
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                body: {
                    product: productToCreate,
                    categoryId: category.id,
                },
                method: "POST",
            });
            
            await indexHandler(req, res);
            const response = res._getJSONData();
            expect(res._getStatusCode()).toBe(403);
            expect(response.message).toBe("Product code already registered");
        });
    });

    describe("PATCH", () => {
        it.todo("(201) should update a product and return it");
    });
});
