<template>
  <div class="bg-white border-b border-slate-200 p-3.5 sm:p-4 text-xs">
    <!-- 单据头主信息栏 -->
    <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
      <div class="flex items-center space-x-3">
        <h2 class="text-base font-bold text-slate-800 flex items-center space-x-2">
          <span>{{ title }}</span>
          <span class="font-mono text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            {{ header.docNo }}
          </span>
        </h2>

        <!-- 单据状态标志 -->
        <span
          v-if="header.status === 'approved'"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300"
        >
          <CheckCircle2 class="w-3.5 h-3.5 mr-1 text-emerald-600" />
          已核准生效
        </span>
        <span
          v-else-if="header.status === 'pending'"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300"
        >
          <Clock class="w-3.5 h-3.5 mr-1 text-blue-600 animate-spin" />
          待审核审批
        </span>
        <span
          v-else-if="header.status === 'rejected'"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300"
        >
          <AlertCircle class="w-3.5 h-3.5 mr-1 text-rose-600" />
          审批已驳回
        </span>
        <span
          v-else-if="header.status === 'voided'"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300"
        >
          已作废
        </span>
        <span
          v-else
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300"
        >
          草稿编制中
        </span>
      </div>

      <div class="flex items-center space-x-3 text-slate-500 text-[11px]">
        <span>版本: <strong class="text-slate-700 font-mono">v{{ header.version }}</strong></span>
        <span>•</span>
        <span>制单人: <strong class="text-slate-700">{{ header.createdBy }}</strong></span>
        <span>•</span>
        <span>制单时间: <strong class="text-slate-700 font-mono">{{ header.createdTime }}</strong></span>
        <button
          type="button"
          @click="expanded = !expanded"
          class="text-indigo-600 hover:text-indigo-800 font-medium ml-2 flex items-center space-x-1"
        >
          <span>{{ expanded ? '收起表头' : '展开表头' }}</span>
          <ChevronDown :class="['w-3.5 h-3.5 transition-transform duration-200', expanded ? 'rotate-180' : '']" />
        </button>
      </div>
    </div>

    <!-- 表单网格区域 -->
    <div v-show="expanded" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      <!-- 单据日期 -->
      <div>
        <label class="block text-slate-500 font-medium mb-1">
          单据日期 <span class="text-rose-500">*</span>
        </label>
        <input
          type="date"
          :value="header.docDate"
          :disabled="isReadOnly"
          @input="onFieldChange('docDate', ($event.target as HTMLInputElement).value)"
          class="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:bg-white focus:border-indigo-500 disabled:opacity-60"
        />
      </div>

      <!-- 供应商/往来单位选择 -->
      <div class="sm:col-span-2">
        <label class="block text-slate-500 font-medium mb-1">
          往来单位 (供应商) <span class="text-rose-500">*</span>
        </label>
        <select
          :value="header.partnerId"
          :disabled="isReadOnly"
          @change="onSupplierChange(($event.target as HTMLSelectElement).value)"
          class="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded text-slate-800 font-medium focus:bg-white focus:border-indigo-500 disabled:opacity-60"
        >
          <option v-for="sup in suppliers" :key="sup.id" :value="sup.id">
            [{{ sup.code }}] {{ sup.name }}
          </option>
        </select>
      </div>

      <!-- 联系人与电话 -->
      <div>
        <label class="block text-slate-500 font-medium mb-1">联系人 / 电话</label>
        <input
          type="text"
          :value="`${header.contactPerson} (${header.contactPhone})`"
          disabled
          class="w-full h-8 px-2.5 bg-slate-100 border border-slate-200 rounded text-slate-600 truncate"
        />
      </div>

      <!-- 经办部门 -->
      <div>
        <label class="block text-slate-500 font-medium mb-1">经办部门</label>
        <select
          :value="header.department"
          :disabled="isReadOnly"
          @change="onFieldChange('department', ($event.target as HTMLSelectElement).value)"
          class="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:bg-white focus:border-indigo-500 disabled:opacity-60"
        >
          <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
        </select>
      </div>

      <!-- 业务经办人 -->
      <div>
        <label class="block text-slate-500 font-medium mb-1">业务经办人</label>
        <select
          :value="header.buyer"
          :disabled="isReadOnly"
          @change="onFieldChange('buyer', ($event.target as HTMLSelectElement).value)"
          class="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:bg-white focus:border-indigo-500 disabled:opacity-60"
        >
          <option v-for="buyer in buyers" :key="buyer" :value="buyer">{{ buyer }}</option>
        </select>
      </div>

      <!-- 结算币种 -->
      <div>
        <label class="block text-slate-500 font-medium mb-1">结算币种</label>
        <select
          :value="header.currency"
          :disabled="isReadOnly"
          @change="onFieldChange('currency', ($event.target as HTMLSelectElement).value)"
          class="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:bg-white focus:border-indigo-500 disabled:opacity-60 font-mono"
        >
          <option value="CNY">人民币 (CNY)</option>
          <option value="USD">美元 (USD)</option>
          <option value="EUR">欧元 (EUR)</option>
        </select>
      </div>

      <!-- 汇率 -->
      <div>
        <label class="block text-slate-500 font-medium mb-1">本位币汇率</label>
        <input
          type="number"
          step="0.0001"
          :value="header.exchangeRate"
          :disabled="isReadOnly"
          @input="onFieldChange('exchangeRate', Number(($event.target as HTMLInputElement).value))"
          class="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded text-slate-800 font-mono focus:bg-white focus:border-indigo-500 disabled:opacity-60"
        />
      </div>

      <!-- 默认税率 -->
      <div>
        <label class="block text-slate-500 font-medium mb-1">默认增值税率 (%)</label>
        <input
          type="number"
          :value="header.taxRateDefault"
          :disabled="isReadOnly"
          @input="onFieldChange('taxRateDefault', Number(($event.target as HTMLInputElement).value))"
          class="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded text-slate-800 font-mono focus:bg-white focus:border-indigo-500 disabled:opacity-60"
        />
      </div>

      <!-- 付款条件 -->
      <div class="sm:col-span-2">
        <label class="block text-slate-500 font-medium mb-1">付款结算条件</label>
        <input
          type="text"
          :value="header.paymentTerm"
          :disabled="isReadOnly"
          @input="onFieldChange('paymentTerm', ($event.target as HTMLInputElement).value)"
          placeholder="例如：月结30天电汇、预付30%尾款发货前结清..."
          class="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:bg-white focus:border-indigo-500 disabled:opacity-60"
        />
      </div>

      <!-- 合同编号 -->
      <div>
        <label class="block text-slate-500 font-medium mb-1">关联合同编号</label>
        <input
          type="text"
          :value="header.contractNo"
          :disabled="isReadOnly"
          @input="onFieldChange('contractNo', ($event.target as HTMLInputElement).value)"
          placeholder="CON-2026-XXXX"
          class="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded text-slate-800 font-mono focus:bg-white focus:border-indigo-500 disabled:opacity-60"
        />
      </div>

      <!-- 送货地址 -->
      <div class="sm:col-span-3">
        <label class="block text-slate-500 font-medium mb-1">送货交货地址</label>
        <input
          type="text"
          :value="header.deliveryAddress"
          :disabled="isReadOnly"
          @input="onFieldChange('deliveryAddress', ($event.target as HTMLInputElement).value)"
          class="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:bg-white focus:border-indigo-500 disabled:opacity-60"
        />
      </div>

      <!-- 单据备注 -->
      <div class="sm:col-span-3">
        <label class="block text-slate-500 font-medium mb-1">单据备注 / 特殊条款</label>
        <input
          type="text"
          :value="header.remarks"
          :disabled="isReadOnly"
          @input="onFieldChange('remarks', ($event.target as HTMLInputElement).value)"
          placeholder="填写采购质检要求、包装标准、附加入库批注..."
          class="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:bg-white focus:border-indigo-500 disabled:opacity-60"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MasterHeader } from '../../types/document';
import { SUPPLIERS, BUYERS, DEPARTMENTS } from '../../data/initialTemplates';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
} from 'lucide-vue-next';

const props = defineProps<{
  header: MasterHeader;
  title: string;
}>();

const emit = defineEmits<{
  (e: 'update-header', fields: Partial<MasterHeader>): void;
}>();

const expanded = ref(true);
const suppliers = SUPPLIERS;
const buyers = BUYERS;
const departments = DEPARTMENTS;

const isReadOnly = computed(() => props.header.status === 'approved' || props.header.status === 'voided');

const onFieldChange = (field: keyof MasterHeader, value: any) => {
  emit('update-header', { [field]: value });
};

const onSupplierChange = (supplierId: string) => {
  const target = suppliers.find((s) => s.id === supplierId);
  if (target) {
    emit('update-header', {
      partnerId: target.id,
      partnerCode: target.code,
      partnerName: target.name,
      contactPerson: target.contact,
      contactPhone: target.phone,
    });
  }
};
</script>
