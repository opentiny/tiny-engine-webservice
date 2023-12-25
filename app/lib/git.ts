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
export class GitUser {
  username; // 账号用户名
  email; // 账号邮箱
  userToken; // 账号token
  constructor(
    username = process.env.GIT_USERNAME,
    email = process.env.GIT_EMAIL,
    userToken = process.env.GIT_USER_TOKEN
  ) {
    this.username = username;
    this.email = email;
    this.userToken = userToken;
  }

  // 是否是有效的非默认账户
  public isValidNormalUser(): boolean {
    if (!this.username || !this.email || !this.userToken) {
      return false;
    }
    
    return (
      this.username !== process.env.GIT_USERNAME &&
      this.email !== process.env.GIT_EMAIL &&
      this.userToken !== process.env.GIT_USER_TOKEN
    );
  }
}

export class GitRepository {
  url; // https格式仓库地址
  branch; // 分支
  canCreateNewBranch; // 是否创建新分支
  codePath; // 本地代码根目录
  constructor(url, branch = 'develop', canCreateNewBranch = false, codePath: string) {
    this.url = url;
    this.branch = branch;
    this.canCreateNewBranch = canCreateNewBranch;
    this.codePath = codePath;
  }
}
