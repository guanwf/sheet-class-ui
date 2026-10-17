<template>
  <div
    v-if="store.detailDrawerVisible"
    class="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end"
    role="dialog"
    aria-modal="true"
    aria-labelledby="detail-drawer-title"
  >
    <div
      class="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
    >
      <!-- 抽屉头部 -->
      <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded bg-[#1F4FD8]/10 text-[#1F4FD8] flex items-center justify-center font-bold text-sm">
            🔍
          </div>
          <div>
            <h3 id="detail-drawer-title" class="text-sm font-bold text-slate-900 m-0">
              系统参数详情与审计
            </h3>
            <p class="text-xs text-slate-500 m-0 mt-0.5">
              查看底层物理字段元数据、生效语义与发布流水
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="store.detailDrawerVisible = false"
          aria-label="关闭详情抽屉"
          class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 抽屉内容 -->
      <div v-if="config" class="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
        <!-- 重启生效警示条 -->
        <div
          v-if="config.needRestart === 1"
          class="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-start space-x-2"
        >
          <span class="text-base shrink-0">⚠️</span>
          <div>
            <div class="font-bold">需重启生效 (need_restart = 1)</div>
            <p class="text-[11px] text-amber-800 m-0 mt-0.5 leading-relaxed">
              此参数属于基础架构核心配置（如线程池、数据源或网关连接）。修改该参数值后，需重启微服务容器实例，配置中心(Nacos/Apollo)的本地缓存方可重新初始化生效。
            </p>
          </div>
        </div>

        <div
          v-else
          class="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center space-x-2"
        >
          <span class="text-emerald-600 font-bold">⚡</span>
          <span>热生效 (need_restart = 0)：修改后由 Spring Cloud 监听器即时热更新生效。</span>
        </div>

        <!-- 基础键名与类型 -->
        <div class="space-y-3">
          <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-medium">参数键名 (name)</span>
              <button
                type="button"
                @click="copyText(config.name, '参数名')"
                class="text-[11px] text-[#1F4FD8] hover:underline cursor-pointer"
              >
                复制键名
              </button>
            </div>
            <div class="font-mono text-sm font-bold text-slate-900 break-all select-all">
              {{ config.name }}
            </div>
            <div class="flex flex-wrap items-center gap-2 pt-1">
              <span class="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-100 text-[#1F4FD8]">
                TYPE: {{ config.valueType }}
              </span>
              <span class="px-2 py-0.5 rounded font-medium text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center space-x-1">
                <span>🏷️ 业务域:</span>
                <span class="font-bold">{{ config.tag || '未分类' }}</span>
              </span>
              <span v-if="config.editable === 0" class="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-700 font-semibold">
                🔒 系统内置只读
              </span>
              <span v-if="config.visible === 0" class="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-semibold">
                🙈 前端隐藏脱敏
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-300 font-mono">
                sort_order: {{ config.sortOrder }}
              </span>
            </div>
          </div>

          <!-- 说明与描述 -->
          <div class="space-y-1">
            <span class="font-semibold text-slate-700">参数语义说明 (description)</span>
            <div class="p-3 bg-white border border-slate-200 rounded-md text-slate-800 leading-relaxed">
              {{ config.description || '暂无业务描述' }}
            </div>
          </div>
        </div>

        <!-- 当前参数值展示 (按类型适配) -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-800">当前参数值 (value)</span>
            <button
              type="button"
              @click="copyText(config.value, '参数值')"
              class="text-[11px] text-[#1F4FD8] hover:underline cursor-pointer"
            >
              复制参数值
            </button>
          </div>

          <!-- JSON 结构展示 -->
          <div v-if="config.valueType === 'JSON'" class="rounded-lg overflow-hidden border border-slate-800">
            <div class="px-3 py-1 bg-slate-800 text-slate-400 font-mono text-[10px] flex justify-between">
              <span>JSON Payload</span>
              <span>UTF-8</span>
            </div>
            <pre class="p-3 bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed m-0">{{ formatJsonValue(config.value) }}</pre>
          </div>

          <!-- BOOLEAN 状态展示 -->
          <div
            v-else-if="config.valueType === 'BOOLEAN'"
            class="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between"
          >
            <div>
              <span class="text-slate-500">布尔物理值:</span>
              <span class="font-mono font-bold text-sm ml-2 text-slate-900">{{ config.value }}</span>
            </div>
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-bold font-mono',
                config.value === 'true' || config.value === '1'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-200 text-slate-700'
              ]"
            >
              {{ config.value === 'true' || config.value === '1' ? 'ACTIVE / 启用' : 'INACTIVE / 关闭' }}
            </span>
          </div>

          <!-- NUMBER 数值展示 -->
          <div
            v-else-if="config.valueType === 'NUMBER'"
            class="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-1"
          >
            <div class="text-2xl font-bold font-mono text-slate-900">
              {{ config.value }}
            </div>
            <div class="text-[11px] text-slate-500 font-mono">
              数值型参数，由程序直接解析为 Integer / Long / Double
            </div>
          </div>

          <!-- STRING 文本展示 -->
          <div
            v-else
            class="p-3 bg-slate-50 border border-slate-200 rounded-md font-mono text-xs text-slate-800 break-all select-all leading-relaxed"
          >
            {{ config.value }}
          </div>
        </div>

        <!-- 开发者集成参考 (Spring Boot / Apollo / Nacos) -->
        <div class="space-y-2 pt-1">
          <span class="font-semibold text-slate-700">微服务读取方式参考</span>
          <div class="p-3 bg-slate-900 rounded-md text-[11px] font-mono text-slate-300 space-y-1 overflow-x-auto">
            <div class="text-slate-500">// 1. Spring @Value 注解动态拉取</div>
            <div class="text-emerald-400">@Value("${{ config.name }}:{{ getDefaultFallback(config) }}")</div>
            <div class="text-blue-300">private {{ getJavaType(config.valueType) }} {{ getJavaFieldName(config.name) }};</div>
          </div>
        </div>

        <!-- 审计流水与时间戳 -->
        <div class="border-t border-slate-200 pt-4 space-y-2 text-xs">
          <span class="font-semibold text-slate-700">变更生命周期与审计</span>
          <div class="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span class="text-slate-400 text-[11px]">创建人:</span>
              <div class="font-medium text-slate-800">{{ config.creater || 'system' }}</div>
            </div>
            <div>
              <span class="text-slate-400 text-[11px]">创建时间:</span>
              <div class="font-mono text-slate-600">{{ config.createTime || '-' }}</div>
            </div>
            <div>
              <span class="text-slate-400 text-[11px]">最后修改人:</span>
              <div class="font-medium text-slate-800">{{ config.modifyer || '-' }}</div>
            </div>
            <div>
              <span class="text-slate-400 text-[11px]">最后修改时间:</span>
              <div class="font-mono text-slate-600">{{ config.modifyTime || '-' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 抽屉底部操作 -->
      <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
        <button
          type="button"
          @click="store.detailDrawerVisible = false"
          class="h-9 px-4 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
        >
          关闭
        </button>

        <div class="flex items-center space-x-2">
          <button
            v-if="config && config.editable === 1"
            type="button"
            @click="onEditClick"
            class="h-9 px-4 text-xs font-semibold text-white bg-[#1F4FD8] hover:bg-[#183eb0] rounded-md transition-colors cursor-pointer shadow-xs"
          >
            编辑此参数
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useConfigStore } from '../store/configStore';
import { ConfigValueType } from '../types/config';
import { message } from 'ant-design-vue';

const store = useConfigStore();
const config = computed(() => store.activeConfig);

const formatJsonValue = (val: string) => {
  try {
    return JSON.stringify(JSON.parse(val), null, 2);
  } catch {
    return val;
  }
};

const copyText = (text: string, title: string) => {
  navigator.clipboard.writeText(text);
  message.success(`${title}已复制到剪贴板`);
};

const onEditClick = () => {
  if (config.value) {
    store.detailDrawerVisible = false;
    store.openEditModal(config.value);
  }
};

const getJavaType = (type: ConfigValueType): string => {
  switch (type) {
    case 'NUMBER': return 'Long';
    case 'BOOLEAN': return 'Boolean';
    case 'JSON': return 'Map<String, Object>';
    default: return 'String';
  }
};

const getDefaultFallback = (cfg: any): string => {
  if (cfg.valueType === 'BOOLEAN') return 'false';
  if (cfg.valueType === 'NUMBER') return '0';
  return '';
};

const getJavaFieldName = (name: string): string => {
  const parts = name.split('.');
  const lastPart = parts[parts.length - 1];
  return lastPart.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
};
</script>
