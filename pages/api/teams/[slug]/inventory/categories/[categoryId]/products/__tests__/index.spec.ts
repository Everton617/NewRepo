import { createMocks } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "lib/prisma";

import indexHandler from "../index";
import { randomUUID } from "node:crypto";

describe("\n > (integration) inventory/categories/[_categoryId]/index\n", () => {
    let globalCategory: any;

    beforeAll( async () => {

      globalCategory = await prisma.inventoryCategory.create({
        data: {name: "Chaveiros", teamId: global.team.id}
      });          

    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    describe("GET", () => {
        it("(200) should return all category products", async () => {
            const category = 
                await prisma.inventoryCategory.create({
                    data: {name: "Joias", teamId: global.team.id}
            });

            const dataProducts =
                await prisma.inventoryProduct.createManyAndReturn({
                    data: [
                        {name: "colar",salePrice: 2.9, stockQuant: 2, teamId: global.team.id},
                        {name: "pulseira",salePrice: 2.9, stockQuant: 2, teamId: global.team.id},
                        {name: "pingente",salePrice: 2.9, stockQuant: 2, teamId: global.team.id}
                    ]
            });

            const tempProds = dataProducts.map(prod => ({productId: prod.id, categoryId: category.id, teamId: global.team.id}))

            const dataCategoryProducts = await prisma.category_Product.createManyAndReturn({
                    data: tempProds
            });

            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
                query: {
                    _categoryId: category.id
                }
            });

            await indexHandler(req, res);
            const response = res._getJSONData();
            const responseIds = response.categoryProducts.map((x: any) => (x.id));
            const catProdIds = dataCategoryProducts.map((x: any) => (x.id));
            let areEqual = true;
            catProdIds.forEach((x, index) => {
                if (x !== responseIds[index]) {
                    areEqual = false;
                    return;
                }
            });
            expect(res._getStatusCode()).toBe(200);
            expect(areEqual).toBe(true);
        });

        it("(404) should return Category Id not found", async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
                query: {
                    _categoryId: randomUUID() 
                }
            });

            await indexHandler(req, res);
            expect(res._getStatusCode()).toBe(404);
        });
    });

    describe("POST", () => {
        it("(200) should add a product to a category", async () => {
            const category = 
                await prisma.inventoryCategory.create({
                    data: {name: "Eletronicos", teamId: global.team.id}
            });
            const product =
                await prisma.inventoryProduct.create({
                    data: {name: "Iphone", salePrice: 2.9, stockQuant: 2, teamId: global.team.id}
            });
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "POST",
                query: {
                    _categoryId: category.id
                },
                body: {
                    categoryId: category.id,
                    productId: product.id
                }
            });

            await indexHandler(req, res);        
            const response = res._getJSONData();
            expect(res._getStatusCode()).toBe(200);
            expect(response.message).toBeTruthy();
            expect(response.category_product_id).toBeTruthy();
            expect(response.product).toBeTruthy();
            expect(response.category).toBeTruthy();
        });
    });

});
