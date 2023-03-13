import { ProjectionExpression, SyntaxKind, Model } from "@cadl-lang/compiler";
import { ValidationRecord } from "./index.js";
import prettier from "prettier";

export function emitValidationFunction(
  model: Model,
  validations: ValidationRecord[]
): string {
  let code = `
  type ${model.name} = any;
  function validate${model.name}(type: ${model.name}) {\n`;

  for (const validation of validations) {
    code += `if (!(
      ${emitValidationExpression(validation.ast, model, validation)}
    )) { throw new Error("${validation.message ?? "Validation failure"}");}\n`;
  }

  code += "\n}";
  code = prettier.format(code, {
    parser: "typescript",
  });
  return code;
}

const operatorMap = new Map([
  ["==", "==="],
  ["!=", "!=="],
]);

function emitValidationExpression(
  expr: ProjectionExpression,
  model: Model,
  validation: ValidationRecord
): string {
  switch (expr.kind) {
    case SyntaxKind.ProjectionLogicalExpression:
    case SyntaxKind.ProjectionArithmeticExpression:
    case SyntaxKind.ProjectionRelationalExpression:
    case SyntaxKind.ProjectionEqualityExpression:
      return `${emitValidationExpression(expr.left, model, validation)} ${
        operatorMap.get(expr.op) ?? expr.op
      } ${emitValidationExpression(expr.right, model, validation)}`;
    case SyntaxKind.ProjectionUnaryExpression:
      return `${expr.op}${emitValidationExpression(
        expr.target,
        model,
        validation
      )}`;
    case SyntaxKind.ProjectionMemberExpression:
      if (expr.selector === ".") {
        return `${emitValidationExpression(expr.base, model, validation)}.${
          expr.id.sv
        }`;
      } else {
        switch (expr.id.sv) {
          case "length":
            return `${emitValidationExpression(expr.base, model, validation)}.length`;
          default:
            throw new Error("Unknown meta-property " + expr.id.sv);
        }
      }
      break;
    case SyntaxKind.ProjectionCallExpression:
      if (
        expr.target.kind !== SyntaxKind.ProjectionMemberExpression ||
        expr.target.selector !== "::"
      ) {
        throw new Error("invalid call target");
      }
      const functionName = expr.target.id.sv;
      const base = expr.target.base;

      switch (functionName) {
        case "hasMember":
          return `${emitValidationExpression(
            base,
            model,
            validation
          )}.hasOwnProperty(${emitValidationExpression(
            expr.arguments[0],
            model,
            validation
          )})`;
        default:
          throw new Error("Unknown function " + functionName);
      }
    case SyntaxKind.NumericLiteral:
    case SyntaxKind.BooleanLiteral:
      return String(expr.value);
    case SyntaxKind.StringLiteral:
      return `"${expr.value}"`;
    case SyntaxKind.Identifier:
      if (expr.sv === "null") {
        // todo: this could probably be more robust, but
        // stick to model props or null and it should be fine.
        return "null";
      }

      if (expr.sv === "self") {
        return `type`;
      }

      return `type.${expr.sv}`;
  }
  return "";
}
