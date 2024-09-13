import { createMocks } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "lib/prisma";

import authHandler from "pages/api/auth/join";
import indexHandler from "../index";
import { getCurrentUserWithTeam } from "models/team";
import { seedUniqueUser } from "@/lib/utils/user";
import { wipeAccount } from "@/lib/utils/database";
import { randomUUID } from "crypto";
import { getAllCategorySubcategories } from "models/inventory/category_subcategories";

jest.mock("models/team", () => {
    const teamModels = jest.requireActual("models/team");

    return {
        ...teamModels,
        getCurrentUserWithTeam: jest.fn(),
        throwIfNoTeamAccess: jest.fn(() => true)
    }
});

describe("\n > (integration) inventory/categories/index\n", () => {
    const login = {teamName: "hierro team", slug: "hierro-team", name: "hierro"}
    let globalUser: any;
    let globalTeam: any;
    let globalCategory: any;

    beforeAll( async () => {

        try {
            await prisma.$connect();
        } catch (error) {console.warn(error); throw new Error("Error connecting to database");}

        try {
           const { team, user } = await seedUniqueUser(authHandler, login);
           globalUser = user;
           globalTeam = team;

           globalCategory = await prisma.inventoryCategory.create({
                data: {name: "Chaveiros", teamId: globalTeam.id}
           });

        } catch (error) { console.warn(error); throw new Error();}

    });

    afterAll( async () => {
        try {
            await wipeAccount(globalTeam.slug);
        } catch(error) {
            console.error(error);
        } finally {
            await prisma.$disconnect();
        }


    });

    beforeEach(() => {
        (getCurrentUserWithTeam as jest.Mock).mockReset();
        (getCurrentUserWithTeam as jest.Mock).mockResolvedValueOnce({
            user: globalUser,
            team: globalTeam,
            role: "OWNER"
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    describe("GET", () => {
        it("(200) should return a unique category by an ID", async () => {
          const subcategory = await prisma.inventorySubCategory.create({data: {name: "fofos", teamId: globalTeam.id}})
          await prisma.category_SubCategory.create({data: {categoryId: globalCategory.id, subCategoryId: subcategory.id, teamId: globalTeam.id}})
            
            const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
                method: "GET",
                query: {
                    _categoryId: globalCategory.id
                }
            });

            const subs = await getAllCategorySubcategories(globalTeam.id, globalCategory.id);
            console.log("subs", subs);

            await indexHandler(req, res);
            const response = res._getJSONData();
            console.log(response);
            expect(res._getStatusCode()).toBe(200);
        });

    });
});
