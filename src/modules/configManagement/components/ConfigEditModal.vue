<template>
  <div
    v-if="store.editModalVisible && store.activeConfig"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    role="dialog"
    aria-modal="true"
    aria-labelledby="config-modal-title"
  >
    <div
      class="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- 模态框头部 -->
      <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
        <div class="flex items-center space-x-2.5">
          <div class="w-8 h-8 rounded bg-[#1F4FD8]/10 text-[#1F4FD8] flex items-center justify-center font-bold text-base">
            ✏️
          </div>
          <div>
            <h3 id="config-modal-title" class="text-sm font-bold text-slate-900 m-0 flex items-center space-x-2">
              <span>修改系统配置参数</span>
              <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-[#1F4FD8] border border-blue-200">
                pbs_config
              </span>
            </h3>
            <p class="text-xs text-slate-500 m-0 mt-0.5">
              数据由后台初始化，在此仅支持修改业务域标签、运行参数值与说明
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="store.editModalVisible = false"
          aria-label="关闭参数配置弹窗"
          class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 表单主体 -->
      <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
        <!-- 1. 参数元数据只读卡片 (后台初始化固定) -->
        <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-slate-500 font-medium text-[11px]">参数键名 (name - 唯一只读标识)</span>
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-100 text-[#1F4FD8] border border-blue-200">
                TYPE: {{ form.valueType }}
              </span>
            </div>
          </div>

          <div class="font-mono text-sm font-bold text-slate-900 break-all select-all bg-white p-2.5 rounded border border-slate-200">
            {{ form.name }}
          </div>

          <!-- 生效模式与权限标识 -->
          <div class="flex flex-wrap items-center gap-2 pt-1">
            <span
              v-if="store.activeConfig.needRestart === 1"
              class="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1"
            >
              <span>⚠️</span>
              <span>需重启微服务容器生效 (need_restart=1)</span>
            </span>
            <span
              v-else
              class="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1"
            >
              <span>⚡</span>
              <span>热重载即时生效 (need_restart=0)</span>
            </span>

            <span class="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-300 font-mono">
              sort_order: {{ form.sortOrder }}
            </span>
          </div>
        </div>

        <!-- 2. 业务域分类 (tag) -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label for="cfg-tag" class="block font-medium text-slate-800">
              业务域分类 (tag) <span class="text-red-500">*</span>
            </label>
            <span class="text-[11px] text-slate-400">
              对应数据表 tag 字段 (VARCHAR(64))
            </span>
          </div>
          <div class="relative">
            <input
              id="cfg-tag"
              v-model="form.tag"
              list="tag-suggestions"
              required
              maxlength="64"
              placeholder="请输入或选择业务域分类（如：网关服务、安全中心、系统内核...）"
              class="w-full h-9 px-3 bg-white text-slate-800 border border-slate-300 rounded-md focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8] font-medium"
            />
            <datalist id="tag-suggestions">
              <option v-for="t in store.tags.filter(t => t !== 'ALL')" :key="t" :value="t" />
            </datalist>
          </div>
        </div>

        <!-- 3. 参数值 (value) 针对不同 valueType 专用的编辑器 -->
        <div class="space-y-2">
          <!-- A. STRING 模式 -->
          <div v-if="form.valueType === 'STRING'" class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label for="val-string" class="block font-medium text-slate-800">
                参数文本内容 (STRING) <span class="text-red-500">*</span>
              </label>
              <span class="text-[11px] text-slate-400 font-mono">
                {{ form.value.length }} 字符
              </span>
            </div>
            <textarea
              id="val-string"
              v-model="form.value"
              rows="4"
              required
              placeholder="请输入字符串内容..."
              aria-label="字符串类型参数值"
              class="w-full p-3 font-mono text-xs bg-white text-slate-800 border border-slate-300 rounded-md focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8] leading-relaxed"
            ></textarea>
          </div>

          <!-- B. NUMBER 模式 -->
          <div v-else-if="form.valueType === 'NUMBER'" class="space-y-2">
            <label for="val-number" class="block font-medium text-slate-800">
              数值内容 (NUMBER) <span class="text-red-500">*</span>
            </label>
            <div class="flex items-center space-x-3">
              <input
                id="val-number"
                v-model="form.value"
                type="number"
                step="any"
                required
                placeholder="请输入有效数字..."
                aria-label="数字类型参数值"
                class="w-64 h-10 px-3 font-mono text-sm font-semibold bg-white text-slate-900 border border-slate-300 rounded-md focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
              />
              <div class="flex items-center space-x-1">
                <button
                  type="button"
                  @click="adjustNumber(-1000)"
                  class="h-9 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs cursor-pointer"
                >
                  -1000
                </button>
                <button
                  type="button"
                  @click="adjustNumber(-10)"
                  class="h-9 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs cursor-pointer"
                >
                  -10
                </button>
                <button
                  type="button"
                  @click="adjustNumber(10)"
                  class="h-9 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs cursor-pointer"
                >
                  +10
                </button>
                <button
                  type="button"
                  @click="adjustNumber(1000)"
                  class="h-9 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs cursor-pointer"
                >
                  +1000
                </button>
              </div>
            </div>
            <!-- 人性化语义参考 -->
            <div v-if="numberHelperHint" class="p-2.5 bg-blue-50/70 border border-blue-200 rounded text-[11px] text-[#1F4FD8] flex items-center space-x-1.5 font-mono">
              <span>💡 单位与语义换算:</span>
              <span>{{ numberHelperHint }}</span>
            </div>
          </div>

          <!-- C. BOOLEAN 模式 -->
          <div v-else-if="form.valueType === 'BOOLEAN'" class="space-y-2">
            <label class="block font-medium text-slate-800">
              布尔开关状态 (BOOLEAN) <span class="text-red-500">*</span>
            </label>
            <div class="flex items-center space-x-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <!-- 开关 -->
              <button
                type="button"
                @click="toggleBooleanForm"
                aria-label="切换布尔状态"
                :class="[
                  'w-14 h-7.5 rounded-full transition-colors relative cursor-pointer',
                  isBooleanTrue ? 'bg-emerald-600' : 'bg-slate-300'
                ]"
              >
                <span
                  :class="[
                    'w-6 h-6 rounded-full bg-white absolute top-0.75 transition-transform shadow-xs',
                    isBooleanTrue ? 'right-0.75' : 'left-0.75'
                  ]"
                ></span>
              </button>

              <div>
                <div class="flex items-center space-x-2">
                  <span
                    :class="[
                      'px-2.5 py-0.5 rounded font-mono font-bold text-xs',
                      isBooleanTrue ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-700'
                    ]"
                  >
                    {{ form.value }}
                  </span>
                  <span class="text-xs font-semibold text-slate-800">
                    {{ isBooleanTrue ? '已启用 (true)' : '已停用 (false)' }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 m-0 mt-0.5">
                  点击滑块可即时在 true / false 之间切换
                </p>
              </div>
            </div>
          </div>

          <!-- D. JSON 模式 -->
          <div v-else-if="form.valueType === 'JSON'" class="space-y-2">
            <div class="flex items-center justify-between">
              <label for="val-json" class="block font-medium text-slate-800">
                JSON 结构体数据 (JSON Payload) <span class="text-red-500">*</span>
              </label>
              <div class="flex items-center space-x-2">
                <button
                  type="button"
                  @click="formatJson"
                  class="px-2 py-0.5 bg-blue-50 text-[#1F4FD8] hover:bg-blue-100 border border-blue-200 rounded text-[11px] font-medium transition-colors cursor-pointer"
                >
                  ⚡ 美化格式化 JSON
                </button>
                <button
                  type="button"
                  @click="compressJson"
                  class="px-2 py-0.5 bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300 rounded text-[11px] font-medium transition-colors cursor-pointer"
                >
                  压缩单行
                </button>
              </div>
            </div>

            <!-- 代码编辑框 -->
            <div class="relative">
              <textarea
                id="val-json"
                v-model="form.value"
                rows="8"
                required
                placeholder='请输入合法 JSON 数组或键值对对象...'
                aria-label="JSON数据文本"
                class="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 border border-slate-700 rounded-md focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8] leading-relaxed"
              ></textarea>
            </div>

            <!-- JSON 实时检测条 -->
            <div
              :class="[
                'p-2 rounded border text-[11px] flex items-center justify-between font-mono',
                jsonValidationResult.valid
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              ]"
            >
              <div class="flex items-center space-x-1.5">
                <span>{{ jsonValidationResult.valid ? '✓' : '✗' }}</span>
                <span>{{ jsonValidationResult.message }}</span>
              </div>
              <div v-if="jsonValidationResult.valid" class="text-slate-500">
                {{ jsonValidationResult.type }}
              </div>
            </div>
          </div>
        </div>

        <!-- 4. 参数描述 (description) -->
        <div class="space-y-1.5">
          <label for="cfg-desc" class="block font-medium text-slate-800">
            参数语义描述说明 (description)
          </label>
          <textarea
            id="cfg-desc"
            v-model="form.description"
            rows="2"
            placeholder="记录该参数的技术含义、影响范围与推荐取值..."
            aria-label="参数描述"
            class="w-full p-2.5 text-xs bg-white text-slate-800 border border-slate-300 rounded-md focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
          ></textarea>
        </div>
      </form>

      <!-- 底部操作按钮：仅允许保存修改和取消，无新增和删除 -->
      <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
        <div class="text-[11px] text-slate-500">
          * 数据由后台初始化预置，仅支持修改业务域标签、运行参数值与说明
        </div>
        <div class="flex items-center space-x-3">
          <button
            type="button"
            @click="store.editModalVisible = false"
            aria-label="取消"
            class="h-9 px-4 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            @click="handleSubmit"
            :disabled="form.valueType === 'JSON' && !jsonValidationResult.valid"
            aria-label="保存修改"
            class="h-9 px-4 text-xs font-semibold text-white bg-[#1F4FD8] hover:bg-[#183eb0] disabled:bg-slate-300 disabled:cursor-not-allowed rounded-md transition-colors cursor-pointer shadow-xs"
          >
            保存修改
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue';
import { useConfigStore } from '../store/configStore';
import { ConfigValueType } from '../types/config';
import { message } from 'ant-design-vue';

const store = useConfigStore();

const form = reactive({
  tenantId: 1,
  tag: '',
  name: '',
  value: '',
  valueType: 'STRING' as ConfigValueType,
  description: '',
  needRestart: 0,
  editable: 1,
  visible: 1,
  sortOrder: 0,
});

watch(
  () => store.editModalVisible,
  (val) => {
    if (val && store.activeConfig) {
      form.tenantId = store.activeConfig.tenantId;
      form.tag = store.activeConfig.tag || '';
      form.name = store.activeConfig.name;
      form.value = store.activeConfig.value;
      form.valueType = store.activeConfig.valueType;
      form.description = store.activeConfig.description || '';
      form.needRestart = store.activeConfig.needRestart;
      form.editable = store.activeConfig.editable;
      form.visible = store.activeConfig.visible;
      form.sortOrder = store.activeConfig.sortOrder;
    }
  }
);

const isBooleanTrue = computed(() => {
  const v = form.value.trim().toLowerCase();
  return v === 'true' || v === '1';
});

const toggleBooleanForm = () => {
  form.value = isBooleanTrue.value ? 'false' : 'true';
};

const adjustNumber = (delta: number) => {
  const current = Number(form.value) || 0;
  form.value = String(current + delta);
};

const numberHelperHint = computed(() => {
  const num = Number(form.value);
  if (isNaN(num)) return null;

  if (num >= 1000 && num % 1000 === 0 && num <= 3600000) {
    return `${num} ms = ${num / 1000} 秒`;
  }
  if (num >= 60 && num <= 86400 * 30) {
    if (num % 86400 === 0) {
      return `${num} 秒 = ${num / 86400} 天`;
    }
    if (num % 3600 === 0) {
      return `${num} 秒 = ${num / 3600} 小时`;
    }
    if (num % 60 === 0) {
      return `${num} 秒 = ${num / 60} 分钟`;
    }
  }
  return null;
});

const jsonValidationResult = computed(() => {
  if (form.valueType !== 'JSON') return { valid: true, message: '', type: '' };
  try {
    const parsed = JSON.parse(form.value);
    const isArray = Array.isArray(parsed);
    const typeStr = isArray ? `JSON 数组 (${parsed.length} 个元素)` : `JSON 对象 (${Object.keys(parsed).length} 个键)`;
    return { valid: true, message: 'JSON 语法检测通过', type: typeStr };
  } catch (err: any) {
    return { valid: false, message: `语法错误: ${err.message}`, type: 'ERROR' };
  }
});

const formatJson = () => {
  try {
    const parsed = JSON.parse(form.value);
    form.value = JSON.stringify(parsed, null, 2);
    message.success('JSON 已美化排版');
  } catch (err: any) {
    message.error(`格式化失败，存在语法错误: ${err.message}`);
  }
};

const compressJson = () => {
  try {
    const parsed = JSON.parse(form.value);
    form.value = JSON.stringify(parsed);
    message.info('JSON 已压缩为单行');
  } catch (err: any) {
    message.error(`压缩失败，存在语法错误: ${err.message}`);
  }
};

const handleSubmit = async () => {
  if (!store.activeConfig) return;

  if (!form.tag.trim()) {
    message.error('业务域分类 (tag) 不能为空');
    return;
  }

  if (form.valueType === 'JSON' && !jsonValidationResult.value.valid) {
    message.error('请先修正 JSON 语法错误再提交');
    return;
  }

  await store.saveConfig(
    {
      tenantId: form.tenantId,
      tag: form.tag.trim(),
      name: form.name,
      value: form.value,
      valueType: form.valueType,
      description: form.description,
      needRestart: form.needRestart,
      editable: form.editable,
      visible: form.visible,
      sortOrder: form.sortOrder,
    },
    store.activeConfig.id
  );
};
</script>
