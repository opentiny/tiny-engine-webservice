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
import { addTypeToReturnValue, nodeTypeCheckerFactory } from '../../lib/decorator';
import { E_Declaration, E_Expression } from '../../lib/enum';
import { AstParsed } from '../script';
import expression from './expression';

class Declaration {
  @nodeTypeCheckerFactory(E_Declaration.ExportDefaultDeclaration)
  @addTypeToReturnValue(E_Declaration.ExportDefaultDeclaration)
  static ExportDefaultDeclaration(node) {
    const { declaration } = node;
    const parsed: AstParsed = {};
    if (declaration.type in E_Expression) {
      const expressionParsed: AstParsed = expression[declaration.type](declaration);
      for (const key of Object.keys(expressionParsed)) {
        parsed[key] = expressionParsed[key];
      }
    }
    return parsed;
  }
}

export default Declaration;
