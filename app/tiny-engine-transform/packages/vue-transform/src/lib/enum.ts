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
export enum E_ResStatus {
  Success = 1,
  Fail = 0,
}

export enum E_UIlib {
  ElementUI = 'element-ui',
  OpenTiny = 'OpenTiny',
}

export enum E_ComponentName {
  Page = 'Page',
  Block = 'Block',
}

export enum E_Expression {
  ObjectExpression = 'ObjectExpression',
  ArrayExpression = 'ArrayExpression',
  FunctionExpression = 'FunctionExpression',
}

export enum E_ObjectType {
  ObjectProperty = 'ObjectProperty',
  ObjectMethod = 'ObjectMethod',
}

export enum E_Literal {
  StringLiteral = 'StringLiteral',
  NumericLiteral = 'NumericLiteral',
  BooleanLiteral = 'BooleanLiteral',
  NullLiteral = 'NullLiteral',
  RegExpLiteral = 'RegExpLiteral',
}

export enum E_Statement {
  BlockStatement = 'BlockStatement',
  ReturnStatement = 'ReturnStatement',
}

export enum E_Declaration {
  ExportDefaultDeclaration = 'ExportDefaultDeclaration',
  ImportDeclaration = 'ImportDeclaration',
  VariableDeclaration = 'VariableDeclaration',
}

export enum E_SchemaJsType {
  JSFunction = 'JSFunction',
  JSExpression = 'JSExpression',
}

// 想起啥写啥，后面再补
export enum E_VariableType {
  String = 'String',
  Boolean = 'Boolean',
  Number = 'Number',
  Symbol = 'Symbol',
  Null = 'Null',
  Undefined = 'Undefined',
  Function = 'Function',
  Date = 'Date',
  RegExp = 'RegExp',
  Error = 'Error',
  Object = 'Object',
  Array = 'Array',
}

export enum E_LifeCycles {
  BeforeCreate = 'beforeCreate',
  Created = 'created',
  BeforeMount = 'beforeMount',
  Mounted = 'mounted',
  BeforeUpdate = 'beforeUpdate',
  Updated = 'updated',
  BeforeDestroy = 'beforeDestroy',
  Destroyed = 'destroyed',
}

export enum E_NodeType {
  ROOT = 0, // 根节点
  ELEMENT = 1, // 元素节点
  TEXT = 2, // 文本节点
  COMMENT = 3, // 注释节点
  SIMPLE_EXPRESSION = 4, // 简单表达式节点
  INTERPOLATION = 5, // 插值节点
  ATTRIBUTE = 6, // 属性节点
  DIRECTIVE = 7, // 指令节点
  COMPOUND_EXPRESSION = 8, // 复合表达式节点
  IF = 9, // 条件语句节点
  IF_BRANCH = 10, // 条件语句分支节点
  FOR = 11, // 循环语句节点
  TEXT_CALL = 12, // 文本调用节点
  VNODE_CALL = 13, // 虚拟节点调用节点
  JS_CALL_EXPRESSION = 14, // JavaScript调用表达式节点
  JS_OBJECT_EXPRESSION = 15, // JavaScript对象表达式节点
  JS_PROPERTY = 16, // JavaScript属性节点
  JS_ARRAY_EXPRESSION = 17, // JavaScript数组表达式节点
  JS_FUNCTION_EXPRESSION = 18, // JavaScript函数表达式节点
  JS_CONDITIONAL_EXPRESSION = 19, // JavaScript条件表达式节点
  JS_CACHE_EXPRESSION = 20, // JavaScript缓存表达式节点
  JS_BLOCK_STATEMENT = 21, // JavaScript代码块语句节点
  JS_TEMPLATE_LITERAL = 22, // JavaScript模板字符串节点
  JS_IF_STATEMENT = 23, // JavaScript条件语句节点
  JS_ASSIGNMENT_EXPRESSION = 24, // JavaScript赋值表达式节点
  JS_SEQUENCE_EXPRESSION = 25, // JavaScript序列表达式节点
  JS_RETURN_STATEMENT = 26, // JavaScript返回语句节点
}

/**
 * 元素类型
 *
 * 当NodeType为1（元素节点）时，需要把第三方组件库的组件转为指定的另一第三方组件库的组件
 *
 * @export
 * @enum {number}
 */
export const enum E_ElementTypes {
  ELEMENT = 0, // 原生html元素
  COMPONENT = 1, // 组件，包括三方组件、内置组件、自定义组件等（待确认）
  SLOT = 2,
  TEMPLATE = 3,
}

/**
 * 常量类型
 *
 * 在ast中用于表示静态类型的不同级别。这些级别决定了节点在编译过程中的处理方式。
 *
 * @export
 * @enum {number}
 */
export const enum E_ConstantTypes {
  /**
   * 表示节点不是常量，即其值在编译过程中可能会发生变化，不能被视为静态的。
   * 这种类型的节点无法被跳过，也无法被提升（hoist）到编译过程的顶部。
   */
  NOT_CONSTANT = 0,
  /**
   * 表示节点可以被跳过补丁（patch），即在某些情况下，编译器可以决定跳过对这些节点的更新。
   * 这些节点的值是静态的，因此它们在不会影响渲染输出的情况下可以被忽略。
   */
  CAN_SKIP_PATCH = 1,
  /**
   * 表示节点可以被提升（hoist），即在编译过程中，可以将这些节点的计算结果提升
   * 到渲染函数的顶部，以减少重复计算。这些节点通常是静态的。
   */
  CAN_HOIST = 2,
  /**
   * 表示节点可以被转换为字符串，即节点的值是纯字符串，没有动态表达式。
   * 这种类型的节点可以在编译时被直接转换为静态字符串，提高渲染性能。
   */
  CAN_STRINGIFY = 3,
}
