<template>
  <div
    v-if="store.exportModalVisible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    role="dialog"
    aria-modal="true"
    aria-labelledby="export-modal-title"
  >
    <div
      class="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- 头部 -->
      <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded bg-[#1F4FD8]/10 text-[#1F4FD8] flex items-center justify-center font-bold text-sm">
            📤
          </div>
          <div>
            <h3 id="export-modal-title" class="text-sm font-bold text-slate-900 m-0">
              参数配置导出与备份
            </h3>
            <p class="text-xs text-slate-500 m-0 mt-0.5">
              数据由后台统一初始化，支持将当前生效配置导出为 JSON 用于多环境备份与对比
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="store.exportModalVisible = false"
          class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
        <div class="flex items-center justify-between">
          <span class="text-slate-600 font-medium">当前符合筛选条件的参数 ({{ exportData.length }} 条记录)</span>
          <div class="flex items-center space-x-2">
            <button
              type="button"
              @click="copyExport"
              class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs cursor-pointer font-medium"
            >
              复制 JSON
            </button>
            <button
              type="button"
              @click="downloadJsonFile"
              class="px-3 py-1 bg-[#1F4FD8] hover:bg-[#183eb0] text-white rounded text-xs font-semibold cursor-pointer shadow-xs"
            >
              下载 .json 文件
            </button>
          </div>
        </div>

        <div class="p-3 bg-blue-50/70 border border-blue-200 rounded-md text-blue-900 text-xs">
          💡 <strong>说明:</strong> 本模块参数定义由后端初始化载入，在线仅允许查看与修改值，不开放新增与删除物理键。
        </div>

        <textarea
          readonly
          :value="exportJsonString"
          rows="12"
          aria-label="导出的JSON数据"
          class="w-full p-3 font-mono text-[11px] bg-slate-900 text-emerald-400 border border-slate-700 rounded-md focus:outline-hidden leading-relaxed"
        ></textarea>
      </div>

      <!-- 底部关闭按钮 -->
      <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
        <button
          type="button"
          @click="store.exportModalVisible = false"
          class="h-8 px-4 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useConfigStore } from '../store/configStore';
import { message } from 'ant-design-vue';

const store = useConfigStore();

const exportData = computed(() => store.filteredConfigs);
const exportJsonString = computed(() => JSON.stringify(exportData.value, null, 2));

const copyExport = () => {
  navigator.clipboard.writeText(exportJsonString.value);
  message.success('已复制配置数据到剪贴板');
};

const downloadJsonFile = () => {
  const blob = new Blob([exportJsonString.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pbs_config_export_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  message.success('已开始下载配置文件');
};
</script>
