<template>
  <!-- 通用精灵输入框组件 (SpiritInput.vue) - 右侧带小查询图标与快捷清空按钮 -->
  <div class="relative inline-flex items-center w-full group">
    <!-- 主输入展示框：展示为 "编码-名称"；点击输入框不弹出精灵 -->
    <input
      type="text"
      :value="formattedDisplayText"
      :disabled="disabled"
      :readonly="readonlyInput"
      :placeholder="placeholder || `点击右侧查询图标打开${currentConfig?.title || '精灵'}...`"
      @keydown.enter.prevent="onEnterQuickSearch"
      :class="[
        'w-full h-8 pl-2.5 pr-14 border rounded text-xs transition truncate select-text',
        disabled
          ? 'bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed'
          : 'bg-white border-slate-300 text-slate-800 hover:border-indigo-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500/20 focus:outline-none cursor-default',
        modelValue ? 'font-medium' : ''
      ]"
    />

    <!-- 右侧操作图标组 -->
    <div class="absolute right-1 flex items-center space-x-1">
      <!-- 清空 (x) 按钮：仅在有值且非禁用时显示 -->
      <button
        v-if="allowClear && !disabled && (internalCode || internalName || modelValue || displayValue)"
        type="button"
        @click.stop="onClear"
        class="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded transition cursor-pointer"
        title="清空当前选择"
      >
        <X class="w-3.5 h-3.5" />
      </button>

      <!-- 核心：小查询图标按钮 (点击此图标弹出查询精灵，已按需求去除文字) -->
      <button
        type="button"
        :disabled="disabled"
        @click.stop="openModal"
        class="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 border border-slate-200 hover:border-indigo-300 rounded transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
        :title="`查询${currentConfig?.title || '精灵'}`"
      >
        <Search class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- 弹出的上下结构查询精灵窗口 -->
    <SpiritModal
      v-model:visible="modalVisible"
      :spirit-config="currentConfig"
      :initial-keyword="enterKeyword"
      @confirm="onSpiritConfirm"
      @close="onModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Search, X } from 'lucide-vue-next';
import SpiritModal from './SpiritModal.vue';
import { spiritRegistry } from './spiritRegistry';
import { SpiritKey, SpiritFieldMapping } from './types';
import { MOCK_SHOPS } from '../../data/mockShops';
import { SUPPLIERS } from '../../data/initialTemplates';

const props = withDefaults(
  defineProps<{
    spiritKey?: SpiritKey;
    modelValue?: string | number | null;
    displayValue?: string | null;
    placeholder?: string;
    disabled?: boolean;
    readonlyInput?: boolean;
    allowClear?: boolean;
    mapping?: SpiritFieldMapping;
  }>(),
  {
    spiritKey: 'SHOP',
    modelValue: '',
    displayValue: '',
    disabled: false,
    readonlyInput: true, // 只读展示，点击文本框不弹出；只有点右侧小查询图标才弹出
    allowClear: true,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: any): void;
  (e: 'update:code', val: string): void;
  (e: 'update:displayValue', val: string): void;
  (e: 'update:name', val: string): void;
  (e: 'confirm', entity: any, meta?: { code: string; name: string; shopCode?: string; shopName?: string }): void;
  (e: 'select', entity: any, meta?: { code: string; name: string; shopCode?: string; shopName?: string }): void;
  (e: 'change', payload: { code: string; name: string; row: any }): void;
  (e: 'clear'): void;
}>();

const modalVisible = ref(false);
const enterKeyword = ref('');

// 内部维护响应式状态，避免父组件未传 displayValue 时无法回显 "编码-名称"
const internalCode = ref<string>('');
const internalName = ref<string>('');

const currentConfig = computed(() => {
  return spiritRegistry.get(props.spiritKey);
});

// 根据编码自动从数据字典中查找名称
function lookupNameByCode(code: string, spiritKey?: string): string {
  if (!code) return '';
  const trimmed = code.trim();
  if (!spiritKey || spiritKey === 'SHOP') {
    const shop = MOCK_SHOPS.find(
      (s) => s.shopCode === trimmed || s.id === trimmed || s.shortName === trimmed
    );
    if (shop) return shop.shopName;
  }
  if (spiritKey === 'SUPPLIER') {
    const sup = SUPPLIERS.find(
      (s) => s.code === trimmed || s.id === trimmed
    );
    if (sup) return sup.name;
  }
  return '';
}

// 监听外部传入的 modelValue 与 displayValue
watch(
  () => [props.modelValue, props.displayValue],
  ([newVal, newDisp]) => {
    const code = newVal != null ? String(newVal).trim() : '';
    let name = newDisp != null ? String(newDisp).trim() : '';

    internalCode.value = code;

    if (name) {
      internalName.value = name;
    } else if (code) {
      // 外部未传入 displayValue 时，尝试通过编码自动反查全称
      const found = lookupNameByCode(code, props.spiritKey);
      if (found) {
        internalName.value = found;
        // 如果外部监听了 update:displayValue，顺带同步
        emit('update:displayValue', found);
      } else {
        internalName.value = '';
      }
    } else {
      internalName.value = '';
    }
  },
  { immediate: true }
);

// 格式化展示文本：严格显示为 "编码-名称" (例如 "SHP-SZ-01-深圳南山科技园直营店")
const formattedDisplayText = computed(() => {
  const code = internalCode.value || (props.modelValue != null ? String(props.modelValue).trim() : '');
  let name = internalName.value || (props.displayValue != null ? String(props.displayValue).trim() : '');

  // 兜底查名称
  if (code && !name) {
    name = lookupNameByCode(code, props.spiritKey);
    if (name) {
      internalName.value = name;
    }
  }

  if (code && name) {
    if (code === name) {
      return code;
    }
    // 严格满足需求：显示为 "编码-名称"
    return `${code}-${name}`;
  }
  return code || name || '';
});

function openModal() {
  if (props.disabled) return;
  enterKeyword.value = '';
  modalVisible.value = true;
}

function onEnterQuickSearch(e: Event) {
  if (props.disabled) return;
  const target = e.target as HTMLInputElement;
  enterKeyword.value = target?.value || '';
  modalVisible.value = true;
}

// 查询精灵确认回调：将门店编码与门店全称同时回传
function onSpiritConfirm(selectedRow: any) {
  if (!selectedRow || !currentConfig.value) return;

  const valueField = currentConfig.value.valueField;
  const displayField = currentConfig.value.displayField;

  const code = String(selectedRow[valueField] || selectedRow.shopCode || selectedRow.code || '').trim();
  const name = String(selectedRow[displayField] || selectedRow.shopName || selectedRow.name || '').trim();

  // 1. 立即更新内部状态，保证输入框瞬间渲染为 "编码-名称"
  internalCode.value = code;
  internalName.value = name;

  const meta = {
    code,
    name,
    shopCode: code,
    shopName: name,
    entity: selectedRow,
  };

  // 2. 同时向外部回传编码与名称，全面发出标准事件满足所有调用姿势
  emit('update:modelValue', code);
  emit('update:code', code);
  emit('update:displayValue', name);
  emit('update:name', name);
  emit('confirm', selectedRow, meta);
  emit('select', selectedRow, meta);
  emit('change', { code, name, row: selectedRow });
}

function onClear() {
  internalCode.value = '';
  internalName.value = '';
  emit('update:modelValue', '');
  emit('update:code', '');
  emit('update:displayValue', '');
  emit('update:name', '');
  emit('clear');
  emit('change', { code: '', name: '', row: null });
}

function onModalClose() {
  modalVisible.value = false;
}
</script>
