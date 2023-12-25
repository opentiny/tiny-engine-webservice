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
import { E_ConstantTypes, E_NodeType } from '../../../lib/enum';
import { AstProp } from '../../../lib/types';
import { formatStyle, toPascalCase } from '../../../utils/tools';

export default (prop: AstProp) => {
  const directiveBind = {
    [E_NodeType.SIMPLE_EXPRESSION]: {
      key: prop.arg?.content,
      // TODO 暂不支持这种写法<div :style="{ width: quotePopWidth }">循环渲染：</div>
      value: dealWithContent(prop),
    },
    [E_NodeType.COMPOUND_EXPRESSION]: {
      key: prop.arg?.content,
      value: {
        type: 'JSExpression',
        value: prop.exp?.loc.source,
      },
    },
  };

  function dealWithContent(prop) {
    if (prop.arg?.content === 'style') {
      return formatStyle(prop.exp?.content ?? prop.exp?.loc.source);
    } else if (prop.exp?.constType === E_ConstantTypes.CAN_STRINGIFY) {
      try {
        return json5.parse(prop.exp?.loc.source);
      } catch (error) {
        // 目前有下面这种无法解析的json字符串，暂时将其原样返回
        // "['basic-info', { 'form-fixed-layout': isFixed }, { 'form-auto-layout': isAuto }]"
        return prop.exp?.loc.source;
      }
    } else if (prop.exp?.constType === E_ConstantTypes.NOT_CONSTANT) {
      return {
        type: 'JSExpression',
        value: `state.${prop.exp?.loc.source}`,
      };
    } else {
      // TODO 字面量中内嵌复合表达式暂不支持
      return prop.exp?.content;
    }
  }

  return {
    bind: directiveBind[prop.exp?.type],

    // TODO 暂不支持v-on的内联声明
    on: {
      key: 'on' + toPascalCase(prop.arg?.content),
      value: {
        type: 'JSExpression',
        // 可以拼接上this或this.props也可不拼接
        value: prop.exp?.loc.source,
      },
    },

    slot: {
      key: 'slot',
      value: prop.arg?.content,
    },

    model: {
      key: 'modelValue',
      value: {
        type: 'JSExpression',
        value: `state.${prop.exp?.loc.source}`,
        model: true,
      },
    },
  };
};
