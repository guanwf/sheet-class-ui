<template>
  <div class="bg-white border border-[#DDE3EA] rounded-[8px] shadow-2xs overflow-hidden flex-1 flex flex-col min-h-0">
    <!-- 表格工具提示条 -->
    <div class="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#DDE3EA] flex items-center justify-between text-xs text-[#64748B]">
      <div class="flex items-center space-x-2">
        <span class="font-medium text-[#0F172A]">字典明细条目列表</span>
        <span class="text-[#94A3B8]">/</span>
        <span>共 {{ dictStore.items.length }} 条记录</span>
        <span v-if="dictStore.hasPendingDrafts" class="ml-2 px-2 py-0.5 text-[11px] font-medium rounded-full bg-[#EFF6FF] text-[#1F4FD8] border border-[#BFDBFE]">
          当前有 {{ dictStore.draftCount }} 项草稿修改
        </span>
      </div>
      <div class="text-[11px] text-[#94A3B8]">
        提示：业务数据表仅关联存储条目编码 (item_code)
      </div>
    </div>

    <!-- 表格主体容器（横向自适应滚动） -->
    <div class="flex-1 overflow-auto">
      <table class="w-full text-left text-xs border-collapse min-w-[760px]">
        <thead>
          <tr class="bg-[#F1F5F9] text-[#475569] font-medium border-b border-[#CBD5E1]">
            <th class="py-3 px-4 w-[240px]">条目编码</th>
            <th class="py-3 px-4 min-w-[200px]">多语言标签 (中/英)</th>
            <th class="py-3 px-3 w-[80px] text-center">排序</th>
            <th class="py-3 px-4 w-[160px]">有效期</th>
            <th class="py-3 px-3 w-[110px] text-center">当前状态</th>
            <th class="py-3 px-4 w-[180px] text-right">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#E2E8F0] text-[#1E293B]">
          <tr v-if="dictStore.treeItems.length === 0">
            <td colspan="6" class="py-16 text-center text-xs text-[#94A3B8]">
              当前字典类型暂无明细条目，请点击右上角「新增条目」
            </td>
          </tr>

          <!-- 递归树状行渲染 -->
          <template v-for="item in dictStore.treeItems" :key="item.id">
            <!-- 根条目 -->
            <tr
              :class="[
                'hover:bg-[#F8FAFC] transition-colors',
                item._draftStatus ? 'bg-[#F0F7FF]/60' : ''
              ]"
            >
              <!-- 条目编码 (支持树形展开图标) -->
              <td class="py-2.5 px-4 font-mono font-medium">
                <div class="flex items-center space-x-1.5">
                  <!-- 树形展开/收起切换按钮 (仅有子项时展示) -->
                  <button
                    v-if="item.children && item.children.length > 0"
                    type="button"
                    @click="toggleExpand(item.itemCode)"
                    :aria-label="expandedKeys.has(item.itemCode) ? '收起子项' : '展开子项'"
                    class="w-6 h-6 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded transition-colors cursor-pointer"
                  >
                    <svg
                      :class="['w-3.5 h-3.5 transition-transform duration-150', expandedKeys.has(item.itemCode) ? 'rotate-90' : '']"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <span v-else class="w-6 inline-block"></span>

                  <span class="text-[#0F172A]">{{ item.itemCode }}</span>

                  <!-- 草稿修改状态徽标 -->
                  <span
                    v-if="item._draftStatus === 'NEW'"
                    class="px-1.5 py-0.2 text-[10px] rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-sans"
                  >
                    待发布新增
                  </span>
                  <span
                    v-else-if="item._draftStatus === 'MODIFIED'"
                    class="px-1.5 py-0.2 text-[10px] rounded bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] font-sans"
                  >
                    待发布修改
                  </span>
                  <span
                    v-else-if="item._draftStatus === 'TOGGLED'"
                    class="px-1.5 py-0.2 text-[10px] rounded bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF] font-sans"
                  >
                    待发布启停
                  </span>
                </div>
              </td>

              <!-- 多语言标签（中文主、英文辅） -->
              <td class="py-2.5 px-4">
                <div class="flex flex-col">
                  <span class="text-xs font-medium text-[#0F172A]">
                    {{ getZhLabel(item) }}
                  </span>
                  <span v-if="getEnLabel(item)" class="text-[11px] text-[#64748B]">
                    {{ getEnLabel(item) }}
                  </span>
                </div>
              </td>

              <!-- 排序 -->
              <td class="py-2.5 px-3 text-center font-mono text-[#475569]">
                {{ item.sortNo }}
              </td>

              <!-- 有效期 -->
              <td class="py-2.5 px-4 text-[#64748B] text-[11px]">
                <span v-if="item.validFrom || item.validTo">
                  {{ item.validFrom || '即日起' }} 至 {{ item.validTo || '长期有效' }}
                </span>
                <span v-else class="text-[#94A3B8]">长期有效</span>
              </td>

              <!-- 状态徽标（启用中、已停用） -->
              <td class="py-2.5 px-3 text-center">
                <span
                  :class="[
                    'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium',
                    (item._pendingStatus ?? item.status) === 1
                      ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                      : 'bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]'
                  ]"
                >
                  <span
                    :class="[
                      'w-1.5 h-1.5 rounded-full mr-1.5',
                      (item._pendingStatus ?? item.status) === 1 ? 'bg-[#10B981]' : 'bg-[#94A3B8]'
                    ]"
                  ></span>
                  {{ (item._pendingStatus ?? item.status) === 1 ? '启用中' : '已停用' }}
                </span>
              </td>

              <!-- 操作列（编辑、停用/启用、添加子项） -->
              <td class="py-2.5 px-4 text-right">
                <div class="flex items-center justify-end space-x-1">
                  <!-- 添加子项按钮 -->
                  <button
                    type="button"
                    @click="dictStore.openAddDrawer(item.itemCode)"
                    aria-label="在该项下添加子级条目"
                    title="添加子项"
                    class="h-11 min-h-[44px] px-2 text-xs font-medium text-[#1F4FD8] hover:bg-[#EFF6FF] rounded-[4px] transition-colors cursor-pointer"
                  >
                    + 子项
                  </button>

                  <!-- 编辑按钮 -->
                  <button
                    type="button"
                    @click="dictStore.openEditDrawer(item)"
                    :aria-label="`编辑字典条目 ${item.itemCode}`"
                    class="h-11 min-h-[44px] px-2 text-xs font-medium text-[#334155] hover:bg-[#F1F5F9] rounded-[4px] transition-colors cursor-pointer"
                  >
                    编辑
                  </button>

                  <!-- 停用/启用按钮 -->
                  <button
                    type="button"
                    @click="dictStore.toggleStatus(item.id)"
                    :aria-label="`${(item._pendingStatus ?? item.status) === 1 ? '停用' : '启用'}条目 ${item.itemCode}`"
                    :class="[
                      'h-11 min-h-[44px] px-2 text-xs font-medium rounded-[4px] transition-colors cursor-pointer',
                      (item._pendingStatus ?? item.status) === 1
                        ? 'text-[#DC2626] hover:bg-[#FEF2F2]'
                        : 'text-[#16A34A] hover:bg-[#F0FDF4]'
                    ]"
                  >
                    {{ (item._pendingStatus ?? item.status) === 1 ? '停用' : '启用' }}
                  </button>
                </div>
              </td>
            </tr>

            <!-- 子项（展开时渲染） -->
            <template v-if="expandedKeys.has(item.itemCode) && item.children">
              <tr
                v-for="sub in item.children"
                :key="sub.id"
                :class="[
                  'hover:bg-[#F8FAFC] transition-colors bg-[#FAFBFD]',
                  sub._draftStatus ? 'bg-[#F0F7FF]/70' : ''
                ]"
              >
                <!-- 子项条目编码 (带缩进与层级线条) -->
                <td class="py-2 px-4 font-mono font-medium pl-10">
                  <div class="flex items-center space-x-1.5">
                    <span class="text-[#CBD5E1] mr-1">└─</span>
                    <span class="text-[#334155]">{{ sub.itemCode }}</span>

                    <!-- 子项草稿徽标 -->
                    <span
                      v-if="sub._draftStatus === 'NEW'"
                      class="px-1.5 py-0.2 text-[10px] rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-sans"
                    >
                      待发布新增
                    </span>
                    <span
                      v-else-if="sub._draftStatus === 'MODIFIED'"
                      class="px-1.5 py-0.2 text-[10px] rounded bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] font-sans"
                    >
                      待发布修改
                    </span>
                    <span
                      v-else-if="sub._draftStatus === 'TOGGLED'"
                      class="px-1.5 py-0.2 text-[10px] rounded bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF] font-sans"
                    >
                      待发布启停
                    </span>
                  </div>
                </td>

                <!-- 子项多语言 -->
                <td class="py-2 px-4">
                  <div class="flex flex-col">
                    <span class="text-xs text-[#0F172A]">{{ getZhLabel(sub) }}</span>
                    <span v-if="getEnLabel(sub)" class="text-[11px] text-[#64748B]">{{ getEnLabel(sub) }}</span>
                  </div>
                </td>

                <!-- 排序 -->
                <td class="py-2 px-3 text-center font-mono text-[#475569]">
                  {{ sub.sortNo }}
                </td>

                <!-- 有效期 -->
                <td class="py-2 px-4 text-[#64748B] text-[11px]">
                  <span v-if="sub.validFrom || sub.validTo">
                    {{ sub.validFrom || '即日起' }} 至 {{ sub.validTo || '长期有效' }}
                  </span>
                  <span v-else class="text-[#94A3B8]">长期有效</span>
                </td>

                <!-- 状态 -->
                <td class="py-2 px-3 text-center">
                  <span
                    :class="[
                      'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium',
                      (sub._pendingStatus ?? sub.status) === 1
                        ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                        : 'bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]'
                    ]"
                  >
                    <span
                      :class="[
                        'w-1.5 h-1.5 rounded-full mr-1.5',
                        (sub._pendingStatus ?? sub.status) === 1 ? 'bg-[#10B981]' : 'bg-[#94A3B8]'
                      ]"
                    ></span>
                    {{ (sub._pendingStatus ?? sub.status) === 1 ? '启用中' : '已停用' }}
                  </span>
                </td>

                <!-- 子项操作 -->
                <td class="py-2 px-4 text-right">
                  <div class="flex items-center justify-end space-x-1">
                    <button
                      type="button"
                      @click="dictStore.openEditDrawer(sub)"
                      :aria-label="`编辑子项条目 ${sub.itemCode}`"
                      class="h-11 min-h-[44px] px-2 text-xs font-medium text-[#334155] hover:bg-[#F1F5F9] rounded-[4px] transition-colors cursor-pointer"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      @click="dictStore.toggleStatus(sub.id)"
                      :aria-label="`${(sub._pendingStatus ?? sub.status) === 1 ? '停用' : '启用'}子项条目 ${sub.itemCode}`"
                      :class="[
                        'h-11 min-h-[44px] px-2 text-xs font-medium rounded-[4px] transition-colors cursor-pointer',
                        (sub._pendingStatus ?? sub.status) === 1
                          ? 'text-[#DC2626] hover:bg-[#FEF2F2]'
                          : 'text-[#16A34A] hover:bg-[#F0FDF4]'
                      ]"
                    >
                      {{ (sub._pendingStatus ?? sub.status) === 1 ? '停用' : '启用' }}
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDictStore } from '../store/dictStore';
import { DictItem } from '../types/dict';

const dictStore = useDictStore();

// 树状展开收起控制，默认展开全部有子项的节点（如 BUG）
const expandedKeys = ref<Set<string>>(new Set(['BUG']));

const toggleExpand = (code: string) => {
  if (expandedKeys.value.has(code)) {
    expandedKeys.value.delete(code);
  } else {
    expandedKeys.value.add(code);
  }
};

const getZhLabel = (item: DictItem): string => {
  if (!item.labelI18n) return item.itemCode;
  if (typeof item.labelI18n === 'object') {
    return item.labelI18n['zh-CN'] || item.itemCode;
  }
  try {
    const parsed = JSON.parse(item.labelI18n);
    return parsed['zh-CN'] || item.itemCode;
  } catch {
    return item.itemCode;
  }
};

const getEnLabel = (item: DictItem): string => {
  if (!item.labelI18n) return '';
  if (typeof item.labelI18n === 'object') {
    return item.labelI18n.en || '';
  }
  try {
    const parsed = JSON.parse(item.labelI18n);
    return parsed.en || '';
  } catch {
    return '';
  }
};
</script>
