<template>
  <div class="bg-slate-200/90 border-b border-slate-300/80 px-2 pt-1 flex items-center justify-between select-none text-xs gap-2">
    <!-- 滚动标签区域 -->
    <div class="flex items-center space-x-1 overflow-x-auto scrollbar-none flex-1 py-0.5">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        @click="$emit('select-tab', tab.id)"
        :class="[
          'group relative flex items-center h-8 px-3 rounded-t-md cursor-pointer transition-all border-t border-l border-r',
          tab.id === activeTabId
            ? 'bg-white text-slate-900 font-semibold border-slate-300 shadow-2xs z-10'
            : 'bg-slate-100/70 text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'
        ]"
        :style="{ maxWidth: tab.type === 'LIST' ? '180px' : '230px' }"
      >
        <!-- 顶部激活指示条 -->
        <span
          v-if="tab.id === activeTabId"
          class="absolute top-0 left-0 right-0 h-0.5 bg-[#25548d] rounded-t"
        />

        <!-- 图标 -->
        <ListFilter
          v-if="tab.type === 'LIST'"
          :class="[
            'w-3.5 h-3.5 mr-1 shrink-0',
            tab.id === activeTabId ? 'text-[#25548d]' : 'text-slate-400 group-hover:text-slate-600'
          ]"
        />
        <div v-else class="mr-1 shrink-0 flex items-center space-x-1">
          <FileText
            :class="[
              'w-3.5 h-3.5',
              tab.id === activeTabId ? 'text-[#25548d]' : 'text-slate-400 group-hover:text-slate-600'
            ]"
          />
          <span
            v-if="tab.status === 'draft'"
            class="erp-dot-sm erp-dot-muted"
            title="草稿"
          />
          <span
            v-else-if="tab.status === 'pending'"
            class="erp-dot-sm erp-dot-info erp-dot-pulse"
            title="待审批"
          />
          <span
            v-else-if="tab.status === 'approved'"
            class="erp-dot-sm erp-dot-success"
            title="已核准"
          />
          <span
            v-else-if="tab.status === 'rejected'"
            class="erp-dot-sm erp-dot-danger"
            title="已驳回"
          />
          <span
            v-else-if="tab.status === 'voided'"
            class="erp-dot-sm erp-dot-voided"
            title="已作废"
          />
        </div>

        <!-- 标签文本 -->
        <span class="truncate pr-1 font-medium">{{ tab.title }}</span>

        <!-- 列表总数徽章 -->
        <span
          v-if="tab.type === 'LIST'"
          class="erp-badge-tab-count group-hover:bg-indigo-100 group-hover:text-indigo-700"
        >
          {{ docTotalCount }}
        </span>

        <!-- 未保存改动小圆点 -->
        <span
          v-if="tab.isDirty"
          class="erp-dot erp-dot-warning erp-dot-pulse mr-1"
          title="有未保存改动"
        />

        <!-- 关闭按钮 -->
        <button
          v-if="tab.closable"
          type="button"
          @click.stop="$emit('close-tab', tab.id)"
          class="ml-1.5 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
          title="关闭标签页"
        >
          <X class="w-3 h-3" />
        </button>
      </div>

      <!-- 快捷新建单据标签按钮组 -->
      <div class="relative flex items-center ml-1.5" ref="newDocMenuRef">
        <button
          type="button"
          @click="$emit('new-doc-tab')"
          class="flex items-center space-x-1 h-7 px-2.5 rounded hover:bg-white/90 text-slate-700 hover:text-indigo-600 transition font-medium text-xs cursor-pointer shadow-2xs bg-slate-100/80"
          title="快捷新建单据标签页"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>新建</span>
        </button>
        <button
          type="button"
          @click="showNewDocMenu = !showNewDocMenu"
          class="h-7 px-1.5 rounded hover:bg-white/90 text-slate-500 hover:text-slate-800 transition cursor-pointer ml-0.5 shadow-2xs bg-slate-100/80"
          title="选择单据类型新建"
        >
          <ChevronDown class="w-3 h-3" />
        </button>

        <div
          v-if="showNewDocMenu"
          class="absolute left-0 top-8 w-44 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs"
        >
          <button
            type="button"
            @click="
              showNewDocMenu = false;
              $emit('new-doc-tab', 'PURCHASE_ORDER');
            "
            class="w-full text-left px-3 py-1.5 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 flex items-center space-x-2 cursor-pointer"
          >
            <span class="text-sm">📦</span>
            <div class="flex flex-col">
              <span class="font-medium">新建采购订单</span>
              <span class="text-[10px] text-slate-400">标准采购单据</span>
            </div>
          </button>
          <button
            type="button"
            @click="
              showNewDocMenu = false;
              $emit('new-doc-tab', 'RETURN_ORDER');
            "
            class="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-slate-700 hover:text-rose-700 flex items-center space-x-2 cursor-pointer"
          >
            <span class="text-sm">🔄</span>
            <div class="flex flex-col">
              <span class="font-medium">新建采购退货单</span>
              <span class="text-[10px] text-slate-400">退货门店与原因核算</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- 右侧标签页管理菜单 -->
    <div class="relative shrink-0 flex items-center" ref="menuRef">
      <button
        type="button"
        @click="showMenu = !showMenu"
        class="flex items-center space-x-1 px-2 py-1 rounded text-slate-600 hover:bg-slate-300/60 hover:text-slate-800 transition"
        title="标签页操作"
      >
        <Layers class="w-3.5 h-3.5" />
        <ChevronDown class="w-3 h-3" />
      </button>

      <div
        v-if="showMenu"
        class="absolute right-0 top-8 w-40 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100"
      >
        <button
          type="button"
          @click="
            showMenu = false;
            $emit('close-other-tabs', activeTabId);
          "
          class="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-700 text-xs flex items-center"
        >
          <X class="w-3.5 h-3.5 mr-2 text-slate-400" />
          关闭其他标签
        </button>
        <button
          type="button"
          @click="
            showMenu = false;
            $emit('close-all-doc-tabs');
          "
          class="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-700 text-xs flex items-center"
        >
          <RotateCcw class="w-3.5 h-3.5 mr-2 text-slate-400" />
          关闭所有单据详情
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { TabPageItem } from '../../types/document';
import {
  ListFilter,
  FileText,
  Plus,
  X,
  Layers,
  ChevronDown,
  RotateCcw,
} from 'lucide-vue-next';

defineProps<{
  tabs: TabPageItem[];
  activeTabId: string;
  docTotalCount: number;
}>();

defineEmits<{
  (e: 'select-tab', tabId: string): void;
  (e: 'close-tab', tabId: string): void;
  (e: 'close-other-tabs', keepTabId: string): void;
  (e: 'close-all-doc-tabs'): void;
  (e: 'new-doc-tab', docType?: 'PURCHASE_ORDER' | 'RETURN_ORDER'): void;
}>();

const showMenu = ref(false);
const menuRef = ref<HTMLDivElement | null>(null);

const showNewDocMenu = ref(false);
const newDocMenuRef = ref<HTMLDivElement | null>(null);

const handleClickOutside = (e: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    showMenu.value = false;
  }
  if (newDocMenuRef.value && !newDocMenuRef.value.contains(e.target as Node)) {
    showNewDocMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>
