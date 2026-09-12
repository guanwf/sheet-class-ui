<template>
  <div :class="['bg-white border-b border-slate-200 text-xs select-none transition-all duration-150', isCompact ? 'p-2 sm:p-2.5' : 'p-3.5 sm:p-4']">
    <!-- 单据头顶部信息条 -->
    <div :class="['flex items-center justify-between border-b border-slate-100', isCompact ? 'pb-1.5 mb-2' : 'pb-2.5 mb-3']">
      <div class="flex items-center space-x-3">
        <h2 :class="['font-bold text-slate-800 flex items-center space-x-2', isCompact ? 'text-sm' : 'text-base']">
          <span>{{ title || '业务单据' }}</span>
          <span
            v-if="docNo || masterData?.docNo"
            :class="['font-mono font-semibold text-[#25548d] bg-[#f0f5fa] px-2 py-0.5 rounded border border-[#cbdff2]', isCompact ? 'text-xs' : 'text-sm']"
          >
            {{ docNo || masterData?.docNo }}
          </span>
        </h2>

        <!-- 单据状态徽标 (采用 Ant Design Vue 标签) -->
        <a-tag
          v-if="currentStatus === 'approved'"
          color="success"
          class="m-0 inline-flex items-center text-xs px-2 py-0.5"
        >
          <template #icon><CheckCircleOutlined /></template>
          已核准生效
        </a-tag>
        <a-tag
          v-else-if="currentStatus === 'pending'"
          color="processing"
          class="m-0 inline-flex items-center text-xs px-2 py-0.5"
        >
          <template #icon><SyncOutlined spin /></template>
          待审核审批
        </a-tag>
        <a-tag
          v-else-if="currentStatus === 'rejected'"
          color="error"
          class="m-0 inline-flex items-center text-xs px-2 py-0.5"
        >
          <template #icon><CloseCircleOutlined /></template>
          审批已驳回
        </a-tag>
        <a-tag
          v-else-if="currentStatus === 'voided'"
          color="default"
          class="m-0 inline-flex items-center text-xs px-2 py-0.5"
        >
          已作废
        </a-tag>
        <a-tag
          v-else
          color="warning"
          class="m-0 inline-flex items-center text-xs px-2 py-0.5"
        >
          <template #icon><EditOutlined /></template>
          草稿待提交
        </a-tag>
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
          class="text-[#25548d] hover:text-[#183a62] font-medium ml-2 flex items-center space-x-1 cursor-pointer"
        >
          <span>{{ expanded ? '收起表头' : '展开表头' }}</span>
          <DownOutlined :class="['w-3 h-3 text-[10px] transition-transform duration-200', expanded ? 'rotate-180' : '']" />
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
        <div :class="['grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6', isCompact ? 'gap-x-2.5 gap-y-1.5' : 'gap-3']">
          <template v-for="field in fields" :key="field.key">
            <div
              :class="[
                isCompact && field.type !== 'textarea'
                  ? 'flex items-center space-x-1.5'
                  : (isCompact ? 'space-y-0.5' : 'space-y-1'),
                getSpanClass(field.span || 1),
              ]"
            >
              <label
                :class="[
                  isCompact && field.type !== 'textarea'
                    ? 'w-18 shrink-0 text-right text-slate-500 font-medium text-[11px] truncate'
                    : 'block text-slate-500 font-medium text-[11px]'
                ]"
                :title="field.label"
              >
                {{ field.label }}
                <span v-if="field.required" class="text-rose-500 font-bold">*</span>
              </label>

              <div :class="isCompact && field.type !== 'textarea' ? 'flex-1 min-w-0' : 'w-full'">
                <!-- 字段级自定义插槽：业务若想替换某单个控件可覆盖 #field-[key] -->
                <slot
                  :name="`field-${field.key}`"
                  :field="field"
                  :value="masterData[field.key]"
                  :master="masterData"
                  :update-value="(val: any) => updateField(field.key, val)"
                >
                  <!-- 1. 文本输入 (Ant Design Vue a-input) -->
                  <a-input
                    v-if="field.type === 'text'"
                    :value="masterData[field.key]"
                    :disabled="readonly || field.disabled"
                    :placeholder="field.placeholder || `请输入${field.label}`"
                    :size="controlSize"
                    allow-clear
                    @update:value="(val: any) => updateField(field.key, val)"
                  />

                  <!-- 2. 数字输入 (Ant Design Vue a-input-number) -->
                  <a-input-number
                    v-else-if="field.type === 'number'"
                    :value="masterData[field.key]"
                    :disabled="readonly || field.disabled"
                    :step="field.step || 1"
                    :min="field.min"
                    :max="field.max"
                    :placeholder="field.placeholder"
                    :size="controlSize"
                    class="w-full"
                    @update:value="(val: any) => updateField(field.key, val)"
                  />

                  <!-- 3. 日期选择 (Ant Design Vue a-date-picker) -->
                  <a-date-picker
                    v-else-if="field.type === 'date'"
                    :value="masterData[field.key]"
                    value-format="YYYY-MM-DD"
                    :disabled="readonly || field.disabled"
                    :size="controlSize"
                    class="w-full"
                    allow-clear
                    placeholder="请选择日期"
                    @change="(_: any, dateStr: string | string[]) => updateField(field.key, Array.isArray(dateStr) ? dateStr[0] : dateStr)"
                  />

                  <!-- 4. 下拉选择 (Ant Design Vue a-select) -->
                  <a-select
                    v-else-if="field.type === 'select'"
                    :value="masterData[field.key]"
                    :options="field.options"
                    :disabled="readonly || field.disabled"
                    :size="controlSize"
                    class="w-full"
                    allow-clear
                    show-search
                    :filter-option="(input: string, option: any) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())"
                    placeholder="请选择"
                    @change="(val: any) => updateField(field.key, val)"
                  />

                  <!-- 5. 文本域 (Ant Design Vue a-textarea) -->
                  <a-textarea
                    v-else-if="field.type === 'textarea'"
                    :value="masterData[field.key]"
                    :disabled="readonly || field.disabled"
                    :placeholder="field.placeholder"
                    :size="controlSize"
                    :rows="isCompact ? 1 : 2"
                    :auto-size="isCompact ? { minRows: 1, maxRows: 3 } : { minRows: 2, maxRows: 4 }"
                    allow-clear
                    @update:value="(val: any) => updateField(field.key, val)"
                  />

                  <!-- 6. 查询精灵输入框 (SpiritInput) -->
                  <SpiritInput
                    v-else-if="field.type === 'spirit'"
                    :spirit-key="field.spiritKey || 'SHOP'"
                    :model-value="masterData[field.key]"
                    :display-value="getSpiritDisplayValue(field)"
                    :disabled="readonly || field.disabled"
                    :placeholder="field.placeholder"
                    :mapping="field.spiritMapping"
                    :compact="isCompact"
                    @select="(item, meta) => onSpiritFieldSelect(field, item, meta)"
                    @confirm="(item, meta) => onSpiritFieldSelect(field, item, meta)"
                    @clear="onSpiritFieldClear(field)"
                  />

                  <!-- 默认兜底 -->
                  <a-input
                    v-else
                    :value="masterData[field.key]"
                    :disabled="readonly || field.disabled"
                    :size="controlSize"
                    allow-clear
                    @update:value="(val: any) => updateField(field.key, val)"
                  />
                </slot>
              </div>
            </div>
          </template>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import {
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  EditOutlined,
  DownOutlined,
} from '@ant-design/icons-vue';
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
    density?: 'compact' | 'standard';
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

const store = useStore();
const isCompact = computed(() => {
  if (props.density) {
    return props.density === 'compact';
  }
  return store?.getters?.uiDensity === 'compact';
});

const controlSize = computed<'small' | 'middle'>(() => (isCompact.value ? 'small' : 'middle'));

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
