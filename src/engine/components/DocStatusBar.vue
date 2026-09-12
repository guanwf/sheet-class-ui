<template>
  <div class="h-10 bg-slate-900 text-white px-3.5 flex items-center justify-between text-xs select-none shrink-0 border-t border-slate-800">
    <!-- 支持整块插槽自定义覆盖 -->
    <slot name="footer-content" :summary="computedSummary">
      <!-- 默认左侧财务合计数值与大写 -->
      <div class="flex items-center space-x-4 overflow-x-auto scrollbar-none py-1">
        <slot name="footer-left" :summary="computedSummary" />

        <div class="flex items-center space-x-1.5 text-slate-300">
          <span>明细行:</span>
          <strong class="text-white font-mono">{{ computedSummary.totalRows }}</strong>
        </div>

        <div class="flex items-center space-x-1.5 text-slate-300">
          <span>数量合计:</span>
          <strong class="text-amber-400 font-mono">{{ computedSummary.totalQuantity.toLocaleString() }}</strong>
        </div>

        <div v-if="computedSummary.totalAmountWithoutTax !== undefined" class="flex items-center space-x-1.5 text-slate-300">
          <span>无税金额:</span>
          <strong class="text-slate-200 font-mono">¥{{ formatNumber(computedSummary.totalAmountWithoutTax) }}</strong>
        </div>

        <div v-if="computedSummary.totalTaxAmount !== undefined" class="flex items-center space-x-1.5 text-slate-300">
          <span>增值税额:</span>
          <strong class="text-slate-200 font-mono">¥{{ formatNumber(computedSummary.totalTaxAmount) }}</strong>
        </div>

        <div class="flex items-center space-x-1.5 bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700/50">
          <span class="text-indigo-200 font-medium">价税合计:</span>
          <strong class="text-emerald-400 font-mono font-bold text-sm">
            ¥{{ formatNumber(computedSummary.totalAmountWithTax) }}
          </strong>
        </div>

        <div
          v-if="computedSummary.capitalizedAmountCN"
          class="hidden xl:flex items-center space-x-1 text-slate-400 text-[11px] truncate max-w-xs"
          :title="computedSummary.capitalizedAmountCN"
        >
          <span>大写:</span>
          <span class="text-amber-200 truncate">{{ computedSummary.capitalizedAmountCN }}</span>
        </div>
      </div>

      <!-- 默认右侧系统状态与扩展插槽 -->
      <div class="flex items-center space-x-3 text-slate-400 text-[11px] shrink-0 pl-2">
        <slot name="footer-right" :summary="computedSummary" />

        <div class="flex items-center space-x-1">
          <span class="erp-dot-sm erp-dot-success erp-dot-pulse"></span>
          <span class="text-slate-300">vxe-table 极速虚拟网格就绪</span>
        </div>
        <span class="text-slate-700">|</span>
        <span class="text-slate-400">Ctrl+S 保存 • Tab / Enter 快捷录入</span>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface DocStatusSummary {
  totalRows: number;
  totalQuantity: number;
  totalAmountWithoutTax?: number;
  totalTaxAmount?: number;
  totalAmountWithTax: number;
  capitalizedAmountCN?: string;
  [key: string]: any;
}

const props = withDefaults(
  defineProps<{
    summary?: Partial<DocStatusSummary>;
    items?: any[];
  }>(),
  {
    summary: () => ({}),
    items: () => [],
  }
);

const computedSummary = computed<DocStatusSummary>(() => {
  if (props.summary && Object.keys(props.summary).length > 0) {
    return {
      totalRows: props.summary.totalRows ?? props.items.length,
      totalQuantity: props.summary.totalQuantity ?? 0,
      totalAmountWithoutTax: props.summary.totalAmountWithoutTax ?? 0,
      totalTaxAmount: props.summary.totalTaxAmount ?? 0,
      totalAmountWithTax: props.summary.totalAmountWithTax ?? 0,
      capitalizedAmountCN: props.summary.capitalizedAmountCN || '',
    };
  }

  // 若外部未传入 summary，根据 items 自动聚合计算默认指标
  const rows = props.items || [];
  let qty = 0;
  let withoutTax = 0;
  let tax = 0;
  let withTax = 0;

  rows.forEach((r) => {
    qty += Number(r.quantity) || 0;
    withoutTax += Number(r.priceWithoutTax || r.amountWithoutTax) || 0;
    tax += Number(r.taxAmount) || 0;
    withTax += Number(r.totalAmount || r.amountWithTax || r.amount) || 0;
  });

  return {
    totalRows: rows.length,
    totalQuantity: qty,
    totalAmountWithoutTax: withoutTax,
    totalTaxAmount: tax,
    totalAmountWithTax: withTax,
    capitalizedAmountCN: '',
  };
});

function formatNumber(val: any) {
  const num = Number(val);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
</script>
