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
import {
  E_Declaration,
  E_Expression,
  E_LifeCycles,
  E_ObjectType,
  E_SchemaJsType,
  E_Statement,
  E_VariableType,
} from '../lib/enum';
import { TinyEnginePageSchema } from '../lib/types';
import { capitalizeFirstLetter, getVariableType } from '../utils/tools';
import Declaration from './scriptASTParser/declaration';

export type AstParsed = Record<string | symbol, any>;

class VueScriptTranslator {
  static nodeType = Symbol('ASTNodeType');
  public scriptAst: Array<any>;
  public sourceCode: string;
  private pageSchema: Partial<TinyEnginePageSchema> = {
    methods: {},
    lifeCycles: {},
  };
  private parsedAst: AstParsed;
  constructor(scriptAst, sourceCode) {
    this.scriptAst = scriptAst;
    this.sourceCode = sourceCode;
  }

  transform() {
    // 当前只解析"ExportDefaultDeclaration"
    const exportDefaultNode = this.scriptAst.filter((node) => node.type === E_Declaration.ExportDefaultDeclaration)[0];
    if (!exportDefaultNode) {
      return this.pageSchema;
    }
    this.parsedAst = Declaration.ExportDefaultDeclaration(exportDefaultNode);
    this.getMethods();
    this.getLifeCycles();
    this.getState();
    this.getProp();
    return this.pageSchema;
  }

  getMethods() {
    const { methods = {} } = this.parsedAst;
    for (const key of Object.keys(methods)) {
      const statement = methods[key];
      if (
        [E_ObjectType.ObjectMethod, E_Expression.FunctionExpression].includes(statement?.[VueScriptTranslator.nodeType])
      ) {
        this.pageSchema.methods[key] = this.getCodeFromObjectMethod(statement.start, statement.end);
      }
    }
  }

  getLifeCycles() {
    const lifeCycles = Object.values(E_LifeCycles) as Array<string>;
    // 筛选生命周期函数
    for (const method of Object.keys(this.parsedAst)) {
      const node = this.parsedAst[method];
      if (lifeCycles.includes(method) && node[VueScriptTranslator.nodeType] === E_ObjectType.ObjectMethod) {
        const { start, end } = node;
        const methodName = `on${capitalizeFirstLetter(method)}`;
        this.pageSchema.lifeCycles[methodName] = this.getCodeFromObjectMethod(start, end);
      }
    }
  }

  getState() {
    // 当前只解析"ExportDefaultDeclaration"
    const { data = {} } = this.parsedAst;
    // 校验data函数是否有返回值
    const returnStatement =
      (data?.body?.body ?? []).filter(
        (statement) => statement?.[VueScriptTranslator.nodeType] === E_Statement.ReturnStatement,
      )[0] ?? {};
    const argumentType = returnStatement?.argument?.[VueScriptTranslator.nodeType];
    // vue的data 属性返回值只能是对象
    if (argumentType === E_Expression.ObjectExpression) {
      this.pageSchema.state = this.getValueFromObjectExpression(returnStatement.argument);
    }
    // TODO 处理computed
  }

  getProp() {}

  private getValueFromObjectExpression(parsed: AstParsed): Record<string, any> {
    const pureData = {};
    for (const key of Object.keys(parsed)) {
      const parsedValue = parsed[key];
      if (Array.isArray(parsedValue)) {
        pureData[key] = this.getValueFormArrayExpression(parsedValue);
        continue;
      }
      const nodeType = parsedValue[VueScriptTranslator.nodeType];
      switch (nodeType) {
        case E_ObjectType.ObjectMethod:
          pureData[key] = this.getCodeFromObjectMethod(parsedValue.start, parsedValue.end);
          break;
        case E_Expression.ObjectExpression:
          pureData[key] = this.getValueFromObjectExpression(parsedValue);
          break;
        default:
          pureData[key] = parsedValue;
      }
    }
    return pureData;
  }

  private getValueFormArrayExpression(parsed: Array<any>): Array<any> {
    return parsed.map((item) => {
      const vType = getVariableType(item);
      if (vType === E_VariableType.Array) {
        return this.getValueFormArrayExpression(item);
      }

      if (vType === E_VariableType.Object) {
        return this.getValueFromObjectExpression(item);
      }
      return item;
    });
  }
  private getCodeFromObjectMethod(start: number, end: number) {
    const functionCode = this.sourceCode.substring(start, end);
    // 先简单考虑字符串是否为function 开头这一种情况，后面有问题再搞
    const reg = /^function/;
    return {
      type: E_SchemaJsType.JSFunction,
      value: reg.test(functionCode) ? functionCode : `function ${functionCode}`,
    };
  }
}

export default VueScriptTranslator;
