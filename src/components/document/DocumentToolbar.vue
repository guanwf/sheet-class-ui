<template>
  <div class="h-12 bg-white border-b border-slate-200 px-3.5 flex items-center justify-between text-xs shrink-0 select-none">
    <!-- 左侧动作按钮组 -->
    <div class="flex items-center space-x-1.5">
      <!-- 保存按钮 -->
      <button
        type="button"
        :disabled="isReadOnly"
        @click="$emit('save')"
        class="inline-flex items-center px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium shadow-2xs transition"
        title="保存当前单据的所有主从表修改 (Ctrl+S)"
      >
        <Save class="w-3.5 h-3.5 mr-1" />
        保存
      </button>

      <!-- 送审按钮 -->
      <button
        v-if="status === 'draft' || status === 'rejected'"
        type="button"
        @click="$emit('submit')"
        class="inline-flex items-center px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-2xs transition"
        title="提交给部门主管进行审批"
      >
        <Send class="w-3.5 h-3.5 mr-1" />
        提交送审
      </button>

      <!-- 审核通过按钮 -->
      <button
        v-if="status === 'pending'"
        type="button"
        @click="$emit('approve')"
        class="inline-flex items-center px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-2xs transition"
        title="审批核准生效"
      >
        <CheckCircle2 class="w-3.5 h-3.5 mr-1" />
        审核通过
      </button>

      <!-- 审批驳回按钮 -->
      <button
        v-if="status === 'pending'"
        type="button"
        @click="$emit('reject')"
        class="inline-flex items-center px-3 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium transition"
        title="退回草稿状态重新修改"
      >
        <AlertCircle class="w-3.5 h-3.5 mr-1 text-rose-600" />
        驳回
      </button>

      <span class="h-4 w-px bg-slate-200 mx-1"></span>

      <!-- 复制单据 -->
      <button
        type="button"
        @click="$emit('duplicate')"
        class="inline-flex items-center px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium transition"
        title="复制生成新单据"
      >
        <Copy class="w-3.5 h-3.5 mr-1 text-slate-400" />
        复制单据
      </button>

      <!-- 打印套打 -->
      <button
        type="button"
        @click="$emit('print')"
        class="inline-flex items-center px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium transition"
        title="打开标准商务凭证打印预览"
      >
        <Printer class="w-3.5 h-3.5 mr-1 text-slate-400" />
        凭证套打
      </button>

      <!-- 规则与列模型配置 -->
      <button
        type="button"
        @click="$emit('open-schema-config')"
        class="inline-flex items-center px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium transition"
        title="字段配置与校验规则"
      >
        <Settings class="w-3.5 h-3.5 mr-1 text-slate-400" />
        模型配置
      </button>

      <!-- 删除/作废 -->
      <button
        v-if="status !== 'approved'"
        type="button"
        @click="$emit('delete')"
        class="inline-flex items-center px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-medium transition"
        title="作废并删除单据"
      >
        <Trash2 class="w-3.5 h-3.5 mr-1" />
        作废删除
      </button>
    </div>

    <!-- 右侧返回与状态 -->
    <div class="flex items-center space-x-3">
      <div v-if="isDirty" class="flex items-center text-amber-600 font-medium space-x-1 animate-pulse">
        <span class="erp-dot erp-dot-warning"></span>
        <span>未保存修改</span>
      </div>

      <button
        type="button"
        @click="$emit('close')"
        class="inline-flex items-center px-2.5 py-1.5 rounded border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
      >
        <span>返回台账</span>
        <ArrowLeft class="w-3.5 h-3.5 ml-1" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DocumentStatus } from '../../types/document';
import {
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  Settings,
  Trash2,
  ArrowLeft,
} from 'lucide-vue-next';

defineProps<{
  status: DocumentStatus;
  isReadOnly: boolean;
  isDirty: boolean;
}>();

defineEmits<{
  (e: 'save'): void;
  (e: 'submit'): void;
  (e: 'approve'): void;
  (e: 'reject'): void;
  (e: 'duplicate'): void;
  (e: 'print'): void;
  (e: 'open-schema-config'): void;
  (e: 'delete'): void;
  (e: 'close'): void;
}>();
</script>
