import { fullFormats } from "ajv-formats/dist/formats.js";

// The items are purposely typed to any since Next.js likes to complain about the structure
// even though it is correct

const customFormats: any = {
  "custom-uri": {
    type: "string",
    validate: (url) => {
      try {
        new URL(url); // Uses the URL constructor for validation
        return true;
      } catch {
        return false;
      }
    },
  },
};

// Apply this to your format in your schema definition
// to use this custom format
export function withUriValidation() {
  return {
    format: "custom-uri",
    errorMessage: {
      format: "Not a valid URL",
    },
  };
}

export const ajvValidationFormats: any = {
  ...fullFormats,
  ...customFormats,
};

export const registerAjvFormats = (ajv) => {
  ajv.addKeyword({ keyword: "errorMessage" });

  for (const format in ajvValidationFormats) {
    ajv.addFormat(format, customFormats[format]);
  }

  return ajv;
};

export const ajvPlugins = [registerAjvFormats];
