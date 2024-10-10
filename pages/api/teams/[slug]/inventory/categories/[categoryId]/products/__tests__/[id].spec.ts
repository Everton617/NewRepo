import { prisma } from "lib/prisma";

describe("\n > (integration) inventory/categories/[_categoryId]/[id]\n", () => {
  let globalCategory: any;

  beforeAll(async () => {
    globalCategory = await prisma.inventoryCategory.create({
      data: {name: "Chaveiros", teamId: global.team.id}
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe("GET", () => {
    it.todo("(200) should return a unique category product");
  });

  describe("DELETE", () => {
    it.todo("(200) should delete a unique category product");
  });

});
