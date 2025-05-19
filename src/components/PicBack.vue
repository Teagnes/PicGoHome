<template>
  <div>
  <div class="mb-4">
    <el-button type="info" plain>源文件目录</el-button>
      <el-input v-model="in_source" style="width: 400px"  />
  </div>
  <div class="mb-4">
    <el-button type="info" plain>仓库目录</el-button>
      <el-input v-model="in_repo" style="width: 400px"  />
  </div>
  <div class="mb-4">
    <el-button type="info" plain>暂存目录</el-button>
      <el-input v-model="in_cache" style="width: 400px" />
  </div>
  <div class="mb-4">
   进度栏todo
  </div>
  <div class="mb-4">
    <el-checkbox-group v-model="checkList">
      <el-checkbox label="仅文件名相同" value="1" />
      <el-checkbox label="完全相同" value="2" />
      <el-checkbox label="新文件" value="3" />
    </el-checkbox-group>
  </div>
  <div class="mb-4">
    <el-button type="info" plain >过滤筛选</el-button>
    <el-button type="info" plain @click="handleBackup">开始备份</el-button>
  </div>

  <el-table :data="filteredTableData" border style="width: 100%">
    <el-table-column prop="index" label="序号" width="120" />
    <el-table-column prop="name" label="文件名" width="180" />
    <el-table-column prop="check" label="检查结果" width="150"/>
    <el-table-column prop="path" label="路径" />
    <el-table-column prop="size" label="文件大小" width="120" />
    <el-table-column prop="exists" label="是否存在" width="120" />
    <el-table-column prop="sourceMd5" label="源文件md5" width="180" />
    <el-table-column prop="targetMd5" label="目标文件md5" width="180" />
  </el-table>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { computed } from 'vue'
const in_source = ref('')
const in_repo = ref('')
const in_cache = ref('')
const checkList = ref(["1","2",])
const handleBackup = () => {
  ElMessageBox.confirm(
    '确定要开始备份吗？',
    '提示',
    { type: 'warning' }
  ).then(() => {
    // 这里添加实际的备份逻辑
    console.log('开始备份');
  }).catch(() => {
    console.log('取消备份');
  });
};

const tableData = ref([
  // 示例数据，可根据实际情况修改
  { index: 1, name: 'example.txt', path: '/path/to/file', size: '10KB', exists: true, sourceMd5: 'abc123', targetMd5: 'def456', check: '仅文件名相同' },
  { index: 2, name: 'example2.txt', path: '/path/to/file2', size: '20KB', exists: false, sourceMd5: 'xyz789', targetMd5: '', check: '新文件' },
  { index: 3, name: 'example3.txt', path: '/path/to/file3', size: '30KB', exists: true, sourceMd5: 'uvw012', targetMd5: 'uvw012', check: '完全相同' }
]);
const filteredTableData = computed(() => {
  return tableData.value.filter(item => checkList.value.includes(item.check === '仅文件名相同' ? '1' : item.check === '完全相同' ? '2' : item.check === '新文件' ? '3' : ''));
});
</script>

<style scoped>
  .mb-4 {
    margin-bottom: 1rem;
  }

  .el-button + .el-input {
    margin-left: 1rem;
  }

  .el-button {
      width: 150px; 
  }

</style>