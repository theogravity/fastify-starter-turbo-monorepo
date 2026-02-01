import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";
import { testFramework } from "@/test-utils/test-framework/index.js";
import { testFastify } from "@/test-utils/test-server.js";
import type { CreateEMailUserResponse } from "../create-email-user.route.js";

describe("Create e-mail user API", () => {
  it("should create an e-mail user", async () => {
    const { headers } = await testFramework.generateTestFacets({
      // Enables server-side logging for this test
      withLogging: true,
    });

    // This inject is a custom version of the Fastify inject function
    // that logs the response if it's not what we expected
    const response = await testFastify.inject({
      method: "POST",
      url: "/users/email",
      payload: {
        givenName: faker.person.firstName(),
        familyName: faker.person.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      },
      expectedStatusCode: 200,
      headers,
    });

    expect(response.json<CreateEMailUserResponse>().user.id).toBeDefined();
  });
});
