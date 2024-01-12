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
import { E_Framework } from "../lib/enum";

export default (app) => {
  const { validator } = app;

  validator.addRule('page', (rule, value) => {
    if (!/^\d+$/.test(value) || value <= 0) {
      return rule.type + '只能为正整数';
    }
  });

  validator.addRule('pageSize', (rule, value) => {
    if (!/^\d+$/.test(value) || value <= 0 || value > 100) {
      return rule.type + '只能为正整数, 且最大值为100';
    }
  });

  validator.addRule('multiId', (rule, value) => {
    const val = value.toString();
    if (!/^\d+$/.test(val)) {
      return rule.type + '不是一个合法的ID格式';
    }
  });

  validator.addRule('id', (rule, value) => {
    if (!/^[0-9]+$/.test(value)) {
      return `不是一个合法的${rule.type}格式`;
    }
  });

  validator.addRule('materialName', (rule, value) => {
    if (!/^([a-z][a-z0-9]*)(-?[a-z0-9]+)*$/.test(value)) {
      return `不是一个合法的${rule.type}格式`;
    }
  });

  validator.addRule('framework', (rule, value) => {
    const frameworks = [
      E_Framework.Angular,
      E_Framework.Vue,
      E_Framework.HTML,
      E_Framework.React
    ];
    if (!frameworks.includes(value)) {
      return `不是一个合法的${rule.type}格式`;
    }
  });

  validator.addRule('schemaContent', (rule, value) => {
    const { schema, name } = value;
    if (typeof schema !== 'object' || typeof name !== 'string') {
      return `${rule.type} 对象必须包含schema对象 和 name字符串`;
    }
  });

  validator.addRule('cn', (rule, value) => {
    if (!/^[\u4e00-\u9fa5][\u4e00-\u9fa50-9]*$/.test(value)) {
      return `不是一个合法的${rule.type}格式`;
    }
  });

  validator.addRule('en', (rule, value) => {
    if (!/^[a-z][a-z0-9]*$/.test(value)) {
      return `不是一个合法的${rule.type}格式`;
    }
  });

  validator.addRule('templateName', (rule, value) => {
    if (!/^[A-Z][A-Za-z0-9]*?[A-Z][A-Za-z0-9]*?$/.test(value)) {
      return `不是一个合法的${rule.type}格式`;
    }
  });

  validator.addRule('templateNameCN', (rule, value) => {
    if (!/^[\u4e00-\u9fa5-_a-zA-Z0-9]+$/.test(value)) {
      return `不是一个合法的${rule.type}格式`;
    }
  });
  validator.addRule('createdApp', (rule, value) => {
    if (typeof (value) !== 'number' && !/^[0-9]+$/.test(value)) {
      return `不是一个合法的${rule.type}格式`;
    }
  });
  // 兼容 x.y.z, ~x.y.z, ^x.y.z, x 这四种格式
  validator.addRule('version', (rule, value) => {
    const reg = /(^((~[1-9]\d*)|(\^[1-9]\d*)|([1-9]\d*))(\.([1-9]\d*|0)){2}$)|^x$/;
    if (!reg.test(value)) {
      return `不是一个合法的${rule.type}格式`;
    }
  });
  // 仅支持 x.y.z 格式：x为1开头任何数字，y和z为1开头的任何数字或者0
  validator.addRule('fixedVersion', (rule, value) => {
    if (!/^([1-9]\d*)(\.([1-9]\d*|0)){2}$/.test(value)) {
      return `不是一个合法的${rule.type}格式`;
    }
  });

  // 区块英文名称（label）
  validator.addRule('blockName', (rule, value) => {
    if (!/^[A-Z][A-Za-z0-9]*?[A-Z][A-Za-z0-9]*?$/.test(value)) {
      return `不是一个合法的${rule.type}格式`;
    }
  });

  // 代码仓地址
  validator.addRule('registry', (rule, value) => {
    if (!/^(http|https):\/\/([\w.]+\/?)\S*$/.test(value)) {
      return `不是一个合法的${rule.type}格式`;
    }
  });

  // npm包名
  validator.addRule('packageName', (rule, value) => {
    if (!/^(([a-z][a-z\d_-]*)|(@[a-z\d_-]+\/[a-z\d_-]+))$/.test(value)) {
      return `不是一个合法的${rule.type}格式`;
    }
  });

  validator.addRule('pageParentId', (rule, value) => {
    if (typeof (value) !== 'number' && !/^[0-9]+$/.test(value)) {
      return `不是一个合法的${rule.type}格式`;
    }
  });

};
