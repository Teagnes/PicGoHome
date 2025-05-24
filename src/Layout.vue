<template>
    <div class="common-layout">
      <el-container>
        <el-header>PicGoHome 辅助备份照片视频小工具</el-header>
        <el-container>
          <el-main>
            <pic-back>
            </pic-back>
          </el-main>
        </el-container>
      </el-container>
    </div>
  </template>
<script setup>
import PicBack from './components/PicBack.vue'

</script>



<style scoped>
.common-layout {
  border: 1px solid #ccc;
  width: 100%;
  height: 100vh;
}

.el-header {
  height: 40px; /* 设置 header 高度 */
  /* border: 1px solid #050505; */
}



.el-main {
  height: calc(100vh - 40px); /* 减去 header 高度 */;
  /* border: 1px solid #050505;  */
}
</style>