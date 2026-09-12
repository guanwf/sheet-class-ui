<template>
  <div class="flex-1 flex flex-col min-h-0 bg-white border border-slate-200 rounded-lg overflow-hidden">
    <!-- 1. 网格内置快捷操作工具栏 (支持通过插槽完全定制或追加) -->
    <slot
      name="toolbar"
      :selected-rows="selectedRows"
      :is-readonly="readonly"
      :on-add="() => onAddRow()"
      :on-delete="onDeleteSelected"
      :on-duplicate="onDuplicateSelected"
      :on-paste="() => (showPasteModal = true)"
      :on-export="exportCsv"
    >
      <div :class="['bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs select-none shrink-0 transition-all', isCompact ? 'px-2 py-1' : 'p-2']">
        <!-- 左侧快捷动作组 -->
        <div class="flex items-center gap-2 flex-wrap">
          <button
            v-if="!readonly && config.allowAdd !== false"
            type="button"
            @click="onAddRow()"
            :class="['inline-flex items-center rounded bg-[#25548d] hover:bg-[#1e4676] active:bg-[#183860] text-white font-medium transition shadow-2xs', isCompact ? 'px-2 py-0.5 text-[11.5px]' : 'px-2.5 py-1']"
            title="追加一行空白记录"
          >
            <Plus :class="isCompact ? 'w-3 h-3 mr-0.5' : 'w-3.5 h-3.5 mr-1'" />
            新增行
          </button>

          <button
            v-if="!readonly && config.allowDuplicate !== false"
            type="button"
            :disabled="selectedRows.length === 0"
            @click="onDuplicateSelected"
            :class="['inline-flex items-center rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition', isCompact ? 'px-2 py-0.5 text-[11.5px]' : 'px-2.5 py-1']"
            title="复制选中行并在下方插入副本"
          >
            <Copy :class="isCompact ? 'w-3 h-3 mr-0.5 text-slate-400' : 'w-3.5 h-3.5 mr-1 text-slate-400'" />
            复制行
          </button>

          <button
            v-if="!readonly && config.allowDelete !== false"
            type="button"
            :disabled="selectedRows.length === 0"
            @click="onDeleteSelected"
            :class="['inline-flex items-center rounded border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition', isCompact ? 'px-2 py-0.5 text-[11.5px]' : 'px-2.5 py-1']"
            title="移除选中行记录"
          >
            <Trash2 :class="isCompact ? 'w-3 h-3 mr-0.5 text-rose-500' : 'w-3.5 h-3.5 mr-1 text-rose-500'" />
            删除 ({{ selectedRows.length }})
          </button>

          <button
            v-if="!readonly && config.allowPaste !== false"
            type="button"
            @click="showPasteModal = true"
            :class="['inline-flex items-center rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition', isCompact ? 'px-2 py-0.5 text-[11.5px]' : 'px-2.5 py-1']"
            title="从 Excel 复制多行并一键解析填充"
          >
            <FileSpreadsheet :class="isCompact ? 'w-3 h-3 mr-0.5 text-emerald-600' : 'w-3.5 h-3.5 mr-1 text-emerald-600'" />
            Excel 快速粘贴
          </button>

          <!-- 压力测试按钮 -->
          <div v-if="!readonly && showStressTest" class="flex items-center space-x-1 pl-2 border-l border-slate-300">
            <span class="text-slate-400 text-[11px]">虚拟滚动压测:</span>
            <button
              type="button"
              @click="onStressTest(1000)"
              class="px-2 py-0.5 rounded text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-mono transition"
            >
              1,000行
            </button>
            <button
              type="button"
              @click="onStressTest(5000)"
              class="px-2 py-0.5 rounded text-[11px] bg-purple-50 hover:bg-purple-100 text-purple-700 font-mono transition"
            >
              5,000行
            </button>
          </div>

          <!-- 自定义扩展按钮插槽 -->
          <slot name="toolbar-extra" :is-readonly="readonly" :selected-rows="selectedRows" />
        </div>

        <!-- 右侧：过滤与排序控制区、快捷键提示与导出 -->
        <div class="flex items-center space-x-2.5 text-slate-500 text-xs flex-wrap gap-y-1">
          <!-- 1. 快速文本检索过滤 (过滤特性开启时展示) -->
          <div v-if="isFilterEnabled" class="relative flex items-center">
            <Search class="w-3.5 h-3.5 absolute left-2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              v-model="quickSearchQuery"
              placeholder="搜索当前明细..."
              :class="[
                'pl-7 pr-6 bg-white border border-slate-300 rounded text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none w-32 sm:w-44 transition-all focus:w-52 shadow-2xs',
                isCompact ? 'h-6 text-[11px]' : 'h-7 text-xs'
              ]"
            />
            <button
              v-if="quickSearchQuery"
              type="button"
              @click="quickSearchQuery = ''"
              class="absolute right-1 text-slate-400 hover:text-slate-600 p-0.5"
              title="清空搜索"
            >
              <X class="w-3 h-3" />
            </button>
          </div>

          <!-- 筛选匹配统计标签 -->
          <span
            v-if="isFilterEnabled && (activeColumnFilterCount > 0 || quickSearchQuery)"
            class="text-[11px] font-medium text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-100 flex items-center space-x-1"
          >
            <Filter class="w-3 h-3 text-indigo-500" />
            <span>
              {{ activeColumnFilterCount > 0 ? `列筛选(${activeColumnFilterCount})` : '' }}
              {{ quickSearchQuery ? (activeColumnFilterCount > 0 ? ' + ' : '') + `搜索匹配 ${displayTableData.length} 行` : '' }}
            </span>
          </span>

          <!-- 2. 重置筛选与排序按钮 -->
          <button
            v-if="hasActiveFilterOrSort"
            type="button"
            @click="resetFilterAndSort"
            class="inline-flex items-center px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium transition shadow-2xs"
            title="重置当前所有网格列过滤、搜索与排序列"
          >
            <RotateCcw class="w-3 h-3 mr-1 text-amber-600" />
            重置筛选/排序
          </button>

          <!-- 3. 自定义开启/关闭过滤与排序特性设置 (支持用户灵活自定义) -->
          <div class="relative flex items-center">
            <button
              type="button"
              @click="showFeatureConfigModal = !showFeatureConfigModal"
              :class="[
                'inline-flex items-center px-2 py-1 rounded border text-xs transition shadow-2xs select-none',
                isFilterEnabled || isSortEnabled
                  ? 'border-indigo-200 bg-indigo-50/90 text-indigo-700 hover:bg-indigo-100'
                  : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-50'
              ]"
              :title="`网格能力：过滤(${isFilterEnabled ? '已开启' : '已关闭'})，排序(${isSortEnabled ? '已开启' : '已关闭'})。点击可自定义配置`"
            >
              <SlidersHorizontal
                class="w-3.5 h-3.5 mr-1"
                :class="isFilterEnabled || isSortEnabled ? 'text-indigo-600' : 'text-slate-400'"
              />
              <span class="font-medium">
                {{
                  isFilterEnabled && isSortEnabled
                    ? '过滤/排序: 已开启'
                    : isFilterEnabled
                    ? '过滤: 已开启'
                    : isSortEnabled
                    ? '排序: 已开启'
                    : '过滤/排序: 已关闭'
                }}
              </span>
              <span class="text-[9px] ml-1 opacity-60">▼</span>
            </button>

            <!-- 自定义弹出配置面板 -->
            <div
              v-if="showFeatureConfigModal"
              class="absolute right-0 top-full mt-1.5 w-64 p-3 bg-white rounded-xl shadow-xl border border-slate-200 z-50 text-xs space-y-3"
            >
              <div class="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div class="font-bold text-slate-800 flex items-center space-x-1.5">
                  <SlidersHorizontal class="w-3.5 h-3.5 text-indigo-600" />
                  <span>自定义网格特性开关</span>
                </div>
                <button
                  type="button"
                  @click="showFeatureConfigModal = false"
                  class="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>

              <div class="space-y-2">
                <label class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition">
                  <div class="flex flex-col pr-2">
                    <span class="font-medium text-slate-800">列过滤功能 (Filter)</span>
                    <span class="text-[10px] text-slate-400">表头漏斗筛选与快捷搜索</span>
                  </div>
                  <input
                    type="checkbox"
                    v-model="customEnableFilter"
                    class="rounded border-slate-300 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition">
                  <div class="flex flex-col pr-2">
                    <span class="font-medium text-slate-800">列排序功能 (Sort)</span>
                    <span class="text-[10px] text-slate-400">点击表头升降序排布</span>
                  </div>
                  <input
                    type="checkbox"
                    v-model="customEnableSort"
                    class="rounded border-slate-300 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>

              <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span class="text-slate-400 text-[10px]">
                  {{ isFilterEnabled ? '采购单默认开启' : '退货单默认关闭' }}
                </span>
                <button
                  type="button"
                  @click="resetToModuleDefault"
                  class="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                >
                  恢复模块默认
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            @click="exportCsv"
            class="inline-flex items-center px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition shadow-2xs"
            title="导出明细网格为 CSV"
          >
            <Download class="w-3 h-3 mr-1 text-slate-400" />
            导出 CSV
          </button>
        </div>
      </div>
    </slot>

    <!-- 2. vxe-table 虚拟滚动就地编辑主体 (支持过滤与排序) -->
    <div class="flex-1 w-full relative min-h-0">
      <vxe-table
        ref="xTableRef"
        height="auto"
        border
        stripe
        round
        show-overflow
        show-footer
        class="text-xs w-full h-full"
        :size="tableSize"
        :data="displayTableData"
        :row-config="{ isHover: true, isCurrent: true, keyField: 'id' }"
        :edit-config="readonly ? undefined : { trigger: 'click', mode: 'cell', showStatus: true }"
        :edit-rules="computedEditRules"
        :scroll-y="{ enabled: true, gt: 0 }"
        :checkbox-config="{ trigger: 'row', highlight: true }"
        :footer-method="footerMethod"
        :sort-config="{
          trigger: 'default',
          showIcon: isSortEnabled,
          orders: ['asc', 'desc', null]
        }"
        :filter-config="{
          showIcon: isFilterEnabled,
          destroyOnClose: false
        }"
        @checkbox-change="onCheckboxChange"
        @checkbox-all="onCheckboxAll"
        @edit-closed="onEditClosed"
        @sort-change="onSortChange"
        @filter-change="onFilterChange"
      >
        <!-- 复选列 -->
        <vxe-column type="checkbox" :width="isCompact ? 38 : 45" align="center" fixed="left" />

        <!-- 序号列 -->
        <vxe-column type="seq" :width="isCompact ? 46 : 55" title="序号" align="center" fixed="left" />

        <!-- 差异状态标识列 (展示 I/U/D/N 图标状态，方便直观校验) -->
        <vxe-column title="变动" :width="isCompact ? 42 : 50" align="center" fixed="left">
          <template #default="{ row }">
            <span
              v-if="insertedIdSet.has(row.id)"
              class="inline-block px-1 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700"
              title="新增行 (I)"
            >
              I
            </span>
            <span
              v-else-if="updatedIdSet.has(row.id) || row.isDirty"
              class="inline-block px-1 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-700"
              title="修改行 (U)"
            >
              U
            </span>
            <span
              v-else
              class="inline-block px-1 py-0.2 rounded text-[10px] text-slate-400"
              title="无变动 (N)"
            >
              N
            </span>
          </template>
        </vxe-column>

        <!-- 动态列渲染 (结合全局/单列的排序与过滤配置) -->
        <template v-for="col in columns" :key="col.field">
          <vxe-column
            :field="col.field"
            :title="col.title"
            :width="col.width"
            :min-width="col.minWidth"
            :fixed="col.fixed"
            :align="col.align || (col.type === 'number' ? 'right' : 'left')"
            :edit-render="readonly || col.editable === false ? undefined : getEditRenderConfig(col)"
            :sortable="isSortEnabled && col.sortable !== false"
            :sort-by="getSortBy(col)"
            :filters="isFilterEnabled && isColumnFilterable(col) ? columnFiltersMap[col.field] : undefined"
            :filter-multiple="col.filterMultiple !== false"
            :filter-method="col.filterMethod || defaultColFilterMethod"
          >
            <!-- 单元格展示插槽: 支持业务模块自定义单元格 UI -->
            <template #default="{ row, rowIndex }">
              <slot :name="`cell-${col.field}`" :row="row" :col="col" :value="row[col.field]" :rowIndex="rowIndex">
                <!-- 查询精灵字段呈现 (带高亮与可点击放大镜图标) -->
                <div
                  v-if="col.type === 'spirit' || col.spiritKey"
                  class="flex items-center justify-between w-full group/spirit-cell"
                >
                  <span
                    class="truncate font-mono"
                    :class="row[col.field] ? 'text-slate-900 font-medium' : 'text-slate-400 italic text-[11px]'"
                    :title="row[col.field] ? String(row[col.field]) : '点击或点击右侧放大镜选择'"
                  >
                    {{ row[col.field] || '点击选择商品...' }}
                  </span>
                  <button
                    v-if="!readonly && col.editable !== false"
                    type="button"
                    @click.stop="openSpiritForCell(row, col, rowIndex)"
                    class="w-5 h-5 ml-1 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded transition shrink-0 cursor-pointer shadow-2xs"
                    :title="`打开${col.title}查询精灵`"
                  >
                    <Search class="w-3 h-3" />
                  </button>
                </div>
                <!-- 默认通用格式化呈现 -->
                <span v-else-if="col.format === 'currency'" class="font-mono font-medium text-slate-900">
                  {{ row[col.field] !== undefined && row[col.field] !== '' && row[col.field] !== null ? `¥${formatCurrency(row[col.field])}` : '-' }}
                </span>
                <span v-else-if="col.format === 'percent'" class="font-mono text-slate-700">
                  {{ row[col.field] !== undefined && row[col.field] !== '' && row[col.field] !== null ? `${row[col.field]}%` : '-' }}
                </span>
                <span v-else-if="col.type === 'number'" class="font-mono">
                  {{ row[col.field] !== undefined && row[col.field] !== '' && row[col.field] !== null ? Number(row[col.field]).toLocaleString() : '-' }}
                </span>
                <span v-else>
                  {{ row[col.field] || '-' }}
                </span>
              </slot>
            </template>

            <!-- 就地编辑插槽 (仅针对精灵列) -->
            <template v-if="col.type === 'spirit' || col.spiritKey" #edit="{ row, rowIndex }">
              <div class="flex items-center w-full px-1 py-0.5 bg-white">
                <input
                  type="text"
                  v-model="row[col.field]"
                  @keydown.enter.prevent="openSpiritForCell(row, col, rowIndex)"
                  class="flex-1 min-w-0 bg-transparent text-xs text-slate-800 focus:outline-none font-mono"
                  :placeholder="col.placeholder || `回车或点击选${col.title}`"
                />
                <button
                  type="button"
                  @click.stop="openSpiritForCell(row, col, rowIndex)"
                  class="w-5 h-5 ml-1 flex items-center justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded shrink-0 cursor-pointer shadow-2xs"
                  :title="`打开${col.title}查询精灵 (Enter)`"
                >
                  <Search class="w-3 h-3" />
                </button>
              </div>
            </template>
          </vxe-column>
        </template>
      </vxe-table>
    </div>

    <!-- 内置查询精灵通用弹窗 (SpiritModal) -->
    <SpiritModal
      v-model:visible="spiritModalVisible"
      :spirit-config="currentSpiritConfig"
      :initial-keyword="currentSpiritKeyword"
      :multiple="currentSpiritColumn?.multiple !== false"
      @confirm="handleSpiritConfirm"
    />

    <!-- Excel 批量快速粘贴弹窗 (根据 columns 动态解析，通用无硬编码) -->
    <div
      v-if="showPasteModal"
      class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div class="flex items-center space-x-2">
            <FileSpreadsheet class="w-5 h-5 text-emerald-600" />
            <h3 class="font-bold text-sm text-slate-800">从 Excel / 剪贴板批量快速录入</h3>
          </div>
          <button
            type="button"
            @click="showPasteModal = false"
            class="text-slate-400 hover:text-slate-600"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="p-4 space-y-3 flex-1 overflow-y-auto text-xs">
          <p class="text-slate-500 leading-relaxed">
            请从 Excel 或电子表格中复制多行数据（制表符 Tab 分隔），直接粘贴在下方文本框中。<br />
            将按当前列配置顺序自动匹配回填：
            <span class="font-mono text-indigo-600 font-semibold">
              {{ columns.map(c => c.title).join(' | ') }}
            </span>
          </p>

          <textarea
            v-model="pasteRawText"
            placeholder="例如在 Excel 中选中多行表格，Ctrl+C 复制后在此处粘贴..."
            rows="8"
            class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs focus:bg-white focus:border-indigo-500 focus:outline-none"
          ></textarea>

          <div class="flex items-center justify-between text-[11px] text-slate-400">
            <span>支持千分位数值与文本自动去除首尾空格</span>
            <button
              type="button"
              @click="loadSamplePaste"
              class="text-indigo-600 hover:underline"
            >
              填充当前列配置对应示例
            </button>
          </div>
        </div>

        <div class="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
          <button
            type="button"
            @click="showPasteModal = false"
            class="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium"
          >
            取消
          </button>
          <button
            type="button"
            @click="handleApplyPaste"
            class="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-2xs"
          >
            解析并导入
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRaw, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { VxeTableInstance, VxeTableDefines } from 'vxe-table';
import {
  Plus,
  Trash2,
  Copy,
  Download,
  FileSpreadsheet,
  X,
  SlidersHorizontal,
  Search,
  RotateCcw,
  Filter,
} from 'lucide-vue-next';
import { SlaveColumnConfig, DeltaFlag } from '../types';
import SpiritModal from '../spirit/SpiritModal.vue';
import { spiritRegistry } from '../spirit/spiritRegistry';
import { SpiritConfig } from '../spirit/types';

const props = withDefaults(
  defineProps<{
    tableKey: string;
    columns: SlaveColumnConfig[];
    data: any[];
    readonly?: boolean;
    showStressTest?: boolean;
    enableFilter?: boolean;
    enableSort?: boolean;
    density?: 'compact' | 'standard';
    config?: {
      allowAdd?: boolean;
      allowDelete?: boolean;
      allowDuplicate?: boolean;
      allowPaste?: boolean;
      autoSummary?: boolean;
      enableFilter?: boolean;
      enableSort?: boolean;
    };
  }>(),
  {
    readonly: false,
    showStressTest: true,
    enableFilter: undefined,
    enableSort: undefined,
    config: () => ({
      allowAdd: true,
      allowDelete: true,
      allowDuplicate: true,
      allowPaste: true,
      autoSummary: true,
      enableFilter: true,
      enableSort: true,
    }),
  }
);

const emit = defineEmits<{
  (e: 'update:data', val: any[]): void;
  (e: 'cell-change', payload: { row: any; field: string; value: any; oldValue: any; column: any }): void;
  (e: 'row-add', row: any): void;
  (e: 'row-delete', rowIds: string[]): void;
  (e: 'row-duplicate', rowId: string): void;
  (e: 'validate-error', payload: { row: any; field: string; message: string }): void;
  (e: 'spirit-select', payload: { row: any; column: SlaveColumnConfig; selected: any; allSelected?: any[]; rowIndex?: number }): void;
}>();

const store = useStore();
const isCompact = computed(() => {
  if (props.density) return props.density === 'compact';
  return store?.getters?.uiDensity === 'compact';
});
const tableSize = computed(() => isCompact.value ? 'mini' : 'medium');

const xTableRef = ref<VxeTableInstance | null>(null);
const selectedRows = ref<any[]>([]);

// 追踪差异：I (新增), U (修改), D (删除)
const insertedIdSet = ref<Set<string>>(new Set());
const updatedIdSet = ref<Set<string>>(new Set());
const removedRecords = ref<any[]>([]);

// 过滤与排序开关（优先受 props 传入的模块规范控制，并支持用户在网格工具栏自定义切换）
const customEnableFilter = ref<boolean>(props.enableFilter ?? props.config?.enableFilter ?? true);
const customEnableSort = ref<boolean>(props.enableSort ?? props.config?.enableSort ?? true);

watch(
  () => [props.enableFilter, props.config?.enableFilter],
  () => {
    if (props.enableFilter !== undefined) {
      customEnableFilter.value = props.enableFilter;
    } else if (props.config?.enableFilter !== undefined) {
      customEnableFilter.value = props.config.enableFilter;
    }
  },
  { immediate: true }
);

watch(
  () => [props.enableSort, props.config?.enableSort],
  () => {
    if (props.enableSort !== undefined) {
      customEnableSort.value = props.enableSort;
    } else if (props.config?.enableSort !== undefined) {
      customEnableSort.value = props.config.enableSort;
    }
  },
  { immediate: true }
);

const isFilterEnabled = computed(() => customEnableFilter.value);
const isSortEnabled = computed(() => customEnableSort.value);

// 快速检索关键词
const quickSearchQuery = ref('');
const showFeatureConfigModal = ref(false);
const activeColumnFilterCount = ref(0);
const activeSortInfo = ref<{ field: string; order: string } | null>(null);

const tableData = computed({
  get: () => props.data,
  set: (val) => emit('update:data', val),
});

// 过滤后的明细呈现（保持与原始数据的对象引用一致，原地编辑直接映射到 tableData）
const displayTableData = computed(() => {
  if (!isFilterEnabled.value || !quickSearchQuery.value.trim()) {
    return tableData.value;
  }
  const q = quickSearchQuery.value.trim().toLowerCase();
  return tableData.value.filter((row) => {
    return props.columns.some((col) => {
      const val = row[col.field];
      if (val === undefined || val === null) return false;
      return String(val).toLowerCase().includes(q);
    });
  });
});

// 列排序与过滤辅助方法
function getSortBy(col: SlaveColumnConfig) {
  if (col.type === 'number') {
    return (row: any) => {
      const v = row[col.field];
      if (v === undefined || v === null || v === '') return -Infinity;
      const num = Number(v);
      return isNaN(num) ? -Infinity : num;
    };
  }
  return col.field;
}

// 维护每个列稳定的 filters 列表（避免在模板中频繁返回新数组导致 vxe-table 内部筛选状态丢失）
const columnFiltersMap = ref<Record<string, Array<{ label: string; value: any; checked?: boolean }>>>({});

function isColumnFilterable(col: SlaveColumnConfig) {
  if (!isFilterEnabled.value) return false;
  if (col.filterable === false) return false;
  // 显式指定 filterable: true，或者配置了 filters，或者列未显式禁止过滤
  return col.filterable === true || !!col.filters || (col.filterable !== false && isFilterEnabled.value);
}

function updateColumnFiltersStore() {
  if (!isFilterEnabled.value) {
    columnFiltersMap.value = {};
    return;
  }

  const currentMap = columnFiltersMap.value;
  const newMap: Record<string, Array<{ label: string; value: any; checked?: boolean }>> = {};

  props.columns.forEach((col) => {
    if (!isColumnFilterable(col)) {
      return;
    }

    let options: Array<{ label: string; value: any; checked?: boolean }> = [];

    // 1. 如果列配置中显式定义了 filters 静态选项
    if (col.filters && col.filters.length > 0) {
      options = col.filters.map((f) => ({
        label: String(f.label),
        value: f.value,
        checked: !!f.checked,
      }));
    }
    // 2. 如果列配置了 options (如 select 下拉列表)
    else if (col.options && col.options.length > 0) {
      options = col.options.map((opt) => {
        const label = typeof opt === 'string' ? opt : opt.label;
        const value = typeof opt === 'string' ? opt : opt.value;
        return {
          label: String(label),
          value: value,
          checked: false,
        };
      });
    }
    // 3. 其它列 (文本/数字/日期等)，提取当前明细数据的去重枚举值
    else {
      const valSet = new Set<any>();
      tableData.value.forEach((r) => {
        const v = r[col.field];
        if (v !== undefined && v !== null && String(v).trim() !== '') {
          valSet.add(v);
        }
      });

      const sortedVals = Array.from(valSet).sort((a, b) => {
        const numA = Number(a);
        const numB = Number(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return String(a).localeCompare(String(b), 'zh-CN');
      });

      options = sortedVals.slice(0, 50).map((v) => {
        let label = String(v);
        if (col.format === 'currency') {
          label = `¥${formatCurrency(v)}`;
        } else if (col.format === 'percent') {
          label = `${v}%`;
        }
        return {
          label,
          value: v,
          checked: false,
        };
      });
    }

    if (options.length === 0) {
      options = [{ label: '（空值）', value: '', checked: false }];
    }

    // 继承该列已勾选的 checked 状态
    const prevList = currentMap[col.field];
    if (prevList && prevList.length > 0) {
      const checkedSet = new Set(
        prevList.filter((item) => item.checked).map((item) => String(item.value))
      );
      options.forEach((item) => {
        if (checkedSet.has(String(item.value))) {
          item.checked = true;
        }
      });

      // 如果选项内容与勾选状态完全相同，复用既有数组引用，避免 vxe-table 内部 watcher 重复触发
      const isSame =
        prevList.length === options.length &&
        prevList.every(
          (p, i) =>
            String(p.value) === String(options[i].value) &&
            p.label === options[i].label &&
            p.checked === options[i].checked
        );

      if (isSame) {
        newMap[col.field] = prevList;
        return;
      }
    }

    newMap[col.field] = options;
  });

  columnFiltersMap.value = newMap;
}

watch(
  () => [props.columns, isFilterEnabled.value],
  () => {
    updateColumnFiltersStore();
  },
  { deep: true, immediate: true }
);

watch(
  () => tableData.value.length,
  () => {
    updateColumnFiltersStore();
  }
);

onMounted(() => {
  updateColumnFiltersStore();
});

function defaultColFilterMethod({ value, option, cellValue }: any) {
  const filterVal = option && option.value !== undefined ? option.value : value;
  if (filterVal === undefined || filterVal === null || filterVal === '') return true;
  if (cellValue === undefined || cellValue === null) return false;
  return String(cellValue).trim().toLowerCase() === String(filterVal).trim().toLowerCase();
}

function onFilterChange() {
  const table = xTableRef.value;
  if (table && table.getCheckedFilters) {
    const checkedFilters = table.getCheckedFilters();
    activeColumnFilterCount.value = checkedFilters ? checkedFilters.length : 0;
  }
}

function onSortChange({ property, order }: any) {
  if (order) {
    activeSortInfo.value = { field: property, order };
  } else {
    activeSortInfo.value = null;
  }
}

const hasActiveFilterOrSort = computed(() => {
  return (
    !!quickSearchQuery.value ||
    activeColumnFilterCount.value > 0 ||
    !!activeSortInfo.value
  );
});

function resetFilterAndSort() {
  quickSearchQuery.value = '';
  activeColumnFilterCount.value = 0;
  activeSortInfo.value = null;
  xTableRef.value?.clearFilter();
  xTableRef.value?.clearSort();
  // 重置各列筛选选项勾选状态
  Object.values(columnFiltersMap.value).forEach((list) => {
    list.forEach((item) => {
      item.checked = false;
    });
  });
}

function resetToModuleDefault() {
  customEnableFilter.value = props.enableFilter ?? props.config?.enableFilter ?? true;
  customEnableSort.value = props.enableSort ?? props.config?.enableSort ?? true;
  showFeatureConfigModal.value = false;
  resetFilterAndSort();
}

// 当关闭过滤或排序时，自动重置过滤和排序状态
watch(isFilterEnabled, (val) => {
  if (!val) {
    quickSearchQuery.value = '';
    activeColumnFilterCount.value = 0;
    xTableRef.value?.clearFilter();
  }
});
watch(isSortEnabled, (val) => {
  if (!val) {
    activeSortInfo.value = null;
    xTableRef.value?.clearSort();
  }
});

// 动态构建校验规则，支持必填校验和 min 范围限制（防止负数等）
const computedEditRules = computed(() => {
  const rulesMap: Record<string, any[]> = {};
  props.columns.forEach((col) => {
    const list: any[] = [];
    if (col.required) {
      list.push({ required: true, message: `${col.title}必须填写` });
    }
    if (col.min !== undefined) {
      list.push({
        validator({ cellValue }: any) {
          if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
            if (Number(cellValue) < col.min!) {
              return new Error(`${col.title}不允许小于 ${col.min}`);
            }
          }
        },
      });
    }
    if (col.rules && col.rules.length > 0) {
      col.rules.forEach((r) => {
        list.push({
          required: r.required,
          min: r.min,
          max: r.max,
          message: r.message,
          validator: r.validator,
        });
      });
    }
    if (list.length > 0) {
      rulesMap[col.field] = list;
    }
  });
  return rulesMap;
});

// 列编辑渲染模式生成 (原生接入 min/max 限制)
function getEditRenderConfig(col: SlaveColumnConfig) {
  if (col.type === 'spirit' || col.spiritKey) {
    return {
      name: 'input',
    };
  }
  if (col.type === 'select') {
    return {
      name: 'VxeSelect',
      options: (col.options || []).map((opt) =>
        typeof opt === 'string' ? { label: opt, value: opt } : opt
      ),
    };
  }
  if (col.type === 'number') {
    return {
      name: 'VxeNumberInput',
      props: {
        type: 'float',
        digits: col.precision !== undefined ? col.precision : 2,
        min: col.min !== undefined ? col.min : undefined,
        max: col.max !== undefined ? col.max : undefined,
      },
    };
  }
  if (col.type === 'date') {
    return {
      name: 'VxeDatePicker',
      props: {
        valueFormat: 'yyyy-MM-dd',
      },
    };
  }
  return {
    name: 'VxeInput',
    props: {
      type: 'text',
      placeholder: col.placeholder || `请输入${col.title}`,
    },
  };
}

// 格式化金额
function formatCurrency(val: any) {
  const num = Number(val);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// 复选操作
function onCheckboxChange({ records }: { records: any[] }) {
  selectedRows.value = records;
}
function onCheckboxAll({ records }: { records: any[] }) {
  selectedRows.value = records;
}

// 单元格编辑关闭
function onEditClosed(params: VxeTableDefines.EditClosedEventParams) {
  const { row, column } = params;
  const field = column.property;
  let val = row[field];

  const colConf = props.columns.find((c) => c.field === field);

  // 严格拦截数值下限限制（如 min: 0，阻止负数并自动规范化）
  if (colConf?.type === 'number' && colConf.min !== undefined) {
    const num = Number(val);
    if (!isNaN(num) && num < colConf.min) {
      val = colConf.min;
      row[field] = colConf.min;
      emit('validate-error', {
        row,
        field,
        message: `${colConf.title} 不允许输入负数 (小于 ${colConf.min})，已自动校正为 ${colConf.min}`,
      });
    }
  }

  // 记录修改状态（如果不是前端新增的行，标记为 U）
  if (!insertedIdSet.value.has(row.id)) {
    updatedIdSet.value.add(row.id);
  }
  row.isDirty = true;

  emit('cell-change', {
    row,
    field,
    value: val,
    oldValue: params.cell?.textContent,
    column,
  });
}

/**
 * 新增行操作
 * 关键规则 (响应用户明确需求):
 * 子表新增行时，不要自动填充所有列的记录！
 * 仅生成必需的主键 id 与递增 rowNo，以及外部显式传入的 defaultValues。
 * 只有在列配置上显式声明了 defaultValue 的字段才会填入默认值，其余列保持留空。
 */
function onAddRow(defaultValues?: any) {
  const newId = `row-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const newRow: any = {
    id: newId,
    rowNo: tableData.value.length + 1,
    ...defaultValues,
  };

  // 仅在显式配置了 defaultValue 时才赋初始值，绝不对所有列无脑填 0 或空字符串
  props.columns.forEach((col) => {
    if (newRow[col.field] === undefined && col.defaultValue !== undefined) {
      newRow[col.field] = col.defaultValue;
    }
  });

  insertedIdSet.value.add(newId);
  const next = [...tableData.value, newRow];
  emit('update:data', next);
  emit('row-add', newRow);

  // 滚动到最新行
  setTimeout(() => {
    xTableRef.value?.scrollToRow(newRow);
  }, 50);
}

// 复制选中行
function onDuplicateSelected() {
  if (selectedRows.value.length === 0) return;
  const next = [...tableData.value];

  selectedRows.value.forEach((source) => {
    const newId = `row-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const cloned = {
      ...toRaw(source),
      id: newId,
    };
    insertedIdSet.value.add(newId);
    next.push(cloned);
  });

  // 重置序号
  next.forEach((r, idx) => {
    r.rowNo = idx + 1;
  });

  emit('update:data', next);
  selectedRows.value = [];
}

// 删除选中行
function onDeleteSelected() {
  if (selectedRows.value.length === 0) return;
  const delIds = new Set(selectedRows.value.map((r) => r.id));

  selectedRows.value.forEach((r) => {
    // 如果该行是本次前端刚新增的，物理移除即可
    if (insertedIdSet.value.has(r.id)) {
      insertedIdSet.value.delete(r.id);
    } else {
      // 如果是旧行，进入删除集合，标记为 D
      updatedIdSet.value.delete(r.id);
      removedRecords.value.push({ ...toRaw(r), _flag: 'D' });
    }
  });

  const next = tableData.value.filter((r) => !delIds.has(r.id));
  next.forEach((r, idx) => {
    r.rowNo = idx + 1;
  });

  emit('update:data', next);
  emit('row-delete', Array.from(delIds));
  selectedRows.value = [];
}

// ==================== 查询精灵网格集成核心逻辑 ====================
const spiritModalVisible = ref(false);
const currentSpiritConfig = ref<SpiritConfig | undefined>();
const currentSpiritColumn = ref<SlaveColumnConfig | null>(null);
const currentSpiritRow = ref<any>(null);
const currentSpiritRowIndex = ref<number>(-1);
const currentSpiritKeyword = ref<string>('');

/**
 * 触发指定单元格打开查询精灵
 */
function openSpiritForCell(row: any, col: SlaveColumnConfig, rowIndex?: number) {
  if (props.readonly || col.editable === false) return;
  const spiritKey = col.spiritKey || (col.type === 'spirit' ? 'PRODUCT' : '');
  if (!spiritKey) return;

  const cfg = spiritRegistry.get(spiritKey);
  if (!cfg) {
    console.warn(`[DocEditableGrid] 查询精灵 ${spiritKey} 未在 spiritRegistry 中注册`);
    return;
  }

  currentSpiritConfig.value = cfg;
  currentSpiritColumn.value = col;
  currentSpiritRow.value = row;
  currentSpiritRowIndex.value = rowIndex !== undefined ? rowIndex : tableData.value.indexOf(row);
  currentSpiritKeyword.value = String(row[col.field] || '');
  spiritModalVisible.value = true;
}

/**
 * 查询精灵确认选定数据后，执行自动回填与自定义逻辑回调处理
 */
function handleSpiritConfirm(firstSelected: any, allSelectedRows?: any[]) {
  if (!currentSpiritColumn.value || !currentSpiritRow.value) return;

  const col = currentSpiritColumn.value;
  const currentRow = currentSpiritRow.value;
  const items = allSelectedRows && allSelectedRows.length > 0 ? allSelectedRows : [firstSelected];
  if (items.length === 0) return;

  // 1. 回填当前单元格所在行 (首个选中项)
  applySpiritMapping(currentRow, col, items[0]);

  // 记录修改状态
  if (!insertedIdSet.value.has(currentRow.id)) {
    updatedIdSet.value.add(currentRow.id);
  }
  currentRow.isDirty = true;

  // 执行列配置的自定义逻辑代码回调处理 (onSpiritSelect)
  if (typeof col.onSpiritSelect === 'function') {
    col.onSpiritSelect({
      row: currentRow,
      selected: items[0],
      allSelected: items,
      rowIndex: currentSpiritRowIndex.value,
      tableData: tableData.value,
      grid: xTableRef.value,
    });
  }

  // 触发 cell-change 告知父级与外部 Hook（如退货单自动重新计算金额）
  emit('cell-change', {
    row: currentRow,
    field: col.field,
    value: currentRow[col.field],
    oldValue: null,
    column: col,
  });

  // 立即触发 update:data 保证父组件和 Store 实时感知单行选中的更新
  emit('update:data', [...tableData.value]);

  // 2. 如果多选勾选了多个商品 (items.length > 1) 且开启了多选 (col.multiple !== false)
  if (items.length > 1 && col.multiple !== false) {
    const appendedRows: any[] = [];
    const currentLen = tableData.value.length;

    for (let i = 1; i < items.length; i++) {
      const item = items[i];
      const newId = `row-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 6)}`;
      const newRow: any = {
        id: newId,
        rowNo: currentLen + i,
      };

      // 赋予配置的默认值
      props.columns.forEach((c) => {
        if (c.defaultValue !== undefined) {
          newRow[c.field] = c.defaultValue;
        }
      });

      // 映射回填字段
      applySpiritMapping(newRow, col, item);

      // 执行自定义代码处理
      if (typeof col.onSpiritSelect === 'function') {
        col.onSpiritSelect({
          row: newRow,
          selected: item,
          allSelected: items,
          rowIndex: currentLen + i - 1,
          tableData: tableData.value,
          grid: xTableRef.value,
        });
      }

      insertedIdSet.value.add(newId);
      newRow.isDirty = true;
      appendedRows.push(newRow);
    }

    if (appendedRows.length > 0) {
      const nextData = [...tableData.value, ...appendedRows];
      emit('update:data', nextData);

      appendedRows.forEach((r) => {
        emit('cell-change', {
          row: r,
          field: col.field,
          value: r[col.field],
          oldValue: null,
          column: col,
        });
        emit('row-add', r);
      });
    }
  }

  // 触发全局 spirit-select 事件
  emit('spirit-select', {
    row: currentRow,
    column: col,
    selected: items[0],
    allSelected: items,
    rowIndex: currentSpiritRowIndex.value,
  });
}

/**
 * 依据 column 上的 spiritMapping 进行字段填充
 */
function applySpiritMapping(row: any, col: SlaveColumnConfig, item: any) {
  if (col.spiritMapping) {
    for (const [targetKey, sourceKey] of Object.entries(col.spiritMapping)) {
      if (item[sourceKey] !== undefined) {
        row[targetKey] = item[sourceKey];
      }
    }
  } else {
    // 缺省自动映射：商品编码与名称
    const valField = currentSpiritConfig.value?.valueField || 'productCode';
    row[col.field] = item[valField] ?? item.code ?? item.id;
    if (col.field === 'productCode' && item.productName) {
      row.productName = item.productName;
    } else if (col.field === 'itemCode' && item.productName) {
      row.itemName = item.productName;
    }
    if (item.retailPrice !== undefined) {
      if (row.price !== undefined) row.price = item.retailPrice;
      if (row.priceWithTax !== undefined) row.priceWithTax = item.retailPrice;
    }
  }
}

// 导出 CSV
function exportCsv() {
  if (!xTableRef.value) return;
  xTableRef.value.exportData({
    type: 'csv',
    filename: `${props.tableKey}_明细导出_${new Date().toISOString().slice(0, 10)}`,
  });
}

// 底部合计行计算 (通用无写死，自适应过滤后的数据集)
function footerMethod({ columns, data }: { columns: VxeTableDefines.ColumnInfo[]; data?: any[] }) {
  const currentData = data && Array.isArray(data) ? data : displayTableData.value;
  const footerRow: any[] = [];
  columns.forEach((col, colIndex) => {
    if (colIndex === 0) {
      footerRow.push('合计');
      return;
    }
    if (colIndex === 1) {
      if (currentData.length !== tableData.value.length) {
        footerRow.push(`${currentData.length}/${tableData.value.length} 行`);
      } else {
        footerRow.push(`${tableData.value.length} 行`);
      }
      return;
    }

    const field = col.property;
    const colConf = props.columns.find((c) => c.field === field);

    if (colConf?.summary === 'sum') {
      const sumVal = currentData.reduce(
        (acc, item) => acc + (Number(item[field]) || 0),
        0
      );
      if (colConf.format === 'currency') {
        footerRow.push(`¥${formatCurrency(sumVal)}`);
      } else {
        footerRow.push(sumVal.toLocaleString());
      }
    } else if (colConf?.summary === 'count') {
      footerRow.push(currentData.length);
    } else {
      footerRow.push('-');
    }
  });
  return [footerRow];
}

// Excel 剪贴板快速粘贴处理 (根据当前列类型动态推导，通用无写死)
const showPasteModal = ref(false);
const pasteRawText = ref('');

function loadSamplePaste() {
  // 动态根据传入的 columns 生成示例 Tab 分隔文本，适用于采购、销售、库存等任意模块
  const rows: string[] = [];
  for (let r = 1; r <= 3; r++) {
    const cells = props.columns.map((col) => {
      if (col.type === 'number') {
        const val = col.min !== undefined ? col.min + r * 10 : r * 100;
        return String(val);
      } else if (col.type === 'date') {
        return new Date().toISOString().slice(0, 10);
      } else if (col.type === 'select') {
        const opt = col.options?.[0];
        return typeof opt === 'string' ? opt : (opt?.value || 'OPT-1');
      } else {
        return `${col.title}-${r}`;
      }
    });
    rows.push(cells.join('\t'));
  }
  pasteRawText.value = rows.join('\n');
}

function handleApplyPaste() {
  if (!pasteRawText.value.trim()) {
    showPasteModal.value = false;
    return;
  }

  const lines = pasteRawText.value
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const newItems: any[] = [];
  lines.forEach((line) => {
    const cells = line.split('\t');
    const newId = `paste-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const row: any = {
      id: newId,
      rowNo: tableData.value.length + newItems.length + 1,
    };

    props.columns.forEach((col, idx) => {
      const cellVal = cells[idx] !== undefined ? cells[idx].trim() : '';
      if (col.type === 'number') {
        const numVal = Number(cellVal.replace(/,/g, '')) || 0;
        row[col.field] = col.min !== undefined && numVal < col.min ? col.min : numVal;
      } else {
        row[col.field] = cellVal;
      }
    });

    insertedIdSet.value.add(newId);
    newItems.push(row);
  });

  emit('update:data', [...tableData.value, ...newItems]);
  pasteRawText.value = '';
  showPasteModal.value = false;
}

// 虚拟滚动性能压力测试 (根据当前列定义动态填充，通用无写死)
function onStressTest(count: number) {
  const bulk: any[] = [];
  const baseLen = tableData.value.length;
  for (let i = 0; i < count; i++) {
    const newId = `bulk-${Date.now()}-${i}`;
    const row: any = {
      id: newId,
      rowNo: baseLen + i + 1,
    };
    props.columns.forEach((col) => {
      if (col.type === 'number') {
        const minVal = col.min !== undefined ? col.min : 1;
        row[col.field] = minVal + ((i * 3) % 100);
      } else if (col.type === 'date') {
        row[col.field] = new Date().toISOString().slice(0, 10);
      } else if (col.type === 'select') {
        const opts = col.options || [];
        if (opts.length > 0) {
          const opt = opts[i % opts.length];
          row[col.field] = typeof opt === 'string' ? opt : opt.value;
        } else {
          row[col.field] = '选项1';
        }
      } else {
        row[col.field] = `${col.title}-${baseLen + i + 1}`;
      }
    });
    insertedIdSet.value.add(newId);
    bulk.push(row);
  }
  emit('update:data', [...tableData.value, ...bulk]);
}

/**
 * 核心暴露方法：获取带增量标记 (_flag: I/U/D/N) 的全量差异集合
 */
function getDeltaRecords(): Array<any & { _flag: DeltaFlag }> {
  const currentList = tableData.value.map((item) => {
    let flag: DeltaFlag = 'N';
    if (insertedIdSet.value.has(item.id)) {
      flag = 'I';
    } else if (updatedIdSet.value.has(item.id) || item.isDirty) {
      flag = 'U';
    }
    return {
      ...toRaw(item),
      _flag: flag,
    };
  });

  return [...currentList, ...removedRecords.value];
}

/**
 * 校验网格中所有单元格
 */
async function validate(): Promise<boolean> {
  if (!xTableRef.value) return true;
  const errMap = await xTableRef.value.validate();
  return !errMap;
}

defineExpose({
  getDeltaRecords,
  validate,
  addRow: onAddRow,
  deleteSelected: onDeleteSelected,
  duplicateSelected: onDuplicateSelected,
  resetFilterAndSort,
  isFilterEnabled,
  isSortEnabled,
  clearDiffState: () => {
    insertedIdSet.value.clear();
    updatedIdSet.value.clear();
    removedRecords.value = [];
  },
});
</script>
