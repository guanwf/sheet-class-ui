<template>
  <div
    v-if="dictStore.importExportModalVisible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="import-export-modal-title"
  >
    <div class="bg-white rounded-[8px] border border-[#DDE3EA] shadow-xl w-full max-w-[620px] p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
      <div class="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <h3 id="import-export-modal-title" class="text-sm font-bold text-[#0F172A] m-0">
          字典数据导入与导出
        </h3>
        <button
          type="button"
          @click="dictStore.importExportModalVisible = false"
          aria-label="关闭导入导出弹窗"
          class="text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 选项卡切换：导入数据 / 导出数据 -->
      <div class="flex border-b border-[#E2E8F0] text-xs font-medium space-x-6" role="tablist">
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'export'"
          @click="activeTab = 'export'"
          :class="[
            'pb-2.5 transition-colors border-b-2 cursor-pointer',
            activeTab === 'export'
              ? 'border-[#1F4FD8] text-[#1F4FD8] font-bold'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          ]"
        >
          导出当前字典数据
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'import'"
          @click="activeTab = 'import'"
          :class="[
            'pb-2.5 transition-colors border-b-2 cursor-pointer',
            activeTab === 'import'
              ? 'border-[#1F4FD8] text-[#1F4FD8] font-bold'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          ]"
        >
          批量导入数据 (幂等覆盖)
        </button>
      </div>

      <!-- 导出选项卡内容 -->
      <div v-if="activeTab === 'export'" class="space-y-4 text-xs">
        <p class="text-[#475569]">
          当前将导出字典类型
          <strong class="text-[#0F172A]">【{{ dictStore.currentType?.name }}】({{ dictStore.selectedTypeCode }})</strong>
          下的全部明细条目（共 {{ dictStore.items.length }} 条）。
        </p>

        <div class="grid grid-cols-2 gap-4">
          <button
            type="button"
            @click="downloadJson"
            aria-label="导出为 JSON 格式文件"
            class="h-14 p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px] hover:border-[#1F4FD8] hover:bg-[#F0F7FF] transition-all flex items-center space-x-3 cursor-pointer"
          >
            <div class="w-8 h-8 rounded bg-[#1F4FD8] text-white flex items-center justify-center font-mono font-bold text-xs">
              {}
            </div>
            <div class="text-left">
              <span class="block font-semibold text-[#0F172A]">导出为 JSON 文件</span>
              <span class="text-[11px] text-[#64748B]">包含完整多语言与扩展属性</span>
            </div>
          </button>

          <button
            type="button"
            @click="downloadCsv"
            aria-label="导出为 Excel CSV 格式文件"
            class="h-14 p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px] hover:border-[#1F4FD8] hover:bg-[#F0F7FF] transition-all flex items-center space-x-3 cursor-pointer"
          >
            <div class="w-8 h-8 rounded bg-[#15803D] text-white flex items-center justify-center font-mono font-bold text-xs">
              CSV
            </div>
            <div class="text-left">
              <span class="block font-semibold text-[#0F172A]">导出为 Excel (CSV)</span>
              <span class="text-[11px] text-[#64748B]">适合表格编辑与批量归档</span>
            </div>
          </button>
        </div>
      </div>

      <!-- 导入选项卡内容 -->
      <div v-else class="space-y-3 text-xs">
        <div class="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-[6px] text-[#1D4ED8] text-[11px]">
          说明：导入采用 <code>type_code + item_code</code> 幂等策略，已存在的记录将被更新，新编码将被直接插入。
        </div>

        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label for="import-json-data" class="font-medium text-[#0F172A]">
              粘贴待导入的 JSON 数组数据:
            </label>
            <button
              type="button"
              @click="loadSampleImport"
              class="text-[11px] text-[#1F4FD8] hover:underline cursor-pointer"
            >
              加载示例导入数据
            </button>
          </div>
          <textarea
            id="import-json-data"
            v-model="importText"
            rows="6"
            placeholder='[\n  {\n    "typeCode": "CUSTOMER_LEVEL",\n    "itemCode": "LEVEL_SUPER",\n    "labelI18n": {"zh-CN": "特级至尊会员", "en": "Super VIP"},\n    "sortNo": 50,\n    "ext": {"discount": 0.75},\n    "status": 1\n  }\n]'
            aria-label="导入 JSON 数据"
            class="w-full font-mono text-[11px] p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px] focus:outline-hidden focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
          ></textarea>
        </div>

        <div class="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            @click="dictStore.importExportModalVisible = false"
            aria-label="取消导入"
            class="h-11 min-h-[44px] px-4 text-xs font-medium text-[#475569] bg-white border border-[#CBD5E1] rounded-[6px] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            @click="onExecuteImport"
            aria-label="立即执行导入"
            class="h-11 min-h-[44px] px-5 text-xs font-semibold text-white bg-[#1F4FD8] rounded-[6px] hover:bg-[#1940B0] transition-colors cursor-pointer shadow-xs"
          >
            立即执行导入
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDictStore } from '../store/dictStore';
import { message } from 'ant-design-vue';

const dictStore = useDictStore();

const activeTab = ref<'export' | 'import'>('export');
const importText = ref('');

const downloadJson = () => {
  const jsonStr = JSON.stringify(dictStore.items, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dict_${dictStore.selectedTypeCode}_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  message.success('JSON 数据导出成功');
};

const downloadCsv = () => {
  let csv = '\uFEFF条目编码,中文名称,英文名称,父级编码,排序号,状态,有效起始,有效截止\n';
  for (const item of dictStore.items) {
    let zh = '';
    let en = '';
    if (typeof item.labelI18n === 'object') {
      zh = item.labelI18n['zh-CN'] || '';
      en = item.labelI18n.en || '';
    }
    csv += `"${item.itemCode}","${zh}","${en}","${item.parentCode || ''}",${item.sortNo},${item.status === 1 ? '启用' : '停用'},"${item.validFrom || ''}","${item.validTo || ''}"\n`;
  }
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dict_${dictStore.selectedTypeCode}_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  message.success('Excel CSV 数据导出成功');
};

const loadSampleImport = () => {
  importText.value = JSON.stringify(
    [
      {
        typeCode: dictStore.selectedTypeCode,
        itemCode: 'SAMPLE_' + Date.now().toString().slice(-4),
        labelI18n: { 'zh-CN': '测试批量导入条目', en: 'Sample Batch Item' },
        sortNo: 99,
        ext: { importedBy: 'Excel/JSON Channel' },
        status: 1,
      },
    ],
    null,
    2
  );
};

const onExecuteImport = async () => {
  if (!importText.value.trim()) {
    message.warning('请输入待导入的 JSON 数组');
    return;
  }
  try {
    const list = JSON.parse(importText.value);
    if (!Array.isArray(list)) {
      message.error('导入数据必须为 JSON 数组');
      return;
    }
    await dictStore.importData(list);
    importText.value = '';
  } catch (err: any) {
    message.error('JSON 解析失败: ' + err.message);
  }
};
</script>
