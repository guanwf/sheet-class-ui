<template>
  <div class="flex-1 flex flex-col min-h-0 bg-slate-100 overflow-hidden relative">
    <!-- 业务逻辑浮动通知条 (Toast Container) -->
    <div class="absolute top-12 right-6 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm">
      <transition-group
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'p-3 rounded-lg shadow-lg text-xs font-medium border flex items-center space-x-2 pointer-events-auto',
            toast.type === 'error' ? 'bg-rose-50 border-rose-300 text-rose-800' :
            toast.type === 'warning' ? 'bg-amber-50 border-amber-300 text-amber-800' :
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
            'bg-slate-800 border-slate-700 text-white'
          ]"
        >
          <AlertCircle v-if="toast.type === 'error' || toast.type === 'warning'" class="w-4 h-4 shrink-0" />
          <CheckCircle2 v-else-if="toast.type === 'success'" class="w-4 h-4 shrink-0" />
          <Info v-else class="w-4 h-4 shrink-0" />
          <span>{{ toast.text }}</span>
        </div>
      </transition-group>
    </div>

    <!-- 顶部核心导航：3 种布局方式交互切换栏 -->
    <div class="px-4 py-2 bg-slate-900 text-slate-300 text-xs border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 select-none shadow-sm z-10">
      <!-- 左侧：3 种布局模式切换 Pills -->
      <div class="flex items-center space-x-2 flex-wrap">
        <span class="font-bold text-white flex items-center space-x-1.5 mr-1">
          <Layout class="w-4 h-4 text-indigo-400" />
          <span>页面布局模式切换：</span>
        </span>

        <!-- 模式 1 按钮 -->
        <button
          type="button"
          @click="layoutMode = 'config'"
          :class="[
            'px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5',
            layoutMode === 'config'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          ]"
        >
          <span class="erp-dot" :class="layoutMode === 'config' ? 'bg-white' : 'bg-indigo-400'"></span>
          <span>1. 配置驱动 (schema.ts)</span>
        </button>

        <!-- 模式 2 按钮 -->
        <button
          type="button"
          @click="layoutMode = 'slot'"
          :class="[
            'px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5',
            layoutMode === 'slot'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          ]"
        >
          <span class="erp-dot" :class="layoutMode === 'slot' ? 'bg-white' : 'bg-amber-400'"></span>
          <span>2. 插槽定制 (Vue Slots)</span>
        </button>

        <!-- 模式 3 按钮 -->
        <button
          type="button"
          @click="layoutMode = 'recomposed'"
          :class="[
            'px-3 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5',
            layoutMode === 'recomposed'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          ]"
        >
          <span class="erp-dot" :class="layoutMode === 'recomposed' ? 'bg-white' : 'bg-purple-400'"></span>
          <span>3. 自由重组 (左右分栏)</span>
        </button>
      </div>

      <!-- 右侧：代码指南速查与报文查看 -->
      <div class="flex items-center space-x-2">
        <button
          type="button"
          @click="showGuideModal = true"
          class="inline-flex items-center px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/40 font-medium text-xs transition"
          title="查看 3 种布局方式写在哪个文件与示例代码"
        >
          <BookOpen class="w-3.5 h-3.5 mr-1 text-indigo-400" />
          查看代码写在哪里 (Where to write)
        </button>

        <button
          type="button"
          @click="openDeltaModal"
          class="inline-flex items-center px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono text-xs transition"
          title="查看 master + slaves 增量提交格式 (_flag: I/U/D/N)"
        >
          <FileCode2 class="w-3.5 h-3.5 mr-1 text-slate-400" />
          增量报文
        </button>
      </div>
    </div>

    <!-- 模式 1 专有：交互式 schema 配置调参演示面板 -->
    <div
      v-if="layoutMode === 'config'"
      class="px-4 py-2 bg-indigo-50/80 border-b border-indigo-200 text-xs text-indigo-900 flex flex-wrap items-center justify-between gap-3 shrink-0"
    >
      <div class="flex items-center space-x-2">
        <span class="font-bold text-indigo-700 flex items-center space-x-1">
          <Settings2 class="w-4 h-4 text-indigo-600" />
          <span>【方式一演示】改配置调排版 (schema.ts 动态响应)：</span>
        </span>
        <span class="text-indigo-600 hidden md:inline text-[11px]">
          点击下方按钮调整 span 栅格占比 (1~6列)，观察主表如何自动响应重排：
        </span>
      </div>

      <!-- 动态交互微调按钮组 -->
      <div class="flex items-center space-x-3 text-[11px] flex-wrap gap-y-1">
        <!-- 单据日期 span -->
        <div class="flex items-center space-x-1 bg-white px-2 py-0.5 rounded border border-indigo-200">
          <span class="text-slate-600 font-medium">日期宽度:</span>
          <button
            v-for="s in [1, 2, 3]"
            :key="s"
            type="button"
            @click="setFieldSpan('docDate', s)"
            :class="[
              'px-1.5 py-0.2 rounded font-mono font-bold',
              getFieldSpan('docDate') === s ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-indigo-50'
            ]"
          >
            {{ s }}格
          </button>
        </div>

        <!-- 供应商 span -->
        <div class="flex items-center space-x-1 bg-white px-2 py-0.5 rounded border border-indigo-200">
          <span class="text-slate-600 font-medium">供应商宽度:</span>
          <button
            v-for="s in [1, 2, 3, 4]"
            :key="s"
            type="button"
            @click="setFieldSpan('partnerId', s)"
            :class="[
              'px-1.5 py-0.2 rounded font-mono font-bold',
              getFieldSpan('partnerId') === s ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-indigo-50'
            ]"
          >
            {{ s }}格
          </button>
        </div>

        <!-- 交货地址 span -->
        <div class="flex items-center space-x-1 bg-white px-2 py-0.5 rounded border border-indigo-200">
          <span class="text-slate-600 font-medium">地址宽度:</span>
          <button
            v-for="s in [2, 3, 4, 6]"
            :key="s"
            type="button"
            @click="setFieldSpan('deliveryAddress', s)"
            :class="[
              'px-1.5 py-0.2 rounded font-mono font-bold',
              getFieldSpan('deliveryAddress') === s ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-indigo-50'
            ]"
          >
            {{ s }}格
          </button>
        </div>

        <button
          type="button"
          @click="resetConfigSpans"
          class="text-indigo-600 hover:text-indigo-800 underline font-medium text-[11px]"
        >
          重置默认
        </button>
      </div>
    </div>

    <!-- 模式 2 专有：插槽定制说明条 -->
    <div
      v-else-if="layoutMode === 'slot'"
      class="px-4 py-1.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2 shrink-0"
    >
      <div class="flex items-center space-x-2">
        <span class="font-bold text-amber-800 flex items-center space-x-1">
          <Sparkles class="w-4 h-4 text-amber-600" />
          <span>【方式二演示】使用 Vue 插槽局部/整块覆盖：</span>
        </span>
        <span class="text-amber-700 text-[11px]">
          已激活：① <code>#master-layout</code> 替换主表为业务卡片；② <code>#cell-itemCode</code> 增加徽标；③ <code>#footer-left</code> 增加预算执行率。
        </span>
      </div>
      <span class="text-[10px] font-mono text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
        业务模板位于 src/modules/[当前模块]/
      </span>
    </div>

    <!-- 模式 3 专有：架构自由重组说明条 -->
    <div
      v-else-if="layoutMode === 'recomposed'"
      class="px-4 py-1.5 bg-purple-50 border-b border-purple-200 text-xs text-purple-900 flex items-center justify-between gap-2 shrink-0"
    >
      <div class="flex items-center space-x-2">
        <span class="font-bold text-purple-800 flex items-center space-x-1">
          <Columns3 class="w-4 h-4 text-purple-600" />
          <span>【方式三演示】搭积木式自由组合（左右分栏高密度工作台）：</span>
        </span>
        <span class="text-purple-700 text-[11px]">
          彻底打破上下堆叠结构！左侧独立嵌入主表表头与客商卡片，右侧整屏嵌入工具栏与子表虚拟滚动网格。
        </span>
      </div>
      <span class="text-[10px] font-mono text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded border border-purple-300">
        业务模板位于 src/modules/[当前模块]/
      </span>
    </div>

    <!-- ============================================================== -->
    <!-- 视图呈现区：根据 layoutMode 渲染不同的排版结构                   -->
    <!-- ============================================================== -->

    <!-- 【排版 A: 上下堆叠结构 (用于模式 1 配置驱动 与 模式 2 插槽定制)】 -->
    <template v-if="layoutMode === 'config' || layoutMode === 'slot'">
      <!-- 2.2.1 按钮栏组件 (配置化按钮组、状态机、权限驱动) -->
      <DocActionToolbar
        :actions="activeModuleConfig.actions"
        :doc="doc"
        :is-read-only="isReadOnly"
        :is-dirty="isDirty"
        @action="handleToolbarAction"
      />

      <!-- 2.2.2 主表部分 (配置驱动 6 列栅格 VS 插槽自定义卡片覆盖) -->
      <DocHeaderForm
        :model-value="doc.header"
        :fields="dynamicMasterFields"
        :title="activeModuleConfig.moduleName"
        :readonly="isReadOnly"
        @update:model-value="$emit('update-header', $event)"
      >
        <!-- 方式二激活时，传入 #master-layout 插槽：由具体业务模块自带的 MasterSlotComponent 自治渲染 -->
        <template v-if="layoutMode === 'slot'" #master-layout="{ master, readonly, updateField }">
          <component
            :is="activeModule.MasterSlotComponent"
            :master="master"
            :readonly="readonly"
            :update-field="updateField"
          />
        </template>
      </DocHeaderForm>

      <!-- 2.2.3 子表部分 (多从表、独立可编辑网格、无分页、虚拟滚动、自动汇总与差集追踪) -->
      <DocumentTabs
        :items="doc.items"
        :costs="doc.costs"
        :schedule="doc.paymentSchedule"
        :attachments="doc.attachments"
        :logs="doc.logs"
        :columns="activeSlaveColumns"
        :table-key="activeModule.slaveTableKey"
        :items-title="activeModule.itemsTitle"
        :is-return-order="activeModule.isReturnOrder"
        :is-read-only="isReadOnly"
        :enable-custom-cell="layoutMode === 'slot'"
        :enable-filter="activeModule.enableGridFilter"
        :enable-sort="activeModule.enableGridSort"
        @update-item-row="onItemRowUpdate"
        @add-item-row="$emit('add-item-row', $event)"
        @duplicate-item-row="$emit('duplicate-item-row', $event)"
        @delete-item-rows="$emit('delete-item-rows', $event)"
        @generate-bulk="$emit('generate-bulk', $event)"
        @open-batch-add="showBatchModal = true"
        @update-costs="$emit('update-costs', $event)"
        @update-schedule="$emit('update-schedule', $event)"
        @update-attachments="$emit('update-attachments', $event)"
        @replace-doc-items="$emit('replace-doc-items', $event)"
      />

      <!-- 2.2.4 底部状态栏组件 -->
      <DocStatusBar :summary="summary">
        <!-- 方式二插槽演示：左侧追加预算执行率 -->
        <template v-if="layoutMode === 'slot'" #footer-left>
          <div class="flex items-center space-x-1.5 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/50 text-amber-300 font-mono text-[11px]">
            <span>⚡ 预算执行率 82.4%</span>
          </div>
        </template>

        <!-- 方式二插槽演示：右侧追加专属单据防伪哈希 -->
        <template v-if="layoutMode === 'slot'" #footer-right>
          <span class="text-indigo-400 font-mono text-[11px]">单据哈希: {{ doc.header.id.slice(-8) }}</span>
        </template>
      </DocStatusBar>
    </template>

    <!-- 【排版 B: 架构自由重组 (用于模式 3: 左右分栏高密度布局)】 -->
    <template v-else-if="layoutMode === 'recomposed'">
      <div class="flex-1 flex flex-row min-h-0 overflow-hidden">
        <!-- 左侧固定边栏：垂直单据头卡片 -->
        <div class="w-80 md:w-96 bg-white border-r border-slate-200 flex flex-col min-h-0 shrink-0 shadow-xs">
          <div class="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div class="flex items-center space-x-2">
              <FileText class="w-4 h-4 text-indigo-600" />
              <h3 class="font-bold text-xs text-slate-800">单据头信息 (左栏紧凑呈现)</h3>
            </div>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-mono font-semibold">
              搭积木布局
            </span>
          </div>

          <div class="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
            <!-- 单号与状态 -->
            <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-slate-400 block">单据编号</span>
                <span class="font-mono font-bold text-indigo-700 text-sm">{{ doc.header.docNo }}</span>
              </div>
              <span
                v-if="doc.header.status === 'approved'"
                class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800"
              >
                已核准
              </span>
              <span
                v-else-if="doc.header.status === 'pending'"
                class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800"
              >
                待审核
              </span>
              <span
                v-else
                class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800"
              >
                草稿
              </span>
            </div>

            <!-- 具体业务模块自带的 RecomposedSidebarComponent 自治渲染 -->
            <component
              :is="activeModule.RecomposedSidebarComponent"
              :doc="doc"
              :is-read-only="isReadOnly"
              @update-header="$emit('update-header', $event)"
            />
          </div>
        </div>

        <!-- 右侧工作区：弹性撑满剩余宽度，最大化子表网格编辑空间 -->
        <div class="flex-1 flex flex-col min-h-0 bg-slate-100 overflow-hidden">
          <!-- 按钮栏 -->
          <DocActionToolbar
            :actions="activeModuleConfig.actions"
            :doc="doc"
            :is-read-only="isReadOnly"
            :is-dirty="isDirty"
            @action="handleToolbarAction"
          />

          <!-- 充满剩余所有高度的多从表网格 (沉浸式海量明细录入) -->
          <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
            <DocumentTabs
              :items="doc.items"
              :costs="doc.costs"
              :schedule="doc.paymentSchedule"
              :attachments="doc.attachments"
              :logs="doc.logs"
              :columns="activeSlaveColumns"
              :table-key="activeModule.slaveTableKey"
              :items-title="activeModule.itemsTitle"
              :is-return-order="activeModule.isReturnOrder"
              :is-read-only="isReadOnly"
              :enable-filter="activeModule.enableGridFilter"
              :enable-sort="activeModule.enableGridSort"
              @update-item-row="onItemRowUpdate"
              @add-item-row="$emit('add-item-row', $event)"
              @duplicate-item-row="$emit('duplicate-item-row', $event)"
              @delete-item-rows="$emit('delete-item-rows', $event)"
              @generate-bulk="$emit('generate-bulk', $event)"
              @open-batch-add="showBatchModal = true"
              @update-costs="$emit('update-costs', $event)"
              @update-schedule="$emit('update-schedule', $event)"
              @update-attachments="$emit('update-attachments', $event)"
            />
          </div>

          <!-- 底部汇总状态栏 -->
          <DocStatusBar :summary="summary" />
        </div>
      </div>
    </template>

    <!-- 弹窗 1: 3种方式在工程中的写法速查指南 -->
    <LayoutGuideModal
      :visible="showGuideModal"
      @update:visible="showGuideModal = $event"
    />

    <!-- 弹窗 2: 增量报文 JSON 预览弹窗 -->
    <DocDeltaPayloadModal
      :visible="showDeltaModal"
      :payload="currentDeltaPayload"
      @update:visible="showDeltaModal = $event"
    />

    <!-- 弹窗 3: 打印预览弹窗 -->
    <PrintPreviewModal
      :visible="showPrintModal"
      :doc="doc"
      @close="showPrintModal = false"
    />

    <!-- 弹窗 4: 批量快速录入弹窗 -->
    <QuickBatchAddModal
      :visible="showBatchModal"
      @close="showBatchModal = false"
      @import-items="onBatchImport"
    />

    <!-- 弹窗 5: 模型配置弹窗 -->
    <SchemaConfigModal
      :visible="showSchemaModal"
      :current-schema="schema"
      @close="showSchemaModal = false"
      @apply-schema="$emit('apply-schema', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  FileCode2,
  AlertCircle,
  CheckCircle2,
  Info,
  Layout,
  Settings2,
  Sparkles,
  Columns3,
  BookOpen,
  FileText,
} from 'lucide-vue-next';
import {
  DocumentRecord,
  MasterHeader,
  ItemDetailRow,
  DocumentSchemaConfig,
  CostAllocationRow,
  PaymentScheduleRow,
  AttachmentItem,
} from '../../types/document';
import { computeDocumentSummary } from '../../utils/formulas';
import {
  DocActionToolbar,
  DocHeaderForm,
  DocStatusBar,
  DocDeltaPayloadModal,
  DeltaPayload,
  MasterFieldConfig,
  DocModuleConfig,
  SlaveColumnConfig,
} from '../../engine';
import { getBusinessModule, BusinessModuleDefinition } from '../../modules';

import DocumentTabs from './DocumentTabs.vue';
import PrintPreviewModal from './PrintPreviewModal.vue';
import QuickBatchAddModal from './QuickBatchAddModal.vue';
import SchemaConfigModal from './SchemaConfigModal.vue';
import LayoutGuideModal from './LayoutGuideModal.vue';

const props = defineProps<{
  doc: DocumentRecord;
  isDirty: boolean;
  schema: DocumentSchemaConfig;
}>();

const emit = defineEmits<{
  (e: 'update-header', fields: Partial<MasterHeader>): void;
  (e: 'update-item-row', payload: { rowId: string; fields: Partial<ItemDetailRow>; fieldKey?: keyof ItemDetailRow }): void;
  (e: 'add-item-row', insertIndex?: number): void;
  (e: 'duplicate-item-row', rowId: string): void;
  (e: 'delete-item-rows', rowIds: string[]): void;
  (e: 'generate-bulk', count: number): void;
  (e: 'replace-doc-items', items: ItemDetailRow[]): void;
  (e: 'update-costs', costs: CostAllocationRow[]): void;
  (e: 'update-schedule', schedule: PaymentScheduleRow[]): void;
  (e: 'update-attachments', attachments: AttachmentItem[]): void;
  (e: 'save'): void;
  (e: 'submit'): void;
  (e: 'approve'): void;
  (e: 'reject'): void;
  (e: 'duplicate'): void;
  (e: 'delete'): void;
  (e: 'close'): void;
  (e: 'apply-schema', schema: DocumentSchemaConfig): void;
}>();

// 动态获取当前单据对应的业务模块（含配置、生命周期/联动逻辑、插槽卡片组件、重组卡片组件、增量报文生成器）
const activeModule = computed<BusinessModuleDefinition>(() => {
  return getBusinessModule(props.doc.header.docType);
});

// 当前激活的模块元配置
const activeModuleConfig = computed<DocModuleConfig>(() => activeModule.value.config);

// 当前子表列配置
const activeSlaveColumns = computed<SlaveColumnConfig[]>(() => activeModule.value.slaveColumns);

// 3 种页面布局模式：'config' (配置驱动) | 'slot' (插槽定制) | 'recomposed' (左右分栏)
const layoutMode = ref<'config' | 'slot' | 'recomposed'>('config');
const showGuideModal = ref(false);

// 方式一专用：响应式维护当前字段配置列表（用于交互演示动态改变 span 后的栅格自动重排）
const dynamicMasterFields = ref<MasterFieldConfig[]>([]);

watch(
  () => [props.doc.header.docType, props.doc.header.id],
  () => {
    const base = activeModule.value.config.masterFields;
    dynamicMasterFields.value = JSON.parse(JSON.stringify(base));
  },
  { immediate: true }
);

function getFieldSpan(key: string): number {
  const f = dynamicMasterFields.value.find((item) => item.key === key);
  return f?.span || 1;
}

function setFieldSpan(key: string, span: number) {
  const f = dynamicMasterFields.value.find((item) => item.key === key);
  if (f) {
    f.span = span as any;
  }
}

function resetConfigSpans() {
  const base = activeModule.value.config.masterFields;
  dynamicMasterFields.value = JSON.parse(JSON.stringify(base));
}

// 统一引入业务模块逻辑 Hook
const activeLogic = computed(() => activeModule.value.logic);
const toasts = computed(() => activeLogic.value.toasts.value);
const showToast = (msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  activeLogic.value.showToast(msg, type);
};

const showPrintModal = ref(false);
const showBatchModal = ref(false);
const showSchemaModal = ref(false);
const showDeltaModal = ref(false);

const isReadOnly = computed(() => {
  return props.doc.header.status === 'approved' || props.doc.header.status === 'voided';
});

const summary = computed(() => {
  return computeDocumentSummary(props.doc.items, props.doc.header.currency);
});

// 构建符合规范的 master + slaves 增量格式 Payload
const currentDeltaPayload = computed<DeltaPayload>(() => {
  return activeModule.value.buildDeltaPayload(props.doc, props.isDirty);
});

function openDeltaModal() {
  showDeltaModal.value = true;
}

// 拦截并执行业务模块单元格联动（如输入数量和价格自动计算出合计金额，禁止负数）
function onItemRowUpdate(payload: {
  rowId: string;
  fields: Partial<ItemDetailRow>;
  fieldKey?: keyof ItemDetailRow;
}) {
  const row = props.doc.items.find((r) => r.id === payload.rowId);
  if (row && payload.fieldKey) {
    activeLogic.value.handleCellChange({
      row,
      field: payload.fieldKey,
      value: payload.fields[payload.fieldKey],
      oldValue: (row as any)[payload.fieldKey],
    });
  }
  emit('update-item-row', payload);
}

// 统一响应按钮栏动作
function handleToolbarAction(code: string) {
  switch (code) {
    case 'save':
      emit('save');
      break;
    case 'submit': {
      const check = activeLogic.value.validateBeforeSubmit(props.doc.header, props.doc.items);
      if (!check.valid) {
        showToast(check.message || '单据校验未通过', 'error');
        return;
      }
      emit('submit');
      break;
    }
    case 'approve':
      emit('approve');
      break;
    case 'reject':
      emit('reject');
      break;
    case 'previewDelta':
      openDeltaModal();
      break;
    case 'duplicate':
      emit('duplicate');
      break;
    case 'print':
      showPrintModal.value = true;
      break;
    case 'delete':
      emit('delete');
      break;
    default:
      break;
  }
}

const onBatchImport = (importedItems: ItemDetailRow[]) => {
  const merged = [...props.doc.items, ...importedItems].map((item, idx) => ({
    ...item,
    rowNo: idx + 1,
  }));
  emit('replace-doc-items', merged);
};
</script>
