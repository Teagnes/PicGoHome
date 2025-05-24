<template>
  <div>
    <div ><el-text class=".mb-4" size="large">1. 准备好要备份的图片和视频，复制到源文件目录下</el-text></div>
    <div ><el-text class=".mb-4" size="large">2. 设置好三个目录路径</el-text></div>
    <div ><el-text  size="large">3. 选择复制逻辑，按照过滤逻辑过滤后的文件复制到暂存目录下，</el-text></div>
    <div class="mb-4"><el-text class=".mb-4" size="large">4. 手动全选文件复制到你的仓库文件目录下</el-text></div>

  <div class="mb-4">
    <el-button type="info" plain @click="handleSelectSource">源文件目录</el-button>
      <el-input v-model="in_source" style="width: 400px"  />
  </div>
  <div class="mb-4">
    <el-button type="info" plain @click="handleSelectRepo">仓库目录</el-button>
      <el-input v-model="in_repo" style="width: 400px"  />
  </div>
  <div class="mb-4">
    <el-button type="info" plain @click="handleSelectCache">暂存目录</el-button>
      <el-input v-model="in_cache" style="width: 400px" />
  </div>
  <div class="mb-4">
   进度栏todo
  </div>
  <div class="mb-4">
    <el-checkbox-group v-model="checkList">
      <div>
        <el-checkbox label="仅文件名相同" value="1" />  
        <el-text>[ {{ fileNameMatchCount }} ] </el-text>
      </div>
      <div>
        <el-checkbox label="完全相同" value="2" />
        <el-text> [  {{ exactMatchCount }} ]</el-text>
      </div>
      <div>
        <el-checkbox label="新文件" value="3" />
        <el-text>  [  {{ newFileCount }}  ]  </el-text>
      </div>
    </el-checkbox-group>
  </div>
  <div class="mb-4">
    <el-button type="info" plain @click="handleFilter">过滤筛选</el-button>
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
const checkList = ref(["1","2"]);

const handleSelectRepo = async () => {
  const result = await window.electronApi.openDirectoryDialog();
  if (result) {
    const fullPath = await window.electronApi.joinPath(result, '');
    in_repo.value = fullPath;
  }
};

const handleSelectCache = async () => {
  const result = await window.electronApi.openDirectoryDialog();
  if (result) {
    const fullPath = await window.electronApi.joinPath(result, '');
    in_cache.value = fullPath;
  }
};
const handleSelectSource = async () => {
  const result = await window.electronApi.openDirectoryDialog();
  if (result) {
    const fullPath = await window.electronApi.joinPath(result, '');
    in_source.value = fullPath;
  }
};

const handleFilter = async () => {
  if (!in_source.value || !in_repo.value||!in_cache.value) {
    ElMessageBox.warning('请选择源文件目录和仓库目录和暂存目录');
    return;
  }
  // 假设这里有一个获取源目录文件列表的 IPC 方法
  const sourceFiles = await window.electronApi.getFilesInDirectory(in_source.value);
  const repoFiles = await window.electronApi.getFilesInDirectory(in_repo.value);
  console.log(sourceFiles);
  console.log(repoFiles)  
  const newTableData = [];
  sourceFiles.forEach((sourceFile, index) => {
    const repoFile = repoFiles.find(file => file.name === sourceFile.name);
    const checkResult = repoFile ? (sourceFile.md5 === repoFile.md5 ? '完全相同' : '仅文件名相同') : '新文件';
    newTableData.push({
      index: index + 1,
      name: sourceFile.name,
      path: sourceFile.path,
      size: sourceFile.size,
      exists: !!repoFile,
      sourceMd5: sourceFile.md5,
      targetMd5: repoFile?.md5 || '',
      check: checkResult
    });
  });
  tableData.value = newTableData;
};

const handleBackup = () => {
  ElMessageBox.confirm(
    '确定要开始备份吗？',
    '提示',
    { type: 'warning' }
  ).then(async () => {
    if (!in_source.value || !in_repo.value || !in_cache.value) {
      ElMessageBox.warning('请选择源文件目录、仓库目录和暂存目录');
      return;
    }
    const filteredFiles = filteredTableData.value.filter(file => file.check === '仅文件名相同' || file.check === '完全相同');
    for (const file of filteredFiles) {
      const sourcePath = file.path;
      const targetPath = await window.electronApi.joinPath(in_cache.value, file.name);
      try {
        await window.electronApi.copyFile(sourcePath, targetPath);
        console.log(`已复制文件 ${file.name} 到 ${targetPath}`);
      } catch (error) {
        console.error(`复制文件 ${file.name} 时出错:`, error);
      }
    }
    ElMessageBox.success('备份完成');
  }).catch(() => {
    console.log('取消备份');
  });
};

const tableData = ref([
  // 初始化数据，可根据实际情况修改
  
]);
const fileNameMatchCount = computed(() => {
    return tableData.value.filter(item => item.check === '仅文件名相同').length;
  });
  const exactMatchCount = computed(() => {
    return tableData.value.filter(item => item.check === '完全相同').length;
  });
  const newFileCount = computed(() => {
    return tableData.value.filter(item => item.check === '新文件').length;
  });

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