<template>
  <div class="flex-1 flex flex-col bg-slate-100 p-3 md:p-4 space-y-3 overflow-y-auto">
    <!-- 1. 状态栏 (KPI卡片区) - 默认提供指标卡，支持业务通过 #status-bar 插槽自定义覆盖 -->
    <slot name="status-bar" :documents="documents" :stats="computedStats">
      <!-- 默认状态栏样式 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <div class="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-500 font-medium">单据总台账</div>
            <div class="text-xl font-bold text-slate-900 font-mono mt-1">
              {{ documents.length }} <span class="text-xs font-normal text-slate-400">单</span>
            </div>
            <div class="text-[11px] text-slate-400 mt-1">其中草稿 {{ computedStats.draftCount }} 单</div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers class="w-5 h-5" />
          </div>
        </div>

        <div class="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div class="text-xs text-blue-600 font-medium">待审核审批</div>
            <div class="text-xl font-bold text-blue-700 font-mono mt-1">
              {{ computedStats.pendingCount }} <span class="text-xs font-normal text-slate-400">单</span>
            </div>
            <div class="text-[11px] text-blue-500 mt-1">等待部门主管与财务核准</div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock class="w-5 h-5" />
          </div>
        </div>

        <div class="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div class="text-xs text-emerald-600 font-medium">已核准正式生效</div>
            <div class="text-xl font-bold text-emerald-700 font-mono mt-1">
              {{ computedStats.approvedCount }} <span class="text-xs font-normal text-slate-400">单</span>
            </div>
            <div class="text-[11px] text-emerald-600 mt-1">已下达执行下游仓储与结算</div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 class="w-5 h-5" />
          </div>
        </div>

        <div class="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-500 font-medium">台账金额总计 (¥)</div>
            <div class="text-xl font-bold text-indigo-900 font-mono mt-1">
              {{ formatCurrency(computedStats.totalAmountSum) }}
            </div>
            <div class="text-[11px] text-slate-400 mt-1">全部单据价税总额</div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold font-mono">
            ¥
          </div>
        </div>
      </div>
    </slot>

    <!-- 2. 主列表台账容器 (支持分页) -->
    <div class="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex flex-col flex-1 min-h-[460px]">
      <!-- 查询过滤工具栏 - 默认提供标准过滤，支持 #filter-bar 整块覆盖或 #filter-extra 局部扩展 -->
      <slot
        name="filter-bar"
        :query="queryState"
        :reset="resetFilters"
        :selected-rows="selectedRows"
        :on-new-document="() => $emit('new-document')"
      >
        <div class="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/70 shrink-0">
          <!-- 默认查询条件 -->
          <div class="flex items-center flex-wrap gap-2 flex-1 min-w-[300px]">
            <div class="relative w-72">
              <Search class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                v-model="queryState.keyword"
                type="text"
                placeholder="搜索单据编号、往来客商、经办人、部门..."
                class="w-full h-8 pl-8 pr-3 bg-white border border-slate-300 rounded text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div class="flex items-center space-x-1.5">
              <span class="text-slate-500">类型:</span>
              <select
                v-model="queryState.docType"
                class="h-8 px-2 bg-white border border-slate-300 rounded text-slate-700 focus:border-indigo-500"
              >
                <option value="ALL">全部单据类型</option>
                <option value="PURCHASE_ORDER">标准采购订单</option>
                <option value="RETURN_ORDER">采购退货单</option>
                <option value="SALES_DELIVERY">销售出库发货单</option>
                <option value="PROD_REQUISITION">生产领料单</option>
              </select>
            </div>

            <div class="flex items-center space-x-1.5">
              <span class="text-slate-500">状态:</span>
              <select
                v-model="queryState.status"
                class="h-8 px-2 bg-white border border-slate-300 rounded text-slate-700 focus:border-indigo-500"
              >
                <option value="ALL">全部单据状态</option>
                <option value="draft">草稿编制中</option>
                <option value="pending">待审核审批</option>
                <option value="approved">已核准生效</option>
                <option value="rejected">已驳回</option>
                <option value="voided">已作废</option>
              </select>
            </div>

            <button
              v-if="queryState.keyword || queryState.status !== 'ALL' || queryState.docType !== 'ALL'"
              type="button"
              @click="resetFilters"
              class="px-2.5 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded transition"
            >
              重置过滤
            </button>

            <!-- 业务模块自定义额外过滤项插槽 -->
            <slot name="filter-extra" :query="queryState" />
          </div>

          <!-- 右侧动作按钮组 -->
          <div class="flex items-center space-x-2">
            <button
              v-if="selectedRows.length > 0"
              type="button"
              @click="handleBatchApprove"
              class="inline-flex items-center px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition shadow-2xs"
            >
              <CheckCircle2 class="w-3.5 h-3.5 mr-1" />
              批量审核 ({{ selectedRows.length }})
            </button>

            <button
              type="button"
              @click="exportCsv"
              class="inline-flex items-center px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition shadow-2xs"
            >
              <Download class="w-3.5 h-3.5 mr-1 text-slate-500" />
              导出台账 CSV
            </button>

            <button
              type="button"
              @click="$emit('new-document')"
              class="inline-flex items-center px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs"
            >
              <Plus class="w-3.5 h-3.5 mr-1" />
              新增单据 (新标签页)
            </button>
          </div>
        </div>
      </slot>

      <!-- 提示条 -->
      <div class="px-4 py-1.5 bg-indigo-50/50 border-b border-indigo-100/60 text-[11px] text-indigo-700 flex items-center justify-between shrink-0">
        <div class="flex items-center space-x-1.5">
          <span class="erp-dot-sm erp-dot-indigo"></span>
          <span>双击行或点击单据编号即可在<strong>新标签页 (TabPage)</strong> 中开启独立主从表编辑；列表支持分页浏览。</span>
        </div>
        <span class="text-indigo-600 font-medium font-mono">
          过滤检索共 {{ filteredDocuments.length }} 条记录（当前第 {{ currentPage }} / {{ totalPages || 1 }} 页）
        </span>
      </div>

      <!-- vxe-table 单据台账列表 -->
      <div class="flex-1 w-full relative min-h-[260px]">
        <vxe-table
          ref="tableRef"
          height="auto"
          border
          stripe
          round
          show-overflow
          class="text-xs"
          :data="pagedDocuments"
          :row-config="{ isHover: true, isCurrent: true, keyField: 'id' }"
          :checkbox-config="{ trigger: 'row', highlight: true }"
          @checkbox-change="onCheckboxChange"
          @checkbox-all="onCheckboxAll"
          @cell-dblclick="onCellDblClick"
        >
          <!-- 复选列 -->
          <vxe-column type="checkbox" width="45" align="center" fixed="left" />

          <!-- 序号列 (连续分页序号) -->
          <vxe-column width="55" title="序号" align="center" fixed="left">
            <template #default="{ $rowIndex }">
              {{ (currentPage - 1) * pageSize + $rowIndex + 1 }}
            </template>
          </vxe-column>

          <!-- 单据编号 -->
          <vxe-column field="docNo" title="单据编号" width="180" sortable fixed="left">
            <template #default="{ row }">
              <div class="flex items-center space-x-1.5">
                <button
                  type="button"
                  @click.stop="$emit('open-document', row.id)"
                  class="font-mono font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                >
                  {{ row.docNo }}
                </button>
              </div>
              <div class="text-[10px] text-slate-400">版本: v{{ row.version }}</div>
            </template>
          </vxe-column>

          <!-- 单据类型 -->
          <vxe-column field="docType" title="单据类型" width="130">
            <template #default="{ row }">
              <span class="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                {{ formatDocType(row.docType) }}
              </span>
            </template>
          </vxe-column>

          <!-- 状态 -->
          <vxe-column field="status" title="状态" width="110" align="center">
            <template #default="{ row }">
              <span
                v-if="row.status === 'approved'"
                class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800"
              >
                已核准生效
              </span>
              <span
                v-else-if="row.status === 'pending'"
                class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800"
              >
                待审核
              </span>
              <span
                v-else-if="row.status === 'rejected'"
                class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 text-rose-800"
              >
                已驳回
              </span>
              <span
                v-else-if="row.status === 'voided'"
                class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600"
              >
                已作废
              </span>
              <span
                v-else
                class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800"
              >
                草稿
              </span>
            </template>
          </vxe-column>

          <!-- 往来单位/供应商/客户 -->
          <vxe-column field="partnerName" title="往来单位" min-width="190">
            <template #default="{ row }">
              <div class="font-medium text-slate-800 truncate">{{ row.partnerName }}</div>
              <div class="text-[10px] text-slate-400 font-mono">代码: {{ row.partnerCode }}</div>
            </template>
          </vxe-column>

          <!-- 价税合计金额 -->
          <vxe-column field="totalAmount" title="价税合计(¥)" width="140" align="right" sortable>
            <template #default="{ row }">
              <span class="font-mono font-bold text-slate-900">
                ¥{{ formatCurrency(row.totalAmount) }}
              </span>
            </template>
          </vxe-column>

          <!-- 单据日期 -->
          <vxe-column field="docDate" title="单据日期" width="110" align="center" sortable />

          <!-- 部门与经办人 -->
          <vxe-column field="department" title="经办部门/人" width="150">
            <template #default="{ row }">
              <div>{{ row.department }}</div>
              <div class="text-[10px] text-slate-400">{{ row.buyer || row.createdBy }}</div>
            </template>
          </vxe-column>

          <!-- 操作列 -->
          <vxe-column title="操作" width="170" align="center" fixed="right">
            <template #default="{ row }">
              <div class="flex items-center justify-center space-x-1">
                <button
                  type="button"
                  @click.stop="$emit('open-document', row.id)"
                  class="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium transition"
                  title="在新标签页中编辑"
                >
                  详情编辑
                </button>
                <button
                  type="button"
                  @click.stop="$emit('duplicate-document', row.id)"
                  class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title="复制新单"
                >
                  复制
                </button>
                <button
                  v-if="row.status !== 'approved'"
                  type="button"
                  @click.stop="$emit('delete-document', row.id)"
                  class="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                  title="删除单据"
                >
                  删除
                </button>
              </div>
            </template>
          </vxe-column>
        </vxe-table>
      </div>

      <!-- 单据列表的分页工具栏 (用户明确要求：单据列表的网格需要支持分页) -->
      <div class="p-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs select-none shrink-0">
        <!-- 左侧分页总数统计 -->
        <div class="flex items-center space-x-2 text-slate-500">
          <span>共 <strong class="text-slate-800 font-mono">{{ filteredDocuments.length }}</strong> 条单据</span>
          <span class="text-slate-300">|</span>
          <div class="flex items-center space-x-1">
            <span>每页展示:</span>
            <select
              v-model="pageSize"
              class="h-7 px-2 bg-white border border-slate-300 rounded text-slate-700 text-xs focus:border-indigo-500"
            >
              <option :value="10">10 条/页</option>
              <option :value="20">20 条/页</option>
              <option :value="50">50 条/页</option>
              <option :value="100">100 条/页</option>
            </select>
          </div>
        </div>

        <!-- 右侧翻页控制器 -->
        <div class="flex items-center space-x-1.5">
          <button
            type="button"
            :disabled="currentPage <= 1"
            @click="currentPage = 1"
            class="px-2 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            title="首页"
          >
            首页
          </button>
          <button
            type="button"
            :disabled="currentPage <= 1"
            @click="currentPage--"
            class="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            上一页
          </button>

          <span class="px-2 font-mono text-slate-700 font-medium">
            {{ currentPage }} / {{ totalPages || 1 }}
          </span>

          <button
            type="button"
            :disabled="currentPage >= totalPages"
            @click="currentPage++"
            class="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            下一页
          </button>
          <button
            type="button"
            :disabled="currentPage >= totalPages"
            @click="currentPage = totalPages"
            class="px-2 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            title="末页"
          >
            末页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import { VxeTableInstance } from 'vxe-table';
import {
  Search,
  Plus,
  Download,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    documents: any[];
  }>(),
  {
    documents: () => [],
  }
);

const emit = defineEmits<{
  (e: 'open-document', docId: string): void;
  (e: 'new-document'): void;
  (e: 'duplicate-document', docId: string): void;
  (e: 'delete-document', docId: string): void;
  (e: 'batch-approve', docIds: string[]): void;
}>();

const tableRef = ref<VxeTableInstance | null>(null);
const selectedRows = ref<any[]>([]);

// 分页状态 (用户明确要求：单据列表必须支持分页)
const currentPage = ref(1);
const pageSize = ref(10);

// 查询过滤状态
const queryState = reactive({
  keyword: '',
  docType: 'ALL',
  status: 'ALL',
});

// 重置过滤
function resetFilters() {
  queryState.keyword = '';
  queryState.docType = 'ALL';
  queryState.status = 'ALL';
  currentPage.value = 1;
}

// 统计 KPI
const computedStats = computed(() => {
  let draftCount = 0;
  let pendingCount = 0;
  let approvedCount = 0;
  let totalAmountSum = 0;

  props.documents.forEach((doc) => {
    const h = doc.header || doc;
    if (h.status === 'draft') draftCount++;
    else if (h.status === 'pending') pendingCount++;
    else if (h.status === 'approved') approvedCount++;

    const items = doc.items || [];
    const itemsSum = items.reduce(
      (acc: number, item: any) => acc + (Number(item.totalAmount) || 0),
      0
    );
    totalAmountSum += itemsSum;
  });

  return {
    draftCount,
    pendingCount,
    approvedCount,
    totalAmountSum,
  };
});

// 扁平化数据供列表展示
const flatDocuments = computed(() => {
  return props.documents.map((doc) => {
    const h = doc.header || doc;
    const items = doc.items || [];
    const totalAmount = items.reduce(
      (acc: number, item: any) => acc + (Number(item.totalAmount) || 0),
      0
    );
    return {
      ...h,
      totalAmount,
      itemsCount: items.length,
    };
  });
});

// 筛选后的列表
const filteredDocuments = computed(() => {
  const kw = queryState.keyword.trim().toLowerCase();
  return flatDocuments.value.filter((doc) => {
    if (queryState.status !== 'ALL' && doc.status !== queryState.status) {
      return false;
    }
    if (queryState.docType !== 'ALL' && doc.docType !== queryState.docType) {
      return false;
    }
    if (kw) {
      const matchNo = doc.docNo?.toLowerCase().includes(kw);
      const matchPartner = doc.partnerName?.toLowerCase().includes(kw);
      const matchBuyer = doc.buyer?.toLowerCase().includes(kw);
      const matchDept = doc.department?.toLowerCase().includes(kw);
      if (!matchNo && !matchPartner && !matchBuyer && !matchDept) {
        return false;
      }
    }
    return true;
  });
});

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredDocuments.value.length / pageSize.value) || 1;
});

// 当前页数据切片
const pagedDocuments = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredDocuments.value.slice(start, start + pageSize.value);
});

// 过滤变动时重置页码
watch(
  () => [queryState.keyword, queryState.status, queryState.docType, pageSize.value],
  () => {
    currentPage.value = 1;
  }
);

function formatDocType(type: string) {
  switch (type) {
    case 'PURCHASE_ORDER':
      return '标准采购订单';
    case 'RETURN_ORDER':
      return '采购退货单';
    case 'SALES_DELIVERY':
      return '销售出库发货单';
    case 'PROD_REQUISITION':
      return '生产领料单';
    default:
      return type || '通用单据';
  }
}

function formatCurrency(val: any) {
  const num = Number(val);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function onCheckboxChange({ records }: { records: any[] }) {
  selectedRows.value = records;
}
function onCheckboxAll({ records }: { records: any[] }) {
  selectedRows.value = records;
}

function onCellDblClick({ row }: { row: any }) {
  emit('open-document', row.id);
}

function handleBatchApprove() {
  if (selectedRows.value.length === 0) return;
  const ids = selectedRows.value.map((r) => r.id);
  emit('batch-approve', ids);
  selectedRows.value = [];
}

function exportCsv() {
  if (!tableRef.value) return;
  tableRef.value.exportData({
    type: 'csv',
    filename: `单据台账列表_${new Date().toISOString().slice(0, 10)}`,
  });
}
</script>
