<template>
  <div class="flex-1 flex flex-col min-h-0 bg-white">
    <!-- 工具条 -->
    <div class="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
      <div class="flex items-center space-x-2">
        <button
          v-if="!isReadOnly"
          type="button"
          @click="onAddSchedule"
          class="inline-flex items-center px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-2xs transition"
        >
          <Plus class="w-3.5 h-3.5 mr-1" />
          新增分期付款计划
        </button>
        <span class="text-slate-400 text-[11px]">
          支持预付款、交货验收入库款、质保金等阶段性资金排程
        </span>
      </div>

      <div class="text-slate-500 font-mono text-xs">
        排程总额: <strong class="text-indigo-700 font-bold">¥{{ totalSchedule.toFixed(2) }}</strong>
        <span class="ml-2 text-slate-400">比例合计: {{ totalRatio }}%</span>
      </div>
    </div>

    <!-- vxe-table 表格 -->
    <div class="flex-1 w-full relative min-h-0">
      <vxe-table
        border
        stripe
        round
        height="auto"
        class="text-xs w-full h-full"
        :data="schedule"
        :row-config="{ isHover: true, isCurrent: true, keyField: 'id' }"
        :edit-config="isReadOnly ? undefined : { trigger: 'click', mode: 'cell', showStatus: true }"
      >
        <vxe-column field="stage" title="期数" width="60" align="center" />

        <vxe-column field="stageName" title="款项性质 / 阶段名称" width="150">
          <template #default="{ row }">
            <span class="font-medium text-slate-800">{{ row.stageName }}</span>
          </template>
          <template #edit="{ row }">
            <input
              v-model="row.stageName"
              type="text"
              class="w-full h-7 px-1.5 border border-indigo-400 rounded text-xs focus:outline-none"
            />
          </template>
        </vxe-column>

        <vxe-column field="ratio" title="比例 (%)" width="90" align="right">
          <template #default="{ row }">
            <span class="font-mono font-semibold text-slate-800">{{ row.ratio }}%</span>
          </template>
          <template #edit="{ row }">
            <input
              v-model.number="row.ratio"
              type="number"
              step="1"
              min="0"
              max="100"
              class="w-full h-7 px-1.5 text-right border border-indigo-500 rounded text-xs font-mono focus:outline-none"
            />
          </template>
        </vxe-column>

        <vxe-column field="amount" title="计划金额 (¥)" width="130" align="right">
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

        <vxe-column field="dueDate" title="约定到期日" width="125">
          <template #default="{ row }">
            <span class="font-mono text-slate-700">{{ row.dueDate }}</span>
          </template>
          <template #edit="{ row }">
            <input
              v-model="row.dueDate"
              type="date"
              class="w-full h-7 px-1.5 border border-indigo-400 rounded text-xs focus:outline-none"
            />
          </template>
        </vxe-column>

        <vxe-column field="condition" title="付款前置条件" min-width="180">
          <template #default="{ row }">
            <span class="text-slate-600 truncate block">{{ row.condition }}</span>
          </template>
          <template #edit="{ row }">
            <input
              v-model="row.condition"
              type="text"
              class="w-full h-7 px-1.5 border border-indigo-400 rounded text-xs focus:outline-none"
            />
          </template>
        </vxe-column>

        <vxe-column field="paymentMethod" title="支付方式" width="120">
          <template #default="{ row }">
            <span class="text-slate-700">{{ row.paymentMethod }}</span>
          </template>
          <template #edit="{ row }">
            <select
              v-model="row.paymentMethod"
              class="w-full h-7 px-1.5 border border-indigo-400 rounded text-xs focus:outline-none"
            >
              <option value="银行电汇 (T/T)">银行电汇 (T/T)</option>
              <option value="承兑汇票 (L/C)">承兑汇票 (L/C)</option>
              <option value="企业网银支付">企业网银支付</option>
              <option value="信用证支付">信用证支付</option>
            </select>
          </template>
        </vxe-column>

        <vxe-column field="status" title="核销结算状态" width="110" align="center">
          <template #default="{ row }">
            <span
              v-if="row.status === 'SETTLED'"
              class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800"
            >
              已完全结算
            </span>
            <span
              v-else-if="row.status === 'PARTIAL'"
              class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800"
            >
              部分付款中
            </span>
            <span
              v-else
              class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600"
            >
              待触发申请
            </span>
          </template>
        </vxe-column>

        <vxe-column v-if="!isReadOnly" title="操作" width="80" align="center" fixed="right">
          <template #default="{ row }">
            <button
              type="button"
              @click="onDeleteSchedule(row.id)"
              class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
              title="删除排程"
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
import { PaymentScheduleRow } from '../../types/document';
import { Plus, Trash2 } from 'lucide-vue-next';

const props = defineProps<{
  schedule: PaymentScheduleRow[];
  isReadOnly: boolean;
}>();

const emit = defineEmits<{
  (e: 'update-schedule', schedule: PaymentScheduleRow[]): void;
}>();

const totalSchedule = computed(() => {
  return props.schedule.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
});

const totalRatio = computed(() => {
  return props.schedule.reduce((sum, s) => sum + (Number(s.ratio) || 0), 0);
});

const onAddSchedule = () => {
  const newRow: PaymentScheduleRow = {
    id: `pay-${Date.now()}`,
    stage: props.schedule.length + 1,
    stageName: `第${props.schedule.length + 1}期 进度结算款`,
    ratio: 20,
    amount: 5000,
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    condition: '收到合规增值税专用发票并经复核无误',
    paymentMethod: '银行电汇 (T/T)',
    status: 'PENDING',
  };
  emit('update-schedule', [...props.schedule, newRow]);
};

const onDeleteSchedule = (id: string) => {
  const updated = props.schedule
    .filter((s) => s.id !== id)
    .map((s, idx) => ({ ...s, stage: idx + 1 }));
  emit('update-schedule', updated);
};
</script>
