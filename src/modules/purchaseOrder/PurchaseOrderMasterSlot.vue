<template>
  <!-- 采购订单专属业务卡片插槽定制 (3 大业务卡片) -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
    <!-- 卡片 1: 基本业务与供应商 -->
    <div class="bg-indigo-50/50 border border-indigo-200/80 p-3 rounded-lg space-y-2">
      <div class="text-xs font-bold text-indigo-900 border-b border-indigo-200/60 pb-1 flex items-center justify-between">
        <span>一、基本业务与往来客商</span>
        <span class="text-[10px] text-indigo-600 font-normal font-mono bg-white px-1.5 py-0.2 rounded border border-indigo-200">
          插槽卡片 1
        </span>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">单据日期</label>
          <input
            type="date"
            :value="master.docDate"
            :disabled="readonly"
            @input="updateField('docDate', ($event.target as HTMLInputElement).value)"
            class="w-full h-7 px-2 bg-white border border-slate-300 rounded text-xs"
          />
        </div>
        <div>
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">关联合同号</label>
          <input
            type="text"
            :value="master.contractNo"
            :disabled="readonly"
            placeholder="HT-2026-X"
            @input="updateField('contractNo', ($event.target as HTMLInputElement).value)"
            class="w-full h-7 px-2 bg-white border border-slate-300 rounded text-xs"
          />
        </div>
        <div class="col-span-2">
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">供应商</label>
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

    <!-- 卡片 2: 经办组织与财务 -->
    <div class="bg-emerald-50/50 border border-emerald-200/80 p-3 rounded-lg space-y-2">
      <div class="text-xs font-bold text-emerald-900 border-b border-emerald-200/60 pb-1 flex items-center justify-between">
        <span>二、经办组织与财务币种</span>
        <span class="text-[10px] text-emerald-600 font-normal font-mono bg-white px-1.5 py-0.2 rounded border border-emerald-200">
          插槽卡片 2
        </span>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">采购部门</label>
          <input
            type="text"
            :value="master.department"
            disabled
            class="w-full h-7 px-2 bg-slate-100 border border-slate-300 rounded text-xs text-slate-600"
          />
        </div>
        <div>
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">采购员</label>
          <input
            type="text"
            :value="master.buyer"
            disabled
            class="w-full h-7 px-2 bg-slate-100 border border-slate-300 rounded text-xs text-slate-600"
          />
        </div>
        <div>
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">结算币种</label>
          <input
            type="text"
            :value="master.currency"
            disabled
            class="w-full h-7 px-2 bg-slate-100 border border-slate-300 rounded text-xs text-slate-600 font-mono font-bold"
          />
        </div>
        <div>
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">默认税率 (%)</label>
          <input
            type="number"
            :value="master.taxRateDefault"
            :disabled="readonly"
            @input="updateField('taxRateDefault', Number(($event.target as HTMLInputElement).value))"
            class="w-full h-7 px-2 bg-white border border-slate-300 rounded text-xs font-mono"
          />
        </div>
      </div>
    </div>

    <!-- 卡片 3: 物流与交运要求 -->
    <div class="bg-amber-50/50 border border-amber-200/80 p-3 rounded-lg space-y-2">
      <div class="text-xs font-bold text-amber-900 border-b border-amber-200/60 pb-1 flex items-center justify-between">
        <span>三、物流交运与特约说明</span>
        <span class="text-[10px] text-amber-600 font-normal font-mono bg-white px-1.5 py-0.2 rounded border border-amber-200">
          插槽卡片 3
        </span>
      </div>
      <div>
        <label class="block text-slate-500 text-[11px] font-medium mb-0.5">收货仓库与交货地址</label>
        <input
          type="text"
          :value="master.deliveryAddress"
          :disabled="readonly"
          @input="updateField('deliveryAddress', ($event.target as HTMLInputElement).value)"
          class="w-full h-7 px-2 bg-white border border-slate-300 rounded text-xs"
        />
      </div>
      <div>
        <label class="block text-slate-500 text-[11px] font-medium mb-0.5">特约说明</label>
        <input
          type="text"
          :value="master.remarks"
          :disabled="readonly"
          placeholder="备忘条款说明..."
          @input="updateField('remarks', ($event.target as HTMLInputElement).value)"
          class="w-full h-7 px-2 bg-white border border-slate-300 rounded text-xs"
        />
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
