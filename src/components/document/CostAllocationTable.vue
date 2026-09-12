<template>
  <div class="flex-1 flex flex-col min-h-0 bg-white">
    <!-- 工具条 -->
    <div class="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
      <div class="flex items-center space-x-2">
        <button
          v-if="!isReadOnly"
          type="button"
          @click="onAddCost"
          class="inline-flex items-center px-2.5 py-1 rounded bg-[#25548d] hover:bg-[#1e4676] active:bg-[#183860] text-white font-medium shadow-2xs transition"
        >
          <Plus class="w-3.5 h-3.5 mr-1" />
          新增分摊费用
        </button>
        <span class="text-slate-400 text-[11px]">
          支持报关费、海运陆运专线运费、保价检验费等落地成本核算分摊
        </span>
      </div>

      <div class="text-slate-500 font-mono text-xs">
        费用总计: <strong class="text-[#25548d] font-bold">¥{{ totalCost.toFixed(2) }}</strong>
      </div>
    </div>

    <!-- vxe-table 费用表格 -->
    <div class="flex-1 w-full relative min-h-0">
      <vxe-table
        border
        stripe
        round
        height="auto"
        class="text-xs w-full h-full"
        :data="costs"
        :row-config="{ isHover: true, isCurrent: true, keyField: 'id' }"
        :edit-config="isReadOnly ? undefined : { trigger: 'click', mode: 'cell', showStatus: true }"
      >
        <vxe-column field="rowNo" title="序号" width="60" align="center" />

        <vxe-column field="costItem" title="费用项目" min-width="160">
          <template #default="{ row }">
            <span class="font-medium text-slate-800">{{ row.costItem }}</span>
          </template>
          <template #edit="{ row }">
            <input
              v-model="row.costItem"
              type="text"
              class="w-full h-7 px-1.5 border border-indigo-400 rounded text-xs focus:outline-none"
            />
          </template>
        </vxe-column>

        <vxe-column field="allocationMethod" title="分摊方式" width="130">
          <template #default="{ row }">
            <span class="px-2 py-0.5 rounded text-[11px] bg-slate-100 font-medium text-slate-700">
              {{ formatMethod(row.allocationMethod) }}
            </span>
          </template>
          <template #edit="{ row }">
            <select
              v-model="row.allocationMethod"
              class="w-full h-7 px-1.5 border border-indigo-400 rounded text-xs focus:outline-none"
            >
              <option value="AMOUNT">按明细金额分摊</option>
              <option value="QUANTITY">按明细数量分摊</option>
              <option value="VOLUME">按体积重量分摊</option>
              <option value="MANUAL">手工指定分摊</option>
            </select>
          </template>
        </vxe-column>

        <vxe-column field="amount" title="费用金额 (¥)" width="130" align="right">
          <template #default="{ row }">
            <span class="font-mono font-bold text-slate-900">¥{{ Number(row.amount).toFixed(2) }}</span>
          </template>
          <template #edit="{ row }">
            <input
              v-model.number="row.amount"
              type="number"
              step="0.01"
              class="w-full h-7 px-1.5 text-right border border-indigo-500 rounded text-xs font-mono font-bold focus:outline-none"
            />
          </template>
        </vxe-column>

        <vxe-column field="payee" title="收款方 / 承运商" width="160">
          <template #default="{ row }">
            <span class="text-slate-700">{{ row.payee }}</span>
          </template>
          <template #edit="{ row }">
            <input
              v-model="row.payee"
              type="text"
              class="w-full h-7 px-1.5 border border-indigo-400 rounded text-xs focus:outline-none"
            />
          </template>
        </vxe-column>

        <vxe-column field="invoiceRequired" title="需要发票" width="90" align="center">
          <template #default="{ row }">
            <span :class="row.invoiceRequired ? 'text-emerald-600 font-semibold' : 'text-slate-400'">
              {{ row.invoiceRequired ? '是 (专票)' : '否' }}
            </span>
          </template>
          <template #edit="{ row }">
            <input
              v-model="row.invoiceRequired"
              type="checkbox"
              class="w-4 h-4 text-indigo-600 rounded focus:ring-0"
            />
          </template>
        </vxe-column>

        <vxe-column field="remarks" title="费用备注" min-width="150">
          <template #default="{ row }">
            <span class="text-slate-500 truncate block">{{ row.remarks }}</span>
          </template>
          <template #edit="{ row }">
            <input
              v-model="row.remarks"
              type="text"
              class="w-full h-7 px-1.5 border border-indigo-400 rounded text-xs focus:outline-none"
            />
          </template>
        </vxe-column>

        <vxe-column v-if="!isReadOnly" title="操作" width="80" align="center" fixed="right">
          <template #default="{ row }">
            <button
              type="button"
              @click="onDeleteCost(row.id)"
              class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
              title="删除费用"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CostAllocationRow } from '../../types/document';
import { Plus, Trash2 } from 'lucide-vue-next';

const props = defineProps<{
  costs: CostAllocationRow[];
  isReadOnly: boolean;
}>();

const emit = defineEmits<{
  (e: 'update-costs', costs: CostAllocationRow[]): void;
}>();

const totalCost = computed(() => {
  return props.costs.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
});

const formatMethod = (m: string) => {
  switch (m) {
    case 'AMOUNT':
      return '按金额比';
    case 'QUANTITY':
      return '按数量比';
    case 'VOLUME':
      return '按体积重量';
    default:
      return '手工分配';
  }
};

const onAddCost = () => {
  const newRow: CostAllocationRow = {
    id: `cost-${Date.now()}`,
    rowNo: props.costs.length + 1,
    costItem: '干线冷链运输保价费',
    allocationMethod: 'AMOUNT',
    amount: 850.0,
    payee: '顺丰冷链物流专线',
    invoiceRequired: true,
    remarks: '含装卸及冷链保温包材',
  };
  emit('update-costs', [...props.costs, newRow]);
};

const onDeleteCost = (id: string) => {
  const updated = props.costs
    .filter((c) => c.id !== id)
    .map((c, i) => ({ ...c, rowNo: i + 1 }));
  emit('update-costs', updated);
};
</script>
