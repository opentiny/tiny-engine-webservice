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
import { Service } from 'egg';
import semver from 'semver';
import * as path from 'path';
import * as fs from 'fs-extra';
import { execSync } from 'child_process';
import { E_TYPES } from '../../lib/enum';
import { I_Response, I_SourceCode } from '../../lib/interface';

export default class Build extends Service {
  
  /**
   *
   * @param block 区块记录
   * @param history 区块关联的历史记录
   * @returns 转换后的代码
   */
  async translate(block, history): Promise<I_SourceCode> {
    if (!block) {
      throw new Error('block undefined, check block content format');
    }
    const { label, framework } = block;

    // 使用历史记录中的schema做转换
    const { content } = history;
    if (!content) {
      throw new Error('unexpected history content');
    }

    // 获取嵌套的区块
    const innerBlocksLabel: string[] = [];
    this.traverseBlocks(content, innerBlocksLabel);
    const innerBlocks: I_Response = innerBlocksLabel.length
      ? await this.service.materialCenter.block.find({ label_in: innerBlocksLabel })
      : { data: [] };
    let blocksData = [];
    if (innerBlocks.error) {
      this.logger.error(innerBlocks.error.message);
      throw new Error('strapi query blocks by label failed');
    } else {
      blocksData = innerBlocks.data.map(({ content, label }) => ({ content, label })).filter((b) => b.label !== label);
    }

    const type = E_TYPES[framework];
    const gpkg = this.app.config.dsl[type];
    const { generateCode } = require(gpkg.dslPkgCore);
    const result = generateCode({ pageInfo: { schema: content, name: label }, blocksData });
    return result;
  }
  
  updateDSLPkgIfNotlatest(pkgName) {
    const packageJson = fs.readFileSync(
      path.resolve(this.app.baseDir, 'node_modules', pkgName, 'package.json'),
      'utf8'
    );
    const oldVersion = JSON.parse(packageJson)?.version;
    const info = this.getPackageInfo(`${pkgName}`);
    const newVersion = (info && info.version) || '0.0.0';
    if (oldVersion && semver.gt(newVersion, oldVersion)) {
      execSync(`npm i ${pkgName}`, { cwd: this.app.baseDir });
    }
  }

  private getPackageInfo(packageName) {
    try {
      const str = execSync(`npm view ${packageName} --json`, { timeout: 3000 });
      return JSON.parse(str.toString('utf8').trim());
    } catch (error) {
      return null;
    }
  }

  public isBlock(schema) {
    return schema && schema.componentType === 'Block';
  }

  public traverseBlocks(schema, blocks) {
    if (Array.isArray(schema)) {
      schema.forEach((prop) => this.traverseBlocks(prop, blocks));
    } else if (typeof schema === 'object') {
      if (this.isBlock(schema) && !blocks.includes(schema.componentName)) {
        blocks.push(schema.componentName);
      }
      if (Array.isArray(schema.children)) {
        this.traverseBlocks(schema.children, blocks);
      }
    }
  }
}
