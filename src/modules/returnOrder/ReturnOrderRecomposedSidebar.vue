<template>
  <!-- 退货单左侧主表信息卡片 (模式 3: 架构自由重组左右分栏) -->
  <div class="space-y-3">
    <div>
      <label class="block text-slate-500 text-[11px] font-medium mb-1">
        退货供应商 <span class="text-rose-500">*</span>
      </label>
      <select
        :value="doc.header.partnerId"
        :disabled="isReadOnly"
        @change="$emit('update-header', { partnerId: ($event.target as HTMLSelectElement).value })"
        class="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-medium focus:border-rose-500 focus:outline-none"
      >
        <option v-for="sup in suppliers" :key="sup.id" :value="sup.id">
          [{{ sup.code }}] {{ sup.name }}
        </option>
      </select>
    </div>

    <div>
      <label class="block text-slate-500 text-[11px] font-medium mb-1 flex items-center justify-between">
        <span>退货经办门店 <span class="text-rose-500">*</span></span>
        <span class="text-[10px] text-indigo-600 font-mono flex items-center space-x-0.5">
          <span>✨</span>
          <span>Shop Spirit</span>
        </span>
      </label>
      <SpiritInput
        spirit-key="SHOP"
        :model-value="doc.header.shopCode || doc.header.storeCode"
        :display-value="doc.header.shopName || doc.header.storeName"
        :disabled="isReadOnly"
        placeholder="点击右侧小查询图标选择门店..."
        @select="(shop) => $emit('update-header', { shopCode: shop.shopCode, shopName: shop.shopName, storeCode: shop.shopCode, storeName: shop.shopName })"
        @clear="$emit('update-header', { shopCode: '', shopName: '', storeCode: '', storeName: '' })"
      />
    </div>

    <div>
      <label class="block text-slate-500 text-[11px] font-medium mb-1">制单日期</label>
      <input
        type="date"
        :value="doc.header.docDate"
        :disabled="isReadOnly"
        @input="$emit('update-header', { docDate: ($event.target as HTMLInputElement).value })"
        class="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs"
      />
    </div>

    <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <span class="text-[11px] text-slate-500 block">制单人</span>
          <span class="font-medium text-slate-700">{{ doc.header.createdBy }}</span>
        </div>
        <div>
          <span class="text-[11px] text-slate-500 block">审批人</span>
          <span class="font-medium text-slate-700">{{ doc.header.approvedBy || '未审批' }}</span>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
        <div>
          <span class="text-[11px] text-slate-500 block">审批日期</span>
          <span class="font-mono text-slate-700">{{ doc.header.approvedDate || '—' }}</span>
        </div>
        <div>
          <span class="text-[11px] text-slate-500 block">结算币种</span>
          <span class="font-mono font-bold text-slate-800">{{ doc.header.currency || 'CNY' }}</span>
        </div>
      </div>
    </div>

    <div>
      <label class="block text-slate-500 text-[11px] font-medium mb-1">退货原因与备注</label>
      <textarea
        :value="doc.header.remarks"
        :disabled="isReadOnly"
        rows="3"
        @input="$emit('update-header', { remarks: ($event.target as HTMLTextAreaElement).value })"
        class="w-full p-2 bg-white border border-slate-300 rounded text-xs focus:border-rose-500 focus:outline-none"
        placeholder="填写整单退货批注或说明..."
      ></textarea>
    </div>

    <div class="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-200">
      <div>制单时间：<span class="font-mono text-slate-600">{{ doc.header.createdTime }}</span></div>
      <div>单据版本：<span class="font-mono text-slate-600">v{{ doc.header.version }}</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DocumentRecord, MasterHeader } from '../../types/document';
import { SUPPLIERS } from '../../data/initialTemplates';
import SpiritInput from '../../engine/spirit/SpiritInput.vue';

defineProps<{
  doc: DocumentRecord;
  isReadOnly: boolean;
}>();

defineEmits<{
  (e: 'update-header', payload: Partial<MasterHeader>): void;
}>();

const suppliers = SUPPLIERS;
</script>
