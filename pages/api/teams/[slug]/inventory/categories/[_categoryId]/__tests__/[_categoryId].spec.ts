import { createMocks } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "lib/prisma"

import indexHandler from "../index";
import { randomUUID } from "crypto";

describe("\n > (integration) inventory/categories/index\n", () => {
  let globalCategory: any;

  beforeAll(async() => {
    globalCategory = await prisma.inventoryCategory.create({data: 
      {name: "Bebidas Secas", teamId: global.team.id}
    });
  });

  afterEach(() => {
      jest.clearAllMocks();
      jest.resetModules();
  });

    describe("GET", () => {
        it("(200) should return a unique category by an ID", async () => {
            
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
                query: {
                    _categoryId: globalCategory.id
                }
            });

            await indexHandler(req, res);
            const response = res._getJSONData();
            console.log(response);
            expect(res._getStatusCode()).toBe(200);
            expect(response).toStrictEqual(expect.objectContaining({
                id: expect.any(String),
                name: expect.any(String)
            }));
        });

        it("(404) should return ID not found", async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
                query: {
                    _categoryId: randomUUID() 
                }
            });

            await indexHandler(req, res);
            const response = res._getJSONData();
            expect(res._getStatusCode()).toBe(404);
            expect(response.message).toBeTruthy();
        });
    });

    describe("DEL", () => {
        it("(200) should delete a category by an ID", async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "DELETE",
                query: {
                    _categoryId: globalCategory.id 
                }
            });

            await indexHandler(req, res);
            const response = res._getJSONData();         
            expect(res._getStatusCode()).toBe(200);
            expect(response.message).toBeTruthy();
        });

        it("(404) should return ID not found", async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "DELETE",
                query: {
                    _categoryId: randomUUID() 
                }
            });

            await indexHandler(req, res);
            const response = res._getJSONData();
            expect(res._getStatusCode()).toBe(404);
            expect(response.message).toBeTruthy();
        });
    });

    describe("PATCH", () => {
        it.todo("(200) should patch a category by an ID");
        it.todo("(404) should return ID not found");
    });

});
