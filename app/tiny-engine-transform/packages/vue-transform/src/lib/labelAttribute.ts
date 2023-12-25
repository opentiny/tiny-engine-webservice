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
import { Rule, RulePropUnit } from '../lib/types';
class LabelAttribute {
  public props: any;
  public componentName: string;
  private labelProps = {};

  constructor(params: Rule) {
    this.props = params.props;
    this.componentName = params.componentName;
  }
  // 标签属性转换
  attributeConvert() {
    const propskeys = Object.keys(this.props ?? {});
    if (propskeys.length === 0) {
      return this.props;
    }
    for (const propKey of propskeys) {
      if (propKey && this.divRule.props) {
        switch (this.componentName) {
          case this.divRule.componentName:
            if (this.divRule.props[propKey]) {
              this.convert(this.divRule.props, propKey);
            }
            break;
        }
      }
    }
    return { ...this.labelProps, ...this.props };
  }

  private convert(ruleProps, propKey) {
    if (ruleProps) {
      const { key, value } = ruleProps[propKey] as RulePropUnit;
      const propValue = this.props[propKey];
      if (key) {
        this.labelProps[key] = value ? value(propValue) : propValue;
        delete this.props[propKey];
      }
    }
  }
  private divRule: Rule = {
    componentName: 'div',
    props: {
      class: {
        key: 'className',
        value(val) {
          return val;
        },
      },
    },
  };
}
export default LabelAttribute;
