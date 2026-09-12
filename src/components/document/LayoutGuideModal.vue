<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4"
  >
    <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
      <!-- 头部 -->
      <div class="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <BookOpen class="w-5 h-5 text-indigo-600" />
          <h3 class="font-bold text-sm text-slate-800">
            页面布局调整指南：3 种方式写在哪里、怎么写？
          </h3>
        </div>
        <button
          type="button"
          @click="$emit('update:visible', false)"
          class="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200/50"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- 内容区 -->
      <div class="p-4 overflow-y-auto space-y-4 flex-1">
        <!-- 概览对比表 -->
        <div class="overflow-x-auto border border-slate-200 rounded-lg">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th class="p-2.5">方式</th>
                <th class="p-2.5">代码写在哪个文件？</th>
                <th class="p-2.5">适用场景</th>
                <th class="p-2.5">开发成本</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr class="hover:bg-slate-50">
                <td class="p-2.5 font-bold text-indigo-600">方式一：配置驱动</td>
                <td class="p-2.5 font-mono text-slate-800 bg-slate-50/80">
                  <code>src/modules/[模块名]/schema.ts</code>
                </td>
                <td class="p-2.5 text-slate-600">改输入框占宽(span 1~6)、调顺序、改列宽、固定列</td>
                <td class="p-2.5 text-emerald-600 font-medium">零代码 (只改 JSON)</td>
              </tr>
              <tr class="hover:bg-slate-50">
                <td class="p-2.5 font-bold text-amber-600">方式二：插槽定制</td>
                <td class="p-2.5 font-mono text-slate-800 bg-slate-50/80">
                  <code>src/modules/[模块名]/[模块]MasterSlot.vue</code>
                </td>
                <td class="p-2.5 text-slate-600">
                  主表改分组卡片/折叠板 (<code>#master-layout</code>)<br />
                  子表改单元格UI (<code>#cell-[field]</code>)<br />
                  底栏加自定义指标 (<code>#footer-left</code>)
                </td>
                <td class="p-2.5 text-indigo-600 font-medium">中等 (业务模块自治 HTML / Tailwind)</td>
              </tr>
              <tr class="hover:bg-slate-50">
                <td class="p-2.5 font-bold text-purple-600">方式三：架构自由重组</td>
                <td class="p-2.5 font-mono text-slate-800 bg-slate-50/80">
                  <code>src/modules/[模块名]/[模块]RecomposedSidebar.vue</code>
                </td>
                <td class="p-2.5 text-slate-600">打破上下堆叠，改左右分栏、双子表上下并列、抽屉弹出明细</td>
                <td class="p-2.5 text-purple-600 font-medium">业务模块自治页面重组</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 详细代码示例 1 -->
        <div class="border border-indigo-200 rounded-lg p-3 bg-indigo-50/30 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-indigo-900 text-xs">
              1. 方式一代码示例：在 schema.ts 中声明栅格跨度 (span) 与列宽
            </span>
            <span class="font-mono text-[10px] text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-200">
              src/modules/purchaseOrder/schema.ts
            </span>
          </div>
          <pre class="p-2.5 bg-slate-900 text-slate-100 rounded text-[11px] font-mono overflow-x-auto leading-relaxed">
// 主表 6 列栅格自由排版：总宽度为 6 格
export const purchaseOrderModuleConfig: DocumentModuleConfig = {
  masterFields: [
    // 占 1/6 宽度 (单列)
    { key: 'docDate', label: '单据日期', span: 1, type: 'date', required: true },
    // 占 2/6 宽度 (双倍宽度)
    { key: 'partnerId', label: '往来供应商', span: 2, type: 'select', required: true },
    // 占 3/6 宽度 (半屏宽度)
    { key: 'deliveryAddress', label: '交货地址', span: 3, type: 'text' },
    // 占 6/6 宽度 (独占整整一行)
    { key: 'remarks', label: '特约条款', span: 6, type: 'textarea' },
  ],
  slaves: {
    OrderItem: {
      enableFilter: true, // 网格开启过滤 (采购单开启，退货单不开启)
      enableSort: true,   // 网格开启排序 (采购单开启，退货单不开启)
      columns: [
        { field: 'itemCode', title: '物料编码', width: 120, fixed: 'left', sortable: true, filterable: true },
        { field: 'quantity', title: '采购数量', width: 100, align: 'right', min: 0, sortable: true },
      ]
    }
  }
};</pre>
        </div>

        <!-- 详细代码示例 2 -->
        <div class="border border-amber-200 rounded-lg p-3 bg-amber-50/30 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-amber-900 text-xs">
              2. 方式二代码示例：业务模块自治插槽组件（覆盖主表卡片排版、子表单元格与底栏）
            </span>
            <span class="font-mono text-[10px] text-amber-600 bg-white px-2 py-0.5 rounded border border-amber-200">
              src/modules/purchaseOrder/PurchaseOrderMasterSlot.vue
            </span>
          </div>
          <pre class="p-2.5 bg-slate-900 text-slate-100 rounded text-[11px] font-mono overflow-x-auto leading-relaxed">
&lt;!-- 1. 主表整块布局覆盖插槽：从默认 6 列栅格改成分组卡片排版 --&gt;
&lt;DocHeaderForm :model-value="doc.header" :fields="fields"&gt;
  &lt;template #master-layout="{ master, updateField }"&gt;
    &lt;div class="grid grid-cols-1 md:grid-cols-3 gap-3"&gt;
      &lt;div class="bg-indigo-50 border p-3 rounded"&gt;
        &lt;h4 class="font-bold"&gt;客商基础信息&lt;/h4&gt;
        &lt;input :value="master.contractNo" @input="updateField('contractNo', $event.target.value)" /&gt;
      &lt;/div&gt;
      &lt;!-- 其他自定义卡片... --&gt;
    &lt;/div&gt;
  &lt;/template&gt;
&lt;/DocHeaderForm&gt;

&lt;!-- 2. 子表单元格自定义插槽：给物料编码加上业务标签与操作 --&gt;
&lt;DocEditableGrid :columns="columns" :data="items"&gt;
  &lt;template #cell-itemCode="{ row, value }"&gt;
    &lt;span class="badge"&gt;{{ value }}&lt;/span&gt;
  &lt;/template&gt;
&lt;/DocEditableGrid&gt;

&lt;!-- 3. 底部状态栏插槽：追加专属业务预算指标 --&gt;
&lt;DocStatusBar :summary="summary"&gt;
  &lt;template #footer-left&gt;
    &lt;span class="text-amber-400"&gt;⚡ 预算执行率 82.4%&lt;/span&gt;
  &lt;/template&gt;
&lt;/DocStatusBar&gt;</pre>
        </div>

        <!-- 详细代码示例 3 -->
        <div class="border border-purple-200 rounded-lg p-3 bg-purple-50/30 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-purple-900 text-xs">
              3. 方式三代码示例：搭积木自由组合（左右分栏高密度工作台侧边栏）
            </span>
            <span class="font-mono text-[10px] text-purple-600 bg-white px-2 py-0.5 rounded border border-purple-200">
              src/modules/purchaseOrder/PurchaseOrderRecomposedSidebar.vue
            </span>
          </div>
          <pre class="p-2.5 bg-slate-900 text-slate-100 rounded text-[11px] font-mono overflow-x-auto leading-relaxed">
&lt;template&gt;
  &lt;!-- 自由调整为【左右分栏】架构 --&gt;
  &lt;div class="flex flex-row h-full w-full overflow-hidden"&gt;
    &lt;!-- 左侧 1/3：垂直展示主表单据头 --&gt;
    &lt;div class="w-80 border-r bg-white p-3 overflow-y-auto"&gt;
      &lt;DocHeaderForm :model-value="doc.header" :fields="schema.masterFields" /&gt;
    &lt;/div&gt;

    &lt;!-- 右侧 2/3：工具栏 + 高度撑满的子表网格 + 状态栏 --&gt;
    &lt;div class="flex-1 flex flex-col bg-slate-100"&gt;
      &lt;DocActionToolbar :actions="schema.actions" :doc="doc" @action="handleAction" /&gt;
      &lt;div class="flex-1 min-h-0"&gt;
        &lt;DocEditableGrid table-key="OrderItem" :columns="columns" :data="doc.items" /&gt;
      &lt;/div&gt;
      &lt;DocStatusBar :summary="summary" /&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;</pre>
        </div>
      </div>

      <!-- 底部关闭按钮 -->
      <div class="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
        <button
          type="button"
          @click="$emit('update:visible', false)"
          class="px-4 py-1.5 rounded bg-[#25548d] hover:bg-[#1e4676] active:bg-[#183860] text-white font-medium shadow-2xs text-xs cursor-pointer"
        >
          我知道了，关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, X } from 'lucide-vue-next';

defineProps<{
  visible: boolean;
}>();

defineEmits<{
  (e: 'update:visible', val: boolean): void;
}>();
</script>
