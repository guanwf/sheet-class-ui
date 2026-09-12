<template>
  <div class="h-12 bg-white border-b border-slate-200 px-3.5 flex items-center justify-between text-xs shrink-0 select-none">
    <!-- 左侧动作按钮组 (配置化驱动) -->
    <div class="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1">
      <slot name="toolbar-left" :context="actionContext" />

      <template v-for="btn in computedActions" :key="btn.code">
        <!-- 支持插槽自定义替换特定按钮 -->
        <slot :name="`action-${btn.code}`" :action="btn" :context="actionContext" :trigger="() => handleTrigger(btn)">
          <button
            v-if="btn.isVisible"
            type="button"
            :disabled="btn.isDisabled"
            :class="[
              'inline-flex items-center px-3 py-1.5 rounded font-medium transition shadow-2xs text-xs',
              getButtonVariantClass(btn.variant, btn.isDisabled)
            ]"
            :title="btn.title || `${btn.label} ${btn.shortcut ? `(${btn.shortcut})` : ''}`"
            @click="handleTrigger(btn)"
          >
            <!-- 动态图标映射 -->
            <component
              :is="resolveIcon(btn.icon || btn.code)"
              class="w-3.5 h-3.5 mr-1"
            />
            <span>{{ btn.label }}</span>
          </button>
        </slot>
      </template>

      <slot name="toolbar-center" :context="actionContext" />
    </div>

    <!-- 右侧扩展区域 -->
    <div class="flex items-center space-x-2 shrink-0 pl-2">
      <slot name="toolbar-right" :context="actionContext" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue';
import {
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  Trash2,
  FileCode2,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-vue-next';
import { DocActionItem, DocActionContext, ActionVariant } from '../types';

const props = withDefaults(
  defineProps<{
    actions?: DocActionItem[];
    doc: any;
    isReadOnly?: boolean;
    isDirty?: boolean;
  }>(),
  {
    actions: () => [],
    isReadOnly: false,
    isDirty: false,
  }
);

const emit = defineEmits<{
  (e: 'action', code: string, ctx: DocActionContext): void;
}>();

const actionContext = computed<DocActionContext>(() => ({
  doc: props.doc,
  status: props.doc?.header?.status || props.doc?.status || 'draft',
  isReadOnly: props.isReadOnly,
  isDirty: props.isDirty,
}));

// 计算按钮的可见性与禁用状态
const computedActions = computed(() => {
  const ctx = actionContext.value;
  return (props.actions || []).map((btn) => {
    let isDisabled = false;
    if (typeof btn.disabled === 'function') {
      isDisabled = btn.disabled(ctx);
    } else if (typeof btn.disabled === 'boolean') {
      isDisabled = btn.disabled;
    }

    let isVisible = true;
    if (typeof btn.visible === 'function') {
      isVisible = btn.visible(ctx);
    } else if (typeof btn.visible === 'boolean') {
      isVisible = btn.visible;
    }

    return {
      ...btn,
      isDisabled,
      isVisible,
    };
  });
});

// 图标匹配
function resolveIcon(iconNameOrCode: string) {
  switch (iconNameOrCode?.toLowerCase()) {
    case 'save':
      return Save;
    case 'send':
    case 'submit':
      return Send;
    case 'approve':
    case 'check':
      return CheckCircle2;
    case 'reject':
      return AlertCircle;
    case 'copy':
    case 'duplicate':
      return Copy;
    case 'print':
      return Printer;
    case 'delete':
    case 'trash':
      return Trash2;
    case 'payload':
    case 'code':
      return FileCode2;
    case 'reset':
      return RotateCcw;
    default:
      return Sliders;
  }
}

// 样式类映射
function getButtonVariantClass(variant?: ActionVariant, isDisabled?: boolean) {
  if (isDisabled) {
    return 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none';
  }
  switch (variant) {
    case 'primary':
      return 'bg-indigo-600 hover:bg-indigo-700 text-white';
    case 'success':
      return 'bg-emerald-600 hover:bg-emerald-700 text-white';
    case 'danger':
      return 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200';
    case 'outline':
      return 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300';
    case 'secondary':
    default:
      return 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300';
  }
}

// 触发按钮事件
function handleTrigger(btn: DocActionItem) {
  const ctx = actionContext.value;
  if (btn.onClick) {
    btn.onClick(ctx);
  }
  emit('action', btn.code, ctx);
}

// 全局快捷键监听 (如 Ctrl+S 保存)
function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    const saveAction = computedActions.value.find(
      (a) => a.code === 'save' && a.isVisible && !a.isDisabled
    );
    if (saveAction) {
      e.preventDefault();
      handleTrigger(saveAction);
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});
</script>
