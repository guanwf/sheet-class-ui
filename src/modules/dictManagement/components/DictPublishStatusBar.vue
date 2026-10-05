<template>
  <footer
    class="bg-white border-t border-[#DDE3EA] px-6 py-3 shrink-0 flex flex-wrap items-center justify-between gap-4 shadow-sm"
    aria-label="草稿发布与版本审核状态栏"
  >
    <!-- 左侧：草稿状态徽标与说明文案 -->
    <div class="flex items-center space-x-3">
      <!-- 草稿状态徽标 -->
      <span
        :class="[
          'px-2.5 py-1 text-xs font-semibold rounded-full flex items-center space-x-1.5',
          dictStore.hasPendingDrafts
            ? 'bg-[#EFF6FF] text-[#1F4FD8] border border-[#BFDBFE]'
            : 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]'
        ]"
      >
        <span
          :class="[
            'w-2 h-2 rounded-full',
            dictStore.hasPendingDrafts ? 'bg-[#1F4FD8]' : 'bg-[#94A3B8]'
          ]"
        ></span>
        <span>
          {{ dictStore.hasPendingDrafts ? `待发布草稿 (${dictStore.draftCount} 项修改)` : '暂无待发布草稿' }}
        </span>
      </span>

      <!-- 说明文案 -->
      <p class="text-xs text-[#64748B] m-0 hidden sm:block">
        <template v-if="dictStore.hasPendingDrafts">
          当前字典存在未生效草稿。点击「提交审批并发布」后版本自增升级，并向全平台广播刷新 Caffeine & Redis 二级缓存。
        </template>
        <template v-else>
          线上版本当前运行在基线
          <span class="font-mono text-[#0F172A] font-semibold">
            v{{ dictStore.currentType?.version || 1 }}
          </span>
          ，所有修改均先经过草稿暂存，保障线上读流量零抖动。
        </template>
      </p>
    </div>

    <!-- 右侧：放弃修改与提交审批并发布按钮 -->
    <div class="flex items-center space-x-3">
      <!-- 放弃修改按钮 -->
      <button
        type="button"
        @click="onDiscard"
        :disabled="!dictStore.hasPendingDrafts"
        aria-label="放弃所有未发布的草稿修改"
        :class="[
          'h-11 min-h-[44px] px-4 text-xs font-medium rounded-[6px] border transition-colors cursor-pointer',
          dictStore.hasPendingDrafts
            ? 'bg-white text-[#DC2626] border-[#FCA5A5] hover:bg-[#FEF2F2] active:bg-[#FEE2E2]'
            : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed'
        ]"
      >
        放弃修改
      </button>

      <!-- 提交审批并发布按钮 -->
      <button
        type="button"
        @click="onOpenPublishModal"
        :disabled="!dictStore.hasPendingDrafts"
        aria-label="提交审批并发布字典草稿"
        :class="[
          'h-11 min-h-[44px] px-5 text-xs font-semibold text-white rounded-[6px] transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs',
          dictStore.hasPendingDrafts
            ? 'bg-[#1F4FD8] hover:bg-[#1940B0] active:bg-[#153494]'
            : 'bg-[#94A3B8] cursor-not-allowed'
        ]"
      >
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>提交审批并发布</span>
      </button>
    </div>

    <!-- 发布确认与审批说明弹窗 -->
    <div
      v-if="publishModalVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-modal-title"
    >
      <div class="bg-white rounded-[8px] border border-[#DDE3EA] shadow-xl w-full max-w-[480px] p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <h3 id="publish-modal-title" class="text-sm font-bold text-[#0F172A] m-0">
            发布审批确认
          </h3>
          <button
            type="button"
            @click="publishModalVisible = false"
            aria-label="关闭发布审批弹窗"
            class="text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="text-xs text-[#475569] space-y-2">
          <p>
            即将把字典类型
            <strong class="text-[#0F172A]">【{{ dictStore.currentType?.name }}】({{ dictStore.selectedTypeCode }})</strong>
            的 <strong>{{ dictStore.draftCount }}</strong> 项草稿修改合并发布上线。
          </p>
          <div class="bg-[#F8FAFC] p-3 rounded border border-[#E2E8F0] space-y-1">
            <div class="flex justify-between">
              <span>当前生效版本:</span>
              <span class="font-mono text-[#64748B]">v{{ dictStore.currentType?.version || 1 }}</span>
            </div>
            <div class="flex justify-between font-semibold text-[#1F4FD8]">
              <span>发布后新版本:</span>
              <span class="font-mono">v{{ (dictStore.currentType?.version || 1) + 1 }}</span>
            </div>
          </div>

          <div class="space-y-1 pt-2">
            <label for="publish-remark" class="block font-medium text-[#0F172A]">
              发布变更说明 / 审批工单号:
            </label>
            <textarea
              id="publish-remark"
              v-model="publishRemark"
              rows="3"
              placeholder="请输入本次字典发布的业务背景或审批工单编号..."
              class="w-full text-xs p-2.5 bg-white border border-[#CBD5E1] rounded-[6px] focus:outline-hidden focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
            ></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end space-x-3 pt-3 border-t border-[#E2E8F0]">
          <button
            type="button"
            @click="publishModalVisible = false"
            aria-label="取消发布"
            class="h-11 min-h-[44px] px-4 text-xs font-medium text-[#475569] bg-white border border-[#CBD5E1] rounded-[6px] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            @click="onConfirmPublish"
            aria-label="确认发布审批"
            class="h-11 min-h-[44px] px-5 text-xs font-semibold text-white bg-[#1F4FD8] rounded-[6px] hover:bg-[#1940B0] transition-colors cursor-pointer shadow-xs"
          >
            确认并发布生效
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDictStore } from '../store/dictStore';

const dictStore = useDictStore();

const publishModalVisible = ref(false);
const publishRemark = ref('');

const onDiscard = () => {
  if (confirm('确定要放弃当前字典类型的所有草稿修改吗？未发布的数据将被永久丢弃。')) {
    dictStore.discardDrafts();
  }
};

const onOpenPublishModal = () => {
  publishRemark.value = '';
  publishModalVisible.value = true;
};

const onConfirmPublish = async () => {
  await dictStore.publish(publishRemark.value);
  publishModalVisible.value = false;
};
</script>
