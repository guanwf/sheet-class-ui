<template>
  <!-- 退货单专属业务卡片插槽定制 (3 大业务卡片) -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
    <!-- 卡片 1: 基本单据与退货客商 -->
    <div class="bg-rose-50/50 border border-rose-200/80 p-3 rounded-lg space-y-2">
      <div class="text-xs font-bold text-rose-900 border-b border-rose-200/60 pb-1 flex items-center justify-between">
        <span>一、退货单据与往来供应商</span>
        <span class="text-[10px] text-rose-600 font-normal font-mono bg-white px-1.5 py-0.2 rounded border border-rose-200">
          退货插槽卡片 1
        </span>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">单据编号</label>
          <input
            type="text"
            :value="master.docNo"
            disabled
            class="w-full h-7 px-2 bg-slate-100 border border-slate-300 rounded text-xs font-mono font-bold text-indigo-700"
          />
        </div>
        <div>
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">制单日期</label>
          <input
            type="date"
            :value="master.docDate"
            :disabled="readonly"
            @input="updateField('docDate', ($event.target as HTMLInputElement).value)"
            class="w-full h-7 px-2 bg-white border border-slate-300 rounded text-xs"
          />
        </div>
        <div class="col-span-2">
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">退货供应商</label>
          <select
            :value="master.partnerId"
            :disabled="readonly"
            @change="updateField('partnerId', ($event.target as HTMLSelectElement).value)"
            class="w-full h-7 px-2 bg-white border border-slate-300 rounded text-xs font-medium"
          >
            <option v-for="sup in suppliers" :key="sup.id" :value="sup.id">
              [{{ sup.code }}] {{ sup.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 卡片 2: 退货门店与经办组织 -->
    <div class="bg-amber-50/50 border border-amber-200/80 p-3 rounded-lg space-y-2">
      <div class="text-xs font-bold text-amber-900 border-b border-amber-200/60 pb-1 flex items-center justify-between">
        <span>二、退货门店与制单人</span>
        <span class="text-[10px] text-amber-600 font-normal font-mono bg-white px-1.5 py-0.2 rounded border border-amber-200">
          退货插槽卡片 2
        </span>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">退货门店编号</label>
          <input
            type="text"
            :value="master.storeCode"
            :disabled="readonly"
            placeholder="STR-BJ-01"
            @input="updateField('storeCode', ($event.target as HTMLInputElement).value)"
            class="w-full h-7 px-2 bg-white border border-slate-300 rounded text-xs font-mono font-medium"
          />
        </div>
        <div>
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">退货门店名称</label>
          <input
            type="text"
            :value="master.storeName"
            :disabled="readonly"
            placeholder="门店全称..."
            @input="updateField('storeName', ($event.target as HTMLInputElement).value)"
            class="w-full h-7 px-2 bg-white border border-slate-300 rounded text-xs"
          />
        </div>
        <div class="col-span-2">
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">制单人</label>
          <input
            type="text"
            :value="master.createdBy"
            disabled
            class="w-full h-7 px-2 bg-slate-100 border border-slate-300 rounded text-xs text-slate-600 font-medium"
          />
        </div>
      </div>
    </div>

    <!-- 卡片 3: 审批与退货备注 -->
    <div class="bg-indigo-50/50 border border-indigo-200/80 p-3 rounded-lg space-y-2">
      <div class="text-xs font-bold text-indigo-900 border-b border-indigo-200/60 pb-1 flex items-center justify-between">
        <span>三、审批人、日期与备注</span>
        <span class="text-[10px] text-indigo-600 font-normal font-mono bg-white px-1.5 py-0.2 rounded border border-indigo-200">
          退货插槽卡片 3
        </span>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">审批人</label>
          <input
            type="text"
            :value="master.approvedBy || '未审批'"
            disabled
            class="w-full h-7 px-2 bg-slate-100 border border-slate-300 rounded text-xs text-slate-600"
          />
        </div>
        <div>
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">审批日期</label>
          <input
            type="text"
            :value="master.approvedDate || '—'"
            disabled
            class="w-full h-7 px-2 bg-slate-100 border border-slate-300 rounded text-xs font-mono text-slate-600"
          />
        </div>
        <div class="col-span-2">
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">退货原因与整单备注</label>
          <input
            type="text"
            :value="master.remarks"
            :disabled="readonly"
            placeholder="填写退货批注或说明..."
            @input="updateField('remarks', ($event.target as HTMLInputElement).value)"
            class="w-full h-7 px-2 bg-white border border-slate-300 rounded text-xs"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MasterHeader } from '../../types/document';
import { SUPPLIERS } from '../../data/initialTemplates';

defineProps<{
  master: MasterHeader;
  readonly?: boolean;
  updateField: (field: string, value: any) => void;
}>();

const suppliers = SUPPLIERS;
</script>
