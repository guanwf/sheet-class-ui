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
          <a-date-picker
            :value="master.docDate"
            value-format="YYYY-MM-DD"
            :disabled="readonly"
            size="small"
            class="w-full"
            placeholder="请选择日期"
            @change="(_: any, dateStr: string | string[]) => updateField('docDate', Array.isArray(dateStr) ? dateStr[0] : dateStr)"
          />
        </div>
        <div>
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">关联合同号</label>
          <a-input
            :value="master.contractNo"
            :disabled="readonly"
            size="small"
            placeholder="HT-2026-X"
            allow-clear
            @update:value="(val: any) => updateField('contractNo', val)"
          />
        </div>
        <div class="col-span-2">
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">供应商</label>
          <a-select
            :value="master.partnerId"
            :options="supplierOptions"
            :disabled="readonly"
            size="small"
            class="w-full"
            show-search
            :filter-option="(input: string, option: any) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())"
            placeholder="请选择供应商"
            @change="(val: any) => updateField('partnerId', val)"
          />
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
          <a-input
            :value="master.department"
            disabled
            size="small"
            class="w-full text-slate-600"
          />
        </div>
        <div>
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">采购员</label>
          <a-input
            :value="master.buyer"
            disabled
            size="small"
            class="w-full text-slate-600"
          />
        </div>
        <div>
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">结算币种</label>
          <a-input
            :value="master.currency"
            disabled
            size="small"
            class="w-full text-slate-600 font-mono font-bold"
          />
        </div>
        <div>
          <label class="block text-slate-500 text-[11px] font-medium mb-0.5">默认税率 (%)</label>
          <a-input-number
            :value="master.taxRateDefault"
            :disabled="readonly"
            :step="1"
            :min="0"
            :max="100"
            size="small"
            class="w-full font-mono"
            @update:value="(val: any) => updateField('taxRateDefault', val)"
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
        <a-input
          :value="master.deliveryAddress"
          :disabled="readonly"
          size="small"
          allow-clear
          @update:value="(val: any) => updateField('deliveryAddress', val)"
        />
      </div>
      <div>
        <label class="block text-slate-500 text-[11px] font-medium mb-0.5">特约说明</label>
        <a-input
          :value="master.remarks"
          :disabled="readonly"
          size="small"
          placeholder="备忘条款说明..."
          allow-clear
          @update:value="(val: any) => updateField('remarks', val)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MasterHeader } from '../../types/document';
import { SUPPLIERS } from '../../data/initialTemplates';

defineProps<{
  master: MasterHeader;
  readonly?: boolean;
  updateField: (field: string, value: any) => void;
}>();

const suppliers = SUPPLIERS;
const supplierOptions = computed(() =>
  suppliers.map((s) => ({
    value: s.id,
    label: `[${s.code}] ${s.name}`,
  }))
);
</script>
