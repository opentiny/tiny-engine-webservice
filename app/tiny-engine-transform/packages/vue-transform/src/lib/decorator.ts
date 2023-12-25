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
import ScriptTranslator from '../translators/script';

// 检查节点类型是否正确
export function nodeTypeCheckerFactory(targetType: string): any {
  // @ts-ignore
  // eslint-disable-next-line no-unused-vars
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): any {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      if (args.length < 1) {
        throw new SyntaxError(`The function call lacks the required parameters.`);
      }

      const nodeType = args[0]?.type ?? '';

      if (nodeType !== targetType) {
        throw new TypeError(`Node is not of type ${targetType}`);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// 节点返回方法添加符号属性
export function addTypeToReturnValue(nodeType: string) {
  // @ts-ignore
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // 调用原始方法获取返回值
      const result = originalMethod.apply(this, args);

      // 将 Symbol('type') 属性添加到返回值上
      Object.defineProperty(result, ScriptTranslator.nodeType, {
        value: nodeType,
        enumerable: false, // 将属性设置为不可枚举
      });

      return result;
    };
  };
}

// 捕获未能识别ast的异常
export function catchError() {
  // @ts-ignore
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      try {
        return originalMethod.apply(this, args);
      } catch (error) {
        // 所有暂不识别的情况，只记录，不阻断程序。 临时移除日志记录，以免线上环境日志过多。console.error(`[lowcode-ast-transform]:未能识别ast数据`, error);
      }
    };
  };
}
