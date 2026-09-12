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

    <!-- 卡片 2: 退货门店与经办组织 (门店查询精灵 - Shop Spirit) -->
    <div class="bg-amber-50/50 border border-amber-200/80 p-3 rounded-lg space-y-2">
      <div class="text-xs font-bold text-amber-900 border-b border-amber-200/60 pb-1 flex items-center justify-between">
        <span class="flex items-center space-x-1.5">
          <span>二、退货门店 (门店查询精灵)</span>
        </span>
        <span class="text-[10px] text-amber-700 font-mono bg-white px-1.5 py-0.2 rounded border border-amber-300 flex items-center space-x-1">
          <span>✨</span>
          <span>Shop Spirit</span>
        </span>
      </div>

      <div class="space-y-2">
        <!-- 门店查询精灵输入框 (支持弹出上下结构查询窗口) -->
        <div>
          <label class="block text-slate-500 text-[11px] font-medium mb-1 flex items-center justify-between">
            <span>
              退货经办门店 <span class="text-rose-500">*</span>
            </span>
            <span class="text-[10px] text-slate-500 font-normal">
              点击右侧小查询图标呼出精灵
            </span>
          </label>
          <SpiritInput
            spirit-key="SHOP"
            :model-value="master.shopCode || master.storeCode"
            :display-value="master.shopName || master.storeName"
            :disabled="readonly"
            placeholder="点击右侧小查询图标选择门店..."
            @select="onShopSelect"
            @confirm="onShopSelect"
            @clear="onShopClear"
          />
        </div>

        <!-- 选定门店的编码与全称实时联动回显 -->
        <div class="grid grid-cols-3 gap-2 pt-1 border-t border-amber-200/50">
          <div>
            <label class="block text-slate-500 text-[10px] font-medium mb-0.5">门店编码</label>
            <div class="h-6 px-2 bg-white/80 border border-amber-200 rounded text-xs font-mono text-slate-700 flex items-center truncate">
              {{ master.shopCode || master.storeCode || '—' }}
            </div>
          </div>
          <div>
            <label class="block text-slate-500 text-[10px] font-medium mb-0.5">门店全称</label>
            <div class="h-6 px-2 bg-white/80 border border-amber-200 rounded text-xs text-slate-700 flex items-center truncate font-medium">
              {{ master.shopName || master.storeName || '—' }}
            </div>
          </div>
          <div>
            <label class="block text-slate-500 text-[10px] font-medium mb-0.5">制单人</label>
            <div class="h-6 px-2 bg-slate-100 border border-slate-200 rounded text-xs text-slate-600 flex items-center truncate">
              {{ master.createdBy }}
            </div>
          </div>
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
import SpiritInput from '../../engine/spirit/SpiritInput.vue';

const props = defineProps<{
  master: MasterHeader;
  readonly?: boolean;
  updateField: (field: string | Record<string, any>, value?: any) => void;
}>();

const suppliers = SUPPLIERS;

// 门店查询精灵选定回调：同时原子性回传 shopCode 与 shopName 并同步 storeCode 与 storeName
function onShopSelect(shop: any, meta?: any) {
  if (!shop) return;
  const code = shop.shopCode || meta?.shopCode || meta?.code || shop.code;
  const name = shop.shopName || meta?.shopName || meta?.name || shop.name;
  props.updateField({
    shopCode: code,
    shopName: name,
    shopId: shop.id || code,
    // 同步旧字段保持完全兼容
    storeCode: code,
    storeName: name,
  });
}

function onShopClear() {
  props.updateField({
    shopCode: '',
    shopName: '',
    shopId: '',
    storeCode: '',
    storeName: '',
  });
}
</script>
