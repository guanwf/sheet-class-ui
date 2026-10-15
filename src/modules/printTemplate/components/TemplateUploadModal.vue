<template>
  <div
    v-if="store.uploadModalVisible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    role="dialog"
    aria-modal="true"
    aria-labelledby="upload-modal-title"
  >
    <div
      class="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- 模态框头部 -->
      <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded bg-[#1F4FD8]/10 text-[#1F4FD8] flex items-center justify-center font-bold text-sm">
            🖨️
          </div>
          <div>
            <h3 id="upload-modal-title" class="text-sm font-bold text-slate-900 m-0">
              {{ store.isNewVersionMode ? `上传模板新版本 (v${(store.activeTemplate?.version || 1) + 1})` : '新建/上传打印模板' }}
            </h3>
            <p class="text-xs text-slate-500 m-0 mt-0.5">
              支持 JasperReports (*.jrxml) 源文件上传，自动解析参数与字段结构
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="store.uploadModalVisible = false"
          aria-label="关闭上传弹窗"
          class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 表单主体 -->
      <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
        <!-- 业务模块 & 模板编码 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label for="tpl-module-id" class="block font-medium text-slate-800">
              所属业务模块 (module_id) <span class="text-red-500">*</span>
            </label>
            <select
              id="tpl-module-id"
              v-model="form.moduleId"
              :disabled="store.isNewVersionMode"
              required
              aria-label="选择所属业务模块"
              class="w-full h-10 px-3 bg-white text-slate-800 border border-slate-300 rounded-md focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8] disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="order">采购订单 (order)</option>
              <option value="return_order">采购退货单 (return_order)</option>
              <option value="invoice">发票与对账单 (invoice)</option>
              <option value="inventory">入库与库管单 (inventory)</option>
              <option value="delivery">发运与物流单 (delivery)</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label for="tpl-template-id" class="block font-medium text-slate-800">
              模板编码 (template_id) <span class="text-red-500">*</span>
            </label>
            <input
              id="tpl-template-id"
              v-model="form.templateId"
              :readonly="store.isNewVersionMode"
              required
              placeholder="如 PO_A4_STANDARD"
              aria-label="模板唯一编码"
              class="w-full h-10 px-3 font-mono text-xs uppercase bg-white text-slate-800 border border-slate-300 rounded-md focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8] readonly:bg-slate-100 readonly:text-slate-500 readonly:cursor-not-allowed"
            />
          </div>
        </div>

        <!-- 模板名称 & 默认模板开关 -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div class="sm:col-span-2 space-y-1.5">
            <label for="tpl-name" class="block font-medium text-slate-800">
              模板名称 (template_name) <span class="text-red-500">*</span>
            </label>
            <input
              id="tpl-name"
              v-model="form.templateName"
              required
              placeholder="如 采购订单标准A4激光套打模板"
              aria-label="模板名称"
              class="w-full h-10 px-3 text-xs bg-white text-slate-800 border border-slate-300 rounded-md focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
            />
          </div>

          <div class="space-y-1.5 pb-1">
            <label class="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                v-model="form.isDefault"
                aria-label="设为模块默认模板"
                class="w-4 h-4 text-[#1F4FD8] rounded border-slate-300 focus:ring-[#1F4FD8]"
              />
              <span class="text-xs font-semibold text-slate-800">设为模块默认模板</span>
            </label>
            <p class="text-[11px] text-slate-500 m-0">同模块下自动互斥置换</p>
          </div>
        </div>

        <!-- JRXML 上传区域 -->
        <div class="space-y-1.5 pt-1">
          <div class="flex items-center justify-between">
            <label class="block font-medium text-slate-800">
              JRXML 报表设计源文件 (*.jrxml) <span class="text-red-500">*</span>
            </label>
            <button
              type="button"
              @click="loadSampleFile"
              class="text-xs text-[#1F4FD8] hover:underline cursor-pointer flex items-center space-x-1"
            >
              <span>⚡ 填入标准采购订单 JRXML 示例</span>
            </button>
          </div>

          <!-- 拖拽上传框 -->
          <div
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
            :class="[
              'border-2 border-dashed rounded-lg p-5 text-center transition-colors cursor-pointer flex flex-col items-center justify-center space-y-2',
              isDragging ? 'border-[#1F4FD8] bg-blue-50/50' : 'border-slate-300 hover:border-[#1F4FD8] bg-slate-50/50'
            ]"
            @click="triggerFileInput"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept=".jrxml,.xml"
              class="hidden"
              @change="handleFileSelect"
            />
            <div class="w-10 h-10 rounded-full bg-blue-100/70 text-[#1F4FD8] flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div class="text-xs">
              <span class="font-medium text-[#1F4FD8]">点击选择文件</span> 或拖拽 JRXML 文件到此处
              <p class="text-[11px] text-slate-400 m-0 mt-0.5">支持 Jaspersoft Studio 生成的标准 JasperReports 6.x/7.x 源格式</p>
            </div>
            <div v-if="selectedFileName" class="px-3 py-1 rounded bg-green-50 border border-green-200 text-green-700 text-xs font-mono font-medium flex items-center space-x-1.5">
              <span>✓ 已就绪: {{ selectedFileName }} ({{ (selectedFileSize / 1024).toFixed(1) }} KB)</span>
            </div>
          </div>
        </div>

        <!-- 编译与缓存失效机制说明 -->
        <div class="bg-blue-50/80 border border-blue-200 rounded-md p-3 text-xs text-blue-900 space-y-1">
          <div class="font-semibold flex items-center space-x-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-[#1F4FD8]"></span>
            <span>自动编译与版本缓存失效 (Cache-Busting):</span>
          </div>
          <p class="text-[11px] text-blue-800 m-0">
            上传后系统将在后台自动编译为 <code>*.jasper</code> 二进制文件。本次上传将使得该模板版本自动提升为
            <strong class="font-mono">v{{ store.isNewVersionMode ? (store.activeTemplate?.version || 1) + 1 : 1 }}</strong>
            ，全系统微服务与打印代理节点将根据版本号自动失效旧缓存并拉取最新编译模板。
          </p>
        </div>

        <!-- 解析所得参数与字段预览 (param_schema) -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label for="tpl-schema" class="block font-medium text-slate-800">
              模板参数/字段说明 (param_schema JSON 契约)
            </label>
            <span class="text-[11px] text-slate-500 font-mono">
              已自动识别 {{ parsedParamCount }} 个报表参数, {{ parsedFieldCount }} 个明细字段
            </span>
          </div>
          <textarea
            id="tpl-schema"
            v-model="form.paramSchemaText"
            rows="5"
            placeholder="JSON 格式参数契约说明..."
            aria-label="模板参数字段说明 JSON"
            class="w-full font-mono text-[11px] p-2.5 bg-slate-50 text-slate-800 border border-slate-300 rounded-md focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
          ></textarea>
        </div>

        <!-- 备注 -->
        <div class="space-y-1.5">
          <label for="tpl-remark" class="block font-medium text-slate-800">
            版本更新说明 / 备注 (remark)
          </label>
          <input
            id="tpl-remark"
            v-model="form.remark"
            placeholder="如 调整表尾审批签名栏高度，增加防伪二维码"
            aria-label="更新说明"
            class="w-full h-10 px-3 text-xs bg-white text-slate-800 border border-slate-300 rounded-md focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
          />
        </div>
      </form>

      <!-- 底部按钮区 -->
      <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
        <div class="text-[11px] text-slate-500">
          * 业务表与单据通过 <code>(module_id, template_id)</code> 进行精准套打路由
        </div>
        <div class="flex items-center space-x-3">
          <button
            type="button"
            @click="store.uploadModalVisible = false"
            aria-label="取消上传"
            class="h-10 px-4 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            @click="handleSubmit"
            aria-label="立即上传并自动编译"
            class="h-10 px-5 text-xs font-semibold text-white bg-[#1F4FD8] rounded-md hover:bg-[#183eb0] active:bg-[#12318e] transition-colors cursor-pointer shadow-xs flex items-center space-x-1.5"
          >
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>{{ store.isNewVersionMode ? '发布新版本' : '确认上传并发布' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { usePrintTemplateStore } from '../store/printTemplateStore';
import { printTemplateApi, parseJrxmlParameters } from '../api/printTemplateApi';
import { message } from 'ant-design-vue';

const store = usePrintTemplateStore();

const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const selectedFileName = ref('');
const selectedFileSize = ref(0);

const form = ref({
  moduleId: 'order',
  templateId: '',
  templateName: '',
  isDefault: false,
  paramSchemaText: '',
  remark: '',
});

const parsedParamCount = ref(0);
const parsedFieldCount = ref(0);

watch(
  () => [store.uploadModalVisible, store.activeTemplate],
  ([visible, activeTpl]) => {
    if (!visible) return;
    if (store.isNewVersionMode && activeTpl) {
      form.value = {
        moduleId: activeTpl.moduleId,
        templateId: activeTpl.templateId,
        templateName: activeTpl.templateName,
        isDefault: activeTpl.isDefault === 1,
        paramSchemaText: activeTpl.paramSchema || '',
        remark: `升级至版本 v${activeTpl.version + 1}`,
      };
      selectedFileName.value = `${activeTpl.templateId}_v${activeTpl.version + 1}.jrxml`;
      selectedFileSize.value = 46000;
      updateSchemaCounts(activeTpl.paramSchema);
    } else {
      const defaultMod = store.selectedModuleId !== 'all' ? store.selectedModuleId : 'order';
      form.value = {
        moduleId: defaultMod,
        templateId: '',
        templateName: '',
        isDefault: false,
        paramSchemaText: '',
        remark: '初始化模板上传',
      };
      selectedFileName.value = '';
      selectedFileSize.value = 0;
      parsedParamCount.value = 0;
      parsedFieldCount.value = 0;
    }
  },
  { immediate: true }
);

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    processFile(target.files[0]);
  }
};

const handleFileDrop = (e: DragEvent) => {
  isDragging.value = false;
  if (e.dataTransfer && e.dataTransfer.files[0]) {
    processFile(e.dataTransfer.files[0]);
  }
};

const processFile = (file: File) => {
  selectedFileName.value = file.name;
  selectedFileSize.value = file.size;

  if (!form.value.templateName && !store.isNewVersionMode) {
    form.value.templateName = file.name.replace(/\.[^/.]+$/, '');
  }
  if (!form.value.templateId && !store.isNewVersionMode) {
    form.value.templateId = file.name.replace(/\.[^/.]+$/, '').toUpperCase().replace(/[^A-Z0-9_]/g, '_');
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const content = event.target?.result as string;
    if (content) {
      const parsed = parseJrxmlParameters(content);
      form.value.paramSchemaText = JSON.stringify(parsed, null, 2);
      updateSchemaCounts(form.value.paramSchemaText);
      message.success(`JRXML 解析成功：提取了 ${parsed.parameters.length} 个参数与 ${parsed.fields.length} 个字段`);
    }
  };
  reader.readAsText(file);
};

const loadSampleFile = () => {
  const sampleXml = printTemplateApi.getSampleJrxml();
  selectedFileName.value = 'PO_A4_STANDARD.jrxml';
  selectedFileSize.value = 48500;
  if (!store.isNewVersionMode) {
    form.value.moduleId = 'order';
    form.value.templateId = 'PO_A4_STANDARD_V2';
    form.value.templateName = '采购订单标准A4激光套打模板 (高清版)';
  }
  const parsed = parseJrxmlParameters(sampleXml);
  form.value.paramSchemaText = JSON.stringify(parsed, null, 2);
  updateSchemaCounts(form.value.paramSchemaText);
  message.success('已载入标准采购订单 JRXML 结构并完成自动解析');
};

const updateSchemaCounts = (schemaText?: string | null) => {
  if (!schemaText) {
    parsedParamCount.value = 0;
    parsedFieldCount.value = 0;
    return;
  }
  try {
    const obj = JSON.parse(schemaText);
    parsedParamCount.value = obj.parameters?.length || 0;
    parsedFieldCount.value = obj.fields?.length || 0;
  } catch {
    parsedParamCount.value = 0;
    parsedFieldCount.value = 0;
  }
};

const handleSubmit = async () => {
  if (!form.value.templateId.trim()) {
    message.warning('请输入模板编码');
    return;
  }
  if (!form.value.templateName.trim()) {
    message.warning('请输入模板名称');
    return;
  }
  if (!selectedFileName.value && !form.value.paramSchemaText) {
    message.warning('请上传 JRXML 源文件或填入参数说明');
    return;
  }

  await store.uploadTemplate({
    moduleId: form.value.moduleId,
    templateId: form.value.templateId.trim().toUpperCase(),
    templateName: form.value.templateName.trim(),
    isDefault: form.value.isDefault,
    paramSchemaText: form.value.paramSchemaText,
    remark: form.value.remark.trim(),
    autoCompile: true,
  });
};
</script>
