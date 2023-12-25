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
import { parse, compileTemplate, compileScript } from '@vue/compiler-sfc';
import { E_ComponentName, E_ResStatus, E_UIlib } from './lib/enum';
import { TinyEnginePageSchema, TransformResponseData } from './lib/types';
import ScriptParser from './translators/script';
import astToSchema from './translators/template';
type TranslatorParam = {
  id?: any;
  sourceLib?: E_UIlib;
  targetLib?: E_UIlib;
  vueCode: string;
};

class Translator {
  public id: any;
  public vueCode: string;
  public sourceLib = E_UIlib.ElementUI;
  public targetLib = E_UIlib.OpenTiny;
  private pageSchema: TinyEnginePageSchema = {
    state: {},
    methods: {},
    componentName: E_ComponentName.Page,
    css: '',
    props: {},
    lifeCycles: {},
    children: [],
    fileName: `temp_file_${Date.now()}`,
  };
  private parsed: any;
  private templateParsed: any;
  private styleParsed: any;
  private scriptParsed: any;
  constructor(params: TranslatorParam) {
    this.id = params.id;
    this.vueCode = params.vueCode.trim();
    this.sourceLib = params.sourceLib ?? E_UIlib.ElementUI;
    this.targetLib = params.targetLib ?? E_UIlib.OpenTiny;
  }

  transform(): TransformResponseData {
    try {
      // 解析vue
      this.compileVueSfc();
    } catch (e) {
      // 返回给服务端失败信息
      return {
        status: E_ResStatus.Fail,
        message: (e as Error)?.message ?? 'Failed to parse the Vue file.',
      };
    }

    return {
      status: E_ResStatus.Success,
      message: 'success',
      schema: this.pageSchema,
    };
  }

  // 解析vue AST
  private compileVueSfc() {
    this.parsed = parse(this.vueCode.trim());
    const { styles, script, template } = this.parsed?.descriptor ?? {};
    this.styleParsed = styles;
    this.scriptParsed = script;
    this.templateParsed = template;
    this.compileTemplate();
    this.compileScript();
    this.compileStyle();
  }

  /**
   * 模板解析
   *
   * 模板解析的代码结构设计，见文档
   * 
   *
   * @private
   * @memberof Translator
   */
  private compileTemplate() {
    const templateContent = this.templateParsed?.content;
    if (!templateContent) {
      throw new ReferenceError('No available template content found.');
    }
    const compiledTpl = compileTemplate({
      id: 'tpl',
      filename: this.pageSchema.fileName,
      source: templateContent,
    });
    if (!compiledTpl.ast) {
      throw new Error('No ast found for the compiled template content.');
    }

    // AST转schema
    this.pageSchema.children = astToSchema(compiledTpl.ast, {
      sourceLib: this.sourceLib,
      targetLib: this.targetLib,
    }).children;
  }

  // style AST转换
  private compileStyle() {
    const css = this.styleParsed[0]?.content ?? '';
    this.pageSchema.css = css.replace(/\r?\n/g, '');
  }

  // script AST转换
  private compileScript() {
    const sourceCode: string = this.scriptParsed?.content;
    if (!sourceCode) {
      return;
    }

    const { scriptAst } = compileScript(this.parsed.descriptor, {
      id: 'script',
    });
    if (!Array.isArray(scriptAst)) {
      return;
    }

    const parser = new ScriptParser(scriptAst, sourceCode);
    const scriptSchema: Partial<TinyEnginePageSchema> = parser.transform();
    this.pageSchema = { ...this.pageSchema, ...scriptSchema };
  }
}

export default Translator;
