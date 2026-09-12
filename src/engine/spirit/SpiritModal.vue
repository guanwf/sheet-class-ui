<template>
  <!-- 查询精灵通用弹窗 (SpiritModal.vue) - 上下结构：上查询条件，下网格数据 -->
  <teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      @keydown.esc="onClose"
      tabindex="-1"
    >
      <div
        class="bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-h-[88vh] w-full"
        :style="{ maxWidth: spiritConfig?.dialogWidth || '920px' }"
        role="dialog"
        aria-modal="true"
      >
        <!-- 1. 精灵弹窗顶栏 (Header) -->
        <div class="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-indigo-800/40">
          <div class="flex items-center space-x-2.5">
            <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/30 text-base">
              ✨
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-sm font-bold tracking-wide">
                  {{ spiritConfig?.title || '查询精灵 (Spirit Wizard)' }}
                </span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 font-mono">
                  SPIRIT-{{ spiritConfig?.spiritKey }}
                </span>
              </div>
              <div class="text-[11px] text-slate-400">
                {{ spiritConfig?.subTitle || '双击网格行可快速选定并回填' }}
              </div>
            </div>
          </div>

          <button
            type="button"
            @click="onClose"
            class="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition cursor-pointer"
            title="关闭窗口 (Esc)"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 2. 上部结构：查询条件表单区 (Search Filters) -->
        <div class="p-4 bg-slate-50 border-b border-slate-200/80 shrink-0">
          <form @submit.prevent="handleSearch" class="flex flex-wrap items-center gap-3">
            <template v-for="field in spiritConfig?.searchFields || []" :key="field.field">
              <!-- 文本输入查询条件 -->
              <div
                v-if="!field.type || field.type === 'input'"
                class="flex items-center space-x-2 text-xs"
              >
                <label class="text-slate-600 font-medium whitespace-nowrap">{{ field.label }}:</label>
                <input
                  type="text"
                  v-model="searchParams[field.field]"
                  :placeholder="field.placeholder || `请输入${field.label}...`"
                  class="h-8 px-2.5 bg-white border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none w-48 shadow-2xs"
                />
              </div>

              <!-- 下拉选择查询条件 -->
              <div
                v-else-if="field.type === 'select'"
                class="flex items-center space-x-2 text-xs"
              >
                <label class="text-slate-600 font-medium whitespace-nowrap">{{ field.label }}:</label>
                <select
                  v-model="searchParams[field.field]"
                  class="h-8 px-2 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:border-indigo-500 focus:outline-none min-w-32 shadow-2xs"
                >
                  <option
                    v-for="opt in field.options || []"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </div>
            </template>

            <!-- 按钮组 -->
            <div class="flex items-center space-x-2 ml-auto">
              <button
                type="submit"
                :disabled="loading"
                class="h-8 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium flex items-center space-x-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                <Search class="w-3.5 h-3.5" />
                <span>{{ loading ? '查询中...' : '查询' }}</span>
              </button>
              <button
                type="button"
                @click="handleReset"
                class="h-8 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-medium flex items-center space-x-1 shadow-2xs transition cursor-pointer"
              >
                <RotateCcw class="w-3 h-3 text-slate-500" />
                <span>重置</span>
              </button>
            </div>
          </form>
        </div>

        <!-- 3. 下部结构：vxe-table 数据网格区 (Grid) -->
        <div class="flex-1 p-3 overflow-hidden flex flex-col min-h-[300px]">
          <div class="flex-1 relative border border-slate-200 rounded-lg overflow-hidden bg-white">
            <vxe-table
              ref="tableRef"
              border
              stripe
              round
              show-overflow
              show-header-overflow
              highlight-current-row
              highlight-hover-row
              auto-resize
              height="100%"
              size="small"
              :loading="loading"
              :data="tableData"
              :row-config="{ isCurrent: true, isHover: true }"
              :checkbox-config="{ trigger: 'row', highlight: true }"
              @current-change="onRowSelect"
              @cell-dblclick="onCellDblClick"
              @checkbox-change="onCheckboxChange"
              @checkbox-all="onCheckboxAll"
            >
              <!-- 复选框列 (多选模式下开启) -->
              <vxe-column
                v-if="isMultipleMode"
                type="checkbox"
                width="46"
                align="center"
                fixed="left"
              />

              <template v-for="col in spiritConfig?.columns || []" :key="col.field">
                <!-- 序号列 -->
                <vxe-column
                  v-if="col.type === 'seq'"
                  type="seq"
                  :width="col.width || 55"
                  :title="col.title || '序号'"
                  :align="col.align || 'center'"
                  :fixed="col.fixed"
                />

                <!-- 金额列渲染 -->
                <vxe-column
                  v-else-if="col.type === 'currency'"
                  :field="col.field"
                  :title="col.title"
                  :width="col.width || 110"
                  :align="col.align || 'right'"
                  :sortable="col.sortable"
                  :fixed="col.fixed"
                >
                  <template #default="{ row }">
                    <span class="font-mono font-medium text-slate-800">
                      {{ row[col.field] !== undefined && row[col.field] !== '' && row[col.field] !== null ? `¥${Number(row[col.field]).toFixed(2)}` : '-' }}
                    </span>
                  </template>
                </vxe-column>

                <!-- 营业状态列渲染 -->
                <vxe-column
                  v-else-if="col.type === 'status'"
                  :field="col.field"
                  :title="col.title"
                  :width="col.width || 95"
                  :align="col.align || 'center'"
                  :sortable="col.sortable"
                  :fixed="col.fixed"
                >
                  <template #default="{ row }">
                    <span
                      v-if="row[col.field] === '营业中' || row[col.field] === '在售' || row[col.field] === '正常'"
                      class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                      {{ row[col.field] }}
                    </span>
                    <span
                      v-else-if="row[col.field] === '筹备装修' || row[col.field] === '缺货'"
                      class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200"
                    >
                      {{ row[col.field] }}
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
                    >
                      {{ row[col.field] }}
                    </span>
                  </template>
                </vxe-column>

                <!-- 标准数据列 -->
                <vxe-column
                  v-else
                  :field="col.field"
                  :title="col.title"
                  :width="col.width"
                  :min-width="col.minWidth"
                  :align="col.align || 'left'"
                  :sortable="col.sortable"
                  :fixed="col.fixed"
                />
              </template>

              <!-- 空数据占位 -->
              <template #empty>
                <div class="py-12 text-center text-slate-400 text-xs">
                  <div class="text-2xl mb-2">🔍</div>
                  <p>未找到符合条件的{{ spiritConfig?.title || '数据' }}</p>
                  <p class="text-[11px] text-slate-400 mt-1">请尝试修改查询条件后重试</p>
                </div>
              </template>
            </vxe-table>
          </div>

          <!-- 网格底部统计栏 -->
          <div class="flex items-center justify-between px-2 pt-2 text-xs text-slate-500 shrink-0">
            <div class="flex items-center space-x-2 font-mono">
              <span>共找到 <strong class="text-indigo-600">{{ tableData.length }}</strong> 条记录</span>
              <span>•</span>
              <span class="text-[11px] text-slate-400">支持双击行快速确认</span>
            </div>
            <div class="text-[11px] text-slate-400">
              提示：可点击表头进行升降序排列
            </div>
          </div>
        </div>

        <!-- 4. 弹窗底栏操作区 (Footer) -->
        <div class="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <!-- 左侧：当前已选中项目提示 -->
          <div class="flex items-center space-x-2 text-xs truncate max-w-[65%]">
            <span class="text-slate-500 shrink-0">当前已选:</span>
            <template v-if="isMultipleMode && selectedRows.length > 0">
              <span class="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded shrink-0">
                已勾选 {{ selectedRows.length }} 项
              </span>
              <span class="text-slate-600 truncate text-[11px]">
                {{ selectedRows.map(r => r[spiritConfig?.displayField || 'name'] || r[spiritConfig?.valueField || 'id']).join(', ') }}
              </span>
            </template>
            <span
              v-else-if="selectedRow"
              class="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded flex items-center space-x-1 truncate"
            >
              <span>[{{ selectedRow[spiritConfig?.valueField || 'id'] }}]</span>
              <span>{{ selectedRow[spiritConfig?.displayField || 'name'] }}</span>
            </span>
            <span v-else class="text-slate-400 italic">
              {{ isMultipleMode ? '(请勾选复选框或单击行，支持多选批量追加)' : '(尚未选择，请在表格中单击选中)' }}
            </span>
          </div>

          <!-- 右侧：按钮组 -->
          <div class="flex items-center space-x-2.5 shrink-0">
            <button
              type="button"
              @click="onClose"
              class="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-white transition cursor-pointer shadow-2xs"
            >
              取消
            </button>
            <button
              type="button"
              @click="onConfirm"
              :disabled="!selectedRow && selectedRows.length === 0"
              class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5"
            >
              <Check class="w-3.5 h-3.5" />
              <span>{{ isMultipleMode && selectedRows.length > 1 ? `确定选择 (${selectedRows.length}项)` : '确定选择' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { X, Search, RotateCcw, Check } from 'lucide-vue-next';
import { VxeTableInstance } from 'vxe-table';
import { SpiritConfig } from './types';

const props = withDefaults(
  defineProps<{
    visible: boolean;
    spiritConfig: SpiritConfig<any> | undefined;
    initialKeyword?: string;
    multiple?: boolean;
  }>(),
  {
    multiple: undefined,
  }
);

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'confirm', row: any, selectedRows?: any[]): void;
  (e: 'close'): void;
}>();

const tableRef = ref<VxeTableInstance>();
const loading = ref(false);
const tableData = ref<any[]>([]);
const selectedRow = ref<any>(null);
const selectedRows = ref<any[]>([]);

const isMultipleMode = computed(() => {
  if (props.multiple !== undefined) {
    return props.multiple;
  }
  return props.spiritConfig?.multiple ?? false;
});

// 查询参数表单状态
const searchParams = reactive<Record<string, any>>({});

// 弹窗打开时，初始化并拉取数据
watch(
  () => props.visible,
  async (newVal) => {
    if (newVal && props.spiritConfig) {
      selectedRow.value = null;
      selectedRows.value = [];
      // 重置并初始化参数
      for (const key of Object.keys(searchParams)) {
        delete searchParams[key];
      }
      props.spiritConfig.searchFields.forEach((field) => {
        searchParams[field.field] = field.defaultValue ?? '';
      });

      // 如果有外部传入的初始检索词
      if (props.initialKeyword && props.spiritConfig.searchFields.some((f) => f.field === 'keyword')) {
        searchParams.keyword = props.initialKeyword;
      }

      await loadData();
    }
  },
  { immediate: true }
);

async function loadData() {
  if (!props.spiritConfig) return;
  loading.value = true;
  try {
    const res = await props.spiritConfig.fetchData({ ...searchParams });
    tableData.value = res || [];
  } catch (err) {
    console.error('Spirit fetch error:', err);
    tableData.value = [];
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  loadData();
}

function handleReset() {
  if (!props.spiritConfig) return;
  props.spiritConfig.searchFields.forEach((field) => {
    searchParams[field.field] = field.defaultValue ?? '';
  });
  selectedRow.value = null;
  selectedRows.value = [];
  loadData();
}

function onRowSelect({ row }: { row: any }) {
  selectedRow.value = row;
  if (!isMultipleMode.value) {
    selectedRows.value = [row];
  }
}

function onCheckboxChange({ records }: { records: any[] }) {
  selectedRows.value = records;
  if (records.length > 0) {
    selectedRow.value = records[records.length - 1];
  } else {
    selectedRow.value = null;
  }
}

function onCheckboxAll({ records }: { records: any[] }) {
  selectedRows.value = records;
  if (records.length > 0) {
    selectedRow.value = records[0];
  } else {
    selectedRow.value = null;
  }
}

function onCellDblClick({ row }: { row: any }) {
  selectedRow.value = row;
  if (selectedRows.value.length === 0) {
    selectedRows.value = [row];
  }
  onConfirm();
}

function onConfirm() {
  const chosenRows = selectedRows.value.length > 0
    ? selectedRows.value
    : (selectedRow.value ? [selectedRow.value] : []);

  if (chosenRows.length === 0) return;

  // 回传选定行与全选多选集合
  emit('confirm', chosenRows[0], chosenRows);
  emit('update:visible', false);
}

function onClose() {
  emit('close');
  emit('update:visible', false);
}
</script>
