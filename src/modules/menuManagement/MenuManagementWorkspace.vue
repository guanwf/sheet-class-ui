<template>
  <div class="flex-1 flex flex-col min-h-0 bg-slate-100 overflow-hidden relative">
    <!-- 1. 顶部页签头 -->
    <div class="bg-slate-200/90 border-b border-slate-300/80 px-2 pt-1 flex items-center justify-between select-none text-xs gap-2 shrink-0">
      <div class="flex items-center space-x-1 py-0.5">
        <div class="relative flex items-center h-8 px-3 rounded-t-md bg-white text-slate-900 font-semibold border-t border-l border-r border-slate-300 shadow-2xs z-10">
          <span class="absolute top-0 left-0 right-0 h-0.5 bg-[#25548d] rounded-t"></span>
          <FolderTree class="w-3.5 h-3.5 mr-1 text-[#25548d]" />
          <span>系统菜单管理中心 (pbs_menufolder & pbs_menufolderitem)</span>
          <span class="ml-2 px-1.5 py-0.2 bg-[#f0f5fa] border border-[#cbdff2] text-[#25548d] rounded-full text-[10px] font-mono">
            {{ folders.length }} 目录 / {{ menuItems.length }} 项
          </span>
        </div>
      </div>

      <div class="flex items-center space-x-2 text-slate-500 text-[11px] pr-2">
        <button
          type="button"
          @click="showPreviewDrawer = true"
          class="inline-flex items-center px-2.5 py-1 rounded bg-[#25548d] hover:bg-[#1e4472] text-white text-xs font-medium transition cursor-pointer shadow-2xs"
        >
          <Eye class="w-3.5 h-3.5 mr-1 text-blue-200" />
          <span>👀 实时导航预览</span>
        </button>
      </div>
    </div>

    <!-- 2. 主体工作区分栏 (左侧多级目录树 + 右侧当前目录下的菜单项明细表) -->
    <div class="flex-1 flex p-3 md:p-4 gap-3 overflow-hidden min-h-0">
      <!-- 2.1 左侧：多层级菜单目录文件夹树 (pbs_menufolder) -->
      <div class="w-72 lg:w-80 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col shrink-0 overflow-hidden">
        <!-- 树标题与操作工具栏 -->
        <div class="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0 text-xs select-none">
          <div class="flex items-center space-x-1.5 font-bold text-slate-800">
            <Folder class="w-4 h-4 text-[#25548d]" />
            <span>菜单多级目录树</span>
          </div>

          <div class="flex items-center space-x-1">
            <button
              type="button"
              @click="openAddFolderModal('0')"
              class="px-2 py-0.5 rounded bg-[#25548d] text-white text-[11px] hover:bg-[#1e4472] transition cursor-pointer flex items-center shadow-2xs"
              title="新建系统顶级根目录"
            >
              <Plus class="w-3 h-3 mr-0.5" />
              <span>新建主目录</span>
            </button>
          </div>
        </div>

        <!-- 目录快速检索栏 -->
        <div class="p-2 border-b border-slate-100 bg-white shrink-0">
          <div class="relative">
            <input
              type="text"
              v-model="folderSearchKeyword"
              placeholder="过滤目录名称..."
              class="w-full pl-7 pr-6 py-1 rounded border border-slate-200 text-xs focus:outline-hidden focus:border-[#25548d]"
            />
            <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            <button
              v-if="folderSearchKeyword"
              type="button"
              @click="folderSearchKeyword = ''"
              class="absolute right-1.5 top-1.5 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- 目录树列表区 -->
        <div class="flex-1 overflow-y-auto p-2 space-y-1 text-xs select-none">
          <!-- 全部目录快捷项 -->
          <div
            @click="selectedFolderId = 'ALL'"
            :class="[
              'px-2.5 py-1.5 rounded-md flex items-center justify-between cursor-pointer transition text-xs font-medium',
              selectedFolderId === 'ALL'
                ? 'bg-[#25548d] text-white shadow-2xs'
                : 'text-slate-700 hover:bg-slate-100'
            ]"
          >
            <div class="flex items-center space-x-2">
              <Layers class="w-3.5 h-3.5" :class="selectedFolderId === 'ALL' ? 'text-white' : 'text-[#25548d]'" />
              <span>【全部目录】全量明细</span>
            </div>
            <span
              :class="[
                'text-[10px] px-1.5 py-0.2 rounded font-mono',
                selectedFolderId === 'ALL' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
              ]"
            >
              {{ menuItems.length }}
            </span>
          </div>

          <!-- 递归渲染多级目录 -->
          <div v-for="folder in filteredRootFolders" :key="folder.id" class="space-y-0.5">
            <!-- 一级目录行 -->
            <div
              @click="selectedFolderId = folder.id"
              :class="[
                'group px-2 py-1.5 rounded-md flex items-center justify-between cursor-pointer transition text-xs',
                selectedFolderId === folder.id
                  ? 'bg-blue-50 text-[#25548d] font-bold border border-blue-200'
                  : 'text-slate-700 hover:bg-slate-50 border border-transparent'
              ]"
            >
              <div class="flex items-center space-x-1.5 truncate flex-1 min-w-0">
                <button
                  type="button"
                  @click.stop="toggleFolderExpand(folder.id)"
                  class="p-0.5 hover:bg-slate-200 rounded text-slate-400"
                >
                  <ChevronRight
                    class="w-3 h-3 transition-transform duration-150"
                    :class="expandedFolderIds.includes(folder.id) ? 'rotate-90 text-slate-700' : 'rotate-0'"
                  />
                </button>
                <Folder class="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span class="truncate" :title="folder.caption">{{ folder.caption }}</span>
                <span v-if="folder.flag === 0" class="text-[9px] px-1 bg-rose-50 text-rose-600 rounded border border-rose-200 shrink-0">
                  停用
                </span>
              </div>

              <!-- 悬浮微操作：添加子目录、编辑、删除 -->
              <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition shrink-0 ml-1">
                <button
                  type="button"
                  @click.stop="openAddFolderModal(folder.id)"
                  class="p-0.5 text-slate-400 hover:text-[#25548d]"
                  title="在此目录下添加子目录"
                >
                  <Plus class="w-3 h-3" />
                </button>
                <button
                  type="button"
                  @click.stop="openEditFolderModal(folder)"
                  class="p-0.5 text-slate-400 hover:text-blue-600"
                  title="编辑目录"
                >
                  <Edit3 class="w-3 h-3" />
                </button>
                <button
                  type="button"
                  @click.stop="deleteFolder(folder)"
                  class="p-0.5 text-slate-400 hover:text-rose-600"
                  title="删除目录"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
              </div>
            </div>

            <!-- 二级子目录展开容器 -->
            <div
              v-show="expandedFolderIds.includes(folder.id)"
              class="pl-4 border-l border-slate-200 ml-3 space-y-0.5 py-0.5"
            >
              <div
                v-for="sub in getSubFolders(folder.id)"
                :key="sub.id"
                @click="selectedFolderId = sub.id"
                :class="[
                  'group px-2 py-1 rounded flex items-center justify-between cursor-pointer transition text-[11px]',
                  selectedFolderId === sub.id
                    ? 'bg-blue-50 text-[#25548d] font-bold border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                ]"
              >
                <div class="flex items-center space-x-1.5 truncate flex-1 min-w-0">
                  <FolderTree class="w-3 h-3 text-indigo-400 shrink-0" />
                  <span class="truncate" :title="sub.caption">{{ sub.caption }}</span>
                </div>

                <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition shrink-0 ml-1">
                  <button
                    type="button"
                    @click.stop="openEditFolderModal(sub)"
                    class="p-0.5 text-slate-400 hover:text-blue-600"
                    title="编辑子目录"
                  >
                    <Edit3 class="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    @click.stop="deleteFolder(sub)"
                    class="p-0.5 text-slate-400 hover:text-rose-600"
                    title="删除子目录"
                  >
                    <Trash2 class="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div
                v-if="getSubFolders(folder.id).length === 0"
                class="text-[10px] text-slate-400 py-0.5 pl-2 italic"
              >
                (暂无子目录，可直接挂载菜单)
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2.2 右侧：选中目录下的菜单明细项列表 (pbs_menufolderitem) -->
      <div class="flex-1 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col min-w-0 overflow-hidden">
        <!-- 目录路径导航与操作栏 -->
        <div class="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0 select-none text-xs">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 rounded-full bg-[#25548d]"></div>
            <span class="text-slate-500 font-medium">当前目录:</span>
            <strong class="text-slate-900 text-sm font-semibold">
              {{ currentFolderCaption }}
            </strong>
            <span class="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[10px]">
              包含 {{ displayItems.length }} 个菜单项
            </span>
          </div>

          <!-- 核心功能按钮 -->
          <div class="flex items-center space-x-2">
            <!-- 核心交互：通过弹出窗口选择模块加入菜单 (用户强要求) -->
            <button
              type="button"
              @click="openSelectModuleModal"
              class="inline-flex items-center px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5 mr-1" />
              <span>选择模块加入菜单</span>
            </button>

            <!-- 添加外链 -->
            <button
              type="button"
              @click="openAddLinkItemModal"
              class="inline-flex items-center px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs transition cursor-pointer"
            >
              <ExternalLink class="w-3.5 h-3.5 mr-1 text-emerald-600" />
              <span>添加外链菜单</span>
            </button>

            <!-- 导出 CSV -->
            <button
              type="button"
              @click="exportCsv"
              class="inline-flex items-center px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs transition cursor-pointer"
            >
              <Download class="w-3.5 h-3.5 mr-1 text-slate-500" />
              <span>导出 CSV</span>
            </button>
          </div>
        </div>

        <!-- 搜索与批量操作栏 -->
        <div class="px-3 py-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 shrink-0 bg-white text-xs">
          <div class="flex items-center space-x-2 flex-1 max-w-sm">
            <div class="relative w-full">
              <input
                type="text"
                v-model="itemSearchKeyword"
                placeholder="搜索菜单标题、模块ID或链接..."
                class="w-full pl-7 pr-6 py-1 rounded border border-slate-200 text-xs focus:outline-hidden focus:border-[#25548d]"
              />
              <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              <button
                v-if="itemSearchKeyword"
                type="button"
                @click="itemSearchKeyword = ''"
                class="absolute right-1.5 top-1.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>
          </div>

          <div v-if="selectedItemRows.length > 0" class="flex items-center space-x-2 text-xs">
            <span class="text-[#25548d] font-medium">已选中 {{ selectedItemRows.length }} 项</span>
            <button
              type="button"
              @click="batchDeleteItems"
              class="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] cursor-pointer transition"
            >
              批量移除
            </button>
            <button
              type="button"
              @click="clearItemSelection"
              class="text-slate-500 hover:text-slate-800 text-[11px] underline cursor-pointer"
            >
              取消勾选
            </button>
          </div>
        </div>

        <!-- 菜单项明细数据表格 -->
        <div class="flex-1 w-full relative overflow-hidden">
          <vxe-table
            ref="tableRef"
            height="auto"
            border
            stripe
            round
            show-overflow
            class="text-xs"
            :data="displayItems"
            :row-config="{ isHover: true, isCurrent: true, keyField: 'id' }"
            :checkbox-config="{ trigger: 'row', highlight: true }"
            @checkbox-change="onItemCheckboxChange"
            @checkbox-all="onItemCheckboxAll"
          >
            <!-- 复选框 -->
            <vxe-column type="checkbox" width="45" align="center" fixed="left" />

            <!-- 排序号 (可快捷调整) -->
            <vxe-column field="orderno" title="排序号" width="75" align="center" fixed="left">
              <template #default="{ row }">
                <span class="font-mono font-bold text-slate-700">{{ row.orderno }}</span>
              </template>
            </vxe-column>

            <!-- 菜单标题 (caption) 唯一约束 UQ02 -->
            <vxe-column field="caption" title="菜单标题 (caption)" min-width="160" fixed="left">
              <template #default="{ row }">
                <div class="flex items-center space-x-2 font-medium text-slate-900">
                  <FileText v-if="row.type === 1" class="w-3.5 h-3.5 text-[#25548d] shrink-0" />
                  <ExternalLink v-else class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span class="truncate" :title="row.caption">{{ row.caption }}</span>
                </div>
              </template>
            </vxe-column>

            <!-- 菜单类型 (type) -->
            <vxe-column field="type" title="类型" width="105" align="center">
              <template #default="{ row }">
                <span
                  :class="[
                    'px-1.5 py-0.5 rounded text-[10px] font-medium border',
                    row.type === 1
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  ]"
                >
                  {{ row.type === 1 ? '模块菜单 (1)' : '外链菜单 (2)' }}
                </span>
              </template>
            </vxe-column>

            <!-- 所属目录名称 -->
            <vxe-column field="folderid" title="所属目录" width="140">
              <template #default="{ row }">
                <span class="text-slate-600 truncate block text-[11px]">
                  📁 {{ getFolderName(row.folderid) }}
                </span>
              </template>
            </vxe-column>

            <!-- 关联模块ID (module_id) 唯一约束 UQ01 -->
            <vxe-column field="module_id" title="关联模块ID (module_id)" width="170">
              <template #default="{ row }">
                <template v-if="row.type === 1 && row.module_id">
                  <span class="font-mono font-bold text-[#25548d] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[11px] truncate block" :title="row.module_id">
                    {{ row.module_id }}
                  </span>
                </template>
                <template v-else>
                  <span class="text-slate-400 text-[10px] italic">-</span>
                </template>
              </template>
            </vxe-column>

            <!-- 模块名称与权限预览 -->
            <vxe-column title="模块特性 / 外链地址" min-width="220">
              <template #default="{ row }">
                <template v-if="row.type === 1">
                  <div class="text-[11px] truncate text-slate-700 flex items-center space-x-1.5">
                    <span class="font-medium text-slate-800">{{ getModuleName(row.module_id) }}</span>
                    <span
                      v-if="getModuleRightvalues(row.module_id) === 2047"
                      class="px-1 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-mono"
                    >
                      全部权限 (2047)
                    </span>
                  </div>
                </template>
                <template v-else>
                  <span class="font-mono text-emerald-700 truncate block text-[11px]" :title="row.link_url">
                    🔗 {{ row.link_url }}
                  </span>
                </template>
              </template>
            </vxe-column>

            <!-- 修改人与时间 -->
            <vxe-column field="modify_time" title="修改人/时间" width="140">
              <template #default="{ row }">
                <div class="text-[10px] text-slate-500 leading-tight">
                  <div>{{ row.modifier || row.creator || '-' }}</div>
                  <div class="font-mono text-slate-400">{{ (row.modify_time || row.create_time || '').split(' ')[0] }}</div>
                </div>
              </template>
            </vxe-column>

            <!-- 操作列 -->
            <vxe-column title="操作" width="130" fixed="right" align="center">
              <template #default="{ row }">
                <div class="flex items-center justify-center space-x-2 text-xs">
                  <button
                    type="button"
                    @click="openEditItemModal(row)"
                    class="text-[#25548d] hover:text-[#1e4472] font-medium transition cursor-pointer"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    @click="deleteItem(row)"
                    class="text-rose-600 hover:text-rose-800 font-medium transition cursor-pointer"
                  >
                    移除
                  </button>
                </div>
              </template>
            </vxe-column>
          </vxe-table>
        </div>
      </div>
    </div>

    <!-- 弹窗 1: 选择模块加入菜单 (核心功能，防误触) -->
    <SelectModuleModal
      v-model:visible="showSelectModuleModal"
      :current-folder="activeFolderObject"
      :all-menu-items="menuItems"
      :all-folders="folders"
      :custom-module-list="allModules"
      @select="onModulesSelected"
    />

    <!-- 弹窗 2: 新建 / 编辑菜单目录 (pbs_menufolder，防误触) -->
    <MenuFolderEditModal
      v-model:visible="showFolderEditModal"
      :initial-data="editingFolder"
      :default-parent-id="folderTargetParentId"
      :all-folders="folders"
      @submit="onSaveFolder"
    />

    <!-- 弹窗 3: 编辑菜单项 / 新增外链 (pbs_menufolderitem，防误触) -->
    <MenuItemEditModal
      v-model:visible="showItemEditModal"
      :initial-data="editingItem"
      :default-folder-id="selectedFolderId !== 'ALL' ? selectedFolderId : folders[0]?.id"
      :all-folders="folders"
      :all-items="menuItems"
      :all-modules="allModules"
      @submit="onSaveItem"
    />

    <!-- 抽屉 4: 实时导航菜单树模拟预览 -->
    <MenuPreviewDrawer
      v-model:visible="showPreviewDrawer"
      :folders="folders"
      :items="menuItems"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Folder,
  FolderTree,
  FileText,
  ExternalLink,
  Plus,
  Edit3,
  Trash2,
  ChevronRight,
  Search,
  Eye,
  Layers,
  Download,
} from 'lucide-vue-next';
import { message, Modal } from 'ant-design-vue';
import { PbsMenuFolder, PbsMenuFolderItem } from '../../types/menu';
import { PbsModule } from '../../types/module';
import { INITIAL_MENU_FOLDERS, INITIAL_MENU_ITEMS } from '../../data/initialMenus';
import { INITIAL_MODULES } from '../../data/initialModules';
import SelectModuleModal from './SelectModuleModal.vue';
import MenuFolderEditModal from './MenuFolderEditModal.vue';
import MenuItemEditModal from './MenuItemEditModal.vue';
import MenuPreviewDrawer from './MenuPreviewDrawer.vue';

// 核心数据集
const folders = ref<PbsMenuFolder[]>([...INITIAL_MENU_FOLDERS]);
const menuItems = ref<PbsMenuFolderItem[]>([...INITIAL_MENU_ITEMS]);
const allModules = ref<PbsModule[]>([...INITIAL_MODULES]);

// 当前选中的目录ID (默认顶级首个目录或全部)
const selectedFolderId = ref<string>('1839202609010002011');
// 展开状态的目录ID
const expandedFolderIds = ref<string[]>([
  '1839202609010002001',
  '1839202609010002003',
]);

// 过滤关键字
const folderSearchKeyword = ref('');
const itemSearchKeyword = ref('');
const selectedItemRows = ref<PbsMenuFolderItem[]>([]);
const tableRef = ref<any>(null);

// 弹窗状态
const showSelectModuleModal = ref(false);
const showFolderEditModal = ref(false);
const editingFolder = ref<PbsMenuFolder | null>(null);
const folderTargetParentId = ref('0');

const showItemEditModal = ref(false);
const editingItem = ref<PbsMenuFolderItem | null>(null);

const showPreviewDrawer = ref(false);

// 切换目录展开/收起
const toggleFolderExpand = (folderId: string) => {
  const index = expandedFolderIds.value.indexOf(folderId);
  if (index >= 0) {
    expandedFolderIds.value.splice(index, 1);
  } else {
    expandedFolderIds.value.push(folderId);
  }
};

// 顶级根目录
const filteredRootFolders = computed(() => {
  let list = folders.value.filter(f => f.parentid === '0');
  if (folderSearchKeyword.value.trim()) {
    const kw = folderSearchKeyword.value.trim().toLowerCase();
    // 自身包含或者子目录包含
    list = list.filter(f => {
      const matchSelf = f.caption.toLowerCase().includes(kw);
      const subList = folders.value.filter(s => s.parentid === f.id);
      const matchSub = subList.some(s => s.caption.toLowerCase().includes(kw));
      return matchSelf || matchSub;
    });
  }
  return list.sort((a, b) => a.orderno - b.orderno);
});

// 获取某个目录的下级子目录
const getSubFolders = (parentId: string) => {
  return folders.value
    .filter(f => f.parentid === parentId)
    .sort((a, b) => a.orderno - b.orderno);
};

// 当前选中的文件夹实体对象
const activeFolderObject = computed(() => {
  if (selectedFolderId.value === 'ALL') return null;
  return folders.value.find(f => f.id === selectedFolderId.value) || null;
});

// 当前目录标题展示
const currentFolderCaption = computed(() => {
  if (selectedFolderId.value === 'ALL') return '全部目录 (全量菜单项)';
  const folder = folders.value.find(f => f.id === selectedFolderId.value);
  if (!folder) return '未选定目录';

  if (folder.parentid !== '0') {
    const parent = folders.value.find(p => p.id === folder.parentid);
    return `${parent?.caption || '上级'} / ${folder.caption}`;
  }
  return folder.caption;
});

// 筛选出的菜单明细列表
const displayItems = computed(() => {
  return menuItems.value.filter(item => {
    // 1. 目录筛选
    if (selectedFolderId.value !== 'ALL' && item.folderid !== selectedFolderId.value) {
      return false;
    }
    // 2. 搜索关键字
    if (itemSearchKeyword.value.trim()) {
      const kw = itemSearchKeyword.value.trim().toLowerCase();
      const matchCap = item.caption.toLowerCase().includes(kw);
      const matchModId = (item.module_id || '').toLowerCase().includes(kw);
      const matchUrl = (item.link_url || '').toLowerCase().includes(kw);
      if (!matchCap && !matchModId && !matchUrl) return false;
    }
    return true;
  }).sort((a, b) => a.orderno - b.orderno);
});

// 获取目录标题辅助
const getFolderName = (folderId: string): string => {
  const f = folders.value.find(item => item.id === folderId);
  return f ? f.caption : folderId;
};

// 获取关联模块名称辅助
const getModuleName = (moduleId?: string): string => {
  if (!moduleId) return '-';
  const m = allModules.value.find(item => item.module_id === moduleId);
  return m ? m.module_name : '-';
};

// 获取关联模块权限值辅助
const getModuleRightvalues = (moduleId?: string): number => {
  if (!moduleId) return 0;
  const m = allModules.value.find(item => item.module_id === moduleId);
  return m ? m.rightvalues : 0;
};

// 复选框事件
const onItemCheckboxChange = ({ records }: any) => {
  selectedItemRows.value = records;
};
const onItemCheckboxAll = ({ records }: any) => {
  selectedItemRows.value = records;
};
const clearItemSelection = () => {
  selectedItemRows.value = [];
  tableRef.value?.clearCheckboxRow();
};

// 打开新建目录弹窗
const openAddFolderModal = (parentId: string) => {
  editingFolder.value = null;
  folderTargetParentId.value = parentId;
  showFolderEditModal.value = true;
};

// 打开编辑目录弹窗
const openEditFolderModal = (folder: PbsMenuFolder) => {
  editingFolder.value = { ...folder };
  folderTargetParentId.value = folder.parentid;
  showFolderEditModal.value = true;
};

// 保存目录
const onSaveFolder = (folder: PbsMenuFolder) => {
  const index = folders.value.findIndex(f => f.id === folder.id);
  if (index >= 0) {
    folders.value[index] = folder;
  } else {
    folders.value.push(folder);
    if (folder.parentid !== '0' && !expandedFolderIds.value.includes(folder.parentid)) {
      expandedFolderIds.value.push(folder.parentid);
    }
  }
};

// 删除目录
const deleteFolder = (folder: PbsMenuFolder) => {
  // 检查是否有子目录
  const hasSubs = folders.value.some(f => f.parentid === folder.id);
  if (hasSubs) {
    message.warning('该目录包含下级子目录，请先清空或删除子目录！');
    return;
  }
  // 检查是否有菜单项
  const hasItems = menuItems.value.some(i => i.folderid === folder.id);
  if (hasItems) {
    message.warning('该目录下挂载了菜单项，请先移除该目录下的菜单项！');
    return;
  }

  Modal.confirm({
    title: `确认删除目录 [ ${folder.caption} ]？`,
    content: '删除后目录将从 pbs_menufolder 表中物理移除。',
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    maskClosable: false,
    onOk: () => {
      folders.value = folders.value.filter(f => f.id !== folder.id);
      if (selectedFolderId.value === folder.id) {
        selectedFolderId.value = 'ALL';
      }
      message.success(`目录 [ ${folder.caption} ] 已删除！`);
    },
  });
};

// 打开从模块库选择弹窗 (用户核心要求)
const openSelectModuleModal = () => {
  if (selectedFolderId.value === 'ALL') {
    // 自动定位到首个可挂载的子目录或顶级目录
    const target = folders.value[0];
    if (target) {
      selectedFolderId.value = target.id;
    }
  }
  showSelectModuleModal.value = true;
};

// 选定模块后加入到菜单
const onModulesSelected = (items: Array<{ module: PbsModule; caption: string; orderno: number }>) => {
  const targetFolderId = selectedFolderId.value !== 'ALL' ? selectedFolderId.value : (folders.value[0]?.id || '0');
  const now = new Date().toISOString().replace('T', ' ').split('.')[0];

  const newRecords: PbsMenuFolderItem[] = items.map(item => ({
    id: `1839${Date.now()}${Math.floor(Math.random() * 899 + 100)}`,
    folderid: targetFolderId,
    module_id: item.module.module_id,
    caption: item.caption,
    type: 1,
    orderno: item.orderno,
    creator: '刘工 (主控业务员)',
    create_time: now,
    modifier: '刘工 (主控业务员)',
    modify_time: now,
  }));

  menuItems.value = [...menuItems.value, ...newRecords];
  message.success(`已成功将 ${newRecords.length} 个模块作为菜单项挂载至当前目录！`);
};

// 打开新建外链菜单项
const openAddLinkItemModal = () => {
  editingItem.value = null;
  showItemEditModal.value = true;
};

// 打开编辑菜单项
const openEditItemModal = (item: PbsMenuFolderItem) => {
  editingItem.value = { ...item };
  showItemEditModal.value = true;
};

// 保存菜单项
const onSaveItem = (item: PbsMenuFolderItem) => {
  const index = menuItems.value.findIndex(i => i.id === item.id);
  if (index >= 0) {
    menuItems.value[index] = item;
  } else {
    menuItems.value.push(item);
  }
};

// 删除单个菜单项
const deleteItem = (item: PbsMenuFolderItem) => {
  Modal.confirm({
    title: `确认移除菜单项 [ ${item.caption} ]？`,
    content: `移除后模块 [ ${item.module_id || '外链'} ] 将脱离当前目录，后续可重新挂载。`,
    okText: '确认移除',
    okType: 'danger',
    cancelText: '取消',
    maskClosable: false,
    onOk: () => {
      menuItems.value = menuItems.value.filter(i => i.id !== item.id);
      message.success(`菜单项 [ ${item.caption} ] 已移除！`);
    },
  });
};

// 批量删除菜单项
const batchDeleteItems = () => {
  const count = selectedItemRows.value.length;
  Modal.confirm({
    title: `确认批量移除选中的 ${count} 个菜单项？`,
    content: '移除操作不可逆，将从 pbs_menufolderitem 中物理清除。',
    okText: '确认批量移除',
    okType: 'danger',
    cancelText: '取消',
    maskClosable: false,
    onOk: () => {
      const ids = selectedItemRows.value.map(r => r.id);
      menuItems.value = menuItems.value.filter(i => !ids.includes(i.id));
      message.success(`已成功批量移除 ${count} 个菜单项！`);
      clearItemSelection();
    },
  });
};

// 导出 CSV
const exportCsv = () => {
  const headers = ['主键ID(雪花)', '所属目录', '菜单标题', '菜单类型', '关联模块ID', '排序号', '创建人', '创建时间'];
  const rows = displayItems.value.map(i => [
    `"${i.id}"`,
    `"${getFolderName(i.folderid)}"`,
    `"${i.caption}"`,
    i.type === 1 ? '模块菜单' : '外链',
    `"${i.module_id || ''}"`,
    i.orderno,
    `"${i.creator || ''}"`,
    `"${i.create_time || ''}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pbs_menu_export_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  message.success(`已成功导出 ${displayItems.value.length} 条菜单数据！`);
};
</script>
