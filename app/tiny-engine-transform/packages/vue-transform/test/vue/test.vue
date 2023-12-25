
<template>
  <div>
    <el-table :data="tableData" :columns="columnData" style="width: 100%">
     <div class="content">
    <el-layout>
      <el-row>
        <el-col :span="2">
          <div class="col">move 0</div>
        </el-col>
        <el-col :span="2" :push="1">
          <div class="col">move 1</div>
        </el-col>
        <el-col :span="2" :push="4">
          <div class="col">向右移动4格</div>
        </el-col>
        <el-col :span="2" :pull="6">
          <div class="col">向左移动6格</div>
        </el-col>
      </el-row>
    </el-layout>
  </div>
    </el-table>
  </div>
</template>

<script>
import { ElTable } from 'element-ui';

export default {
  components: {
    ElTable,
  },
  data() {
    return {
      tableData: [
        { id: 1, name: 'Alice', age: 25 },
        { id: 2, name: 'Bob', age: 30 },
        // ...
      ],
      columnData: [
        { prop: 'id', label: 'ID' },
        { prop: 'name', label: '姓名' },
        { prop: 'age', label: '年龄' },
        // ...
      ],
    };
  },
};
</script>