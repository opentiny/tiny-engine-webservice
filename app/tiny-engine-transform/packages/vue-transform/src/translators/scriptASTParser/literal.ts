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
import { E_Literal } from '../../lib/enum';

export function commonLiteral(node: any) {
  const { type, value } = node;
  if (!(type in E_Literal)) {
    throw TypeError(`The node type is not one of the Literals.`);
  }
  return value;
}

export default {
  CommonLiteral: commonLiteral,
  [E_Literal.BooleanLiteral]: commonLiteral,
  [E_Literal.StringLiteral]: commonLiteral,
  [E_Literal.NullLiteral]: commonLiteral,
  [E_Literal.RegExpLiteral]: commonLiteral,
  [E_Literal.NumericLiteral]: commonLiteral,
};
