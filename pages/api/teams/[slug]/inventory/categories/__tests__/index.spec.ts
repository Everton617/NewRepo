import { createMocks } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";

import indexHandler from "../index";
import { seedCategories } from "@/lib/utils/seeds";

describe("\n > (integration) inventory/categories/index\n", () => {

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    describe("GET", () => {
        it("(200) should return all inventory categories.", async () => {
            await seedCategories(global.team.id);
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
            });

            await indexHandler(req, res);
            const response = res._getJSONData();
            expect(res._getStatusCode()).toBe(200);
            expect(response.categories).toBeTruthy();
        });
    });

    describe("POST", () => {
        it("(200) should create a category and return it.", async () => {
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "POST",
                body: {
                    category: {
                        name: "Roupas"
                    } 
                }
            });

            await indexHandler(req, res);
            const response = res._getJSONData();           
            expect(res._getStatusCode()).toBe(200);
            expect(response.message).toBeTruthy();
            expect(response.category).toBeTruthy();
        });
    });

});
