<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4"
  >
    <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- 弹窗标题栏 -->
      <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div class="flex items-center space-x-2">
          <FileCode2 class="w-5 h-5 text-indigo-600" />
          <h3 class="font-bold text-sm text-slate-800">
            单据增量提交报文预览 (Delta Payload Preview)
          </h3>
          <span class="text-[11px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-mono">
            master + slaves (_flag: I / U / D / N)
          </span>
        </div>
        <button
          type="button"
          @click="$emit('update:visible', false)"
          class="text-slate-400 hover:text-slate-600"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- 说明与过滤切换 -->
      <div class="p-3 bg-indigo-50/70 border-b border-indigo-100 text-xs text-indigo-900 flex flex-wrap items-center justify-between gap-2">
        <div class="space-y-0.5">
          <p>
            状态标记约定：
            <span class="font-bold text-emerald-700">"I" (新增)</span>、
            <span class="font-bold text-amber-700">"U" (修改)</span>、
            <span class="font-bold text-rose-700">"D" (物理/逻辑删除)</span>、
            <span class="font-bold text-slate-500">"N" (无变动保持)</span>。
          </p>
          <p class="text-[11px] text-indigo-700">
            后端在单据事务中直接利用 <code>_flag</code> 精确执行 INSERT / UPDATE / DELETE，无需笨重全量覆盖。
          </p>
        </div>

        <div class="flex items-center space-x-2 text-xs">
          <label class="flex items-center space-x-1.5 cursor-pointer select-none text-slate-700">
            <input
              type="checkbox"
              v-model="filterOnlyChanges"
              class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="font-medium">仅提交产生变动的从表记录 (过滤 "N")</span>
          </label>
        </div>
      </div>

      <!-- JSON 代码展示区域 -->
      <div class="flex-1 p-4 overflow-y-auto bg-slate-950 text-slate-100 font-mono text-xs select-text">
        <pre class="whitespace-pre leading-relaxed">{{ formattedJson }}</pre>
      </div>

      <!-- 底部操作栏 -->
      <div class="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
        <div class="text-slate-500">
          <span>从表统计：</span>
          <span v-for="(list, key) in displayPayload.slaves" :key="key" class="mr-3">
            <strong class="text-slate-800">{{ key }}</strong>: {{ list.length }} 条
          </span>
        </div>

        <div class="flex items-center space-x-2">
          <button
            type="button"
            @click="handleCopy"
            class="inline-flex items-center px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium transition"
          >
            <Check v-if="copied" class="w-3.5 h-3.5 mr-1 text-emerald-600" />
            <Copy v-else class="w-3.5 h-3.5 mr-1 text-slate-400" />
            {{ copied ? '已复制到剪贴板' : '复制 JSON 报文' }}
          </button>
          <button
            type="button"
            @click="$emit('update:visible', false)"
            class="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-2xs"
          >
            关闭预览
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { FileCode2, X, Copy, Check } from 'lucide-vue-next';
import { DeltaPayload } from '../types';

const props = defineProps<{
  visible: boolean;
  payload: DeltaPayload;
}>();

defineEmits<{
  (e: 'update:visible', val: boolean): void;
}>();

const filterOnlyChanges = ref(false);
const copied = ref(false);

const displayPayload = computed(() => {
  if (!props.payload) return { master: {}, slaves: {} };
  if (!filterOnlyChanges.value) {
    return props.payload;
  }

  // 仅保留 I, U, D 的从表记录
  const filteredSlaves: Record<string, any[]> = {};
  for (const [key, items] of Object.entries(props.payload.slaves || {})) {
    filteredSlaves[key] = (items || []).filter((item: any) => item._flag !== 'N');
  }

  return {
    master: props.payload.master,
    slaves: filteredSlaves,
  };
});

const formattedJson = computed(() => {
  return JSON.stringify(displayPayload.value, null, 2);
});

function handleCopy() {
  navigator.clipboard.writeText(formattedJson.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>
