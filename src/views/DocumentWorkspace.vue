<template>
  <div :class="['h-screen w-screen flex flex-col bg-slate-900 overflow-hidden font-sans select-none', uiDensity === 'compact' ? 'erp-density-compact' : 'erp-density-standard']">
    <!-- 1. 全局系统顶栏 -->
    <header class="h-10 bg-slate-900 border-b border-slate-800 text-white px-3 flex items-center justify-between text-xs shrink-0">
      <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-2 font-bold text-sm tracking-wide">
          <div class="w-6 h-6 rounded bg-[#25548d] flex items-center justify-center text-white shadow-2xs font-mono font-black text-xs">
            ERP
          </div>
          <span class="text-slate-100">智造云</span>
          <span class="text-[#7ba5d4] font-normal">| 模块化企业主从表单据系统</span>
        </div>

        <span class="text-slate-700">/</span>

        <!-- 顶部快捷模块状态指示 -->
        <div class="hidden sm:flex items-center text-slate-400 text-[11px] space-x-1">
          <span>当前激活模块:</span>
          <span class="text-[#93c5fd] font-semibold">
            {{
              activeModuleId === 'RETURN_ORDER'
                ? '🔄 采购退货单 (RO)'
                : activeModuleId === 'USER_MANAGEMENT'
                ? '👥 用户管理 (pbs_user)'
                : activeModuleId === 'MODULE_MANAGEMENT'
                ? '🧩 模块管理 (pbs_module)'
                : activeModuleId === 'MENU_MANAGEMENT'
                ? '🗂️ 菜单管理 (pbs_menu)'
                : activeModuleId === 'DICT_MANAGEMENT'
                ? '📚 数据字典 (dict)'
                : '📦 采购订单 (PO)'
            }}
          </span>
        </div>
      </div>

      <!-- 右侧操作与用户信息 -->
      <div class="flex items-center space-x-3 text-slate-400 text-[11px]">
        <!-- 密度标识（系统固定紧凑高密模式） -->
        <div class="flex items-center bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          <span class="text-[10px] text-slate-400 mr-1.5 font-medium">显示密度:</span>
          <span class="px-1.5 py-0.2 rounded text-[10px] bg-[#25548d] text-white font-medium shadow-2xs">
            紧凑模式
          </span>
        </div>

        <div class="flex items-center space-x-1 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
          <span class="text-slate-400">总业务单据:</span>
          <strong class="text-[#93c5fd] font-mono font-bold">{{ totalDocCount }}</strong>
        </div>

        <div class="flex items-center space-x-1.5 text-slate-300">
          <div class="erp-dot erp-dot-success erp-dot-pulse"></div>
          <span>当前操作员: <strong>刘工 (主控业务员)</strong></span>
        </div>
      </div>
    </header>

    <!-- 2. 最外层模块级 Page 选项卡导航 (一个模块在最外层就占一个 Page 页) -->
    <OuterModuleTabBar
      :modules="outerModules"
      :active-module-id="activeModuleId"
      :get-opened-count="getModuleOpenedDocCount"
      :has-dirty="hasModuleDirty"
      @select-module="onSwitchModule"
    />

    <!-- 3. 主体工作区 (每个模块对应一个独立的 Page 工作空间，内部各自含有专属 TabPage 组件) -->
    <main class="flex-1 flex flex-col min-h-0 relative overflow-hidden">
      <!-- 模块 1: 采购订单模块 Page (内部具有专属 TabPage 组件) -->
      <div
        v-show="activeModuleId === 'PURCHASE_ORDER'"
        class="flex-1 flex flex-col min-h-0 relative overflow-hidden"
      >
        <DocModuleWorkspace
          module-id="PURCHASE_ORDER"
          module-title="采购订单"
          module-icon="📦"
          @show-toast="showToast"
          @print-document="onPrintDocument"
        />
      </div>

      <!-- 模块 2: 采购退货单模块 Page (内部具有专属 TabPage 组件) -->
      <div
        v-show="activeModuleId === 'RETURN_ORDER'"
        class="flex-1 flex flex-col min-h-0 relative overflow-hidden"
      >
        <DocModuleWorkspace
          module-id="RETURN_ORDER"
          module-title="采购退货单"
          module-icon="🔄"
          @show-toast="showToast"
          @print-document="onPrintDocument"
        />
      </div>

      <!-- 模块 3: 用户管理模块 Page (基于 pbs_user 表结构实现的高保真用户中心) -->
      <div
        v-show="activeModuleId === 'USER_MANAGEMENT'"
        class="flex-1 flex flex-col min-h-0 relative overflow-hidden"
      >
        <UserManagementWorkspace />
      </div>

      <!-- 模块 4: 模块管理模块 Page (基于 pbs_module 表结构实现的功能定义与位掩码权限中心) -->
      <div
        v-show="activeModuleId === 'MODULE_MANAGEMENT'"
        class="flex-1 flex flex-col min-h-0 relative overflow-hidden"
      >
        <ModuleManagementWorkspace />
      </div>

      <!-- 模块 5: 菜单管理模块 Page (基于 pbs_menufolder & pbs_menufolderitem 实现的多级菜单树与模块挂载) -->
      <div
        v-show="activeModuleId === 'MENU_MANAGEMENT'"
        class="flex-1 flex flex-col min-h-0 relative overflow-hidden"
      >
        <MenuManagementWorkspace />
      </div>

      <!-- 模块 6: 数据字典管理模块 Page (基于平台/租户/组织多级覆盖、版本审计与二级缓存) -->
      <div
        v-show="activeModuleId === 'DICT_MANAGEMENT'"
        class="flex-1 flex flex-col min-h-0 relative overflow-hidden"
      >
        <DictManagementWorkspace />
      </div>
    </main>

    <!-- 全局轻量级 Toast 提示 -->
    <div
      v-if="toastMsg"
      class="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center space-x-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      <span class="erp-dot erp-dot-success"></span>
      <span>{{ toastMsg }}</span>
    </div>

    <!-- 全局套打预览弹窗 (列表或详情页触发) -->
    <PrintPreviewModal
      v-if="printTargetDoc"
      :visible="!!printTargetDoc"
      :doc="printTargetDoc"
      @close="printTargetDoc = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { State } from '../store';
import { DocumentRecord, ModuleKey } from '../types/document';
import OuterModuleTabBar from '../components/document/OuterModuleTabBar.vue';
import DocModuleWorkspace from '../components/document/DocModuleWorkspace.vue';
import UserManagementWorkspace from '../modules/userManagement/UserManagementWorkspace.vue';
import ModuleManagementWorkspace from '../modules/moduleManagement/ModuleManagementWorkspace.vue';
import MenuManagementWorkspace from '../modules/menuManagement/MenuManagementWorkspace.vue';
import DictManagementWorkspace from '../modules/dictManagement/DictManagementWorkspace.vue';
import PrintPreviewModal from '../components/document/PrintPreviewModal.vue';
import { message } from 'ant-design-vue';

const store = useStore<State>();

const activeModuleId = computed<ModuleKey>(() => store.getters.activeModuleId);
const outerModules = computed(() => store.getters.outerModules);
const totalDocCount = computed(() => store.getters.documents.length);
const uiDensity = computed<'compact' | 'standard'>(() => store.getters.uiDensity);

const setDensity = (density: 'compact' | 'standard') => {
  store.commit('SET_UI_DENSITY', density);
  message.success(`已切换至${density === 'compact' ? '紧凑高密模式' : '标准舒适模式'}`);
};

const toastMsg = ref<string | null>(null);
const printTargetDoc = ref<DocumentRecord | null>(null);

const showToast = (msg: string) => {
  message.info(msg);
  toastMsg.value = msg;
  setTimeout(() => {
    if (toastMsg.value === msg) {
      toastMsg.value = null;
    }
  }, 2500);
};

// 切换最外层的业务模块 Page
const onSwitchModule = (moduleId: ModuleKey) => {
  store.commit('SET_ACTIVE_MODULE', moduleId);
  const targetMod = outerModules.value.find((m: any) => m.id === moduleId);
  showToast(`已切换至外层业务模块：${targetMod?.title || moduleId}`);
};

// 获取各模块内部打开的单据详情页数量
const getModuleOpenedDocCount = (moduleId: ModuleKey): number => {
  const tabs = store.getters.getModuleTabs(moduleId);
  return tabs.filter((t: any) => t.type === 'DOCUMENT').length;
};

// 检查某个模块内是否有未保存的草稿改动
const hasModuleDirty = (moduleId: ModuleKey): boolean => {
  const tabs = store.getters.getModuleTabs(moduleId);
  return tabs.some((t: any) => t.isDirty);
};

const onPrintDocument = (doc: DocumentRecord) => {
  printTargetDoc.value = doc;
};
</script>
