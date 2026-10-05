<template>
  <div v-if="dictStore.currentType" class="bg-white border border-[#DDE3EA] rounded-[8px] p-5 shadow-2xs mb-4">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <!-- 左侧：类型信息元数据 -->
      <div class="space-y-2">
        <div class="flex flex-wrap items-center gap-2.5">
          <h2 class="text-base font-bold text-[#0F172A] m-0">
            {{ dictStore.currentType.name }}
          </h2>

          <!-- 范围标签 -->
          <span
            :class="[
              'px-2 py-0.5 text-xs rounded font-medium',
              dictStore.currentType.scope === 'PLATFORM'
                ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
                : dictStore.currentType.scope === 'TENANT'
                ? 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]'
                : 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
            ]"
          >
            {{ dictStore.currentType.scope === 'PLATFORM' ? '平台级' : dictStore.currentType.scope === 'TENANT' ? '租户级' : '组织级' }}
          </span>

          <!-- 内置提示（仅内置类型显示） -->
          <span
            v-if="dictStore.currentType.isBuiltin === 1"
            class="px-2 py-0.5 text-xs rounded font-medium bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]"
          >
            内置·不可删除，不可改编码
          </span>

          <!-- 当前生效版本号 -->
          <span class="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
            版本: v{{ dictStore.currentType.version }}
          </span>
        </div>

        <!-- 编码与说明 -->
        <div class="flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
          <span class="font-mono bg-[#F8FAFC] px-2 py-1 rounded border border-[#E2E8F0] text-[#334155]">
            类型编码: <strong class="text-[#0F172A]">{{ dictStore.currentType.typeCode }}</strong>
          </span>
          <span class="text-[#94A3B8]">|</span>
          <p class="m-0 text-[#475569] line-clamp-1">
            {{ dictStore.currentType.remark || '暂无业务备注说明' }}
          </p>
        </div>
      </div>

      <!-- 右侧操作按钮组：「变更历史」「引用检查」「新增条目」 -->
      <div class="flex items-center space-x-2 shrink-0">
        <!-- 变更历史按钮 -->
        <button
          type="button"
          @click="dictStore.openHistory()"
          aria-label="查看变更历史与版本对比"
          class="h-11 min-h-[44px] px-3.5 text-xs font-medium text-[#334155] bg-white border border-[#CBD5E1] rounded-[6px] hover:bg-[#F8FAFC] hover:border-[#94A3B8] active:bg-[#F1F5F9] transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <svg class="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>变更历史</span>
        </button>

        <!-- 引用检查按钮 -->
        <button
          type="button"
          @click="dictStore.openUsageCheck()"
          aria-label="检查该字典类型在业务系统中的引用关系"
          class="h-11 min-h-[44px] px-3.5 text-xs font-medium text-[#334155] bg-white border border-[#CBD5E1] rounded-[6px] hover:bg-[#F8FAFC] hover:border-[#94A3B8] active:bg-[#F1F5F9] transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <svg class="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>引用检查</span>
        </button>

        <!-- 新增条目按钮 -->
        <button
          type="button"
          @click="dictStore.openAddDrawer()"
          aria-label="新增字典条目"
          class="h-11 min-h-[44px] px-4 text-xs font-medium text-white bg-[#1F4FD8] rounded-[6px] hover:bg-[#1940B0] active:bg-[#153494] transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
        >
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>新增条目</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDictStore } from '../store/dictStore';

const dictStore = useDictStore();
</script>
