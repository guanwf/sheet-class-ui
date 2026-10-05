<template>
  <aside class="w-full lg:w-[320px] bg-white border-r border-[#DDE3EA] flex flex-col shrink-0 overflow-hidden">
    <!-- 1. 搜索框与范围筛选 -->
    <div class="p-3 border-b border-[#DDE3EA] space-y-2.5 bg-[#F8FAFC]">
      <!-- 搜索框 -->
      <div class="relative">
        <label for="dict-search-input" class="sr-only">按名称或编码过滤字典类型</label>
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-4 w-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          id="dict-search-input"
          v-model="dictStore.searchKeyword"
          type="search"
          placeholder="搜索字典名称或编码..."
          aria-label="按名称或编码过滤字典类型"
          class="block w-full h-11 min-h-[44px] pl-9 pr-3 text-xs text-[#0F172A] bg-white border border-[#CBD5E1] rounded-[6px] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8] transition-colors"
        />
      </div>

      <!-- 范围筛选胶囊：全部 / 平台 / 租户 / 组织 -->
      <div class="flex items-center justify-between p-1 bg-[#EEF2F6] rounded-[6px] text-xs" role="tablist" aria-label="作用范围筛选">
        <button
          v-for="scope in scopeOptions"
          :key="scope.key"
          type="button"
          role="tab"
          :aria-selected="dictStore.activeScopeFilter === scope.key"
          :aria-label="`筛选范围：${scope.label}`"
          @click="onSelectScope(scope.key)"
          :class="[
            'flex-1 h-9 min-h-[36px] text-xs font-medium rounded-[4px] transition-all cursor-pointer',
            dictStore.activeScopeFilter === scope.key
              ? 'bg-white text-[#1F4FD8] shadow-2xs font-semibold'
              : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0]/50'
          ]"
        >
          {{ scope.label }}
        </button>
      </div>
    </div>

    <!-- 2. 字典类型列表 -->
    <div class="flex-1 overflow-y-auto divide-y divide-[#F1F5F9]">
      <div v-if="dictStore.filteredTypes.length === 0" class="py-12 px-4 text-center text-xs text-[#94A3B8]">
        未检索到匹配的字典类型
      </div>

      <button
        v-for="item in dictStore.filteredTypes"
        :key="item.id"
        type="button"
        @click="dictStore.selectType(item.typeCode)"
        :aria-label="`选择字典类型：${item.name} (${item.typeCode})`"
        :class="[
          'w-full text-left p-3.5 transition-colors border-l-3 cursor-pointer flex flex-col justify-center min-h-[64px]',
          dictStore.selectedTypeCode === item.typeCode
            ? 'bg-[#F0F4FE] border-[#1F4FD8]'
            : 'bg-white border-transparent hover:bg-[#F8FAFC]'
        ]"
      >
        <div class="flex items-center justify-between mb-1">
          <span
            :class="[
              'text-xs font-medium truncate pr-2',
              dictStore.selectedTypeCode === item.typeCode ? 'text-[#1F4FD8] font-bold' : 'text-[#0F172A]'
            ]"
          >
            {{ item.name }}
          </span>

          <!-- 范围标签 -->
          <span
            :class="[
              'px-1.5 py-0.5 text-[10px] rounded font-medium shrink-0',
              item.scope === 'PLATFORM'
                ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
                : item.scope === 'TENANT'
                ? 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]'
                : 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
            ]"
          >
            {{ item.scope === 'PLATFORM' ? '平台级' : item.scope === 'TENANT' ? '租户级' : '组织级' }}
          </span>
        </div>

        <div class="flex items-center justify-between text-[11px]">
          <!-- 编码 (等宽字体) -->
          <span class="font-mono text-[#64748B] tracking-tight">
            {{ item.typeCode }}
          </span>

          <!-- 版本标识 -->
          <span class="text-[10px] font-mono font-medium text-[#94A3B8]">
            v{{ item.version }}
          </span>
        </div>
      </button>
    </div>

    <!-- 左栏底部统计 -->
    <div class="p-2.5 bg-[#F8FAFC] border-t border-[#DDE3EA] text-[11px] text-[#64748B] flex items-center justify-between">
      <span>类型总数: <strong class="text-[#0F172A] font-semibold">{{ dictStore.filteredTypes.length }}</strong></span>
      <span>当前作用域: <strong>{{ dictStore.activeScopeFilter === 'ALL' ? '全部' : dictStore.activeScopeFilter }}</strong></span>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useDictStore } from '../store/dictStore';
import { ScopeType } from '../types/dict';

const dictStore = useDictStore();

const scopeOptions: { key: ScopeType; label: string }[] = [
  { key: 'ALL', label: '全部' },
  { key: 'PLATFORM', label: '平台' },
  { key: 'TENANT', label: '租户' },
  { key: 'ORG', label: '组织' },
];

const onSelectScope = (scope: ScopeType) => {
  dictStore.activeScopeFilter = scope;
};
</script>
