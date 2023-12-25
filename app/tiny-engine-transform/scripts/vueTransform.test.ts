import transformer from '../packages/vue-transform/index';

/**
 * 快捷测试的入口文件
 *
 * 其中的vue单文件代码字符串，可以通过在lowcode-webservice项目打断点获取
 */
const vueCode =
  /* eslint-disable max-len */
  '<template>\n  <div>\n    <el-button v-for="item in items" :key="item.id" @click="handleButtonClick(item)">\n      {{ item.name }}\n    </el-button>\n    <el-card :header="cardHeader" :body-style="{ paddingBottom: \'20px\' }">\n      <el-form :model="formData" label-width="80px">\n        <el-form-item label="用户名">\n          <el-input v-model="formData.username"></el-input>\n        </el-form-item>\n        <el-form-item label="密码">\n          <el-input v-model="formData.password" type="password"></el-input>\n        </el-form-item>\n        <el-form-item>\n          <el-button type="primary" @click="handleFormSubmit">提交</el-button>\n        </el-form-item>\n      </el-form>\n    </el-card>\n  </div>\n</template>\n\n<script>\nimport { ElButton, ElCard, ElForm, ElFormItem, ElInput } from \'element-ui\';\n\nexport default {\n  components: {\n    ElButton,\n    ElCard,\n    ElForm,\n    ElFormItem,\n    ElInput\n  },\n  data() {\n    return {\n      items: [\n        { id: 1, name: \'按钮1\' },\n        { id: 2, name: \'按钮2\' },\n        { id: 3, name: \'按钮3\' }\n      ],\n      cardHeader: \'表单示例\',\n      formData: {\n        username: \'\',\n        password: \'\'\n      }\n    };\n  },\n  methods: {\n    handleButtonClick(item) {\n      console.log(\'点击了按钮：\', item);\n    },\n    handleFormSubmit() {\n      console.log(\'提交表单：\', this.formData);\n    }\n  }\n};\n</script>';
const result = transformer.translate(vueCode);
console.log('>>>>>>>>>>>>>>>', result);
