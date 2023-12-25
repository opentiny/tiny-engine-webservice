/**
* Copyright (c) 2023 - present TinyEngine Authors.
* Copyright (c) 2023 - present Huawei Cloud Computing Technologies Co., Ltd.
*
* Use of this source code is governed by an MIT-style license.
*
* THE OPEN SOURCE SOFTWARE IN THIS PRODUCT IS DISTRIBUTED IN THE HOPE THAT IT WILL BE USEFUL,
* BUT WITHOUT ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS FOR
* A PARTICULAR PURPOSE. SEE THE APPLICABLE LICENSES FOR MORE DETAILS.
*
*/
import { E_Expression, E_Literal, E_ObjectType } from '../../lib/enum';
import literalParser from './literal';
import Statement from './statement';
import { addTypeToReturnValue, nodeTypeCheckerFactory } from '../../lib/decorator';
import VueScriptTranslator, { AstParsed } from '../script';

export type Expression = {
  type: E_Expression;
  properties: Array<any>;
};

export type ObjectPropertyParsed = {
  key: string;
  value: any;
};

export type ExpressionItem = ObjectPropertyParsed & {
  type: E_ObjectType;
};

class ExpressionParser {
  @nodeTypeCheckerFactory(E_Expression.ObjectExpression)
  @addTypeToReturnValue(E_Expression.ObjectExpression)
  static ObjectExpression(node: any): AstParsed {
    const { properties } = node;
    let parsed: AstParsed = {};
    for (const objectProp of properties) {
      let eItem: AstParsed | null;
      switch (objectProp.type as E_ObjectType) {
        case E_ObjectType.ObjectProperty:
          eItem = ExpressionParser.ObjectProperty(objectProp);
          break;
        case E_ObjectType.ObjectMethod:
          eItem = ExpressionParser.ObjectMethod(objectProp);
          break;
        default:
          eItem = null;
      }
      if (eItem?.key) {
        parsed[eItem.key] = eItem.value;
      }
    }

    return parsed;
  }

  @nodeTypeCheckerFactory(E_Expression.ArrayExpression)
  static ArrayExpression(node: any): Array<any> {
    const { elements } = node;
    const parsed: Array<any> = [];

    // 数组表达式的内容可以为 ArrayExpression\ObjectExpression\xxxLiteral 等等
    for (const element of elements) {
      const { type: eType } = element;
      let item = null;
      if (eType in E_Literal) {
        item = literalParser[eType](element);
      }

      if (eType in E_Expression) {
        item = ExpressionParser[eType](element);
      }

      if (item) {
        parsed.push(item);
      }
    }
    return parsed;
  }

  @nodeTypeCheckerFactory(E_Expression.FunctionExpression)
  @addTypeToReturnValue(E_Expression.FunctionExpression)
  static FunctionExpression(node: any): AstParsed {
    const { start, end, body } = node;
    return {
      start,
      end,
      body: Statement.BlockStatement(body),
    };
  }

  @nodeTypeCheckerFactory(E_ObjectType.ObjectProperty)
  static ObjectProperty(property: any): AstParsed {
    const { key, value } = property;
    const parsed: AstParsed = {
      key: key.name,
    };
    if (value.type in E_Literal) {
      parsed.value = literalParser[value.type](value);
    }

    if (value.type in E_Expression) {
      parsed.value = ExpressionParser[value.type](value);
    }

    return parsed;
  }

  @nodeTypeCheckerFactory(E_ObjectType.ObjectMethod)
  static ObjectMethod(property: any, onlyPosition = false): AstParsed {
    const { body, key, start, end } = property;
    return {
      key: key.name,
      value: {
        start,
        end,
        body: Statement.BlockStatement(body, onlyPosition),
        [VueScriptTranslator.nodeType]: E_ObjectType.ObjectMethod,
      },
    };
  }
}

export default ExpressionParser;
