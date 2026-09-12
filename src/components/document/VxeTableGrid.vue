<template>
  <div class="flex-1 flex flex-col min-h-0 bg-white">
    <!-- 架构演示切换条 (展示：默认网格 vs 业务单元格插槽自定义) -->
    <div class="px-3 py-1 bg-slate-100 border-b border-slate-200 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
      <div class="flex items-center space-x-3">
        <span class="font-bold text-indigo-700">子表网格已独立封装 (DocEditableGrid)</span>
        <span class="text-slate-300">|</span>
        <span>无分页 • 虚拟滚动 • 就地编辑 • 过滤排序 • 增删改状态追踪 (_flag: I/U/D/N)</span>
      </div>
      <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-1">
          <span class="text-slate-400">模块网格默认：</span>
          <span
            v-if="enableFilter || enableSort"
            class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"
          >
            过滤与排序已开启
          </span>
          <span
            v-else
            class="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-200 text-slate-600 border border-slate-300"
          >
            过滤与排序已关闭
          </span>
        </div>
        <span class="text-slate-300">|</span>
        <label class="flex items-center space-x-1 cursor-pointer select-none text-slate-600">
          <input
            type="checkbox"
            v-model="enableCustomCellRender"
            class="rounded border-slate-300 text-indigo-600 focus:ring-0"
          />
          <span>启用自定义单元格插槽</span>
        </label>
      </div>
    </div>

    <!-- 独立封装的子表就地编辑网格 -->
    <DocEditableGrid
      ref="editableGridRef"
      :table-key="tableKey || 'OrderItem'"
      :columns="activeColumns"
      :data="items"
      :readonly="isReadOnly"
      :enable-filter="enableFilter"
      :enable-sort="enableSort"
      :config="{
        allowAdd: true,
        allowDelete: true,
        allowDuplicate: true,
        allowPaste: true,
        enableFilter: enableFilter,
        enableSort: enableSort,
      }"
      @update:data="onUpdateData"
      @cell-change="onCellChange"
      @row-add="onRowAdd"
      @row-delete="onRowDelete"
      @row-duplicate="onRowDuplicate"
    >
      <!-- 2.2.3 单元格自定义渲染插槽演示 (如果业务模块自定义就用自定义的，否则就用默认样式) -->
      <template v-if="enableCustomCellRender" #cell-itemCode="{ row, value }">
        <div class="flex items-center space-x-1.5 font-mono">
          <span class="erp-dot-sm erp-dot-indigo"></span>
          <span class="font-bold text-indigo-600 hover:underline cursor-pointer">{{ value }}</span>
          <span class="erp-badge-cell-tag bg-slate-100 text-slate-500 border-slate-200">
            物料
          </span>
        </div>
      </template>

      <!-- 退货单专属自定义单元格插槽 -->
      <template v-if="enableCustomCellRender" #cell-productCode="{ row, value }">
        <div class="flex items-center space-x-1.5 font-mono">
          <span class="erp-dot-sm erp-dot-danger"></span>
          <span class="font-bold text-rose-700 hover:underline cursor-pointer">{{ value }}</span>
          <span class="erp-badge-cell-tag bg-rose-50 text-rose-600 border-rose-200">
            退货商品
          </span>
        </div>
      </template>

      <!-- 工具栏扩展插槽 -->
      <template #toolbar-extra>
        <button
          v-if="!isReadOnly"
          type="button"
          @click="$emit('open-batch-add')"
          class="inline-flex items-center px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium border border-indigo-200 transition"
          title="打开弹窗批量录入"
        >
          高级批量录入
        </button>
      </template>
    </DocEditableGrid>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ItemDetailRow } from '../../types/document';
import { DocEditableGrid, SlaveColumnConfig } from '../../engine';
import { purchaseOrderModuleConfig } from '../../modules/purchaseOrder/schema';

const props = withDefaults(
  defineProps<{
    items: ItemDetailRow[];
    isReadOnly?: boolean;
    enableCustomCell?: boolean;
    columns?: SlaveColumnConfig[];
    tableKey?: string;
    enableFilter?: boolean;
    enableSort?: boolean;
  }>(),
  {
    isReadOnly: false,
    enableCustomCell: false,
  }
);

const emit = defineEmits<{
  (e: 'update-row', payload: { rowId: string; fields: Partial<ItemDetailRow>; fieldKey?: keyof ItemDetailRow }): void;
  (e: 'add-row', insertIndex?: number): void;
  (e: 'duplicate-row', rowId: string): void;
  (e: 'delete-rows', rowIds: string[]): void;
  (e: 'generate-bulk', count: number): void;
  (e: 'open-batch-add'): void;
}>();

const editableGridRef = ref<InstanceType<typeof DocEditableGrid> | null>(null);
const enableCustomCellRender = ref(props.enableCustomCell);

watch(
  () => props.enableCustomCell,
  (val) => {
    enableCustomCellRender.value = !!val;
  }
);

// 动态使用传入的列定义，若未传入则默认回退到标准采购明细列
const activeColumns = computed<SlaveColumnConfig[]>(() => {
  if (props.columns && props.columns.length > 0) {
    return props.columns;
  }
  return purchaseOrderModuleConfig.slaves.OrderItem.columns;
});

function onUpdateData(newData: any[]) {
  // 保持与 store 同步
}

function onCellChange({ row, field, value }: { row: any; field: string; value: any }) {
  emit('update-row', {
    rowId: row.id,
    fields: { [field]: value },
    fieldKey: field as keyof ItemDetailRow,
  });
}

function onRowAdd() {
  emit('add-row');
}

function onRowDelete(rowIds: string[]) {
  emit('delete-rows', rowIds);
}

function onRowDuplicate(rowId: string) {
  emit('duplicate-row', rowId);
}

defineExpose({
  getDeltaRecords: () => editableGridRef.value?.getDeltaRecords(),
  validate: () => editableGridRef.value?.validate(),
});
</script>
