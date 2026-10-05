<template>
  <div
    v-if="dictStore.historyDrawerVisible"
    class="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end"
    role="dialog"
    aria-modal="true"
    aria-labelledby="history-drawer-title"
  >
    <div class="w-full max-w-[620px] bg-white h-full shadow-2xl flex flex-col border-l border-[#DDE3EA] animate-in slide-in-from-right duration-200">
      <!-- 头部 -->
      <div class="px-6 py-4 border-b border-[#DDE3EA] flex items-center justify-between bg-[#F8FAFC]">
        <div>
          <h3 id="history-drawer-title" class="text-sm font-bold text-[#0F172A] m-0">
            字典版本变更历史与审计追溯
          </h3>
          <p class="text-xs text-[#64748B] m-0 mt-0.5">
            字典类型: <span class="font-mono text-[#0F172A] font-semibold">{{ dictStore.selectedTypeCode }}</span>
          </p>
        </div>
        <button
          type="button"
          @click="dictStore.historyDrawerVisible = false"
          aria-label="关闭历史抽屉"
          class="w-10 h-10 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded-[6px] transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 历史时间轴列表 -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
        <div v-if="dictStore.changeLogs.length === 0" class="py-16 text-center text-[#94A3B8]">
          暂无历史变更记录
        </div>

        <div
          v-for="log in dictStore.changeLogs"
          :key="log.id"
          class="border border-[#DDE3EA] rounded-[8px] p-4 bg-white shadow-2xs hover:border-[#CBD5E1] transition-all"
        >
          <!-- 头部信息 -->
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-[#F1F5F9]">
            <div class="flex items-center space-x-2">
              <span
                :class="[
                  'px-2 py-0.5 rounded text-[11px] font-semibold font-mono',
                  log.actionType === 'PUBLISH'
                    ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
                    : log.actionType === 'ROLLBACK'
                    ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                    : 'bg-[#F1F5F9] text-[#475569]'
                ]"
              >
                {{ log.actionType === 'PUBLISH' ? `发布生效 v${log.version}` : log.actionType === 'ROLLBACK' ? `版本回滚 v${log.version}` : log.actionType }}
              </span>
              <span class="text-[#64748B] text-[11px]">{{ log.operateTime }}</span>
            </div>

            <!-- 一键回滚按钮（仅支持回滚历史发布版本） -->
            <button
              v-if="log.actionType === 'PUBLISH' && log.version !== dictStore.currentType?.version"
              type="button"
              @click="onRollback(log.version)"
              :aria-label="`一键回滚到版本 v${log.version}`"
              class="h-9 min-h-[36px] px-3 text-[11px] font-medium text-[#1F4FD8] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded-[4px] transition-colors cursor-pointer"
            >
              一键回滚到该版本
            </button>
          </div>

          <!-- 操作人与说明 -->
          <div class="text-[11px] text-[#475569] space-y-1 mb-2.5">
            <div>操作人: <strong class="text-[#0F172A]">{{ log.operator }}</strong></div>
            <div v-if="log.remark">说明: <span class="text-[#334155]">{{ log.remark }}</span></div>
          </div>

          <!-- 前后值 Diff 对比折叠区 -->
          <div v-if="log.beforeContent || log.afterContent" class="space-y-1">
            <div class="flex items-center justify-between text-[11px] text-[#64748B]">
              <span class="font-medium">变更前后数据快照对比</span>
              <button
                type="button"
                @click="toggleDiff(log.id)"
                :aria-label="diffExpanded.has(log.id) ? '收起快照对比' : '展开快照对比'"
                class="text-[#1F4FD8] hover:underline cursor-pointer"
              >
                {{ diffExpanded.has(log.id) ? '收起快照' : '查看快照' }}
              </button>
            </div>

            <div v-if="diffExpanded.has(log.id)" class="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#F1F5F9]">
              <div>
                <span class="block text-[10px] text-[#64748B] mb-1 font-medium">变更前 (Before):</span>
                <pre class="m-0 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded font-mono text-[10px] max-h-36 overflow-auto text-[#475569]">{{ log.beforeContent || '无（初始创建）' }}</pre>
              </div>
              <div>
                <span class="block text-[10px] text-[#16A34A] mb-1 font-medium">变更后 (After):</span>
                <pre class="m-0 p-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded font-mono text-[10px] max-h-36 overflow-auto text-[#14532D]">{{ log.afterContent || '无' }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDictStore } from '../store/dictStore';

const dictStore = useDictStore();

const diffExpanded = ref<Set<string>>(new Set());

const toggleDiff = (id: string) => {
  if (diffExpanded.value.has(id)) {
    diffExpanded.value.delete(id);
  } else {
    diffExpanded.value.add(id);
  }
};

const onRollback = (targetVersion: number) => {
  if (
    confirm(
      `确定要将字典【${dictStore.currentType?.name}】回滚至历史版本 v${targetVersion} 吗？当前草稿将被清空，并以 v${targetVersion} 快照作为当前线上基线。`
    )
  ) {
    dictStore.rollback(targetVersion);
  }
};
</script>
