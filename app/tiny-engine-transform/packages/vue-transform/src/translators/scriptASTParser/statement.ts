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
import { E_Expression, E_Statement } from '../../lib/enum';
import { AstParsed } from '../script';

import ExpressionParser from './expression';

export type BlockStatementParsed = {
  start: number;
  end: number;
  body?: Array<any>;
};

export type ReturnStatementParsed = {
  start: number;
  end: number;
  argument?: AstParsed;
};

class Statement {
  @nodeTypeCheckerFactory(E_Statement.ReturnStatement)
  @addTypeToReturnValue(E_Statement.ReturnStatement)
  static ReturnStatement(statement): AstParsed {
    const { argument, start, end } = statement;
    const parsed: AstParsed = {
      start,
      end,
    };
    if (argument.type in E_Expression) {
      parsed.argument = ExpressionParser[argument.type](argument);
    }

    return parsed;
  }

  @nodeTypeCheckerFactory(E_Statement.BlockStatement)
  @addTypeToReturnValue(E_Statement.BlockStatement)
  static BlockStatement(statement, onlyPosition = false): AstParsed {
    const { start, end, body = [] } = statement;

    const parsed: AstParsed = {
      start,
      end,
    };

    if (!onlyPosition) {
      // 暂时不考虑其他语句，只考虑 vue data这一种情况
      parsed.body = (body as Array<any>)
        .map((node) => {
          if (node.type in E_Statement) {
            return Statement[node.type](node);
          }
          return null;
        })
        .filter((item) => item !== null);
    }

    return parsed;
  }
}

export default Statement;
