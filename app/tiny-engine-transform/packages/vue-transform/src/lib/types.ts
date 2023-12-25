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
import { E_ComponentName, E_ResStatus } from './enum';

export type RulePropUnit = {
  key?: string;
  value?: (input: any) => any;
};

export type Rule = {
  componentName: string;
  props?: Record<string, RulePropUnit>;
};

export type ChildrenSchema = {
  componentName?: string;
  props?: Record<string, any>;
  children?: Array<ChildrenSchema>;
  id?: string;
  componentType?: 'Block' | 'Component';
  condition?: any;
  loop?: Array<any> | Record<string, any>;
  loopArgs?: Array<string>;
};

export type AstProp = {
  type: number;
  [key: string]: any; // 任意属性
};

export type AstNodeSchema = {
  type: number;
  [key: string]: any; // 任意属性
};

export type TinyEnginePageSchema = {
  state: any;
  methods: any;
  componentName: E_ComponentName;
  css: string;
  props: any;
  children: ChildrenSchema[] | undefined;
  fileName: string;
  lifeCycles: any;
  dataSource?: any;
  uilts?: Array<any>;
  bridge?: Array<any>;
  inputs?: Array<any>;
  outputs?: Array<any>;
};

export type TransformResponseData = {
  status: E_ResStatus;
  message: string;
  schema?: TinyEnginePageSchema;
};

export type TransformOption = {
  sourceLib: string;
  targetLib: string;
  [key: string]: any; // 任意属性
};
