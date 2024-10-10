import { randomUUID } from "node:crypto";
import { createMocks } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "lib/prisma";

import { getCurrentUserWithTeam } from "models/team";

import idHandler from "../[id]";

describe("\n > (integration) /inventory/products/[id]\n", () => {

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    describe("GET", () => {
        it("(200) should return a unique product by its ID", async () => {
            const product = await prisma.inventoryProduct.create({
                data: {
                    name: "feijoada",
                    salePrice: 5.90,
                    stockQuant: 2,
                    teamId: global.team.id
                }
            });
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
                query: { id: product.id }
            });
            
            await idHandler(req, res);
            const response = res._getJSONData();
            expect(res._getStatusCode()).toBe(200);
            expect(response.product).toBeTruthy();
            expect(response.product.id).toBe(product.id);
        });

        it("(404) should return product id not found message", async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
                query: { id: "12134" }
            });
            
            await idHandler(req, res);
            const response = res._getJSONData();
            expect(res._getStatusCode()).toBe(404);
            expect(response.product).toBeFalsy();
        });
    });

    describe("DEL", () => {
        it("(200) should delete a product and return success message", async () => {
            const product = await prisma.inventoryProduct.create({
                data: {
                    name: "feijoada",
                    salePrice: 5.90,
                    stockQuant: 2,
                    teamId: global.team.id
                }
            });
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "DELETE",
                query: { id: product.id }
            });
            
            await idHandler(req, res);
            const response = res._getJSONData();
            expect(res._getStatusCode()).toBe(200);
            expect(response.product).toBeFalsy();
            expect(response.message).toBeTruthy();
        });

        it("(403) should return user not allowed", async () => {
            (getCurrentUserWithTeam as jest.Mock).mockReset();
            (getCurrentUserWithTeam as jest.Mock).mockResolvedValueOnce({
                user: global.user,
                team: global.team,
                role: "MEMBER"
            });
            const product = await prisma.inventoryProduct.create({
                data: {
                    name: "feijoada",
                    salePrice: 5.90,
                    stockQuant: 2,
                    teamId: global.team.id
                }
            });
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "DELETE",
                query: { id: product.id }
            });
            
            await idHandler(req, res);
            const response = res._getJSONData();
            expect(res._getStatusCode()).toBe(403);
            expect(response.product).toBeFalsy();
            expect(response.error.message).toBeTruthy();
        });
        it("(404) should return product id not found", async () => {
            const product = await prisma.inventoryProduct.create({
                data: {
                    name: "feijoada",
                    salePrice: 5.90,
                    stockQuant: 2,
                    teamId: global.team.id
                }
            });
            const wrongId = randomUUID();
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "DELETE",
                query: { id:  wrongId}
            });
            
            await idHandler(req, res);
            const response = res._getJSONData();
            expect(res._getStatusCode()).toBe(404);
            expect(response.message).toBeTruthy();
            expect(product.id === wrongId).toBe(false);
        });
    });

    describe("PATCH", () => {
      it("(200) should update a product and return it with success message", async () => {

        const product = await prisma.inventoryProduct.create({data: 
          {name: "suco de uva", code: "#AAEERR", salePrice: 2.9, stockQuant: 2, teamId: global.team.id},
        });
        const category = await prisma.inventoryCategory.create({data: 
          {name: "Bebes", teamId: global.team.id}
        })
        await prisma.category_Product.create({data: 
          {productId: product.id, categoryId: category.id, teamId: global.team.id}
        });
        
        const newName = "suco de maracuja";
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: "PATCH",
          query: { id:  product.id},
          body: {
            changes: {
              name: newName
            }
          }
        });
        await idHandler(req, res);
        const response = res._getJSONData();
        expect(res._getStatusCode()).toBe(200);
        expect(response.message).toBeTruthy();
        expect(response.product).toBeTruthy();
        expect(response.product.name === newName).toEqual(true);
        expect(response.product.name).toEqual(newName);
      });

      it.todo("(403) should return user not allowed");
      it.todo("(404) should return product id not found");
      it.todo("(422) should return schema validation error");
    });
});
