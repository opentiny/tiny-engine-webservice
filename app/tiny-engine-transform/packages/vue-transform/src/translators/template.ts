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
import { AstNodeSchema, ChildrenSchema, TransformOption } from '../lib/types';
import NodeFactory from './templateParser/nodeFactory';

/**
 *  List
 *  1.解析插值，例如<li v-for="student in students" :key="student.id">{{ student.name }} - {{ student.age }}岁</li>
 *  2.解析v-if
 *
 */

/**
 * 递归处理ast，从中提取数据，生成dsl能识别的schema
 *
 * @export
 * @param {AstNodeSchema} currentNode
 * @param {TransformOption} option
 * @returns {ChildrenSchema}
 */
export default function astToSchema(currentNode: AstNodeSchema, option: TransformOption): ChildrenSchema {
  const factory = new NodeFactory(currentNode, option);
  const node = factory.createNode(currentNode.type);

  /**
   * 使用了简单工厂，将模板解析任务的复杂度分解到不同类型的节点中
   */
  const schema = node?.generateSchema() ?? {};

  if (currentNode.children?.length > 0) {
    schema.children = currentNode.children.map((item: AstNodeSchema) => {
      return astToSchema(item, option);
    });
  }

  return schema;
}
