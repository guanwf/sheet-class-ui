<template>
  <div class="flex-1 flex flex-col min-h-0 relative">
    <!-- 架构演示控制条 (用于直观体验：默认样式 vs 自定义插槽覆盖) -->
    <div class="px-4 py-1.5 bg-slate-800 text-slate-300 text-[11px] border-b border-slate-700 flex flex-wrap items-center justify-between gap-2 shrink-0">
      <div class="flex items-center space-x-2">
        <span class="font-bold text-indigo-400">单据列表查询 (DocListLedger)</span>
        <span class="text-slate-500">|</span>
        <span class="text-slate-400">当前模式演示：</span>
        <label class="flex items-center space-x-1 cursor-pointer select-none">
          <input
            type="checkbox"
            v-model="customStatusBar"
            class="rounded border-slate-600 text-indigo-500 focus:ring-0"
          />
          <span>自定义状态栏 (插槽 #status-bar)</span>
        </label>
        <span class="text-slate-600">•</span>
        <label class="flex items-center space-x-1 cursor-pointer select-none">
          <input
            type="checkbox"
            v-model="customFilterExtra"
            class="rounded border-slate-600 text-indigo-500 focus:ring-0"
          />
          <span>自定义扩展查询 (插槽 #filter-extra)</span>
        </label>
      </div>

      <div class="text-[11px] text-slate-400 font-mono">
        网格已启用真分页模式 (支持 10/20/50/100 条分页)
      </div>
    </div>

    <!-- 通用单据列表网格底座组件 (带分页，带可定制插槽) -->
    <DocListLedger
      :documents="documents"
      @open-document="$emit('open-doc-detail', $event)"
      @new-document="$emit('new-document')"
      @duplicate-document="$emit('duplicate-document', $event)"
      @delete-document="$emit('delete-document', $event)"
      @batch-approve="$emit('batch-approve', $event)"
    >
      <!-- 2.1 状态栏自定义插槽演示 (如果业务模块自定义就用自定义的，否则就用默认样式) -->
      <template v-if="customStatusBar" #status-bar="{ documents: docList, stats }">
        <div class="bg-gradient-to-r from-indigo-900/90 to-slate-900 p-4 rounded-xl text-white shadow-md border border-indigo-700/50 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
              <PieChart class="w-5 h-5" />
            </div>
            <div>
              <div class="text-xs text-indigo-200 font-semibold tracking-wide">
                业务模块自定义状态栏 (插槽 #status-bar 覆盖)
              </div>
              <div class="text-[11px] text-indigo-300/80">
                本模块自主定制 KPI：资金流转监控、健康度评分与高风险单据预警
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-6 text-xs font-mono">
            <div class="text-right">
              <div class="text-slate-400 text-[10px]">有效台账总额</div>
              <div class="text-emerald-400 text-base font-bold">¥{{ stats.totalAmountSum.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}</div>
            </div>
            <div class="text-right border-l border-slate-700 pl-6">
              <div class="text-slate-400 text-[10px]">待审批阻塞比</div>
              <div class="text-amber-400 text-base font-bold">
                {{ docList.length ? Math.round((stats.pendingCount / docList.length) * 100) : 0 }}%
              </div>
            </div>
            <div class="text-right border-l border-slate-700 pl-6">
              <div class="text-slate-400 text-[10px]">ERP 财务结算周期</div>
              <div class="text-indigo-300 text-base font-bold">T+30 标准</div>
            </div>
          </div>
        </div>
      </template>

      <!-- 2.1 查询条件自定义插槽演示 (支持业务模块插入自定义筛选器) -->
      <template v-if="customFilterExtra" #filter-extra="{ query }">
        <div class="flex items-center space-x-1.5 pl-2 border-l border-slate-300 bg-amber-50/70 px-2 py-0.5 rounded border border-amber-200 text-amber-800">
          <span class="text-[11px] font-medium">业务定制筛选:</span>
          <select
            v-model="customSpecialTag"
            class="h-7 px-1.5 bg-white border border-amber-300 rounded text-[11px] text-slate-700"
          >
            <option value="ALL">全部优先级</option>
            <option value="HIGH">特急采购计划</option>
            <option value="NORMAL">常规补货流转</option>
          </select>
        </div>
      </template>
    </DocListLedger>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PieChart } from 'lucide-vue-next';
import { DocListLedger } from '../../engine';

defineProps<{
  documents: any[];
}>();

defineEmits<{
  (e: 'open-doc-detail', docId: string): void;
  (e: 'new-document'): void;
  (e: 'duplicate-document', docId: string): void;
  (e: 'delete-document', docId: string): void;
  (e: 'batch-approve', docIds: string[]): void;
  (e: 'print-document', doc: any): void;
}>();

const customStatusBar = ref(false);
const customFilterExtra = ref(false);
const customSpecialTag = ref('ALL');
</script>
