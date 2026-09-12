<template>
  <div class="bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between select-none text-xs shrink-0">
    <!-- 最外层业务模块 TabPage 导航栏 (一个模块在最外层占一个 Page 页) -->
    <div class="flex items-center space-x-1.5 py-1">
      <div class="text-[11px] font-semibold text-slate-400 mr-2 flex items-center space-x-1">
        <Layers class="w-3.5 h-3.5 text-[#7ba5d4]" />
        <span class="tracking-wide">业务模块中心:</span>
      </div>

      <button
        v-for="mod in modules"
        :key="mod.id"
        type="button"
        @click="$emit('select-module', mod.id)"
        :class="[
          'relative flex items-center h-8 px-3 rounded-t text-xs font-medium transition-all duration-150 cursor-pointer border-t border-x',
          mod.id === activeModuleId
            ? 'bg-slate-800 text-white border-[#25548d] shadow-xs'
            : 'bg-slate-900/60 text-slate-400 border-transparent hover:bg-slate-800/60 hover:text-slate-200'
        ]"
      >
        <!-- 激活高亮边角指示条 -->
        <span
          v-if="mod.id === activeModuleId"
          class="absolute bottom-0 left-2 right-2 h-0.5 bg-[#3a79c3] rounded-full"
        />

        <!-- 模块图标 -->
        <span class="mr-2 text-sm">{{ mod.icon }}</span>

        <!-- 模块标题与编码 -->
        <div class="flex items-center space-x-1.5">
          <span :class="mod.id === activeModuleId ? 'font-semibold text-slate-100' : ''">
            {{ mod.title }}
          </span>
          <span
            :class="[
              'erp-badge-code',
              mod.id === activeModuleId ? 'erp-badge-code-active' : 'erp-badge-code-idle'
            ]"
          >
            {{ mod.code }}
          </span>
        </div>

        <!-- 模块内部打开的单据 Tab 计数器 -->
        <span
          v-if="getOpenedCount(mod.id) > 0"
          :class="[
            'erp-badge-counter ml-2',
            mod.id === activeModuleId ? 'erp-badge-counter-active' : 'erp-badge-counter-idle'
          ]"
          :title="`该模块内部已打开 ${getOpenedCount(mod.id)} 份单据详情`"
        >
          {{ getOpenedCount(mod.id) }}
        </span>

        <!-- 模块内有未保存脏数据时的小圆点 -->
        <span
          v-if="hasDirty(mod.id)"
          class="erp-dot erp-dot-warning erp-dot-pulse ml-1.5"
          title="该模块内有尚未保存的单据改动"
        />
      </button>
    </div>

    <!-- 右侧系统辅助说明 -->
    <div class="hidden md:flex items-center space-x-3 text-slate-400 text-[11px]">
      <span class="text-slate-500">
        外层模块页签独立隔离 • 内部各含专属 TabPage
      </span>
      <div class="h-3 w-px bg-slate-800" />
      <div class="flex items-center space-x-1 text-slate-300">
        <span class="erp-dot-sm erp-dot-success" />
        <span>系统架构: <strong>双层 TabPage 模块化工作空间</strong></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Layers } from 'lucide-vue-next';
import { ModuleKey, OuterModuleTabItem } from '../../types/document';

const props = defineProps<{
  modules: OuterModuleTabItem[];
  activeModuleId: ModuleKey;
  getOpenedCount: (moduleId: ModuleKey) => number;
  hasDirty: (moduleId: ModuleKey) => boolean;
}>();

defineEmits<{
  (e: 'select-module', moduleId: ModuleKey): void;
}>();
</script>
