import { createMocks } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "lib/prisma";

import idHandler from "../[id]";
import { randomUUID } from "crypto";

describe("\n > (integration) inventory/subcategories/[id]\n", () => {

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    describe("GET", () => {
        it("(200) should return a unique subcategory.", async () => {
            const subcategory = await prisma.inventorySubCategory.create({data: {teamId: global.team.id, name: "sucos"}});
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
                query: { id: subcategory.id }
            });

            await idHandler(req, res);
            const response = res._getJSONData();
            expect(res._getStatusCode()).toBe(200);
            expect(response).toBeTruthy();
            expect(response.id).toBe(subcategory.id);
            expect(response).toStrictEqual({
                id: expect.any(String),
                name: expect.any(String),
                createdAt: expect.any(String)
            });
        });
        it("(404) should return id not found.", async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
                query: { id: randomUUID() }
            });

            await idHandler(req, res);
            const response = res._getJSONData();
            expect(res._getStatusCode()).toBe(404);
            expect(response.message).toBeTruthy();
        });
    });
    describe("PATCH", () => {
        it.todo("(200) should patch a subcategory.");
        it.todo("(404) should return id not found.");
    });
    describe("DEL", () => {
        it("(200) should delete a subcategory.", async () => {
            const subcategory = await prisma.inventorySubCategory.create({data: {teamId: global.team.id, name: "cortinas"}});
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "DELETE",
                query: { id: subcategory.id }
            });

            await idHandler(req, res);
            const response = res._getJSONData();
            expect(res._getStatusCode()).toBe(200);
            expect(response.message).toBeTruthy();
        });
        it("(404) should return id not found.", async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
                query: { id: randomUUID() }
            });

            await idHandler(req, res);
            const response = res._getJSONData();
            expect(res._getStatusCode()).toBe(404);
            expect(response.message).toBeTruthy();
        });
    });
});


