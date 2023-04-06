import { definePlaygroundViteConfig } from "../vendor/playground/src/build-utils/index.js";

// import { definePlaygroundViteConfig } from "@cadl-lang/playground/src/build-utils/index.js";

const config = definePlaygroundViteConfig({
  defaultEmitter: "@cadl-lang/openapi3",
  libraries: [
    "@cadl-lang/compiler",
    "@cadl-lang/rest",
    "@cadl-lang/openapi",
    "@cadl-lang/versioning",
    "@cadl-lang/openapi3",
    "typespec-validation",
  ],
  samples: {
    "API versioning": "samples/versioning.cadl",
    "Discriminated unions": "samples/unions.cadl",
    "HTTP service": "samples/http.cadl",
    "REST framework": "samples/rest.cadl",
  },
  enableSwaggerUI: true,
  links: {
    newIssue: `https://github.com/microsoft/cadl/issues/new`,
    documentation: "https://microsoft.github.io/cadl",
  },
});
config.root = "./";
console.log("my-playground")

export default config;
