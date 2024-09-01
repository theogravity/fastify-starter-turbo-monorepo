import { IS_GENERATING_CLIENT } from "../../constants";

/**
 * Sanitizes the input using ajv-sanitizer
 * @see https://www.npmjs.com/package/ajv-sanitizer
 */
export function sanitizeKeyword() {
  // the sanitize keyword doesn't exist in OpenAPI,
  // so we exclude it during client generation
  if (IS_GENERATING_CLIENT) {
    return {};
  }

  return {
    sanitize: "text",
  };
}
