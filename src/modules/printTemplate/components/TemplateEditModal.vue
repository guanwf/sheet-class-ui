<template>
  <div
    v-if="store.editModalVisible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    role="dialog"
    aria-modal="true"
    aria-labelledby="edit-modal-title"
  >
    <div
      class="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- 模态框头部 -->
      <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded bg-[#1F4FD8]/10 text-[#1F4FD8] flex items-center justify-center font-bold text-sm">
            ✏️
          </div>
          <div>
            <h3 id="edit-modal-title" class="text-sm font-bold text-slate-900 m-0">
              编辑打印模板信息
            </h3>
            <p class="text-xs text-slate-500 m-0 mt-0.5">
              修改模板展示名称、归属业务模块、默认模板标记与备注
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="store.editModalVisible = false"
          aria-label="关闭编辑弹窗"
          class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 表单主体 -->
      <form @submit.prevent="handleSave" class="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
        <!-- 业务模块 & 模板编码 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label for="edit-module-id" class="block font-medium text-slate-800">
              业务模块 (module_id) <span class="text-red-500">*</span>
            </label>
            <select
              id="edit-module-id"
              v-model="form.moduleId"
              required
              aria-label="业务模块"
              class="w-full h-10 px-3 bg-white text-slate-800 border border-slate-300 rounded-md focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
            >
              <option value="order">采购订单 (order)</option>
              <option value="return_order">采购退货单 (return_order)</option>
              <option value="invoice">发票与对账单 (invoice)</option>
              <option value="inventory">入库与库管单 (inventory)</option>
              <option value="delivery">发运与物流单 (delivery)</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label for="edit-template-id" class="block font-medium text-slate-800">
              模板编码 (template_id)
            </label>
            <input
              id="edit-template-id"
              :value="store.activeTemplate?.templateId"
              readonly
              disabled
              aria-label="模板编码 (只读)"
              class="w-full h-10 px-3 font-mono text-xs uppercase bg-slate-100 text-slate-500 border border-slate-300 rounded-md cursor-not-allowed"
            />
            <p class="text-[10px] text-slate-400 m-0">主键编码不可修改，如需更换请重新上传</p>
          </div>
        </div>

        <!-- 模板名称 -->
        <div class="space-y-1.5">
          <label for="edit-name" class="block font-medium text-slate-800">
            模板名称 (template_name) <span class="text-red-500">*</span>
          </label>
          <input
            id="edit-name"
            v-model="form.templateName"
            required
            placeholder="如 采购订单标准A4激光套打模板"
            aria-label="模板名称"
            class="w-full h-10 px-3 text-xs bg-white text-slate-800 border border-slate-300 rounded-md focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
          />
        </div>

        <!-- 默认模板开关 -->
        <div class="p-3 bg-slate-50 rounded-md border border-slate-200">
          <label class="flex items-center space-x-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              v-model="form.isDefault"
              aria-label="设为模块默认模板"
              class="w-4 h-4 text-[#1F4FD8] rounded border-slate-300 focus:ring-[#1F4FD8]"
            />
            <div>
              <span class="text-xs font-semibold text-slate-800">设为所属模块默认模板 (is_default = 1)</span>
              <p class="text-[11px] text-slate-500 m-0">
                勾选后，同一模块下的其他模板将自动取消默认状态。
              </p>
            </div>
          </label>
        </div>

        <!-- 备注 -->
        <div class="space-y-1.5">
          <label for="edit-remark" class="block font-medium text-slate-800">
            备注说明 (remark)
          </label>
          <textarea
            id="edit-remark"
            v-model="form.remark"
            rows="3"
            placeholder="填写模板用途、支持纸张或修订原因..."
            aria-label="备注说明"
            class="w-full p-2.5 text-xs bg-white text-slate-800 border border-slate-300 rounded-md focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
          ></textarea>
        </div>

        <!-- 当前文件路径只读信息 -->
        <div class="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-1 font-mono text-[11px] text-slate-600">
          <div class="flex justify-between">
            <span class="text-slate-500">当前版本:</span>
            <span class="font-bold text-[#1F4FD8]">v{{ store.activeTemplate?.version }}</span>
          </div>
          <div class="truncate">
            <span class="text-slate-500">源文件 (jrxml):</span>
            <span class="text-slate-700 ml-1">{{ store.activeTemplate?.jrxmlPath || '未配置' }}</span>
          </div>
          <div class="truncate">
            <span class="text-slate-500">编译产物 (jasper):</span>
            <span class="text-slate-700 ml-1">{{ store.activeTemplate?.jasperPath || '未编译' }}</span>
          </div>
        </div>
      </form>

      <!-- 底部操作按钮 -->
      <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3 shrink-0">
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
          @click="handleSave"
          aria-label="保存修改"
          class="h-9 px-4 text-xs font-semibold text-white bg-[#1F4FD8] hover:bg-[#183eb0] rounded-md transition-colors cursor-pointer"
        >
          保存修改
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { usePrintTemplateStore } from '../store/printTemplateStore';

const store = usePrintTemplateStore();

const form = reactive({
  moduleId: '',
  templateName: '',
  isDefault: false,
  remark: '',
});

watch(
  () => store.editModalVisible,
  (val) => {
    if (val && store.activeTemplate) {
      form.moduleId = store.activeTemplate.moduleId;
      form.templateName = store.activeTemplate.templateName;
      form.isDefault = store.activeTemplate.isDefault === 1;
      form.remark = store.activeTemplate.remark || '';
    }
  }
);

const handleSave = async () => {
  if (!store.activeTemplate) return;
  if (!form.templateName.trim()) {
    alert('请输入模板名称');
    return;
  }
  await store.updateBasicInfo(store.activeTemplate.id, {
    moduleId: form.moduleId,
    templateName: form.templateName,
    isDefault: form.isDefault,
    remark: form.remark,
  });
};
</script>
