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
import DataService from '../dataService';

/**
 * Test Service
 */
export default class ResourceVersion extends DataService {
  /**
   * sayHi to you
   * @param name - your name
   */
  public async findLatest(name: string) {
    const url = `resource-versions?appName=${name}&_sort=created_at:DESC&_limit=1`;
    return this.query({
      url
    });
  }
}
