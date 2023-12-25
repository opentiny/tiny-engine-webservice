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
import json5 from 'json5';
import rules from '../../../components/rules';
import { catchError } from '../../../lib/decorator';
import { E_ConstantTypes, E_ElementTypes, E_NodeType, E_SchemaJsType } from '../../../lib/enum';
import { AstNodeSchema, AstProp, ChildrenSchema, Rule } from '../../../lib/types';
import AstNode from '../astNode';
import propMaps from '../propMaps';

export default class IfNode extends AstNode {
  private componentName: string;
  private props: AstProp[];
  private sourceConstType: number;
  private condition: AstNodeSchema;

  private sourceLib: string;
  private targetLib: string;
  private tagType: number;

  constructor(current: AstNodeSchema, sourceLib: string, targetLib: string) {
    super(current);

    // 根据ast结构，条件语句节点的部分数据直接从有且仅有一个（TODO 当前不支持多分支条件语句）的分支节点获取
    const child = current.branches[0] ?? {};
    this.condition = child.condition;
    this.componentName = child.children[0].tag;
    this.props = child.children[0].props;
    this.sourceConstType = child.condition.constType;

    this.sourceLib = sourceLib;
    this.targetLib = targetLib;

    // 为了处理循环元素内嵌子元素的情况，将循环节点的children值，替换为child.children[0].children。注意，这改变了ast结构。
    current.children = child.children[0].children;
  }

  @catchError()
  generateSchema(): ChildrenSchema {
    this.node = {
      componentName: this.getComponentName(),
      condition: this.getCondition(),
    };

    const props = this.transformProps();
    if (Object.getOwnPropertyNames(props).length > 0) {
      this.node.props = props;
    }

    return this.node;
  }

  // 与ElementNode类的方法重复了，有必要时重构
  private getComponentName() {
    const libRules: Record<string, Rule> = rules[this.targetLib][this.sourceLib];
    const rule: Rule = libRules[this.componentName];

    // TODO 暂时不能区分自定义组件和组件库组件
    if (this.tagType === E_ElementTypes.COMPONENT && rule) {
      return rule.componentName;
    }

    return this.componentName;
  }

  private getCondition() {
    // 解析条件数据为字面量的情况
    if (this.sourceConstType === E_ConstantTypes.CAN_STRINGIFY) {
      // 可以将"false"转为false

      return json5.parse(this.condition.content);
    }

    return {
      type: E_SchemaJsType.JSExpression,
      value: this.condition.loc.source,
    };
  }

  // 与ElementNode类的方法重复了，有必要时重构
  private transformProps() {
    const schemaProps = {};

    for (const prop of this.props) {
      const { key, value } = this.transformSingleProp(prop);
      schemaProps[key] = value;
    }

    return schemaProps;
  }

  // 与ElementNode类的方法重复了，有必要时重构
  private transformSingleProp(prop: AstProp) {
    let key;
    let value;

    const map = propMaps[prop.type](prop);

    switch (prop.type) {
      case E_NodeType.ATTRIBUTE: {
        key = map.key;
        value = map.value;

        break;
      }

      case E_NodeType.DIRECTIVE: {
        const transformedProp = map[prop.name];
        key = transformedProp.key;
        value = transformedProp.value;

        break;
      }

      default:
        break;
    }

    return { key, value };
  }
}
