<template>
  <!-- 采购订单左侧主表信息卡片 (模式 3: 架构自由重组左右分栏) -->
  <div class="space-y-2">
    <div>
      <label class="block text-slate-500 text-[11px] font-medium mb-1">
        往来供应商 <span class="text-rose-500">*</span>
      </label>
      <select
        :value="doc.header.partnerId"
        :disabled="isReadOnly"
        @change="$emit('update-header', { partnerId: ($event.target as HTMLSelectElement).value })"
        class="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-medium focus:border-indigo-500 focus:outline-none"
      >
        <option v-for="sup in suppliers" :key="sup.id" :value="sup.id">
          [{{ sup.code }}] {{ sup.name }}
        </option>
      </select>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <div>
        <label class="block text-slate-500 text-[11px] font-medium mb-1">单据日期</label>
        <input
          type="date"
          :value="doc.header.docDate"
          :disabled="isReadOnly"
          @input="$emit('update-header', { docDate: ($event.target as HTMLInputElement).value })"
          class="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs"
        />
      </div>
      <div>
        <label class="block text-slate-500 text-[11px] font-medium mb-1">合同编号</label>
        <input
          type="text"
          :value="doc.header.contractNo"
          :disabled="isReadOnly"
          placeholder="HT-2026-X"
          @input="$emit('update-header', { contractNo: ($event.target as HTMLInputElement).value })"
          class="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs"
        />
      </div>
    </div>

    <!-- 经办与财务 -->
    <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <span class="text-[11px] text-slate-500 block">采购部门</span>
          <span class="font-medium text-slate-700">{{ doc.header.department }}</span>
        </div>
        <div>
          <span class="text-[11px] text-slate-500 block">业务员</span>
          <span class="font-medium text-slate-700">{{ doc.header.buyer }}</span>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
        <div>
          <span class="text-[11px] text-slate-500 block">结算币种</span>
          <span class="font-mono font-bold text-slate-800">{{ doc.header.currency }}</span>
        </div>
        <div>
          <span class="text-[11px] text-slate-500 block">默认税率</span>
          <span class="font-mono font-bold text-indigo-600">{{ doc.header.taxRateDefault }}%</span>
        </div>
      </div>
    </div>

    <!-- 物流仓储与备注 -->
    <div class="space-y-2">
      <div>
        <label class="block text-slate-500 text-[11px] font-medium mb-1">交货地址与收货仓</label>
        <input
          type="text"
          :value="doc.header.deliveryAddress"
          :disabled="isReadOnly"
          @input="$emit('update-header', { deliveryAddress: ($event.target as HTMLInputElement).value })"
          class="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs"
        />
      </div>
      <div>
        <label class="block text-slate-500 text-[11px] font-medium mb-1">特约说明与条款</label>
        <textarea
          :value="doc.header.remarks"
          :disabled="isReadOnly"
          rows="3"
          @input="$emit('update-header', { remarks: ($event.target as HTMLTextAreaElement).value })"
          class="w-full p-2 bg-white border border-slate-300 rounded text-xs focus:border-indigo-500 focus:outline-none"
          placeholder="备忘说明..."
        ></textarea>
      </div>
    </div>

    <!-- 制单审计信息卡 -->
    <div class="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-200">
      <div>制单人：<span class="text-slate-600">{{ doc.header.createdBy }}</span></div>
      <div>制单时间：<span class="font-mono text-slate-600">{{ doc.header.createdTime }}</span></div>
      <div>单据版本：<span class="font-mono text-slate-600">v{{ doc.header.version }}</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DocumentRecord, MasterHeader } from '../../types/document';
import { SUPPLIERS } from '../../data/initialTemplates';

defineProps<{
  doc: DocumentRecord;
  isReadOnly: boolean;
}>();

defineEmits<{
  (e: 'update-header', payload: Partial<MasterHeader>): void;
}>();

const suppliers = SUPPLIERS;
</script>
