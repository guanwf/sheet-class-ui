<template>
  <!-- 业务模块专属定制 HTML 状态栏 (ReturnOrderCustomStatusBar.vue) -->
  <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-xl shadow-md border border-indigo-800/50 flex flex-wrap items-center justify-between gap-4">
    <!-- 1. 模块自定义标识与业务标题 HTML -->
    <div class="flex items-center space-x-3.5 min-w-[240px]">
      <div class="w-11 h-11 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 text-xl shrink-0 shadow-inner">
        🔄
      </div>
      <div>
        <div class="flex items-center space-x-2">
          <span class="text-xs font-bold text-rose-300 tracking-wide">
            退货逆向物流与品保监控看板
          </span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
            自定义 HTML 视图
          </span>
        </div>
        <div class="text-[11px] text-slate-400 mt-0.5">
          独立文件组件：<code class="text-indigo-300 font-mono">ReturnOrderCustomStatusBar.vue</code>
        </div>
      </div>
    </div>

    <!-- 2. 自定义业务进度条与出库履约指标 HTML (模块独有业务，标准卡片无法表达) -->
    <div class="flex-1 min-w-[200px] max-w-sm px-2">
      <div class="flex items-center justify-between text-[11px] mb-1.5">
        <span class="text-slate-300 flex items-center space-x-1">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>逆向退运出库执行率:</span>
        </span>
        <span class="text-emerald-400 font-mono font-bold">
          {{ completionRate }}%
        </span>
      </div>
      <!-- 渐变进度条 -->
      <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
        <div
          class="h-full bg-gradient-to-r from-indigo-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
          :style="{ width: `${completionRate}%` }"
        ></div>
      </div>
      <div class="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
        <span>已入库待退: {{ stats.pendingCount }} 单</span>
        <span>已办结放行: {{ stats.approvedCount }} 单</span>
      </div>
    </div>

    <!-- 3. 自定义右侧指标与快捷状态筛选器 HTML (可点击触发过滤) -->
    <div class="flex items-center space-x-4 shrink-0 text-xs font-mono">
      <!-- 待品质审核快捷过滤按钮 -->
      <button
        type="button"
        @click="$emit('filter-status', 'pending')"
        :class="[
          'text-left px-3 py-1.5 rounded-lg border transition cursor-pointer select-none',
          query?.status === 'pending'
            ? 'bg-amber-500/30 border-amber-400 text-amber-200 ring-1 ring-amber-400'
            : 'bg-slate-800/80 border-slate-700 hover:border-amber-400/60 text-slate-300'
        ]"
        title="点击仅筛选待审核退货单"
      >
        <div class="text-[10px] text-slate-400">待品保审核</div>
        <div class="text-amber-400 font-bold text-sm flex items-center space-x-1">
          <span>{{ stats.pendingCount }} 单</span>
          <span v-if="query?.status === 'pending'" class="text-[9px] px-1 rounded bg-amber-500 text-black">已选</span>
        </div>
      </button>

      <!-- 申请退款总额展示 -->
      <div class="text-right border-l border-slate-700 pl-4">
        <div class="text-[10px] text-slate-400">申请退款总额</div>
        <div class="text-rose-400 font-bold text-base">
          ¥{{ stats.totalAmountSum.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
        </div>
      </div>

      <!-- ERP 财务冲抵周期 -->
      <div class="text-right border-l border-slate-700 pl-4 hidden xl:block">
        <div class="text-[10px] text-slate-400">冲账时效规范</div>
        <div class="text-indigo-300 font-bold text-sm mt-0.5">
          T+3 预付款抵扣
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    documents?: any[];
    stats?: {
      draftCount: number;
      pendingCount: number;
      approvedCount: number;
      totalAmountSum: number;
    };
    query?: Record<string, any>;
  }>(),
  {
    documents: () => [],
    stats: () => ({
      draftCount: 0,
      pendingCount: 0,
      approvedCount: 0,
      totalAmountSum: 0,
    }),
    query: () => ({}),
  }
);

defineEmits<{
  (e: 'filter-status', status: string): void;
}>();

const completionRate = computed(() => {
  const total = props.documents.length;
  if (!total) return 0;
  const approved = props.stats.approvedCount;
  return Math.min(100, Math.round((approved / total) * 100)) || 0;
});
</script>
