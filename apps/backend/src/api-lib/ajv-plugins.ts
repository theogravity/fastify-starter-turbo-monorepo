import ajvFormats from "ajv-formats";
import ajvSanitizer from "ajv-sanitizer";

export const ajvPlugins = [
  // https://www.npmjs.com/package/ajv-sanitizer
  ajvSanitizer,
  // https://ajv.js.org/packages/ajv-formats.html
  ajvFormats,
];
