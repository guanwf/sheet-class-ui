<template>
  <div
    v-if="store.paramSchemaDrawerVisible && store.activeTemplate"
    class="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end backdrop-blur-2xs"
    role="dialog"
    aria-modal="true"
    aria-labelledby="schema-drawer-title"
  >
    <div
      class="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
    >
      <!-- 头部 -->
      <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
        <div>
          <h3 id="schema-drawer-title" class="text-sm font-bold text-slate-900 m-0 flex items-center space-x-2">
            <span>模板字段与参数契约说明 (param_schema)</span>
            <span class="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-100 text-[#1F4FD8] font-bold">
              v{{ store.activeTemplate.version }}
            </span>
          </h3>
          <p class="text-xs text-slate-500 m-0 mt-0.5">
            {{ store.activeTemplate.templateName }} ({{ store.activeTemplate.templateId }})
          </p>
        </div>

        <button
          type="button"
          @click="store.paramSchemaDrawerVisible = false"
          aria-label="关闭参数抽屉"
          class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 模式切换：可视化结构预览 vs JSON 源码编辑 -->
      <div class="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
        <div class="flex items-center space-x-2">
          <button
            type="button"
            @click="activeViewMode = 'visual'"
            :class="[
              'px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer',
              activeViewMode === 'visual'
                ? 'bg-white text-[#1F4FD8] shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            结构化预览 (表单与表格)
          </button>
          <button
            type="button"
            @click="activeViewMode = 'json'"
            :class="[
              'px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer',
              activeViewMode === 'json'
                ? 'bg-white text-[#1F4FD8] shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            JSON 源码与语法校验
          </button>
        </div>

        <button
          v-if="activeViewMode === 'json'"
          type="button"
          @click="formatJson"
          class="text-xs text-[#1F4FD8] hover:underline cursor-pointer font-medium"
        >
          格式化 JSON
        </button>
      </div>

      <!-- 抽屉主体内容 -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
        <!-- 1. 可视化模式 -->
        <template v-if="activeViewMode === 'visual'">
          <!-- 基础排版信息 -->
          <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <h4 class="font-bold text-slate-800 m-0 text-xs">页面与打印版式信息</h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-700">
              <div>
                <span class="text-slate-400 block text-[11px]">报表标题:</span>
                <strong class="text-slate-900">{{ parsedObj?.reportTitle || '未定义' }}</strong>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">纸张规格:</span>
                <span class="font-mono font-medium">{{ parsedObj?.pageSize || 'A4' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">纸张方向:</span>
                <span>{{ parsedObj?.orientation === 'LANDSCAPE' ? '横向 (Landscape)' : '纵向 (Portrait)' }}</span>
              </div>
            </div>
          </div>

          <!-- 报表参数 (Parameters) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-slate-800 m-0 text-xs flex items-center space-x-1.5">
                <span>报表主表参数 (Parameters)</span>
                <span class="text-slate-400 font-normal">({{ parsedObj?.parameters?.length || 0 }} 项)</span>
              </h4>
            </div>

            <div class="border border-slate-200 rounded-md overflow-hidden">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-100 text-slate-700 font-medium border-b border-slate-200">
                  <tr>
                    <th class="py-2 px-3 w-[150px]">参数键名</th>
                    <th class="py-2 px-3 w-[100px]">Java 类型</th>
                    <th class="py-2 px-3 w-[70px] text-center">必填</th>
                    <th class="py-2 px-3">业务含义说明</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-if="!parsedObj?.parameters || parsedObj.parameters.length === 0">
                    <td colspan="4" class="py-6 text-center text-slate-400">未定义主表参数</td>
                  </tr>
                  <tr
                    v-for="param in parsedObj?.parameters || []"
                    :key="param.name"
                    class="hover:bg-slate-50"
                  >
                    <td class="py-2 px-3 font-mono font-semibold text-slate-900">{{ param.name }}</td>
                    <td class="py-2 px-3 font-mono text-blue-700 text-[11px]">{{ param.type }}</td>
                    <td class="py-2 px-3 text-center">
                      <span v-if="param.required" class="text-red-500 font-bold">*</span>
                      <span v-else class="text-slate-300">-</span>
                    </td>
                    <td class="py-2 px-3 text-slate-600">{{ param.description }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 明细网格字段 (Fields) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-slate-800 m-0 text-xs flex items-center space-x-1.5">
                <span>明细表格字段 (Fields)</span>
                <span class="text-slate-400 font-normal">({{ parsedObj?.fields?.length || 0 }} 项)</span>
              </h4>
            </div>

            <div class="border border-slate-200 rounded-md overflow-hidden">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-100 text-slate-700 font-medium border-b border-slate-200">
                  <tr>
                    <th class="py-2 px-3 w-[150px]">字段名</th>
                    <th class="py-2 px-3 w-[100px]">数据类型</th>
                    <th class="py-2 px-3">字段说明与映射</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-if="!parsedObj?.fields || parsedObj.fields.length === 0">
                    <td colspan="3" class="py-6 text-center text-slate-400">未定义明细字段</td>
                  </tr>
                  <tr
                    v-for="field in parsedObj?.fields || []"
                    :key="field.name"
                    class="hover:bg-slate-50"
                  >
                    <td class="py-2 px-3 font-mono font-semibold text-slate-900">{{ field.name }}</td>
                    <td class="py-2 px-3 font-mono text-emerald-700 text-[11px]">{{ field.type }}</td>
                    <td class="py-2 px-3 text-slate-600">{{ field.description }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>

        <!-- 2. JSON 源码编辑模式 -->
        <template v-else>
          <div class="space-y-2">
            <label for="drawer-json-textarea" class="block font-medium text-slate-800">
              param_schema 原生 JSON 契约文本
            </label>
            <textarea
              id="drawer-json-textarea"
              v-model="rawJsonText"
              rows="22"
              class="w-full font-mono text-[11px] p-3 bg-slate-900 text-slate-100 rounded-md border border-slate-700 focus:outline-hidden focus:border-[#1F4FD8]"
            ></textarea>
            <p v-if="syntaxError" class="text-red-500 font-mono text-[11px] m-0">
              JSON 语法错误: {{ syntaxError }}
            </p>
          </div>
        </template>
      </div>

      <!-- 抽屉底部保存 -->
      <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
        <div class="text-[11px] text-slate-400">
          保存后将同步更新数据库 <code>param_schema</code> 字段
        </div>

        <div class="flex items-center space-x-3">
          <button
            type="button"
            @click="store.paramSchemaDrawerVisible = false"
            class="h-9 px-4 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            关闭
          </button>
          <button
            type="button"
            @click="handleSave"
            class="h-9 px-4 text-xs font-semibold text-white bg-[#1F4FD8] rounded-md hover:bg-[#183eb0] transition-colors cursor-pointer shadow-xs"
          >
            保存契约修改
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { usePrintTemplateStore } from '../store/printTemplateStore';
import { PrintParamSchema } from '../types/printTemplate';
import { message } from 'ant-design-vue';

const store = usePrintTemplateStore();

const activeViewMode = ref<'visual' | 'json'>('visual');
const rawJsonText = ref('');
const syntaxError = ref('');

watch(
  () => [store.paramSchemaDrawerVisible, store.activeTemplate],
  ([visible, tpl]) => {
    if (visible && tpl) {
      rawJsonText.value = tpl.paramSchema || '{}';
      syntaxError.value = '';
    }
  },
  { immediate: true }
);

const parsedObj = computed<PrintParamSchema | null>(() => {
  try {
    return JSON.parse(rawJsonText.value || '{}');
  } catch {
    return null;
  }
});

const formatJson = () => {
  try {
    const obj = JSON.parse(rawJsonText.value);
    rawJsonText.value = JSON.stringify(obj, null, 2);
    syntaxError.value = '';
    message.success('JSON 已格式化');
  } catch (e: any) {
    syntaxError.value = e.message;
  }
};

const handleSave = async () => {
  if (!store.activeTemplate) return;
  try {
    JSON.parse(rawJsonText.value);
    syntaxError.value = '';
  } catch (e: any) {
    syntaxError.value = e.message;
    message.error('JSON 语法错误，请修改后再保存');
    return;
  }

  await store.saveParamSchema(store.activeTemplate.id, rawJsonText.value);
};
</script>
