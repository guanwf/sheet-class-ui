<template>
  <a-modal
    :open="visible"
    title="从系统模块库选择模块加入菜单"
    :width="920"
    :mask-closable="false"
    :keyboard="false"
    destroy-on-close
    @cancel="handleCancel"
    @ok="handleConfirm"
    ok-text="确认引入到当前目录"
    cancel-text="取消"
    :ok-button-props="{ disabled: selectedModules.length === 0 }"
  >
    <div class="space-y-3.5 text-xs select-none max-h-[75vh] overflow-y-auto px-1 py-1">
      <!-- 目标挂载目录提示 -->
      <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-[11px] text-blue-900">
        <div class="flex items-center space-x-2">
          <FolderCheck class="w-4 h-4 text-[#25548d]" />
          <span>目标挂载目录：</span>
          <strong class="text-slate-900 text-xs px-2 py-0.5 bg-white border border-blue-200 rounded">
            📁 {{ currentFolder ? currentFolder.caption : '顶级目录 (根节点)' }}
          </strong>
          <span class="text-slate-400">|</span>
          <span class="text-blue-700">根据 <code>pbs_menufolderitem_UQ01</code> 约束，每个业务模块在全系统菜单中具有全局唯一映射。</span>
        </div>

        <div class="text-[11px] text-slate-500 font-mono">
          已选 <strong class="text-[#25548d] font-bold">{{ selectedModules.length }}</strong> 个模块
        </div>
      </div>

      <!-- 搜索与状态过滤器 -->
      <div class="flex items-center justify-between gap-3">
        <div class="relative flex-1 max-w-sm">
          <input
            type="text"
            v-model="keyword"
            placeholder="搜索模块ID、名称、提示信息或操作URL..."
            class="w-full pl-8 pr-7 py-1.5 rounded border border-slate-300 text-xs focus:outline-hidden focus:border-[#25548d] transition"
          />
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <button
            v-if="keyword"
            type="button"
            @click="keyword = ''"
            class="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div class="flex items-center space-x-2 text-slate-600">
          <label class="inline-flex items-center space-x-1.5 cursor-pointer">
            <input
              type="checkbox"
              v-model="hideMounted"
              class="rounded border-slate-300 text-[#25548d] focus:ring-0 cursor-pointer"
            />
            <span>仅显示未挂载模块 (可引入)</span>
          </label>
        </div>
      </div>

      <!-- 模块网格选择列表 -->
      <div class="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
              <th class="w-10 py-2.5 px-3 text-center">选择</th>
              <th class="py-2.5 px-3">模块ID (module_id)</th>
              <th class="py-2.5 px-3">模块名称 (module_name)</th>
              <th class="py-2.5 px-3">业务提示 (hint)</th>
              <th class="py-2.5 px-3">操作类型与URL</th>
              <th class="py-2.5 px-3 text-center">挂载状态</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="mod in filteredModuleList"
              :key="mod.module_id"
              @click="toggleSelect(mod)"
              :class="[
                'transition select-none',
                isMounted(mod.module_id)
                  ? 'bg-slate-50/70 text-slate-400 cursor-not-allowed'
                  : isSelected(mod.module_id)
                  ? 'bg-blue-50/70 hover:bg-blue-50 cursor-pointer'
                  : 'hover:bg-slate-50/90 cursor-pointer'
              ]"
            >
              <!-- 复选框 -->
              <td class="py-2.5 px-3 text-center" @click.stop>
                <input
                  type="checkbox"
                  :disabled="isMounted(mod.module_id)"
                  :checked="isSelected(mod.module_id)"
                  @change="toggleSelect(mod)"
                  class="rounded border-slate-300 text-[#25548d] focus:ring-0 cursor-pointer disabled:opacity-40"
                />
              </td>

              <!-- 模块ID -->
              <td class="py-2.5 px-3">
                <span class="font-mono font-bold text-[#25548d] text-[11px]">
                  {{ mod.module_id }}
                </span>
              </td>

              <!-- 模块名称 -->
              <td class="py-2.5 px-3">
                <div class="font-medium text-slate-800 flex items-center space-x-1.5">
                  <span>{{ mod.module_name }}</span>
                  <span
                    v-if="mod.flag === 0"
                    class="px-1 py-0.2 rounded text-[9px] bg-rose-50 text-rose-600 border border-rose-200"
                  >
                    已停用
                  </span>
                </div>
              </td>

              <!-- 提示 -->
              <td class="py-2.5 px-3 text-[11px] text-slate-500 max-w-[200px] truncate" :title="mod.hint">
                {{ mod.hint || '-' }}
              </td>

              <!-- 操作类型与URL -->
              <td class="py-2.5 px-3 font-mono text-[11px]">
                <div class="flex items-center space-x-1">
                  <span class="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] border border-slate-200">
                    {{ mod.actiontypeid }}
                  </span>
                  <span class="text-indigo-700 truncate max-w-[140px]" :title="mod.actionurl">
                    {{ mod.actionurl }}
                  </span>
                </div>
              </td>

              <!-- 挂载状态 -->
              <td class="py-2.5 px-3 text-center">
                <template v-if="isMounted(mod.module_id)">
                  <span
                    class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200"
                    :title="`已挂载到目录: ${getMountedFolderName(mod.module_id)}`"
                  >
                    📁 已挂载: {{ getMountedFolderName(mod.module_id) }}
                  </span>
                </template>
                <template v-else>
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ 可引入
                  </span>
                </template>
              </td>
            </tr>

            <tr v-if="filteredModuleList.length === 0">
              <td colspan="6" class="py-8 text-center text-slate-400 text-xs">
                暂无符合条件的可用模块
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 单选确认时的菜单标题与排序调整面板 -->
      <div v-if="selectedModules.length === 1" class="p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 gap-3">
        <div>
          <label class="block text-slate-600 font-medium mb-1 text-[11px]">菜单项展示标题 (caption):</label>
          <a-input v-model:value="customCaption" placeholder="默认使用模块名称" class="text-xs" />
        </div>
        <div>
          <label class="block text-slate-600 font-medium mb-1 text-[11px]">排序号 (orderno):</label>
          <a-input-number v-model:value="customOrderno" :min="0" :max="9999" class="w-full text-xs" />
        </div>
      </div>
      <div v-else-if="selectedModules.length > 1" class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[11px] flex items-center justify-between">
        <span>批量引入 <strong>{{ selectedModules.length }}</strong> 个模块：菜单标题将自动继承模块名称，排序号自动从起始值递增分配。</span>
        <div class="flex items-center space-x-1.5">
          <span>起始序号:</span>
          <a-input-number v-model:value="customOrderno" :min="0" :max="9999" size="small" class="w-20" />
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Search, FolderCheck } from 'lucide-vue-next';
import { message } from 'ant-design-vue';
import { PbsMenuFolder, PbsMenuFolderItem } from '../../types/menu';
import { PbsModule } from '../../types/module';
import { INITIAL_MODULES } from '../../data/initialModules';

const props = defineProps<{
  visible: boolean;
  currentFolder: PbsMenuFolder | null;
  allMenuItems: PbsMenuFolderItem[];
  allFolders: PbsMenuFolder[];
  customModuleList?: PbsModule[];
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'select', items: Array<{ module: PbsModule; caption: string; orderno: number }>): void;
}>();

const keyword = ref('');
const hideMounted = ref(true);
const selectedModules = ref<PbsModule[]>([]);
const customCaption = ref('');
const customOrderno = ref(10);

// 全部可用的模块库
const modulePool = computed<PbsModule[]>(() => {
  return props.customModuleList && props.customModuleList.length > 0
    ? props.customModuleList
    : INITIAL_MODULES;
});

// 重置选中状态
watch(
  () => props.visible,
  (val) => {
    if (val) {
      keyword.value = '';
      selectedModules.value = [];
      customCaption.value = '';
      // 预估当前文件夹最大的 orderno + 10
      if (props.currentFolder) {
        const folderItems = props.allMenuItems.filter(i => i.folderid === props.currentFolder?.id);
        const maxOrder = folderItems.reduce((max, cur) => Math.max(max, cur.orderno), 0);
        customOrderno.value = maxOrder + 10;
      } else {
        customOrderno.value = 10;
      }
    }
  }
);

// 检查某个模块是否已被任何菜单项挂载 (pbs_menufolderitem_UQ01)
const isMounted = (moduleId: string): boolean => {
  return props.allMenuItems.some(i => i.module_id === moduleId);
};

// 获取已挂载的文件夹名称
const getMountedFolderName = (moduleId: string): string => {
  const item = props.allMenuItems.find(i => i.module_id === moduleId);
  if (!item) return '-';
  const folder = props.allFolders.find(f => f.id === item.folderid);
  return folder ? folder.caption : `文件夹ID:${item.folderid}`;
};

// 检查是否在当前勾选列表中
const isSelected = (moduleId: string): boolean => {
  return selectedModules.value.some(m => m.module_id === moduleId);
};

// 切换选中状态
const toggleSelect = (mod: PbsModule) => {
  if (isMounted(mod.module_id)) return;
  const index = selectedModules.value.findIndex(m => m.module_id === mod.module_id);
  if (index >= 0) {
    selectedModules.value.splice(index, 1);
  } else {
    selectedModules.value.push(mod);
    if (selectedModules.value.length === 1) {
      customCaption.value = mod.module_name;
    }
  }
};

// 过滤后的模块列表
const filteredModuleList = computed(() => {
  return modulePool.value.filter(mod => {
    if (hideMounted.value && isMounted(mod.module_id)) {
      return false;
    }
    if (keyword.value.trim()) {
      const kw = keyword.value.trim().toLowerCase();
      const matchId = mod.module_id.toLowerCase().includes(kw);
      const matchName = mod.module_name.toLowerCase().includes(kw);
      const matchHint = (mod.hint || '').toLowerCase().includes(kw);
      const matchUrl = mod.actionurl.toLowerCase().includes(kw);
      if (!matchId && !matchName && !matchHint && !matchUrl) return false;
    }
    return true;
  });
});

const handleCancel = () => {
  emit('update:visible', false);
};

// 确认引入
const handleConfirm = () => {
  if (selectedModules.value.length === 0) {
    message.warning('请至少选择一个业务模块！');
    return;
  }

  // 校验标题全局唯一 (pbs_menufolderitem_UQ02)
  if (selectedModules.value.length === 1) {
    const singleCaption = customCaption.value.trim() || selectedModules.value[0].module_name;
    const conflict = props.allMenuItems.some(i => i.caption === singleCaption);
    if (conflict) {
      message.error(`违反唯一约束 pbs_menufolderitem_UQ02：菜单标题 [ ${singleCaption} ] 已存在，请调整！`);
      return;
    }

    emit('select', [
      {
        module: selectedModules.value[0],
        caption: singleCaption,
        orderno: customOrderno.value,
      },
    ]);
  } else {
    // 批量引入
    const batchItems: Array<{ module: PbsModule; caption: string; orderno: number }> = [];
    let startOrder = customOrderno.value;

    for (const mod of selectedModules.value) {
      const caption = mod.module_name;
      const conflict = props.allMenuItems.some(i => i.caption === caption);
      if (conflict) {
        message.error(`模块 [ ${mod.module_name} ] 的名称与现有菜单标题冲突，请先单独引入并修改标题！`);
        return;
      }
      batchItems.push({
        module: mod,
        caption,
        orderno: startOrder,
      });
      startOrder += 10;
    }

    emit('select', batchItems);
  }

  emit('update:visible', false);
};
</script>
