<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
      <!-- 弹窗顶栏 -->
      <div class="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div class="flex items-center space-x-2">
          <FileSpreadsheet class="w-4 h-4 text-emerald-600" />
          <h3 class="text-sm font-bold text-slate-800">批量快速录入 / Excel 剪贴板物料粘贴</h3>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- 说明与输入框 -->
      <div class="p-5 space-y-3 text-xs">
        <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-indigo-800">
          <p class="font-semibold mb-1">格式说明：</p>
          <p>支持从 Excel 复制多行并直接粘贴。每行格式为：</p>
          <code class="block font-mono bg-white p-1.5 rounded mt-1 text-slate-700 border border-indigo-100">
            物料编码 [制表符/逗号] 物料名称 [制表符/逗号] 规格型号 [制表符/逗号] 采购数量 [制表符/逗号] 含税单价
          </code>
        </div>

        <div>
          <label class="block font-medium text-slate-700 mb-1">粘贴数据文本区域：</label>
          <textarea
            v-model="rawText"
            rows="8"
            placeholder="例如：
MAT-1001	高速微处理器	LQFP-64 120MHz	50	45.50
MAT-1002	精密滤波电感	0805 22uH ±5%	500	0.85
MAT-1003	工业级固态电容	16V 470uF	200	3.20"
            class="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
          ></textarea>
        </div>
      </div>

      <!-- 底栏动作 -->
      <div class="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <span class="text-xs text-slate-400">已识别约 {{ parsedRowCount }} 行明细</span>
        <div class="flex items-center space-x-3">
          <button
            type="button"
            @click="$emit('close')"
            class="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            @click="handleImport"
            class="px-4 py-1.5 rounded bg-[#25548d] hover:bg-[#1e4676] active:bg-[#183860] text-white text-xs font-medium shadow-xs transition cursor-pointer"
          >
            确认批量追加
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ItemDetailRow } from '../../types/document';
import { recalculateItemRow } from '../../utils/formulas';
import { FileSpreadsheet, X } from 'lucide-vue-next';

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'import-items', items: ItemDetailRow[]): void;
}>();

const rawText = ref('');

const parsedRowCount = computed(() => {
  return rawText.value
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0).length;
});

const handleImport = () => {
  const lines = rawText.value
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    emit('close');
    return;
  }

  const newItems: ItemDetailRow[] = lines.map((line, idx) => {
    const parts = line.includes('\t') ? line.split('\t') : line.split(',');
    const code = parts[0]?.trim() || `MAT-${1000 + idx}`;
    const name = parts[1]?.trim() || '导入物料明细项';
    const spec = parts[2]?.trim() || '标准工业规格';
    const qty = Number(parts[3]?.trim()) || 10;
    const priceWithTax = Number(parts[4]?.trim()) || 100;

    const baseRow: ItemDetailRow = {
      id: `item-batch-${Date.now()}-${idx}`,
      rowNo: idx + 1,
      itemCode: code,
      itemName: name,
      spec: spec,
      unit: 'PCS',
      quantity: qty,
      priceWithTax: priceWithTax,
      priceWithoutTax: Math.round((priceWithTax / 1.13) * 10000) / 10000,
      taxRate: 13,
      taxAmount: 0,
      totalAmount: 0,
      warehouse: 'WH-01 主料总仓',
      batchNo: `BAT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
      deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      remarks: '从Excel批量导入',
    };

    return recalculateItemRow(baseRow, 'priceWithTax');
  });

  emit('import-items', newItems);
  rawText.value = '';
  emit('close');
};
</script>
