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
import { E_UIlib } from './src/lib/enum';
import { TransformResponseData } from './src/lib/types';
import Translator from './src/translator';

export default {
  translate(vueCode: string, sourceLib?: E_UIlib, targetLib?: E_UIlib): TransformResponseData {
    return new Translator({
      vueCode,
      sourceLib,
      targetLib,
    }).transform();
  },
};
