import { faker } from "@faker-js/faker";
import { ApiContext } from "../../api-lib/context";
import type { User } from "../../api-lib/types/user.type";
import { db } from "../../db";
import { getLogger } from "../../utils/logger";

export interface TestHeaders extends Record<string, string | undefined> {
  // test- prefix are test-specific headers
  "test-user-id": string;
}

export interface TestFacets {
  user: User;
  headers: TestHeaders;
}

export class ApiTestingFramework {
  context: ApiContext;

  constructor() {
    this.context = new ApiContext({
      db,
      log: getLogger(),
    });
  }

  /**
   * Generates a set of test facets that can be used to test the API.
   * This includes an organization, an owner user, and an API key.
   */
  async generateTestFacets(): Promise<TestFacets> {
    const user = await this.context.services.users.createEMailUser({
      email: faker.internet.email(),
      password: faker.internet.password(),
      user: {
        familyName: faker.person.lastName(),
        givenName: faker.person.firstName(),
      },
    });

    return {
      user,
      headers: this.generateTestHeaders({
        user,
      }),
    };
  }

  async generateNewUsers(count: number): Promise<User[]> {
    const users: User[] = [];

    for (let i = 0; i < count; i++) {
      const user = await this.context.services.users.createEMailUser({
        email: faker.internet.email(),
        password: faker.internet.password(),
        user: {
          familyName: faker.person.lastName(),
          givenName: faker.person.firstName(),
        },
      });
      users.push(user);
    }

    return users;
  }

  private generateTestHeaders(facets: Omit<TestFacets, "headers">): TestHeaders {
    return {
      "test-user-id": facets.user.id,
    };
  }
}

export const testFramework: ApiTestingFramework = new ApiTestingFramework();
