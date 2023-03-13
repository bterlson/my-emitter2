import { createCadlLibrary, paramMessage } from "@cadl-lang/compiler";

export const libDef = {
  name: "@cadl-lang/json-schema",
  diagnostics: {
    "parse-error": {
      severity: "error",
      messages: {
        default: paramMessage`Parse error in validation expression: ${"error"}`
      }
    },
    "unknown-property": {
      severity: "error",
      messages: {
        default: paramMessage`Could not find a property named ${"propertyName"}`
      }
    }
  },
} as const;

export const $lib = createCadlLibrary(libDef);
export const { reportDiagnostic, createStateSymbol } = $lib;

export type JsonSchemaLibrary = typeof $lib;