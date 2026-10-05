<template>
  <div class="flex-1 flex flex-col min-h-0 bg-[#F4F6F9] text-[#0F172A] font-sans antialiased overflow-hidden">
    <!-- 1. 顶栏 -->
    <DictTopBar />

    <!-- 2. 主体区：左右两栏布局（自适应窄屏上下堆叠） -->
    <div class="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden p-4 gap-4">
      <!-- 左栏：类型列表与搜索筛选 (宽约 300-320px) -->
      <DictTypeSidebar />

      <!-- 右栏自上而下：头部卡片 + 条目表格 (可横向滚动) -->
      <section class="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden" aria-label="字典类型详情与明细工作区">
        <!-- 头部卡片 -->
        <DictTypeHeader />

        <!-- 条目表格 -->
        <DictItemTable />
      </section>
    </div>

    <!-- 3. 底部发布状态栏 -->
    <DictPublishStatusBar />

    <!-- 模态框与抽屉组 -->
    <DictItemDrawer />
    <DictHistoryDrawer />
    <DictUsageModal />
    <DictTypeModal />
    <DictImportExportModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useDictStore } from './store/dictStore';
import DictTopBar from './components/DictTopBar.vue';
import DictTypeSidebar from './components/DictTypeSidebar.vue';
import DictTypeHeader from './components/DictTypeHeader.vue';
import DictItemTable from './components/DictItemTable.vue';
import DictPublishStatusBar from './components/DictPublishStatusBar.vue';
import DictItemDrawer from './components/DictItemDrawer.vue';
import DictHistoryDrawer from './components/DictHistoryDrawer.vue';
import DictUsageModal from './components/DictUsageModal.vue';
import DictTypeModal from './components/DictTypeModal.vue';
import DictImportExportModal from './components/DictImportExportModal.vue';

const dictStore = useDictStore();

onMounted(async () => {
  await dictStore.fetchTypes();
});
</script>

<style scoped>
/* 采用标准企业级字体栈 */
:deep(*) {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
}
</style>
