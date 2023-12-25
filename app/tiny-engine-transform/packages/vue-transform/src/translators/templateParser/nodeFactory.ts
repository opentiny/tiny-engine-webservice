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
import { E_NodeType } from '../../lib/enum';
import { AstNodeSchema, TransformOption } from '../../lib/types';
import AstNode from './astNode';
import IfNode from './derivedNodes/IfNode';
import ElementNode from './derivedNodes/elementNode';
import ForNode from './derivedNodes/forNode';
import RootNode from './derivedNodes/rootNode';
import TextCallNode from './derivedNodes/textCallNode';
import TextNode from './derivedNodes/textNode';

export default class NodeFactory {
  currentNode: any;
  sourceLib: string;
  targetLib: string;

  constructor(currentNode: AstNodeSchema, option: TransformOption) {
    this.currentNode = currentNode;
    this.sourceLib = option.sourceLib;
    this.targetLib = option.targetLib;
  }

  /**
   * 创建节点示例，用于解析各种类型的节点
   *
   * 这里有圈复杂度过高的问题，经思考后，决定不处理。原因如下：
   * 1.任何解决方案都会增加复杂度，增加理解和维护的困难，得不偿失
   * 2.节点类型个数有限，预估10个左右
   * 3.这段代码虽然圈复杂度高，但是结构简单，并无任何理解难度
   *
   * @param type 节点类型
   * @returns
   */
  createNode(type: number): AstNode | null {
    switch (type) {
      case E_NodeType.ROOT:
        return new RootNode(this.currentNode);
      case E_NodeType.ELEMENT:
        return new ElementNode(this.currentNode, this.sourceLib, this.targetLib);
      case E_NodeType.TEXT:
        return new TextNode(this.currentNode);
      case E_NodeType.TEXT_CALL:
        return new TextCallNode(this.currentNode);
      case E_NodeType.FOR:
        return new ForNode(this.currentNode, this.sourceLib, this.targetLib);
      case E_NodeType.IF:
        return new IfNode(this.currentNode, this.sourceLib, this.targetLib);
      default:
        return null;
    }
  }
}
