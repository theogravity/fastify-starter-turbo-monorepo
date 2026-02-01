import { faker } from "@faker-js/faker";
import { ApiContext } from "@/api-lib/context.js";
import type { User } from "@/api-lib/types/user.type.js";
import { db } from "@/db/index.js";
import { getLogger } from "@/utils/logger.js";

export interface TestHeaders extends Record<string, string | undefined> {
  // test- prefix are test-specific headers
  "test-user-id": string;
  "test-logging-enabled"?: string;
}

export interface TestFacets {
  user: User;
  headers: TestHeaders;
}

export interface TestFacetParams {
  /**
   * Enables endpoint-level logging for the test by adding a test-specific header
   * to tell the server to enable logging.
   *
   * You can also use "request.log.enableLogging();" in the endpoint impl code
   * itself to enable logging during tests.
   */
  withLogging?: boolean;
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
  async generateTestFacets(params?: TestFacetParams): Promise<TestFacets> {
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
      headers: this.generateTestHeaders(
        {
          user,
        },
        params,
      ),
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

  private generateTestHeaders(facets: Omit<TestFacets, "headers">, params?: TestFacetParams): TestHeaders {
    return {
      "test-user-id": facets.user.id,
      ...(params?.withLogging ? { "test-logging-enabled": "true" } : { "test-logging-enabled": "false" }),
    };
  }
}

export const testFramework: ApiTestingFramework = new ApiTestingFramework();
