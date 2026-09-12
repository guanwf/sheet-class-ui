<template>
  <div class="flex-1 flex flex-col min-h-0 bg-white border-t border-slate-200">
    <!-- 从表子页签切换栏 -->
    <div class="flex items-center justify-between px-3 bg-slate-100/90 border-b border-slate-200 text-xs select-none shrink-0">
      <div class="flex items-center space-x-1 pt-1">
        <!-- Tab 1: 物料明细 -->
        <button
          type="button"
          @click="activeSubTab = 'items'"
          :class="[
            'px-3.5 py-1.5 rounded-t-md font-semibold flex items-center space-x-1.5 transition border-t border-l border-r',
            activeSubTab === 'items'
              ? 'bg-white text-indigo-700 border-slate-300 shadow-2xs'
              : 'bg-transparent text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
          ]"
        >
          <TableProperties class="w-3.5 h-3.5" />
          <span>{{ itemsTitle || '物料明细清单' }}</span>
          <span
            :class="[
              'erp-subtab-badge',
              activeSubTab === 'items' ? 'erp-subtab-badge-active' : 'erp-subtab-badge-idle'
            ]"
          >
            {{ items.length }}
          </span>
        </button>

        <!-- Tab 2: 费用分摊 -->
        <button
          v-if="!isReturnOrder"
          type="button"
          @click="activeSubTab = 'costs'"
          :class="[
            'px-3.5 py-1.5 rounded-t-md font-semibold flex items-center space-x-1.5 transition border-t border-l border-r',
            activeSubTab === 'costs'
              ? 'bg-white text-indigo-700 border-slate-300 shadow-2xs'
              : 'bg-transparent text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
          ]"
        >
          <Coins class="w-3.5 h-3.5" />
          <span>费用分摊核算</span>
          <span
            :class="[
              'erp-subtab-badge',
              activeSubTab === 'costs' ? 'erp-subtab-badge-active' : 'erp-subtab-badge-idle'
            ]"
          >
            {{ costs ? costs.length : 0 }}
          </span>
        </button>

        <!-- Tab 3: 付款计划 -->
        <button
          v-if="!isReturnOrder"
          type="button"
          @click="activeSubTab = 'payment'"
          :class="[
            'px-3.5 py-1.5 rounded-t-md font-semibold flex items-center space-x-1.5 transition border-t border-l border-r',
            activeSubTab === 'payment'
              ? 'bg-white text-indigo-700 border-slate-300 shadow-2xs'
              : 'bg-transparent text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
          ]"
        >
          <CreditCard class="w-3.5 h-3.5" />
          <span>付款排程计划</span>
          <span
            :class="[
              'erp-subtab-badge',
              activeSubTab === 'payment' ? 'erp-subtab-badge-active' : 'erp-subtab-badge-idle'
            ]"
          >
            {{ schedule ? schedule.length : 0 }}
          </span>
        </button>

        <!-- Tab 4: 附件档案 -->
        <button
          type="button"
          @click="activeSubTab = 'attachments'"
          :class="[
            'px-3.5 py-1.5 rounded-t-md font-semibold flex items-center space-x-1.5 transition border-t border-l border-r',
            activeSubTab === 'attachments'
              ? 'bg-white text-indigo-700 border-slate-300 shadow-2xs'
              : 'bg-transparent text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
          ]"
        >
          <Paperclip class="w-3.5 h-3.5" />
          <span>单据关联附件</span>
          <span
            :class="[
              'erp-subtab-badge',
              activeSubTab === 'attachments' ? 'erp-subtab-badge-active' : 'erp-subtab-badge-idle'
            ]"
          >
            {{ attachments.length }}
          </span>
        </button>

        <!-- Tab 5: 审批流程与审计 -->
        <button
          type="button"
          @click="activeSubTab = 'logs'"
          :class="[
            'px-3.5 py-1.5 rounded-t-md font-semibold flex items-center space-x-1.5 transition border-t border-l border-r',
            activeSubTab === 'logs'
              ? 'bg-white text-indigo-700 border-slate-300 shadow-2xs'
              : 'bg-transparent text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
          ]"
        >
          <History class="w-3.5 h-3.5" />
          <span>审批流与审计追踪</span>
          <span
            :class="[
              'erp-subtab-badge',
              activeSubTab === 'logs' ? 'erp-subtab-badge-active' : 'erp-subtab-badge-idle'
            ]"
          >
            {{ logs.length }}
          </span>
        </button>
      </div>

      <!-- 右侧当前从表子标签提示 -->
      <div class="text-[11px] text-slate-400">
        {{ isReturnOrder ? '退货单子表已精简：退货商品明细、单据关联附件与审批流追踪' : '多从表结构支持按需联动与单独审核' }}
      </div>
    </div>

    <!-- 从表子内容主体 -->
    <div class="flex-1 flex flex-col min-h-0 relative">
      <!-- 1. 物料/商品明细 -->
      <VxeTableGrid
        v-if="activeSubTab === 'items'"
        :items="items"
        :columns="columns"
        :table-key="tableKey"
        :is-read-only="isReadOnly"
        :enable-custom-cell="enableCustomCell"
        :enable-filter="enableFilter"
        :enable-sort="enableSort"
        @update-row="$emit('update-item-row', $event)"
        @add-row="$emit('add-item-row', $event)"
        @duplicate-row="$emit('duplicate-row', $event)"
        @delete-rows="$emit('delete-item-rows', $event)"
        @generate-bulk="$emit('generate-bulk', $event)"
        @open-batch-add="$emit('open-batch-add')"
      />

      <!-- 2. 费用分摊 -->
      <CostAllocationTable
        v-else-if="!isReturnOrder && activeSubTab === 'costs'"
        :costs="costs || []"
        :is-read-only="isReadOnly"
        @update-costs="$emit('update-costs', $event)"
      />

      <!-- 3. 付款排程 -->
      <PaymentScheduleTable
        v-else-if="!isReturnOrder && activeSubTab === 'payment'"
        :schedule="schedule || []"
        :is-read-only="isReadOnly"
        @update-schedule="$emit('update-schedule', $event)"
      />

      <!-- 4. 附件档案 -->
      <AttachmentsTable
        v-else-if="activeSubTab === 'attachments'"
        :attachments="attachments"
        :is-read-only="isReadOnly"
        @update-attachments="$emit('update-attachments', $event)"
      />

      <!-- 5. 审批流与审计 -->
      <WorkflowTimeline
        v-else-if="activeSubTab === 'logs'"
        :logs="logs"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  ItemDetailRow,
  CostAllocationRow,
  PaymentScheduleRow,
  AttachmentItem,
  AuditLogItem,
} from '../../types/document';
import { SlaveColumnConfig } from '../../engine';
import VxeTableGrid from './VxeTableGrid.vue';
import CostAllocationTable from './CostAllocationTable.vue';
import PaymentScheduleTable from './PaymentScheduleTable.vue';
import AttachmentsTable from './AttachmentsTable.vue';
import WorkflowTimeline from './WorkflowTimeline.vue';
import {
  TableProperties,
  Coins,
  CreditCard,
  Paperclip,
  History,
} from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    items: ItemDetailRow[];
    costs?: CostAllocationRow[];
    schedule?: PaymentScheduleRow[];
    attachments: AttachmentItem[];
    logs: AuditLogItem[];
    isReadOnly: boolean;
    enableCustomCell?: boolean;
    columns?: SlaveColumnConfig[];
    tableKey?: string;
    itemsTitle?: string;
    isReturnOrder?: boolean;
    enableFilter?: boolean;
    enableSort?: boolean;
  }>(),
  {
    costs: () => [],
    schedule: () => [],
    isReturnOrder: false,
    enableCustomCell: false,
  }
);

defineEmits<{
  (e: 'update-item-row', payload: { rowId: string; fields: Partial<ItemDetailRow>; fieldKey?: keyof ItemDetailRow }): void;
  (e: 'add-item-row', insertIndex?: number): void;
  (e: 'duplicate-item-row', rowId: string): void;
  (e: 'delete-item-rows', rowIds: string[]): void;
  (e: 'generate-bulk', count: number): void;
  (e: 'open-batch-add'): void;
  (e: 'update-costs', costs: CostAllocationRow[]): void;
  (e: 'update-schedule', schedule: PaymentScheduleRow[]): void;
  (e: 'update-attachments', attachments: AttachmentItem[]): void;
}>();

const activeSubTab = ref<'items' | 'costs' | 'payment' | 'attachments' | 'logs'>('items');

watch(
  () => props.isReturnOrder,
  (val) => {
    if (val && (activeSubTab.value === 'costs' || activeSubTab.value === 'payment')) {
      activeSubTab.value = 'items';
    }
  },
  { immediate: true }
);
</script>
