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
import { catchError } from '../../../lib/decorator';
import { E_NodeType } from '../../../lib/enum';
import { AstNodeSchema, ChildrenSchema } from '../../../lib/types';
import AstNode from '../astNode';

export default class TextCallNode extends AstNode {
  private content: any;

  constructor(current: AstNodeSchema) {
    super(current);

    this.content = current.content;
  }

  @catchError()
  generateSchema(): ChildrenSchema {
    this.node = {
      componentName: 'Text',
      props: {
        // 暂不支持“插值”插入复合表达式，国际化词条也不支持
        text: this.getText(),
      },
    };

    return this.node;
  }

  private getText() {
    if (this.content.type === E_NodeType.INTERPOLATION) {
      // type=5 插值
      if (this.content.content.type === E_NodeType.COMPOUND_EXPRESSION) {
        // type=8 复合表达式
        return this.content.content.loc.source;
      } else {
        // type=4 简单表达式
        return this.content.content.content;
      }
    } else {
      // type=2 普通文本
      return this.content.content;
    }
  }
}
