import {
  parse,
  hasParseError,
  ProjectionStatementNode,
  ProjectionIfExpressionNode,
  Model,
  DecoratorContext,
  ProjectionExpression,
  Node,
  SyntaxKind,
  Type,
  Program,
  EmitContext,
  navigateProgram,
  emitFile,
  joinPaths
} from "@cadl-lang/compiler";

import { createStateSymbol, reportDiagnostic } from "./lib.js";
import { emitValidationFunction } from "./typescript-emitter.js";

const stateKey = createStateSymbol("typespec-validation");

export interface ValidationRecord {
  ast: ProjectionExpression;
  symbols: Map<ProjectionExpression, Type>;
  message: string | undefined;
}


export function $onEmit(context: EmitContext) {
  let contents = '';
  navigateProgram(context.program, {
    model(m) {
      const validations = getValidations(context.program, m);
      if (validations.length > 0) {
        contents += emitValidationFunction(m, validations);
      }
    }
  });

  emitFile(context.program, {
    content: contents,
    path: joinPaths(context.emitterOutputDir, "validations.ts")
  });
}

export function $validates(
  context: DecoratorContext,
  target: Model,
  expr: string,
  message?: string
) {
  addValidation(context, target, expr, message);
}

export function getValidations(program: Program, target: Type): ValidationRecord[] {
  return program.stateMap(stateKey).get(target) ?? []
}

$validates.namespace = "Validation";

export function addValidation(context: DecoratorContext, scope: Type, expr: string, message?: string) : void {
  const program = context.program;
  const symbols = new Map<ProjectionExpression, Type>();
  const preambleCode = `projection model#bar {
    to() {
      if `;
  const postambleCode = `{
      };
    }
  };`;

  const [error, ast] = parseExpression(expr);
  if (error) {
    reportDiagnostic(context.program, {
      code: "parse-error",
      format: {
        error
      },
      target: context.getArgumentTarget(0)!
    });
  } else {
    bindExpression(ast!);
    const currentValidations = getValidations(program, scope);
    currentValidations.push({ ast: ast!, symbols, message });
    context.program.stateMap(stateKey).set(scope, currentValidations);
  }

  function parseExpression(
    code: string
  ): [null, ProjectionExpression] | [string, null] {
    const ast = parse(`${preambleCode}${code}${postambleCode}`);
    if (hasParseError(ast)) {
      return [
        ast.parseDiagnostics
          .filter(
            (d) =>
              (d.target as Node).pos >= preambleCode.length &&
              (d.target as Node).pos <= preambleCode.length + code.length
          )
          .map((d) => d.message)
          .join(", "),
        null,
      ];
    }
    return [
      null,
      (
        (ast.statements[0] as ProjectionStatementNode).to!.body[0]
          .expr as ProjectionIfExpressionNode
      ).test,
    ];
  }
  
  function bindExpression(ast: ProjectionExpression) {
    switch (ast.kind) {
      // binops
      case SyntaxKind.ProjectionLogicalExpression:
      case SyntaxKind.ProjectionArithmeticExpression:
      case SyntaxKind.ProjectionRelationalExpression:
      case SyntaxKind.ProjectionEqualityExpression:
        bindExpression(ast.left);
        bindExpression(ast.right);
        break;
      // unops
      case SyntaxKind.ProjectionUnaryExpression:
      case SyntaxKind.ProjectionCallExpression:
        bindExpression(ast.target);
        break;
      case SyntaxKind.ProjectionMemberExpression:
        bindExpression(ast.base);
        const baseType = symbols.get(ast.base);
        if (!baseType) {
          break;
        }

        switch (baseType.kind) {
          case "Model":
            if (ast.selector === ".") {
              const prop = baseType.properties.get(ast.id.sv);
              if (prop) {
                symbols.set(ast, prop.type);
                break;
              }
              
              reportDiagnostic(program, {
                code: "unknown-property",
                format: {
                  propertyName: ast.id.sv
                },
                target: context.getArgumentTarget(0)!
              });
            }


            break;
        }
        break;
      case SyntaxKind.Identifier:
        if (ast.sv === "self") {
          symbols.set(ast, scope);
          break;
        }
  
        switch (scope.kind) {
          case "Model":
            const prop = scope.properties.get(ast.sv);
            if (prop) {
              symbols.set(ast, prop.type);
              break;
            }

            const intrinsic = lookupTypeSpecIntrinsic(ast.sv);
            if (intrinsic) {
              symbols.set(ast, intrinsic);
              break;
            }

            reportDiagnostic(program, {
              code: "unknown-property",
              format: {
                propertyName: ast.sv
              },
              target: context.getArgumentTarget(0)!
            });

            break;
          default:
            throw new Error("Fail?" + scope.kind)
        }

        break;
      default:
        // do nothing.
    }
  }

  function lookupTypeSpecIntrinsic(name: string) {
    return program.resolveTypeReference(`Cadl.${name}`)[0];
  }
}