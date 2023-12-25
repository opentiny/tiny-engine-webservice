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
import { AstNodeSchema, ChildrenSchema } from '../../lib/types';

/**
 * 用于描述compiler-sfc解析出的ast节点的抽象类
 *
 *
 * @export
 * @abstract
 * @class AstNode
 */
export default abstract class AstNode {
  type: number;
  node: ChildrenSchema = {}; // 当前节点信息

  constructor(currentNode: AstNodeSchema) {
    this.type = currentNode.type;
  }

  abstract generateSchema(): ChildrenSchema;
}
