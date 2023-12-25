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
const fs = require('fs-extra');
const path = require('path');
import index from '../../index';

const filename = 'template.vue';
const testVuePath = path.resolve(__dirname, `../vue/${filename}`);
fs.readFile(testVuePath, (_err, data) => {
  const schema = index.translate(data.toString());

  console.log(schema);
});
