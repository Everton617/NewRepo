// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`
// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
// import '@testing-library/jest-dom/extend-expect';
import { prisma } from "./lib/prisma";
import { seedUniqueUser } from './lib/utils/user';
import authHandler from "pages/api/auth/join";
import { wipeAccount } from './lib/utils/database';
import { getCurrentUserWithTeam } from 'models/team';

jest.mock("models/team", () => {
    const teamModels = jest.requireActual("models/team");

    return {
        ...teamModels,
        getCurrentUserWithTeam: jest.fn(),
        throwIfNoTeamAccess: jest.fn(() => true)
    }
});

global.team = undefined;
global.user = undefined;

beforeAll( async () => {
  const login = {teamName: "hierro team", slug: "hierro-team", name: "hierro"};
  try {
      await prisma.$connect();
  } catch (error) {console.warn(error); throw new Error("Error connecting to database");}

  try {
     const { team, user } = await seedUniqueUser(authHandler, login);
     global.team = user;
     global.user = team;

  } catch (error) { console.warn(error); throw new Error();}

});

afterAll( async () => {
  try {
      await wipeAccount(global.team.slug);
  } catch(error) {
      console.error(error);
  } finally {
      await prisma.$disconnect();
  }

});

beforeEach(() => {
  (getCurrentUserWithTeam as jest.Mock).mockReset();
  (getCurrentUserWithTeam as jest.Mock).mockResolvedValueOnce({
      user: global.user,
      team: global.team,
      role: "OWNER"
  });
});
