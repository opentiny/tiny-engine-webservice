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
import * as qs from 'qs';
import { I_Response } from '../lib/interface';
import DataServcice from './dataService';

class Auth extends DataServcice {
 
  private base = 'auth-users-units-roles';
 

 

  // 查询用户列表
  users(param): Promise<I_Response> {
    const url = `${this.base}/users?${qs.stringify(param)}`;
    return this.query({
      url
    });
  }


  // 查询当前角色信息
  async me(): Promise<I_Response> {
    const userInfo = await this.query({
      url: `${this.base}/me`
    });
    return userInfo;
  }

}

export default Auth;
