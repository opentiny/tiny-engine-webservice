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
import { Rule } from '../../../../lib/types';

const rule: Rule = {
  componentName: 'TinyCol',
  props: {
    type: {
      key: 'flex',
      value(val) {
        if (val === 'flex') return 'true';
      },
    },
    push: {
      key: 'move',
      value(val) {
        return val;
      },
    },
    pull: {
      key: 'move',
      value(val) {
        return -val;
      },
    },
  },
};

export default rule;
