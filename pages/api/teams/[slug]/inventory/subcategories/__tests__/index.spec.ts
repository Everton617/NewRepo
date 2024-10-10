import { createMocks } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "lib/prisma";

import authHandler from "pages/api/auth/join";
import indexHandler from "../index";
import { getCurrentUserWithTeam } from "models/team";
import { seedUniqueUser } from "@/lib/utils/user";
import { wipeAccount } from "@/lib/utils/database";
import { seedSubcategories } from "@/lib/utils/seeds";

describe("\n > (integration) inventory/subcategories/index\n", () => {

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    describe("GET", () => {
        it("(200) should return all inventory subcategories.", async () => {
            await seedSubcategories(global.team.id);
            const subcategories = JSON.parse(JSON.stringify(await prisma.inventorySubCategory.findMany({
                select: {id: true, name: true, createdAt: true}
            })));
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
            });
            
            await indexHandler(req, res);
            const response = res._getJSONData();
            expect(res._getStatusCode()).toBe(200);
            expect(Array.isArray(response.subCategories)).toBe(true);
            expect(response.subCategories.length).toBeGreaterThan(0);
            expect(response.subCategories).toStrictEqual(subcategories);
        });
    });
    describe("POST", () => {
        it("(200) should create a subcategorie and return it.", async () => {
            const postSubcategory = {name: "sucos"};
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "POST",
                body: {
                    subcategory: postSubcategory
                }
            });
            
            await indexHandler(req, res);
            const response = res._getJSONData();
            expect(res._getStatusCode()).toBe(200);
            expect(response.message).toBeTruthy()
            expect(response.newSubcategory).toBeTruthy();
            expect(response.newSubcategory).toStrictEqual(expect.objectContaining({
                id: expect.any(String),
                name: expect.any(String),
            }));
            expect(response.newSubcategory.name).toBe(postSubcategory.name);
        });
    });
});


