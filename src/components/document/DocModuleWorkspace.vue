<template>
  <div class="flex-1 flex flex-col min-h-0 bg-slate-100 overflow-hidden relative">
    <!-- 1. 模块内专用的 TabPage 组件 (所有新增、查看、调整的 page 页面均在此 TabPage 内显示，绝不溢出到外层) -->
    <TabPageBar
      :tabs="tabs"
      :active-tab-id="activeTabId"
      :doc-total-count="moduleDocs.length"
      @select-tab="onSelectTab"
      @close-tab="onCloseTab"
      @close-other-tabs="onCloseOtherTabs"
      @close-all-doc-tabs="onCloseAllDocTabs"
      @new-doc-tab="onCreateNewDocTab"
    />

    <!-- 2. 模块主视图容器 -->
    <div class="flex-1 flex flex-col min-h-0 relative overflow-hidden">
      <!-- 视图 A: 模块单据台账列表 (在当前模块内部的 TabPage 中展示) -->
      <DocumentListView
        v-if="activeTab && activeTab.type === 'LIST'"
        :documents="moduleDocs"
        @open-doc-detail="onOpenDocDetail"
        @new-document="onCreateNewDocTab"
        @batch-approve="onBatchApprove"
        @delete-document="onDeleteDocument"
        @duplicate-document="onDuplicateDocument"
        @print-document="onPrintDocument"
      />

      <!-- 视图 B: 单据详情主从表调整编辑页 (在当前模块内部的 TabPage 中展示) -->
      <DocumentDetailView
        v-else-if="activeTab && activeTab.type === 'DOCUMENT' && activeDoc"
        :key="activeDoc.header.id"
        :doc="activeDoc"
        :is-dirty="isDirty(activeDoc.header.id)"
        :schema="currentSchema"
        @update-header="onUpdateHeader"
        @update-item-row="onUpdateItemRow"
        @add-item-row="onAddItemRow"
        @duplicate-item-row="onDuplicateItemRow"
        @delete-item-rows="onDeleteItemRows"
        @replace-doc-items="onReplaceDocItems"
        @generate-bulk="onGenerateBulk"
        @update-costs="onUpdateCosts"
        @update-schedule="onUpdateSchedule"
        @update-attachments="onUpdateAttachments"
        @save="onSaveDocument"
        @submit="onSubmitDocument"
        @approve="onApproveDocument"
        @reject="onRejectDocument"
        @duplicate="onDuplicateActiveDocument"
        @delete="onDeleteActiveDocument"
        @close="onCloseCurrentTab"
        @apply-schema="onApplySchema"
      />

      <!-- 空白缺省页保护 -->
      <div
        v-else
        class="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs space-y-2"
      >
        <p>未找到该单据或已从本模块关闭</p>
        <button
          type="button"
          @click="onSelectTab(listTabId)"
          class="px-3 py-1.5 rounded bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
        >
          返回{{ moduleTitle }}台账
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import { State } from '../../store';
import {
  DocumentRecord,
  MasterHeader,
  ItemDetailRow,
  DocumentSchemaConfig,
  CostAllocationRow,
  PaymentScheduleRow,
  AttachmentItem,
  ModuleKey,
} from '../../types/document';
import TabPageBar from './TabPageBar.vue';
import DocumentListView from './DocumentListView.vue';
import DocumentDetailView from './DocumentDetailView.vue';

const props = defineProps<{
  moduleId: ModuleKey;
  moduleTitle: string;
  moduleIcon: string;
}>();

const emit = defineEmits<{
  (e: 'show-toast', msg: string): void;
  (e: 'print-document', doc: DocumentRecord): void;
}>();

const store = useStore<State>();

const tabs = computed(() => store.getters.getModuleTabs(props.moduleId));
const activeTabId = computed(() => store.getters.getModuleActiveTabId(props.moduleId));
const activeDoc = computed(() => store.getters.getModuleActiveDoc(props.moduleId));
const moduleDocs = computed(() => store.getters.getModuleDocuments(props.moduleId));
const currentSchema = computed(() => store.getters.currentSchema);
const isDirty = (docId: string) => store.getters.isDirty(docId);

const listTabId = computed(() =>
  props.moduleId === 'RETURN_ORDER' ? 'tab-ro-list' : 'tab-po-list'
);

const activeTab = computed(() => {
  const currentList = tabs.value;
  return currentList.find((t: any) => t.id === activeTabId.value) || currentList[0];
});

// 模块内部 TabPage 操作 (完全限制在当前模块内部)
const onSelectTab = (tabId: string) => {
  store.commit('SET_MODULE_ACTIVE_TAB', {
    moduleId: props.moduleId,
    tabId,
  });
};

const onCloseTab = (tabId: string) => {
  store.commit('CLOSE_MODULE_TAB', {
    moduleId: props.moduleId,
    tabId,
  });
};

const onCloseOtherTabs = (keepTabId: string) => {
  store.commit('CLOSE_MODULE_OTHER_TABS', {
    moduleId: props.moduleId,
    keepTabId,
  });
  emit('show-toast', `已清理【${props.moduleTitle}】其他单据页签`);
};

const onCloseAllDocTabs = () => {
  store.commit('CLOSE_MODULE_ALL_DOC_TABS', props.moduleId);
  emit('show-toast', `已关闭【${props.moduleTitle}】所有已打开单据`);
};

const onCloseCurrentTab = () => {
  onCloseTab(activeTabId.value);
};

// 模块内部新增单据 (在当前模块的 TabPage 中打开新建单据草稿)
const onCreateNewDocTab = () => {
  store.commit('CREATE_NEW_MODULE_DOC_TAB', props.moduleId);
  emit(
    'show-toast',
    props.moduleId === 'RETURN_ORDER'
      ? '已在退货模块打开新建退货单标签，输入数量金额自动核算'
      : '已在采购模块打开新建采购订单标签，可直接录入明细项'
  );
};

// 模块内部查看/调整单据 (在当前模块的 TabPage 中打开该单据详情)
const onOpenDocDetail = (docId: string) => {
  store.commit('OPEN_MODULE_DOC_TAB', {
    moduleId: props.moduleId,
    docId,
  });
};

// 单据编辑保存事件
const onUpdateHeader = (fields: Partial<MasterHeader>) => {
  if (activeDoc.value) {
    store.commit('UPDATE_HEADER', {
      docId: activeDoc.value.header.id,
      fields,
    });
  }
};

const onUpdateItemRow = (payload: {
  rowId: string;
  fields: Partial<ItemDetailRow>;
  fieldKey?: keyof ItemDetailRow;
}) => {
  if (activeDoc.value) {
    store.commit('UPDATE_ITEM_ROW', {
      docId: activeDoc.value.header.id,
      ...payload,
    });
  }
};

const onAddItemRow = (insertIndex?: number) => {
  if (activeDoc.value) {
    store.commit('ADD_ITEM_ROW', {
      docId: activeDoc.value.header.id,
      insertIndex,
    });
    emit('show-toast', '已在明细子表新增空白录入行');
  }
};

const onDuplicateItemRow = (rowId: string) => {
  if (activeDoc.value) {
    store.commit('DUPLICATE_ITEM_ROW', {
      docId: activeDoc.value.header.id,
      rowId,
    });
    emit('show-toast', '已复制明细行');
  }
};

const onDeleteItemRows = (rowIds: string[]) => {
  if (activeDoc.value) {
    store.commit('DELETE_ITEM_ROWS', {
      docId: activeDoc.value.header.id,
      rowIds,
    });
    emit('show-toast', `已删除 ${rowIds.length} 行明细`);
  }
};

const onReplaceDocItems = (items: ItemDetailRow[]) => {
  if (activeDoc.value) {
    store.commit('REPLACE_DOC_ITEMS', {
      docId: activeDoc.value.header.id,
      items,
    });
    emit('show-toast', `已替换当前明细，共 ${items.length} 行`);
  }
};

const onGenerateBulk = (count: number) => {
  if (activeDoc.value) {
    const t0 = performance.now();
    store.dispatch('generateBulkData', {
      docId: activeDoc.value.header.id,
      count,
    });
    const t1 = performance.now();
    emit(
      'show-toast',
      `已批量生成 ${count.toLocaleString()} 行明细 (耗时 ${(t1 - t0).toFixed(1)}ms)`
    );
  }
};

const onUpdateCosts = (costs: CostAllocationRow[]) => {
  if (activeDoc.value) {
    store.commit('UPDATE_COSTS', {
      docId: activeDoc.value.header.id,
      costs,
    });
  }
};

const onUpdateSchedule = (schedule: PaymentScheduleRow[]) => {
  if (activeDoc.value) {
    store.commit('UPDATE_PAYMENT_SCHEDULE', {
      docId: activeDoc.value.header.id,
      schedule,
    });
  }
};

const onUpdateAttachments = (attachments: AttachmentItem[]) => {
  if (activeDoc.value) {
    store.commit('UPDATE_ATTACHMENTS', {
      docId: activeDoc.value.header.id,
      attachments,
    });
  }
};

const onSaveDocument = () => {
  if (activeDoc.value) {
    store.commit('SAVE_DOCUMENT', activeDoc.value.header.id);
    emit('show-toast', `【${activeDoc.value.header.docNo}】已在当前模块保存`);
  }
};

const onSubmitDocument = () => {
  if (activeDoc.value) {
    store.commit('SUBMIT_DOCUMENT', activeDoc.value.header.id);
    emit('show-toast', '单据已提交送审');
  }
};

const onApproveDocument = () => {
  if (activeDoc.value) {
    store.commit('APPROVE_DOCUMENT', activeDoc.value.header.id);
    emit('show-toast', '单据已审核通过并生效');
  }
};

const onRejectDocument = () => {
  if (activeDoc.value) {
    store.commit('REJECT_DOCUMENT', activeDoc.value.header.id);
    emit('show-toast', '单据已驳回至草稿编制状态');
  }
};

const onBatchApprove = (docIds: string[]) => {
  store.commit('BATCH_APPROVE_DOCUMENTS', docIds);
  emit('show-toast', `已批量核准通过 ${docIds.length} 份单据`);
};

const onDuplicateDocument = (docId: string) => {
  store.commit('DUPLICATE_DOCUMENT', docId);
  emit('show-toast', '已在当前模块复制生成新单据草稿');
};

const onDuplicateActiveDocument = () => {
  if (activeDoc.value) {
    onDuplicateDocument(activeDoc.value.header.id);
  }
};

const onDeleteDocument = (docId: string) => {
  if (confirm('确定要删除或作废该单据吗？')) {
    store.commit('DELETE_DOCUMENT', docId);
    emit('show-toast', '单据已作废并从台账移除');
  }
};

const onDeleteActiveDocument = () => {
  if (activeDoc.value) {
    onDeleteDocument(activeDoc.value.header.id);
  }
};

const onPrintDocument = (doc: DocumentRecord) => {
  emit('print-document', doc);
};

const onApplySchema = (schema: DocumentSchemaConfig) => {
  store.commit('SET_SCHEMA', schema);
  emit('show-toast', `已应用模型规则配置：${schema.title}`);
};
</script>
