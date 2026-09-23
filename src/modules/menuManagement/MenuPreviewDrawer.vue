<template>
  <a-drawer
    :open="visible"
    title="👀 实时系统导航菜单效果预览"
    :width="380"
    placement="right"
    @close="$emit('update:visible', false)"
  >
    <div class="space-y-4 text-xs select-none">
      <div class="p-3 bg-slate-900 text-slate-200 rounded-lg text-[11px] leading-relaxed">
        <div class="font-bold text-white mb-1 flex items-center space-x-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>SaaS 企业导航侧栏实时渲染</span>
        </div>
        展示当前由 <code>pbs_menufolder</code> 与 <code>pbs_menufolderitem</code> 组合而成的实际多级展开效果。
      </div>

      <!-- 模拟 ERP 侧边栏菜单结构 -->
      <div class="border border-slate-700 bg-slate-900 rounded-xl overflow-hidden shadow-lg text-slate-300">
        <!-- 侧栏顶部标题 -->
        <div class="p-3 bg-slate-800/90 border-b border-slate-700/80 flex items-center space-x-2">
          <div class="w-5 h-5 rounded bg-[#25548d] flex items-center justify-center text-white font-mono font-bold text-[10px]">
            ERP
          </div>
          <span class="font-bold text-white text-xs">企业主导航树</span>
        </div>

        <!-- 目录树渲染 -->
        <div class="p-2 space-y-1 max-h-[60vh] overflow-y-auto font-sans">
          <template v-for="folder in rootFolders" :key="folder.id">
            <!-- 一级目录 -->
            <div class="rounded-lg overflow-hidden border border-slate-800/80 bg-slate-800/40 mb-1">
              <div
                @click="toggleExpand(folder.id)"
                class="px-2.5 py-2 flex items-center justify-between text-slate-200 hover:bg-slate-700/50 cursor-pointer transition text-xs font-semibold"
              >
                <div class="flex items-center space-x-2">
                  <Folder class="w-3.5 h-3.5 text-[#93c5fd]" />
                  <span>{{ folder.caption }}</span>
                  <span v-if="folder.flag === 0" class="text-[9px] px-1 bg-rose-900/60 text-rose-300 rounded">
                    停用
                  </span>
                </div>
                <div class="flex items-center space-x-1">
                  <span class="text-[10px] text-slate-500 font-mono">
                    {{ getFolderTotalItems(folder.id) }} 项
                  </span>
                  <ChevronDown
                    class="w-3.5 h-3.5 text-slate-400 transition-transform duration-150"
                    :class="expandedMap[folder.id] ? 'rotate-0' : '-rotate-90'"
                  />
                </div>
              </div>

              <!-- 展开内容: 二级子目录与直属菜单项 -->
              <div v-show="expandedMap[folder.id]" class="p-1 pl-3 space-y-1 bg-slate-950/40 border-t border-slate-800/50">
                <!-- 直属于该顶级目录的菜单项 -->
                <div
                  v-for="item in getItemsByFolder(folder.id)"
                  :key="item.id"
                  @click="onItemClick(item)"
                  class="px-2 py-1.5 rounded flex items-center justify-between text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition text-[11px] group"
                >
                  <div class="flex items-center space-x-2 truncate">
                    <FileText v-if="item.type === 1" class="w-3 h-3 text-blue-400 shrink-0" />
                    <ExternalLink v-else class="w-3 h-3 text-emerald-400 shrink-0" />
                    <span class="truncate">{{ item.caption }}</span>
                  </div>
                  <span v-if="item.module_id" class="text-[9px] font-mono text-slate-500 group-hover:text-blue-300">
                    {{ item.module_id }}
                  </span>
                </div>

                <!-- 二级子目录 -->
                <template v-for="sub in getSubFolders(folder.id)" :key="sub.id">
                  <div class="rounded border border-slate-800 bg-slate-900/60 mt-1">
                    <div
                      @click="toggleExpand(sub.id)"
                      class="px-2 py-1.5 flex items-center justify-between text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer text-[11px] font-medium"
                    >
                      <div class="flex items-center space-x-1.5">
                        <FolderTree class="w-3 h-3 text-indigo-400" />
                        <span>{{ sub.caption }}</span>
                      </div>
                      <ChevronDown
                        class="w-3 h-3 text-slate-500 transition-transform duration-150"
                        :class="expandedMap[sub.id] ? 'rotate-0' : '-rotate-90'"
                      />
                    </div>

                    <!-- 二级子目录下的菜单项 -->
                    <div v-show="expandedMap[sub.id]" class="p-1 pl-3 space-y-0.5 bg-black/20">
                      <div
                        v-for="item in getItemsByFolder(sub.id)"
                        :key="item.id"
                        @click="onItemClick(item)"
                        class="px-2 py-1.5 rounded flex items-center justify-between text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition text-[11px] group"
                      >
                        <div class="flex items-center space-x-2 truncate">
                          <FileText v-if="item.type === 1" class="w-3 h-3 text-blue-400 shrink-0" />
                          <ExternalLink v-else class="w-3 h-3 text-emerald-400 shrink-0" />
                          <span class="truncate">{{ item.caption }}</span>
                        </div>
                        <span v-if="item.module_id" class="text-[9px] font-mono text-slate-500 group-hover:text-blue-300">
                          {{ item.module_id }}
                        </span>
                      </div>
                      <div v-if="getItemsByFolder(sub.id).length === 0" class="py-1 px-2 text-[10px] text-slate-600">
                        (暂无菜单项)
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Folder,
  FolderTree,
  FileText,
  ExternalLink,
  ChevronDown,
} from 'lucide-vue-next';
import { message } from 'ant-design-vue';
import { PbsMenuFolder, PbsMenuFolderItem } from '../../types/menu';

const props = defineProps<{
  visible: boolean;
  folders: PbsMenuFolder[];
  items: PbsMenuFolderItem[];
}>();

defineEmits<{
  (e: 'update:visible', val: boolean): void;
}>();

// 展开状态记录
const expandedMap = ref<Record<string, boolean>>({
  '1839202609010002001': true,
  '1839202609010002011': true,
  '1839202609010002003': true,
});

const toggleExpand = (folderId: string) => {
  expandedMap.value[folderId] = !expandedMap.value[folderId];
};

// 顶级根目录
const rootFolders = computed(() => {
  return props.folders
    .filter(f => f.parentid === '0')
    .sort((a, b) => a.orderno - b.orderno);
});

// 获取某个目录的子目录
const getSubFolders = (parentId: string) => {
  return props.folders
    .filter(f => f.parentid === parentId)
    .sort((a, b) => a.orderno - b.orderno);
};

// 获取某个目录下的直接菜单项
const getItemsByFolder = (folderId: string) => {
  return props.items
    .filter(i => i.folderid === folderId)
    .sort((a, b) => a.orderno - b.orderno);
};

// 统计某目录及其子目录的总菜单项
const getFolderTotalItems = (folderId: string): number => {
  const direct = props.items.filter(i => i.folderid === folderId).length;
  const subIds = props.folders.filter(f => f.parentid === folderId).map(f => f.id);
  const subTotal = props.items.filter(i => subIds.includes(i.folderid)).length;
  return direct + subTotal;
};

const onItemClick = (item: PbsMenuFolderItem) => {
  if (item.type === 2 && item.link_url) {
    message.info(`模拟外链跳转: ${item.link_url}`);
  } else {
    message.success(`已调度业务模块: [${item.module_id}] ${item.caption}`);
  }
};
</script>
