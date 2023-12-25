<template>
  <div class="container" style="background-color: #eef0f5">
    <div class="main-container">
      <div class="container-a">
        <div class="title">快速入口</div>
        <div class="content">
          <el-button type="primary">创建节点组</el-button>
          <el-button type="primary">购买节点</el-button>
          <el-button type="primary">管理节点组</el-button>
          <el-button type="primary">管理会话</el-button>
        </div>
      </div>
      <div class="container-b">
        <div class="title">数据监控</div>
        <div class="content">
          <div class="sub-container">
            <div class="sub-title">节点组</div>
            <div class="sub-content">0</div>
          </div>
          <div class="sub-container">
            <div class="sub-title">我购买的节点</div>
            <div class="sub-content">0</div>
          </div>
          <div class="sub-container">
            <div class="sub-title">会话</div>
            <div class="sub-content">0</div>
          </div>
        </div>
      </div>
      <div class="container-c">
        <div class="title">数据监控</div>
        <el-table :data="tableData" :columns="columnData"></el-table>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      columnData: [
        { title: "节点名称", field: "nodeName" },
        { title: "实例名称", field: "instanceName" },
        { title: "使用占比", field: "usagePercentage" },
      ],
      tableData: [
        { nodeName: "节点1", instanceName: "实例1", usagePercentage: "50%" },
        { nodeName: "节点2", instanceName: "实例2", usagePercentage: "30%" },
        { nodeName: "节点3", instanceName: "实例3", usagePercentage: "20%" },
      ],
    };
  },
};
</script>
<style scoped>
.container {
  display: flex;
  justify-content: center;
  background-color: #eef0f5;
  padding: 24px;
}
.main-container {
  display: flex;
  flex-direction: column;
  width: 50vw;
}
.container div {
  padding: 16px;
  background-color: #ffffff;
}
.container .title {
  font-weight: bold;
  font-size: 20px;
}
.container .content {
  display: flex;
  justify-content: space-between;
  margin-top: 48px;
}
.container .content el-button {
  margin-right: 24px;
}
.container .sub-container {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  background-color: #e9edfa;
  width: 200px;
  height: 60px;
  padding: 16px;
}
.container .sub-container .sub-title {
  font-weight: bold;
}
.container-c .title {
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 16px;
}
.el-table {
  width: 100%;
}
</style>