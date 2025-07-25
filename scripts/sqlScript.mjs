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
import mysql from 'mysql2/promise'; // 使用 promise 版本
import Logger from './logger.mjs';

const logger = new Logger('sqlScript')
// 数据库连接池配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '111111',
  database: 'tiny_engine-data',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
};

// 创建连接池
const sourcePool = mysql.createPool({ ...dbConfig });
const targetPool = mysql.createPool({ ...dbConfig });
const batchSize = 1000;
export default class SqlScript {

  /**
   * 通用数据迁移方法 
   * @param {string} sourceTable 源表名
   * @param {string} targetTable 目标表名
   * @param {Function} transformFn 数据转换函数
   */
  async migrateTable(sourceTable, targetTable, transformFn) {
    let sourceConn, targetConn;
    try {
      // 获取连接
      sourceConn = await sourcePool.getConnection();
      targetConn = await targetPool.getConnection();

      logger.info(`Starting migration from ${sourceTable} to ${targetTable}`);

      // 读取源数据
      const [rows] = await sourceConn.query(`SELECT * FROM ??`, [sourceTable]);

      if (rows.length == 0) {
        logger.warn(`No data found in source table ${sourceTable}`);
        return;
      }

      logger.info(`Fetched ${rows.length} rows from ${sourceTable}`);

      // 转换数据
      const targetRows = rows.map(transformFn);

      // 分批迁移数据
      await this.batchInsert(targetConn, targetTable, targetRows);

      logger.info(`Successfully migrated ${rows.length} rows to ${targetTable}`);
    } catch (err) {
      logger.error(`Error migrating ${sourceTable} to ${targetTable}: ${err.message}`);
      throw err;
    } finally {
      // 释放连接
      if (sourceConn) sourceConn.release();
      if (targetConn) targetConn.release();
    }
  }

  /**
   * 批量插入数据
   * @param {Object} connection 数据库连接
   * @param {string} tableName 表名
   * @param {Array} data 数据数组
   */
  async batchInsert(connection, tableName, data) {
    if (data.length == 0) {
      logger.warn('No data to insert');
      return;
    }

    const columns = Object.keys(data[0]);
    const columnPlaceholders = columns.map(() => '??').join(', ');

    // 准备批量插入语句
    const sql = `INSERT INTO ?? (${columnPlaceholders}) VALUES ?`;
    const preparedSql = mysql.format(sql, [tableName, ...columns]);

    try {
      // 分批处理
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const values = batch.map(row => Object.values(row));

        await connection.query(preparedSql, [values]);
        logger.info(`Inserted batch ${i / batchSize + 1} (${batch.length} rows)`);
      }
    } catch (err) {
      logger.error(`Error inserting into ${tableName}:`, err);
      throw err;
    }
  }

  // users-permissions_user表迁移
  async users() {
    const transformFn = (item) => ({
      id: item.id,
      username: item.username,
      email: item.email,
      role: item.role,
      enable: item.enable,
      is_admin: item.is_admin,
      is_public: item.is_public,
      created_by: item.created_by == null ? "1" : item.created_by,
      created_time: item.created_at,
      last_updated_by: item.updated_by == null ? "1" : item.updated_by,
      last_updated_time: item.updated_at
    });

    await this.migrateTable('users-permissions_user', 't_user', transformFn);
  }

  // apps表迁移
  async apps() {
    const transformFn = (item) => ({
      id: item.id,
      name: item.name,
      platform_id: 1,
      platform_history_id: 1,
      publish_url: item.obs_url,
      editor_url: item.editor_url,
      visit_url: item.visit_url,
      image_url: item.image_url,
      assets_url: item.assets_url,
      state: item.state,
      published: item.published,
      home_page_id: item.home_page,
      app_website: item.app_website,
      css: item.css,
      config: item.config,
      constants: item.constants,
      data_handler: item.data_handler,
      latest: item.latest,
      git_group: item.git_group,
      project_name: item.project_name,
      branch: item.branch,
      is_demo: item.is_demo,
      is_default: item.is_default,
      template_type: item.template_type,
      set_template_time: item.set_template_time,
      description: item.description,
      set_template_by: item.set_template_by,
      set_default_by: item.set_default_by,
      framework: item.framework,
      global_state: item.gobal_state,
      default_lang: item.default_lang,
      extend_config: item.extend_config,
      data_hash: item.data_hash,
      can_associate: item.can_associate,
      data_source_global: item.data_source_global,
      tenant_id: item.tenant,
      created_by: item.createdBy,
      created_time: item.created_at,
      last_updated_by: item.updatedBy,
      last_updated_time: item.updated_at
    });

    await this.migrateTable('apps', 't_app', transformFn);
  }

  // app_extensions表迁移
  async appExtensions() {
    const transformFn = (item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      content: item.content,
      category: item.category,
      app_id: item.app,
      tenant_id: "1",
      created_by: item.created_by == null ? "1" : item.created_by,
      created_time: item.created_at,
      last_updated_by: item.updated_by == null ? "1" : item.updated_by,
      last_updated_time: item.updated_at
    });

    await this.migrateTable('app_extensions', 't_app_extension', transformFn);
  }

  // blocks表迁移
  async blocks() {
    const transformFn = (item) => ({
      id: item.id,
      name: item.name_cn,
      label: item.label,
      framework: item.framework,
      content: item.content,
      assets: item.assets,
      last_build_info: item.last_build_info,
      description: item.description,
      tags: item.tags,
      latest_history_id: item.current_history,
      screenshot: item.screenshot,
      path: item.path,
      occupier_by: "1",
      is_official: item.isOfficial,
      public: item.public,
      is_default: item.isDefault,
      tiny_reserved: item.tiny_reserved,
      npm_name: item.npm_name,
      platform_id: 1,
      app_id: item.created_app,
      content_blocks: item.content_blocks,
      tenant_id: "1",
      created_by: item.created_by == null ? "1" : item.created_by,
      created_time: item.created_at,
      last_updated_by: item.updated_by == null ? "1" : item.updated_by,
      last_updated_time: item.updated_at
    });

    await this.migrateTable('blocks', 't_block', transformFn);
  }

  // block_histories表迁移
  async blockHistories() {
    const transformFn = (item) => ({
      id: item.id,
      ref_id: item.block_id,
      version: item.version,
      message: item.message,
      label: item.label,
      framework: item.framework,
      content: item.content,
      assets: item.assets,
      build_info: item.build_info,
      description: item.description,
      screenshot: item.screenshot,
      path: item.path,
      public: item.public,
      npm_name: item.npm_name,
      i18n: item.i18n,
      mode: item.mode,
      platform_id: 1,
      app_id: item.created_app,
      content_blocks: item.content_blocks,
      tenant_id: "1",
      created_by: item.created_by == null ? "1" : item.created_by,
      created_time: item.created_at,
      last_updated_by: item.updated_by == null ? "1" : item.updated_by,
      last_updated_time: item.updated_at
    });

    await this.migrateTable('block_histories', 't_block_history', transformFn);
  }

  // block_categories表迁移
  async blockCategories() {
    const transformFn = (item) => ({
      id: item.id,
      name: item.name,
      description: item.desc,
      app_id: item.app,
      platform_id: 1,
      tenant_id: "1",
      created_by: item.created_by == null ? "1" : item.created_by,
      created_time: item.created_at,
      last_updated_by: item.updated_by == null ? "1" : item.updated_by,
      last_updated_time: item.updated_at
    });

    await this.migrateTable('block_categories', 't_block_group', transformFn);
  }

  // blocks_categories__block_categories_blocks表迁移
  async blockCategorieBlock() {
    const transformFn = ({ id, block_id, 'block-category_id': blockGroupId }) => ({
      id,
      block_id,
      block_group_id: blockGroupId, // 重命名为合法标识符
    });

    await this.migrateTable('blocks_categories__block_categories_blocks', 'r_block_group_block', transformFn);
  }

  // block_groups表迁移
  async blockGroups() {
    const transformFn = (item) => ({
      id: item.id,
      name: item.name,
      description: item.desc,
      app_id: item.app,
      platform_id: 1,
      tenant_id: "1",
      created_by: item.created_by == null ? "1" : item.created_by,
      created_time: item.created_at,
      last_updated_by: item.updated_by == null ? "1" : item.updated_by,
      last_updated_time: item.updated_at
    });

    await this.migrateTable('block_groups', 't_block_group', transformFn);
  }

  // blocks_groups__block_groups_blocks表迁移
  async blockGroupsBlock() {
    const transformFn = ({ id, block_id, 'block-group_id': blockGroupId }) => ({
      id,
      block_id,
      block_group_id: blockGroupId, // 重命名为合法标识符
    });

    await this.migrateTable('blocks_groups__block_groups_blocks', 'r_block_group_block', transformFn);
  }

  // component_library表迁移
  async componentLibrary() {
    const transformFn = (item) => ({
      id: item.id,
      name: item.name,
      version: item.version,
      package: item.packageName,
      framework: item.framework,
      script: item.script,
      css: item.css,
      description: item.description,
      thumbnail: item.thumbnail,
      public: item.public,
      is_official: item.isOfficial,
      is_default: item.isDefault,
      is_started: 1,
      tenant_id: "1",
      created_by: item.created_by == null ? "1" : item.created_by,
      created_time: item.created_at,
      last_updated_by: item.updated_by == null ? "1" : item.updated_by,
      last_updated_time: item.updated_at
    });

    await this.migrateTable('component_library', 't_component_library', transformFn);
  }

  // user_components表迁移
  async component() {
    const transformFn = (item) => ({
      id: item.id,
      name: item.name,
      version: item.version,
      name_en: item.component,
      icon: item.icon,
      npm: item.npm,
      doc_url: item.doc_url,
      screenshot: item.screenshot,
      description: item.description,
      tags: item.tags,
      keywords: item.keywords,
      dev_mode: item.dev_mode,
      group: item.group,
      category: item.category,
      priority: item.priority,
      snippets: item.snippets,
      schema_fragment: item.schema_fragment,
      configure: item.configure,
      public: item.public,
      framework: item.framework,
      tiny_reserved: item.tiny_reserved,
      component_metadata: item.component_metadata,
      is_official: item.isOfficial,
      is_default: item.isDefault,
      library_id: item.library,
      tenant_id: item.tenant == null ? "1" : item.tenant,
      created_by: item.created_by == null ? "1" : item.created_by,
      created_time: item.created_at,
      last_updated_by: item.updated_by == null ? "1" : item.updated_by,
      last_updated_time: item.updated_at
    });

    await this.migrateTable('user_components', 't_component', transformFn);
  }

  // i18n_entriess表迁移
  async i18nEntries() {
    const transformFn = (item) => ({
      id: item.id,
      key: item.key,
      content: item.content,
      host_id: item.host,
      host_type: item.host_type,
      lang_id: item.lang,
      tenant_id: "1",
      created_by: item.created_by == null ? "1" : item.created_by,
      created_time: item.created_at,
      last_updated_by: item.updated_by == null ? "1" : item.updated_by,
      last_updated_time: item.updated_at
    });

    await this.migrateTable('i18n_entries', 't_i18n_entry', transformFn);
  }

  // i18n_langs表迁移
  async i18nLangs() {
    const transformFn = (item) => ({
      id: item.id,
      lang: item.lang,
      label: item.label,
      created_by: item.created_by == null ? "1" : item.created_by,
      created_time: item.created_at,
      last_updated_by: item.updated_by == null ? "1" : item.updated_by,
      last_updated_time: item.updated_at
    });

    await this.migrateTable('i18n_langs', 't_i18n_lang', transformFn);
  }

  // materials表迁移
  async materials() {
    const transformFn = (item) => ({
      id: item.id,
      name: item.name,
      npm_name: item.npm_name,
      framework: item.framework,
      assets_url: item.assets_url,
      image_url: item.image_url,
      published: item.published,
      latest_version: item.version,
      description: item.description,
      public: item.public,
      last_build_info: item.last_build_info,
      latest_history_id: item.material_histories == null ? 1 : item.material_histories,
      component_library_id: item.component_library_id,
      tiny_reserved: item.tiny_reserved,
      is_official: item.isOfficial,
      is_default: item.isDefault,
      tenant_id: item.tenant == null ? "1" : item.tenant,
      created_by: item.created_by == null ? "1" : item.created_by,
      created_time: item.created_at,
      last_updated_by: item.updated_by == null ? "1" : item.updated_by,
      last_updated_time: item.updated_at
    });

    await this.migrateTable('materials', 't_material', transformFn);
  }

  // material_histories表迁移
  async materialHistories() {
    const transformFn = (item) => ({
      id: item.id,
      ref_id: item.material,
      name: item.name,
      npm_name: item.npm_name,
      version: item.version,
      content: item.content,
      framework: item.framework,
      assets_url: item.assets_url,
      description: item.description,
      tenant_id: "1",
      created_by: item.created_by == null ? "1" : item.created_by,
      created_time: item.created_at,
      last_updated_by: item.updated_by == null ? "1" : item.updated_by,
      last_updated_time: item.updated_at
    });

    await this.migrateTable('material_histories', 't_material_history', transformFn);
  }

  // material_histories_components__user_components_mhs表迁移
  async materialHistoriesComponent() {
    const transformFn = ({ id, 'user-component_id': componentId, 'material-history_id': materialHistoryId }) => ({
      id,
      component_id: componentId,
      material_history_id: materialHistoryId,
    });


    await this.migrateTable('material_histories_components__user_components_mhs', 'r_material_history_component', transformFn);
  }

  // materials_user_components__user_components_materials表迁移
  async materialComponent() {
    const transformFn = ({ id, 'user-component_id': componentId, material_id }) => ({
      id,
      component_id: componentId,
      material_id,
    });


    await this.migrateTable('materials_user_components__user_components_materials', 'r_material_component', transformFn);
  }

  // pages表迁移
  async pages() {
    const transformFn = (item) => ({
      id: item.id,
      app_id: item.app,
      name: item.name,
      route: item.route,
      is_body: item.is_body,
      page_content: item.page_content,
      parent_id: item.parent_id,
      group: item.group,
      depth: item.depth,
      is_page: item.is_page,
      occupier_by: "1",
      is_default: item.is_default,
      content_blocks: item.content_blocks,
      tenant_id: item.tenant == null ? "1" : item.tenant,
      created_by: item.created_by == null ? "1" : item.created_by,
      created_time: item.created_at,
      last_updated_by: item.updated_by == null ? "1" : item.updated_by,
      last_updated_time: item.updated_at
    });

    await this.migrateTable('pages', 't_page', transformFn);
  }

  // pages_histories表迁移
  async pagesHistories() {
    const transformFn = (item) => ({
      id: item.id,
      ref_id: item.page,
      app_id: 1,
      version: "draft",
      message: item.message,
      name: item.name,
      route: item.route,
      is_home: item.is_home,
      is_page: 1,
      is_body: item.is_body,
      page_content: item.page_content,
      parent_id: item.parent_id,
      group: item.group,
      is_default: 0,
      is_published: 0,
      content_blocks: item.content_blocks,
      tenant_id: "1",
      created_by: item.created_by == null ? "1" : item.created_by,
      created_time: item.created_at,
      last_updated_by: item.updated_by == null ? "1" : item.updated_by,
      last_updated_time: item.updated_at
    });

    await this.migrateTable('pages_histories', 't_page_history', transformFn);
  }

  // sources表迁移
  async sources() {
    const transformFn = (item) => ({
      id: item.id,
      name: item.name,
      data: item.data,
      tpl: item.tpl,
      app_id: 1,
      platform_id: 1,
      description: item.desc,
      tenant_id: "1",
      created_by: item.created_by == null ? "1" : item.created_by,
      created_time: item.created_at,
      last_updated_by: item.updated_by == null ? "1" : item.updated_by,
      last_updated_time: item.updated_at
    });

    await this.migrateTable('sources', 't_datasource', transformFn);
  }

  // tenant表迁移
  async tenant() {
    const transformFn = (item) => ({
      id: item.id,
      name_cn: item.tenant_id,
      name_en: item.name_cn,
      description: item.desc,
      created_by: item.created_by == null ? "1" : item.created_by,
      created_time: item.created_at,
      last_updated_by: item.updated_by == null ? "1" : item.updated_by,
      last_updated_time: item.updated_at
    });

    await this.migrateTable('tenants', 't_tenant', transformFn);
  }

  async platform() {
    let targetConn = null;
    try {
      targetConn = await targetPool.getConnection();

      // 修正后的平台插入语句（注意反引号和日期格式）
      const platformSql = `
      INSERT INTO t_platform 
      VALUES (
        1, 
        'default', 
        1, 
        NULL, 
        '专用设计器', 
        '1.0.0', 
        1, 
        639, 
        NULL, 
        NULL, 
        NULL, 
        1, 
        NULL, 
        NULL, 
        NULL, 
        NULL, 
        NULL, 
        NULL, 
        NULL, 
        NULL, 
        '1', 
        NULL, 
        '1', 
        '1', 
        '1', 
        '2024-11-14 22:17:39', 
        '2024-11-14 22:17:39'
      )`;

      // 修正后的平台历史插入语句
      const platformHistorySql = `
      INSERT INTO t_platform_history 
      VALUES (
        1, 
        1, 
        '1.0.0', 
        'default', 
        'http://tinyengine.com', 
        '默认设计器', 
        NULL, 
        639, 
        1, 
        '@opentiny/lowcode-alpha-material-materialstwo-1505', 
        '1.0.8', 
        NULL, 
        '1', 
        NULL, 
        '1', 
        '1', 
        '1', 
        '2024-11-14 22:20:25', 
        '2024-11-14 22:20:25'
      )`;

      // 执行插入
      await targetConn.query(platformSql);
      await targetConn.query(platformHistorySql);

      // 插入完成后验证
      logger.info('Inserted platform and platform history successfully');

      // 选择性地查询插入结果进行验证
      const [rows] = await targetConn.query('SELECT * FROM t_platform WHERE id = 1');
      if (rows.length === 0) {
        throw new Error('Platform data not inserted correctly');
      }

    } catch (error) {
      logger.error(`Error inserting platform data: ${error.message}`);
      throw error; // 重新抛出错误以便上层处理
    } finally {
      if (targetConn) {
        await targetConn.release();
      }
    }
  }

  
}

// 执行迁移
(async () => {
  try {
    const script = new SqlScript();

    // 执行迁移
    await script.users();
    await script.apps();
    await script.appExtensions();
    await script.blocks();
    await script.blockHistories();
    // 不建议迁移以下两个表，java版本区块分组与区块分区合并，如果想迁移block_group表相关数据，请保证block_groups表中id与表block_categories中id不冲突，
    // blocks_groups__block_groups_blocks 和blocks_categories__block_categories_blocks中数据不冲突
    // await script.blockGroups(); 
    // await script.blockGroupsBlock(); 
    await script.blockCategories();
    await script.blockCategorieBlock();
    await script.componentLibrary();
    await script.component();
    await script.i18nEntries();
    await script.i18nLangs();
    await script.materials();
    await script.materialHistories();
    await script.materialHistoriesComponent();
    await script.materialComponent();
    await script.pages();
    await script.pagesHistories();
    await script.sources();
    await script.tenant();
    await script.platform();
    logger.info('All migrations completed successfully');
  } catch (err) {
    logger.error('Migration failed:', err);
    process.exit(1);
  } finally {
    try {
      // 确保连接池在所有操作完成后关闭
      await sourcePool.end();
      await targetPool.end();
    } catch (closeError) {
      logger.error('Error closing connection pools:', closeError);
    }
  }
})();
