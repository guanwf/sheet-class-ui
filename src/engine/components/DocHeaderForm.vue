<template>
  <div class="bg-white border-b border-slate-200 p-3.5 sm:p-4 text-xs select-none">
    <!-- 单据头顶部信息条 -->
    <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
      <div class="flex items-center space-x-3">
        <h2 class="text-base font-bold text-slate-800 flex items-center space-x-2">
          <span>{{ title || '业务单据' }}</span>
          <span
            v-if="docNo || masterData?.docNo"
            class="font-mono text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200"
          >
            {{ docNo || masterData?.docNo }}
          </span>
        </h2>

        <!-- 单据状态徽标 -->
        <span
          v-if="currentStatus === 'approved'"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300"
        >
          <CheckCircle2 class="w-3.5 h-3.5 mr-1 text-emerald-600" />
          已核准生效
        </span>
        <span
          v-else-if="currentStatus === 'pending'"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300"
        >
          <Clock class="w-3.5 h-3.5 mr-1 text-blue-600 animate-spin" />
          待审核审批
        </span>
        <span
          v-else-if="currentStatus === 'rejected'"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300"
        >
          <AlertCircle class="w-3.5 h-3.5 mr-1 text-rose-600" />
          审批已驳回
        </span>
        <span
          v-else-if="currentStatus === 'voided'"
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
        <span v-if="masterData?.version !== undefined">
          版本: <strong class="text-slate-700 font-mono">v{{ masterData.version }}</strong>
        </span>
        <span v-if="masterData?.createdBy">
          • 制单人: <strong class="text-slate-700">{{ masterData.createdBy }}</strong>
        </span>
        <span v-if="masterData?.createdTime">
          • 制单时间: <strong class="text-slate-700 font-mono">{{ masterData.createdTime }}</strong>
        </span>

        <!-- 折叠/展开按钮 -->
        <button
          type="button"
          @click="expanded = !expanded"
          class="text-indigo-600 hover:text-indigo-800 font-medium ml-2 flex items-center space-x-1"
        >
          <span>{{ expanded ? '收起表头' : '展开表头' }}</span>
          <ChevronDown
            :class="['w-3.5 h-3.5 transition-transform duration-200', expanded ? 'rotate-180' : '']"
          />
        </button>
      </div>
    </div>

    <!-- 主表内容区域：优先支持 #master-layout 整块自定义覆盖，否则走默认 6 列栅格 -->
    <div v-show="expanded">
      <slot
        name="master-layout"
        :master="masterData"
        :readonly="readonly"
        :fields="fields"
        :update-field="updateField"
        :update-fields="updateField"
      >
        <!-- 默认栅格样式 (Default Layout) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <template v-for="field in fields" :key="field.key">
            <div
              :class="[
                'space-y-1',
                getSpanClass(field.span || 1),
              ]"
            >
              <label class="block text-slate-500 font-medium text-[11px]">
                {{ field.label }}
                <span v-if="field.required" class="text-rose-500 font-bold">*</span>
              </label>

              <!-- 字段级自定义插槽：业务若想替换某单个控件可覆盖 #field-[key] -->
              <slot
                :name="`field-${field.key}`"
                :field="field"
                :value="masterData[field.key]"
                :master="masterData"
                :update-value="(val: any) => updateField(field.key, val)"
              >
                <!-- 1. 文本输入 -->
                <input
                  v-if="field.type === 'text'"
                  type="text"
                  :value="masterData[field.key]"
                  :disabled="readonly || field.disabled"
                  :placeholder="field.placeholder || `请输入${field.label}`"
                  @input="updateField(field.key, ($event.target as HTMLInputElement).value)"
                  class="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded text-slate-800 text-xs focus:bg-white focus:border-indigo-500 focus:outline-none disabled:opacity-60"
                />

                <!-- 2. 数字输入 -->
                <input
                  v-else-if="field.type === 'number'"
                  type="number"
                  :value="masterData[field.key]"
                  :disabled="readonly || field.disabled"
                  :step="field.step || 1"
                  :min="field.min"
                  :max="field.max"
                  :placeholder="field.placeholder"
                  @input="updateField(field.key, Number(($event.target as HTMLInputElement).value))"
                  class="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded text-slate-800 font-mono text-xs focus:bg-white focus:border-indigo-500 focus:outline-none disabled:opacity-60"
                />

                <!-- 3. 日期选择 -->
                <input
                  v-else-if="field.type === 'date'"
                  type="date"
                  :value="masterData[field.key]"
                  :disabled="readonly || field.disabled"
                  @input="updateField(field.key, ($event.target as HTMLInputElement).value)"
                  class="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded text-slate-800 text-xs focus:bg-white focus:border-indigo-500 focus:outline-none disabled:opacity-60"
                />

                <!-- 4. 下拉选择 -->
                <select
                  v-else-if="field.type === 'select'"
                  :value="masterData[field.key]"
                  :disabled="readonly || field.disabled"
                  @change="updateField(field.key, ($event.target as HTMLSelectElement).value)"
                  class="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded text-slate-800 text-xs focus:bg-white focus:border-indigo-500 focus:outline-none disabled:opacity-60"
                >
                  <option
                    v-for="opt in field.options || []"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>

                <!-- 5. 文本域 -->
                <textarea
                  v-else-if="field.type === 'textarea'"
                  :value="masterData[field.key]"
                  :disabled="readonly || field.disabled"
                  :placeholder="field.placeholder"
                  rows="2"
                  @input="updateField(field.key, ($event.target as HTMLTextAreaElement).value)"
                  class="w-full p-2 bg-slate-50 border border-slate-300 rounded text-slate-800 text-xs focus:bg-white focus:border-indigo-500 focus:outline-none disabled:opacity-60"
                ></textarea>

                <!-- 6. 查询精灵输入框 (SpiritInput) -->
                <SpiritInput
                  v-else-if="field.type === 'spirit'"
                  :spirit-key="field.spiritKey || 'SHOP'"
                  :model-value="masterData[field.key]"
                  :display-value="getSpiritDisplayValue(field)"
                  :disabled="readonly || field.disabled"
                  :placeholder="field.placeholder"
                  :mapping="field.spiritMapping"
                  @select="(item, meta) => onSpiritFieldSelect(field, item, meta)"
                  @confirm="(item, meta) => onSpiritFieldSelect(field, item, meta)"
                  @clear="onSpiritFieldClear(field)"
                />

                <!-- 默认兜底 -->
                <input
                  v-else
                  type="text"
                  :value="masterData[field.key]"
                  :disabled="readonly || field.disabled"
                  @input="updateField(field.key, ($event.target as HTMLInputElement).value)"
                  class="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded text-slate-800 text-xs focus:bg-white focus:border-indigo-500 focus:outline-none disabled:opacity-60"
                />
              </slot>
            </div>
          </template>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
} from 'lucide-vue-next';
import { FieldConfig } from '../types';
import SpiritInput from '../spirit/SpiritInput.vue';

const props = withDefaults(
  defineProps<{
    modelValue: any;
    fields: FieldConfig[];
    title?: string;
    docNo?: string;
    status?: string;
    readonly?: boolean;
    defaultExpanded?: boolean;
  }>(),
  {
    readonly: false,
    defaultExpanded: true,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: any): void;
  (e: 'change', payload: { field: string; value: any }): void;
}>();

const expanded = ref(props.defaultExpanded);

const masterData = computed({
  get: () => props.modelValue || {},
  set: (val) => emit('update:modelValue', val),
});

const currentStatus = computed(() => {
  return props.status || masterData.value?.status || 'draft';
});

function getSpanClass(span: number) {
  switch (span) {
    case 2:
      return 'sm:col-span-2';
    case 3:
      return 'sm:col-span-2 md:col-span-3';
    case 4:
      return 'sm:col-span-2 md:col-span-3 lg:col-span-4';
    case 5:
      return 'sm:col-span-2 md:col-span-3 lg:col-span-5';
    case 6:
      return 'col-span-full';
    case 1:
    default:
      return 'col-span-1';
  }
}

function getSpiritDisplayValue(field: FieldConfig): string {
  if (field.displayKey && masterData.value[field.displayKey]) {
    return String(masterData.value[field.displayKey]);
  }
  if (field.spiritMapping) {
    for (const [targetKey, sourceKey] of Object.entries(field.spiritMapping)) {
      if ((sourceKey === 'shopName' || sourceKey === 'name' || sourceKey === 'storeName') && masterData.value[targetKey]) {
        return String(masterData.value[targetKey]);
      }
    }
  }
  if (field.key === 'shopCode') {
    return String(masterData.value.shopName || masterData.value.storeName || '');
  }
  if (field.key.endsWith('Code')) {
    const nameKey = field.key.replace(/Code$/, 'Name');
    if (masterData.value[nameKey]) return String(masterData.value[nameKey]);
  }
  return '';
}

function updateField(field: string | Record<string, any>, value?: any) {
  if (typeof field === 'object' && field !== null) {
    const updated = {
      ...masterData.value,
      ...field,
    };
    emit('update:modelValue', updated);
    for (const [k, v] of Object.entries(field)) {
      emit('change', { field: k, value: v });
    }
    return;
  }
  const updated = {
    ...masterData.value,
    [field]: value,
  };
  emit('update:modelValue', updated);
  emit('change', { field, value });
}

function onSpiritFieldSelect(field: FieldConfig, selectedItem: any, meta?: any) {
  if (!selectedItem) return;
  const updated = { ...masterData.value };
  
  if (field.spiritMapping) {
    for (const [targetKey, sourceKey] of Object.entries(field.spiritMapping)) {
      if (selectedItem[sourceKey] !== undefined) {
        updated[targetKey] = selectedItem[sourceKey];
      }
    }
  } else {
    // 默认回填当前字段与对应名称字段
    const code = selectedItem.shopCode || selectedItem.code || meta?.code || selectedItem.id;
    const name = selectedItem.shopName || selectedItem.name || meta?.name || selectedItem.title;
    updated[field.key] = code;
    if (field.key.endsWith('Code')) {
      const nameKey = field.key.replace(/Code$/, 'Name');
      updated[nameKey] = name;
    }
  }

  // 针对 SHOP 精灵：确保 shopCode, shopName, storeCode, storeName 同时全部回传更新
  if (selectedItem.shopCode || selectedItem.code || meta?.shopCode) {
    const code = selectedItem.shopCode || selectedItem.code || meta?.code || meta?.shopCode;
    const name = selectedItem.shopName || selectedItem.name || meta?.name || meta?.shopName;
    updated.shopCode = code;
    updated.shopName = name;
    updated.storeCode = code;
    updated.storeName = name;
    if (selectedItem.id) {
      updated.shopId = selectedItem.id;
    }
  }

  Object.assign(props.modelValue, updated);
  emit('update:modelValue', updated);

  for (const [k, v] of Object.entries(updated)) {
    emit('change', { field: k, value: v });
  }
}

function onSpiritFieldClear(field: FieldConfig) {
  const updated = { ...masterData.value };
  if (field.spiritMapping) {
    for (const targetKey of Object.keys(field.spiritMapping)) {
      updated[targetKey] = '';
    }
  } else {
    updated[field.key] = '';
    if (field.key.endsWith('Code')) {
      updated[field.key.replace(/Code$/, 'Name')] = '';
    }
  }

  if (field.spiritKey === 'SHOP' || field.key === 'shopCode') {
    updated.shopCode = '';
    updated.shopName = '';
    updated.storeCode = '';
    updated.storeName = '';
    updated.shopId = '';
  }

  Object.assign(props.modelValue, updated);
  emit('update:modelValue', updated);
  for (const [k, v] of Object.entries(updated)) {
    emit('change', { field: k, value: v });
  }
}
</script>
