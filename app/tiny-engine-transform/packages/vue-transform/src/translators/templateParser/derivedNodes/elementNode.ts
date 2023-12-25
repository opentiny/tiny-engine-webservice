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
import rules from '../../../components/rules';
import { catchError } from '../../../lib/decorator';
import { E_ElementTypes, E_NodeType } from '../../../lib/enum';
import { AstNodeSchema, AstProp, ChildrenSchema, Rule } from '../../../lib/types';
import AstNode from '../astNode';
import propMaps from '../propMaps';

export default class ElementNode extends AstNode {
  private componentName: string;
  private props: AstProp[];
  private sourceLib: string;
  private targetLib: string;
  private tagType: number;

  constructor(current: AstNodeSchema, sourceLib: string, targetLib: string) {
    super(current);

    this.componentName = current.tag;
    this.props = current.props;
    this.tagType = current.tagType;

    this.sourceLib = sourceLib;
    this.targetLib = targetLib;
  }

  @catchError()
  generateSchema(): ChildrenSchema {
    this.node = {
      componentName: this.getComponentName(),
    };

    const props = this.transformProps();
    if (Object.getOwnPropertyNames(props).length > 0) {
      this.node.props = props;
    }

    return this.node;
  }

  /**
   * 获取组件名
   *
   * dsl可以兼容大驼峰和连字符两种命名法，如tiny-button和TinyButton都可以识别。
   *
   * @private
   * @returns
   * @memberof ElementNode
   */
  private getComponentName() {
    const libRules: Record<string, Rule> = rules[this.targetLib][this.sourceLib];
    const rule: Rule = libRules[this.componentName];

    // TODO 暂时不能区分自定义组件和组件库组件
    if (this.tagType === E_ElementTypes.COMPONENT && rule) {
      return rule.componentName;
    }

    return this.componentName;
  }

  private transformProps() {
    const schemaProps = {};

    for (const prop of this.props) {
      const { key, value } = this.transformSingleProp(prop);
      schemaProps[key] = value;
    }

    return schemaProps;
  }

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
