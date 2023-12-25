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

export function getVariableType(val: any): string {
  const reg = /\[object\s(\w+)\]/;
  const res = Object.prototype.toString.call(val).match(reg) ?? [];
  return res[1] ?? '';
}

export function capitalizeFirstLetter(str) {
  if (typeof str !== 'string' || str.length === 0) {
    return str;
  }
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

/**
 * 连字符转大驼峰
 *
 * @export
 * @param {string} input
 * @returns {string}
 */
export function toPascalCase(input: string): string {
  if (!input) {
    return input;
  }

  return input
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

export function formatStyle(styleContent: string): string {
  let formatted = '';
  const json = json5.parse(styleContent);

  for (const key of Object.keys(json)) {
    formatted += `${key}: ${json[key]}; `;
  }

  return formatted.slice(0, -2); // 去掉最后的分号和空格
}
