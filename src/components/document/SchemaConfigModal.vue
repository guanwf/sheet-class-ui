<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
      <div class="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div class="flex items-center space-x-2">
          <Settings class="w-4 h-4 text-indigo-600" />
          <h3 class="text-sm font-bold text-slate-800">业务单据字段模型与校验规则配置</h3>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="p-5 space-y-4 text-xs">
        <div>
          <label class="block font-medium text-slate-700 mb-1">单据模板模型：</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              @click="localSchemaKey = 'PURCHASE_ORDER'"
              :class="[
                'p-2.5 rounded-lg border text-left transition',
                localSchemaKey === 'PURCHASE_ORDER'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              ]"
            >
              <div class="font-bold">标准采购订单</div>
              <div class="text-[10px] text-slate-500 mt-0.5">PO 模型，含税/无税联动</div>
            </button>

            <button
              type="button"
              @click="localSchemaKey = 'SALES_DELIVERY'"
              :class="[
                'p-2.5 rounded-lg border text-left transition',
                localSchemaKey === 'SALES_DELIVERY'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              ]"
            >
              <div class="font-bold">销售发货单</div>
              <div class="text-[10px] text-slate-500 mt-0.5">DO 模型，出库与物流追踪</div>
            </button>

            <button
              type="button"
              @click="localSchemaKey = 'PROD_REQUISITION'"
              :class="[
                'p-2.5 rounded-lg border text-left transition',
                localSchemaKey === 'PROD_REQUISITION'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              ]"
            >
              <div class="font-bold">生产领料单</div>
              <div class="text-[10px] text-slate-500 mt-0.5">MR 模型，工单与工序配套</div>
            </button>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-200">
          <label class="block font-medium text-slate-700 mb-2">业务逻辑与录入校验规则：</label>
          <div class="space-y-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="rules.allowNegativeQty"
                type="checkbox"
                class="w-4 h-4 text-indigo-600 rounded focus:ring-0"
              />
              <span class="text-slate-800">允许录入负数数量（用于采购退货、红冲更正单）</span>
            </label>

            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="rules.requireDeliveryDate"
                type="checkbox"
                class="w-4 h-4 text-indigo-600 rounded focus:ring-0"
              />
              <span class="text-slate-800">强制要求每行明细填写交货期望日期</span>
            </label>

            <div class="flex items-center space-x-2 pt-1">
              <span class="text-slate-700">明细行超出预警阈值：</span>
              <input
                v-model.number="rules.maxRowsWarning"
                type="number"
                class="w-24 h-7 px-2 border border-slate-300 rounded text-slate-800 font-mono focus:outline-none focus:border-indigo-500"
              />
              <span class="text-slate-400">行（触发大数据虚拟滚动优化提示）</span>
            </div>
          </div>
        </div>
      </div>

      <div class="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
        <button
          type="button"
          @click="$emit('close')"
          class="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition"
        >
          取消
        </button>
        <button
          type="button"
          @click="saveSchema"
          class="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
        >
          应用配置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DocumentSchemaConfig } from '../../types/document';
import { DOCUMENT_SCHEMAS } from '../../data/initialTemplates';
import { Settings, X } from 'lucide-vue-next';

const props = defineProps<{
  visible: boolean;
  currentSchema: DocumentSchemaConfig;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'apply-schema', schema: DocumentSchemaConfig): void;
}>();

const localSchemaKey = ref(props.currentSchema.docType);
const rules = ref({ ...props.currentSchema.customRules });

const saveSchema = () => {
  const base = DOCUMENT_SCHEMAS[localSchemaKey.value] || DOCUMENT_SCHEMAS.PURCHASE_ORDER;
  const updated: DocumentSchemaConfig = {
    ...base,
    customRules: { ...rules.value },
  };
  emit('apply-schema', updated);
  emit('close');
};
</script>
