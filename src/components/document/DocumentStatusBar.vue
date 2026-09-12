<template>
  <div class="h-10 bg-slate-900 text-white px-3.5 flex items-center justify-between text-xs select-none shrink-0 border-t border-slate-800">
    <!-- 左侧财务合计数值与大写 -->
    <div class="flex items-center space-x-4 overflow-x-auto scrollbar-none py-1">
      <div class="flex items-center space-x-1.5 text-slate-300">
        <span>明细行:</span>
        <strong class="text-white font-mono">{{ summary.totalRows }}</strong>
      </div>

      <div class="flex items-center space-x-1.5 text-slate-300">
        <span>采购总数量:</span>
        <strong class="text-amber-400 font-mono">{{ summary.totalQuantity.toLocaleString() }}</strong>
      </div>

      <div class="flex items-center space-x-1.5 text-slate-300">
        <span>无税金额:</span>
        <strong class="text-slate-200 font-mono">¥{{ summary.totalAmountWithoutTax.toFixed(2) }}</strong>
      </div>

      <div class="flex items-center space-x-1.5 text-slate-300">
        <span>增值税额:</span>
        <strong class="text-slate-200 font-mono">¥{{ summary.totalTaxAmount.toFixed(2) }}</strong>
      </div>

      <div class="flex items-center space-x-1.5 bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700/50">
        <span class="text-indigo-200">价税合计:</span>
        <strong class="text-emerald-400 font-mono font-bold text-sm">
          ¥{{ summary.totalAmountWithTax.toFixed(2) }}
        </strong>
      </div>

      <div class="hidden lg:flex items-center space-x-1 text-slate-400 text-[11px] truncate max-w-sm">
        <span>大写:</span>
        <span class="text-amber-200 truncate">{{ summary.capitalizedAmountCN }}</span>
      </div>
    </div>

    <!-- 右侧系统引擎与快捷提示 -->
    <div class="flex items-center space-x-3 text-slate-400 text-[11px] shrink-0 pl-2">
      <div class="flex items-center space-x-1">
        <span class="erp-dot-sm erp-dot-success erp-dot-ping"></span>
        <span class="text-slate-300">vxe-table 虚拟滚动引擎就绪</span>
      </div>
      <span class="text-slate-600">|</span>
      <span>双击单元格激活快捷编辑</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DocumentSummary } from '../../types/document';

defineProps<{
  summary: DocumentSummary;
}>();
</script>
