import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";
import { testFastify } from "../../../test-utils/test-server";
import type { CreateEMailUserResponse } from "../create-email-user.route";

describe("Create e-mail user API", () => {
  it("should create an e-mail user", async () => {
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
    });

    expect(response.json<CreateEMailUserResponse>().user.id).toBeDefined();
  });
});
