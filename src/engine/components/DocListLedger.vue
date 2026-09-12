<template>
  <div class="flex-1 flex flex-col bg-slate-100 p-3 md:p-4 space-y-3 overflow-y-auto">
    <!-- 1. 顶部状态栏 (KPI卡片区) - 支持业务模块自定义 HTML 组件、listConfig 配置驱动或插槽覆盖 -->
    <slot name="status-bar" :documents="documents" :stats="computedStats" :query="queryValues">
      <!-- 1.1 若业务模块配置了专属的自定义状态栏组件，优先渲染该组件 (方案一) -->
      <component
        v-if="listConfig?.customStatusBarComponent"
        :is="listConfig.customStatusBarComponent"
        :documents="documents"
        :stats="computedStats"
        :query="queryValues"
        @filter-status="onQuickFilterStatus"
      />

      <!-- 1.2 否则渲染默认的 statsCards 标准指标卡网格 -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <div
          v-for="card in activeStatsCards"
          :key="card.key"
          @click="onCardClick(card)"
          :class="[
            'p-3.5 rounded-lg border shadow-2xs flex items-center justify-between transition select-none',
            card.filterStatus
              ? 'cursor-pointer hover:border-indigo-400 hover:shadow-xs'
              : '',
            card.filterStatus && queryValues.status === card.filterStatus
              ? 'ring-2 ring-indigo-500 bg-indigo-50/60 border-indigo-300'
              : 'bg-white border-slate-200'
          ]"
          :title="card.filterStatus ? `点击快速按 [${card.label}] 过滤单据` : undefined"
        >
          <div>
            <div class="flex items-center space-x-1.5">
              <span
                :class="[
                  'text-xs font-medium',
                  card.color === 'amber' ? 'text-amber-700' :
                  card.color === 'emerald' ? 'text-emerald-700' :
                  card.color === 'rose' ? 'text-rose-700' :
                  card.color === 'purple' ? 'text-purple-700' :
                  card.color === 'blue' ? 'text-blue-700' : 'text-slate-600'
                ]"
              >
                {{ card.label }}
              </span>
              <span
                v-if="card.filterStatus && queryValues.status === card.filterStatus"
                class="text-[10px] px-1 py-0.2 rounded bg-indigo-600 text-white font-mono scale-90"
              >
                已过滤
              </span>
            </div>

            <div class="text-xl font-bold font-mono mt-1 text-slate-900">
              <template v-if="card.isCurrency">
                ¥{{ formatCurrency(getCardVal(card)) }}
              </template>
              <template v-else>
                {{ getCardVal(card) }}
                <span class="text-xs font-normal text-slate-400 ml-0.5">{{ card.unit || '单' }}</span>
              </template>
            </div>

            <div class="text-[11px] text-slate-400 mt-1 truncate max-w-[180px]">
              {{ card.subLabel || '统计指标' }}
            </div>
          </div>

          <div
            :class="[
              'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
              card.color === 'amber' ? 'bg-amber-50 text-amber-600' :
              card.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
              card.color === 'rose' ? 'bg-rose-50 text-rose-600' :
              card.color === 'purple' ? 'bg-purple-50 text-purple-600' :
              card.color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'
            ]"
          >
            <component :is="getCardIcon(card.icon)" class="w-5 h-5" />
          </div>
        </div>
      </div>
    </slot>

    <!-- 2. 主列表台账容器 (支持分页与列配置化) -->
    <div class="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex flex-col flex-1 min-h-[460px]">
      <!-- 查询过滤工具栏 - 由 listConfig.searchFields 驱动，并支持插槽整块覆盖或局部扩展 -->
      <slot
        name="filter-bar"
        :query="queryValues"
        :reset="resetFilters"
        :selected-rows="selectedRows"
        :on-new-document="() => $emit('new-document')"
      >
        <div class="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/70 shrink-0">
          <!-- 动态驱动的查询条件组件组 -->
          <div class="flex items-center flex-wrap gap-2 flex-1 min-w-[300px]">
            <template v-for="field in activeSearchFields" :key="field.field">
              <!-- 文本搜索框 -->
              <div
                v-if="field.type === 'input'"
                class="relative"
                :style="{ width: field.width || '260px' }"
              >
                <Search class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  v-model="queryValues[field.field]"
                  type="text"
                  :placeholder="field.placeholder || `请输入${field.label}...`"
                  class="w-full h-8 pl-8 pr-3 bg-white border border-slate-300 rounded text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <!-- 下拉选择框 -->
              <div
                v-else-if="field.type === 'select'"
                class="flex items-center space-x-1.5"
              >
                <span class="text-slate-500 shrink-0">{{ field.label }}:</span>
                <select
                  v-model="queryValues[field.field]"
                  class="h-8 px-2 bg-white border border-slate-300 rounded text-slate-700 focus:border-indigo-500 text-xs max-w-[200px]"
                >
                  <option
                    v-for="opt in field.options || []"
                    :key="String(opt.value)"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <!-- 日期输入框 -->
              <div
                v-else-if="field.type === 'date'"
                class="flex items-center space-x-1.5"
              >
                <span class="text-slate-500 shrink-0">{{ field.label }}:</span>
                <input
                  v-model="queryValues[field.field]"
                  type="date"
                  class="h-8 px-2 bg-white border border-slate-300 rounded text-slate-700 focus:border-indigo-500 text-xs"
                />
              </div>
            </template>

            <!-- 重置按钮 -->
            <button
              v-if="hasActiveFilter"
              type="button"
              @click="resetFilters"
              class="px-2.5 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded transition inline-flex items-center space-x-1"
            >
              <RotateCcw class="w-3 h-3 text-slate-400" />
              <span>重置过滤</span>
            </button>

            <!-- 业务模块自定义额外过滤项插槽 -->
            <slot name="filter-extra" :query="queryValues" />
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

      <!-- vxe-table 单据台账列表 (由 listConfig.columns 动态驱动渲染) -->
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
          <template v-for="col in activeColumns" :key="col.field">
            <!-- 1. 复选框列 -->
            <vxe-column
              v-if="col.type === 'checkbox'"
              type="checkbox"
              :width="col.width || 45"
              :align="col.align || 'center'"
              :fixed="col.fixed"
            />

            <!-- 2. 序号列 -->
            <vxe-column
              v-else-if="col.type === 'seq'"
              :width="col.width || 55"
              :title="col.title || '序号'"
              :align="col.align || 'center'"
              :fixed="col.fixed"
            >
              <template #default="{ $rowIndex }">
                {{ (currentPage - 1) * pageSize + $rowIndex + 1 }}
              </template>
            </vxe-column>

            <!-- 3. 单据编号超链接列 -->
            <vxe-column
              v-else-if="col.type === 'docNo'"
              :field="col.field"
              :title="col.title"
              :width="col.width || 180"
              :sortable="col.sortable !== false"
              :fixed="col.fixed"
            >
              <template #default="{ row }">
                <div class="flex items-center space-x-1.5">
                  <button
                    type="button"
                    @click.stop="$emit('open-document', row.id)"
                    class="font-mono font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                  >
                    {{ row[col.field] }}
                  </button>
                </div>
                <div v-if="row.version !== undefined" class="text-[10px] text-slate-400">版本: v{{ row.version }}</div>
              </template>
            </vxe-column>

            <!-- 4. 单据状态彩色徽章列 -->
            <vxe-column
              v-else-if="col.type === 'statusBadge'"
              :field="col.field"
              :title="col.title"
              :width="col.width || 110"
              :align="col.align || 'center'"
            >
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

            <!-- 5. 往来单位/供应商列 (附带代码) -->
            <vxe-column
              v-else-if="col.type === 'partner'"
              :field="col.field"
              :title="col.title"
              :min-width="col.minWidth || 190"
            >
              <template #default="{ row }">
                <div class="font-medium text-slate-800 truncate">{{ row.partnerName || row[col.field] }}</div>
                <div v-if="row.partnerCode" class="text-[10px] text-slate-400 font-mono">代码: {{ row.partnerCode }}</div>
              </template>
            </vxe-column>

            <!-- 6. 价税金额列 -->
            <vxe-column
              v-else-if="col.type === 'currency' || col.format === 'currency'"
              :field="col.field"
              :title="col.title"
              :width="col.width || 140"
              :align="col.align || 'right'"
              :sortable="col.sortable !== false"
            >
              <template #default="{ row }">
                <span class="font-mono font-bold text-slate-900">
                  ¥{{ formatCurrency(row[col.field]) }}
                </span>
              </template>
            </vxe-column>

            <!-- 7. 操作列 -->
            <vxe-column
              v-else-if="col.type === 'actions'"
              :title="col.title || '操作'"
              :width="col.width || 170"
              :align="col.align || 'center'"
              :fixed="col.fixed || 'right'"
            >
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
                    class="px-1.5 py-0.5 rounded hover:bg-slate-100 text-slate-600 transition"
                    title="复制单据"
                  >
                    复制
                  </button>
                  <button
                    type="button"
                    @click.stop="$emit('delete-document', row.id)"
                    class="px-1.5 py-0.5 rounded hover:bg-rose-50 text-rose-600 transition"
                    title="删除单据"
                  >
                    删除
                  </button>
                </div>
              </template>
            </vxe-column>

            <!-- 8. 普通标准数据列 -->
            <vxe-column
              v-else
              :field="col.field"
              :title="col.title"
              :width="col.width"
              :min-width="col.minWidth"
              :align="col.align"
              :sortable="col.sortable"
              :fixed="col.fixed"
            />
          </template>
        </vxe-table>
      </div>

      <!-- 单据列表的分页工具栏 -->
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
import { ref, computed, reactive, watch, toRaw } from 'vue';
import { VxeTableInstance } from 'vxe-table';
import {
  Search,
  Plus,
  Download,
  CheckCircle2,
  Clock,
  Layers,
  DollarSign,
  AlertCircle,
  RotateCcw,
  Package,
  FileText,
} from 'lucide-vue-next';
import {
  DocListConfig,
  DocListStatsCardConfig,
  DocListSearchFieldConfig,
  DocListColumnConfig,
} from '../types';

const props = withDefaults(
  defineProps<{
    documents: any[];
    listConfig?: DocListConfig;
  }>(),
  {
    documents: () => [],
    listConfig: undefined,
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

// 分页状态
const currentPage = ref(1);
const pageSize = ref(10);

// 查询过滤状态响应式对象
const queryValues = reactive<Record<string, any>>({
  keyword: '',
  status: 'ALL',
  docType: 'ALL',
});

// 初始化/监听查询字段默认值
function initQueryValues() {
  if (props.listConfig?.searchFields) {
    props.listConfig.searchFields.forEach((f) => {
      if (queryValues[f.field] === undefined) {
        queryValues[f.field] = f.defaultValue !== undefined ? f.defaultValue : (f.type === 'select' ? 'ALL' : '');
      }
    });
  }
}
initQueryValues();

watch(
  () => props.listConfig,
  () => {
    initQueryValues();
  },
  { deep: true }
);

// 默认兜底 KPI 卡片
const defaultStatsCards: DocListStatsCardConfig[] = [
  {
    key: 'total',
    label: '单据总台账',
    subLabel: '全部单据记录',
    icon: 'Layers',
    color: 'indigo',
    compute: (docs) => docs.length,
  },
  {
    key: 'pending',
    label: '待审核审批',
    subLabel: '等待部门与主管核准',
    icon: 'Clock',
    color: 'amber',
    filterStatus: 'pending',
    compute: (docs) => docs.filter((d) => (d.header?.status || d.status) === 'pending').length,
  },
  {
    key: 'approved',
    label: '已核准正式生效',
    subLabel: '已下达下游执行',
    icon: 'CheckCircle2',
    color: 'emerald',
    filterStatus: 'approved',
    compute: (docs) => docs.filter((d) => (d.header?.status || d.status) === 'approved').length,
  },
  {
    key: 'totalAmount',
    label: '台账金额总计 (¥)',
    subLabel: '全部单据价税总额',
    icon: 'DollarSign',
    color: 'indigo',
    isCurrency: true,
    compute: (_docs, flatDocs) =>
      flatDocs.reduce((acc, d) => acc + (Number(d.totalAmount) || 0), 0),
  },
];

// 当前启用的 KPI 卡片配置
const activeStatsCards = computed<DocListStatsCardConfig[]>(() => {
  return props.listConfig?.statsCards || defaultStatsCards;
});

// 默认兜底查询字段
const defaultSearchFields: DocListSearchFieldConfig[] = [
  {
    field: 'keyword',
    label: '搜索',
    type: 'input',
    placeholder: '搜索单据编号、往来客商、经办人、部门...',
    width: '280px',
  },
  {
    field: 'docType',
    label: '类型',
    type: 'select',
    defaultValue: 'ALL',
    options: [
      { label: '全部单据类型', value: 'ALL' },
      { label: '标准采购订单', value: 'PURCHASE_ORDER' },
      { label: '采购退货单', value: 'RETURN_ORDER' },
    ],
  },
  {
    field: 'status',
    label: '状态',
    type: 'select',
    defaultValue: 'ALL',
    options: [
      { label: '全部单据状态', value: 'ALL' },
      { label: '草稿编制中', value: 'draft' },
      { label: '待审核审批', value: 'pending' },
      { label: '已核准生效', value: 'approved' },
      { label: '已驳回', value: 'rejected' },
      { label: '已作废', value: 'voided' },
    ],
  },
];

// 当前启用的查询字段
const activeSearchFields = computed<DocListSearchFieldConfig[]>(() => {
  return props.listConfig?.searchFields || defaultSearchFields;
});

// 默认兜底列配置
const defaultColumns: DocListColumnConfig[] = [
  { field: '_checkbox', title: '', type: 'checkbox', width: 45, align: 'center', fixed: 'left' },
  { field: '_seq', title: '序号', type: 'seq', width: 55, align: 'center', fixed: 'left' },
  { field: 'docNo', title: '单据编号', type: 'docNo', width: 180, sortable: true, fixed: 'left' },
  { field: 'docType', title: '单据类型', width: 130 },
  { field: 'status', title: '状态', type: 'statusBadge', width: 110, align: 'center' },
  { field: 'partnerName', title: '往来单位', type: 'partner', minWidth: 190 },
  { field: 'totalAmount', title: '价税合计 (¥)', type: 'currency', width: 140, align: 'right', sortable: true },
  { field: 'docDate', title: '单据日期', width: 110, align: 'center', sortable: true },
  { field: 'department', title: '经办部门/人', width: 150 },
  { field: '_actions', title: '操作', type: 'actions', width: 170, align: 'center', fixed: 'right' },
];

// 当前启用的列配置
const activeColumns = computed<DocListColumnConfig[]>(() => {
  return props.listConfig?.columns || defaultColumns;
});

// 计算卡片值
function getCardVal(card: DocListStatsCardConfig): number {
  if (card.compute) {
    return card.compute(props.documents, flatDocuments.value);
  }
  if (card.filterStatus) {
    return props.documents.filter(
      (d) => (d.header?.status || d.status) === card.filterStatus
    ).length;
  }
  return props.documents.length;
}

// 卡片图标映射
function getCardIcon(name?: string) {
  switch (name) {
    case 'Clock': return Clock;
    case 'CheckCircle2': return CheckCircle2;
    case 'DollarSign': return DollarSign;
    case 'AlertCircle': return AlertCircle;
    case 'Package': return Package;
    case 'FileText': return FileText;
    case 'Layers':
    default:
      return Layers;
  }
}

// 点击卡片联动快捷筛选状态
function onCardClick(card: DocListStatsCardConfig) {
  if (!card.filterStatus) return;
  if (queryValues.status === card.filterStatus) {
    queryValues.status = 'ALL';
  } else {
    queryValues.status = card.filterStatus;
  }
}

// 供自定义状态栏组件调用的快捷状态筛选方法
function onQuickFilterStatus(status: string) {
  if (queryValues.status === status) {
    queryValues.status = 'ALL';
  } else {
    queryValues.status = status;
  }
}

// 是否有处于激活状态的查询过滤条件
const hasActiveFilter = computed(() => {
  for (const [key, val] of Object.entries(queryValues)) {
    if (val !== undefined && val !== null && val !== '' && val !== 'ALL') {
      return true;
    }
  }
  return false;
});

// 重置过滤
function resetFilters() {
  activeSearchFields.value.forEach((f) => {
    queryValues[f.field] = f.defaultValue !== undefined ? f.defaultValue : (f.type === 'select' ? 'ALL' : '');
  });
  queryValues.keyword = '';
  queryValues.status = 'ALL';
  queryValues.docType = 'ALL';
  currentPage.value = 1;
}

// 扁平化单据数据供列表展示
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

// 统计 KPI (向后兼容插槽)
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

// 多条件过滤后的列表
const filteredDocuments = computed(() => {
  const kw = (queryValues.keyword || '').trim().toLowerCase();

  return flatDocuments.value.filter((doc) => {
    // 1. 通用状态过滤
    if (queryValues.status && queryValues.status !== 'ALL' && doc.status !== queryValues.status) {
      return false;
    }
    // 2. 单据类型过滤
    if (queryValues.docType && queryValues.docType !== 'ALL' && doc.docType !== queryValues.docType) {
      return false;
    }

    // 3. 动态配置字段精确/下拉过滤
    for (const field of activeSearchFields.value) {
      const fieldKey = field.field;
      if (fieldKey === 'keyword' || fieldKey === 'status' || fieldKey === 'docType') continue;

      const qVal = queryValues[fieldKey];
      if (qVal !== undefined && qVal !== null && qVal !== '' && qVal !== 'ALL') {
        const rowVal = doc[fieldKey];
        if (String(rowVal) !== String(qVal)) {
          return false;
        }
      }
    }

    // 4. 综合模糊关键词搜索
    if (kw) {
      const matchNo = doc.docNo?.toLowerCase().includes(kw);
      const matchPartner = doc.partnerName?.toLowerCase().includes(kw);
      const matchBuyer = doc.buyer?.toLowerCase().includes(kw);
      const matchDept = doc.department?.toLowerCase().includes(kw);
      const matchShop = (doc.shopName || doc.storeName)?.toLowerCase().includes(kw);
      const matchShopCode = (doc.shopCode || doc.storeCode)?.toLowerCase().includes(kw);
      const matchContract = doc.contractNo?.toLowerCase().includes(kw);
      const matchRemarks = doc.remarks?.toLowerCase().includes(kw);

      if (!matchNo && !matchPartner && !matchBuyer && !matchDept && !matchShop && !matchShopCode && !matchContract && !matchRemarks) {
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

// 过滤变动时自动跳回第 1 页
watch(
  () => [queryValues, pageSize.value],
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);

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
