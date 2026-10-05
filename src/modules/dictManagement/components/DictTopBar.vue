<template>
  <header class="bg-white border-b border-[#DDE3EA] px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xs">
    <!-- 面包屑导航 -->
    <div class="flex items-center space-x-2 text-sm text-[#475569]">
      <span class="text-[#64748B]">平台配置</span>
      <span class="text-[#94A3B8]">/</span>
      <span class="text-[#64748B]">基础数据</span>
      <span class="text-[#94A3B8]">/</span>
      <h1 class="text-sm font-semibold text-[#0F172A] m-0 inline">数据字典管理</h1>
    </div>

    <!-- 右侧操作区：租户切换、导入导出、新建字典类型 -->
    <div class="flex items-center space-x-3">
      <!-- 租户选择器 -->
      <div class="flex items-center space-x-2">
        <label for="tenant-select" class="text-xs font-medium text-[#475569]">当前租户:</label>
        <select
          id="tenant-select"
          v-model="dictStore.currentTenantId"
          @change="onTenantChange"
          aria-label="选择当前系统租户"
          class="h-11 min-h-[44px] px-3 py-2 text-xs bg-white text-[#0F172A] border border-[#CBD5E1] rounded-[6px] focus:outline-hidden focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8] transition-colors cursor-pointer"
        >
          <option v-for="t in dictStore.tenants" :key="t.id" :value="t.id">
            {{ t.name }}
          </option>
        </select>
      </div>

      <!-- 导入/导出按钮 -->
      <button
        type="button"
        @click="dictStore.importExportModalVisible = true"
        aria-label="导入或导出字典数据"
        class="h-11 min-h-[44px] px-4 text-xs font-medium text-[#1E293B] bg-white border border-[#CBD5E1] rounded-[6px] hover:bg-[#F8FAFC] hover:border-[#94A3B8] active:bg-[#F1F5F9] transition-colors flex items-center space-x-1.5 cursor-pointer"
      >
        <svg class="w-4 h-4 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
        <span>导入 / 导出</span>
      </button>

      <!-- 新建字典类型主按钮 -->
      <button
        type="button"
        @click="dictStore.typeModalVisible = true"
        aria-label="新建字典类型"
        class="h-11 min-h-[44px] px-4 text-xs font-medium text-white bg-[#1F4FD8] rounded-[6px] hover:bg-[#1940B0] active:bg-[#153494] transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
      >
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>新建字典类型</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useDictStore } from '../store/dictStore';

const dictStore = useDictStore();

const onTenantChange = () => {
  dictStore.switchTenant(dictStore.currentTenantId);
};
</script>
