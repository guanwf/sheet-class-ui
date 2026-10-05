<template>
  <div
    v-if="dictStore.typeModalVisible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="type-modal-title"
  >
    <div class="bg-white rounded-[8px] border border-[#DDE3EA] shadow-xl w-full max-w-[500px] p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
      <div class="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <h3 id="type-modal-title" class="text-sm font-bold text-[#0F172A] m-0">
          新建字典类型
        </h3>
        <button
          type="button"
          @click="dictStore.typeModalVisible = false"
          aria-label="关闭新建弹窗"
          class="text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-3.5 text-xs">
        <!-- 类型名称 -->
        <div class="space-y-1">
          <label for="new-type-name" class="block font-medium text-[#0F172A]">
            字典类型名称 <span class="text-[#DC2626]">*</span>
          </label>
          <input
            id="new-type-name"
            v-model="name"
            required
            placeholder="例如：物料供货渠道"
            aria-label="字典类型名称"
            class="w-full h-11 min-h-[44px] px-3 bg-white text-[#0F172A] border border-[#CBD5E1] rounded-[6px] focus:outline-hidden focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
          />
        </div>

        <!-- 类型编码 -->
        <div class="space-y-1">
          <label for="new-type-code" class="block font-medium text-[#0F172A]">
            类型编码 (type_code) <span class="text-[#DC2626]">*</span>
          </label>
          <input
            id="new-type-code"
            v-model="typeCode"
            required
            placeholder="例如：SUPPLY_CHANNEL"
            aria-label="类型编码"
            class="w-full h-11 min-h-[44px] px-3 font-mono text-xs uppercase bg-white text-[#0F172A] border border-[#CBD5E1] rounded-[6px] focus:outline-hidden focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
          />
          <p class="text-[11px] text-[#64748B]">
            全大写英文字母与下划线，作为系统全局唯一字典分类标识。
          </p>
        </div>

        <!-- 作用范围 -->
        <div class="space-y-1">
          <label for="new-type-scope" class="block font-medium text-[#0F172A]">
            作用范围 (Scope) <span class="text-[#DC2626]">*</span>
          </label>
          <select
            id="new-type-scope"
            v-model="scope"
            aria-label="选择作用范围"
            class="w-full h-11 min-h-[44px] px-3 bg-white text-[#0F172A] border border-[#CBD5E1] rounded-[6px] focus:outline-hidden focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
          >
            <option value="PLATFORM">平台级 (全集团跨租户统一共享)</option>
            <option value="TENANT">租户级 (当前租户独立隔离扩展)</option>
            <option value="ORG">组织级 (特定事业部/车间组织覆盖)</option>
          </select>
        </div>

        <!-- 业务说明 -->
        <div class="space-y-1">
          <label for="new-type-remark" class="block font-medium text-[#0F172A]">
            业务说明备注
          </label>
          <textarea
            id="new-type-remark"
            v-model="remark"
            rows="3"
            placeholder="说明该字典类型的业务用途及关联模块..."
            aria-label="业务说明备注"
            class="w-full p-2.5 bg-white text-[#0F172A] border border-[#CBD5E1] rounded-[6px] focus:outline-hidden focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
          ></textarea>
        </div>

        <!-- 底部按钮 -->
        <div class="flex items-center justify-end space-x-3 pt-3 border-t border-[#E2E8F0]">
          <button
            type="button"
            @click="dictStore.typeModalVisible = false"
            aria-label="取消创建"
            class="h-11 min-h-[44px] px-4 text-xs font-medium text-[#475569] bg-white border border-[#CBD5E1] rounded-[6px] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            type="submit"
            aria-label="提交创建字典类型"
            class="h-11 min-h-[44px] px-5 text-xs font-semibold text-white bg-[#1F4FD8] rounded-[6px] hover:bg-[#1940B0] transition-colors cursor-pointer shadow-xs"
          >
            立即创建
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDictStore } from '../store/dictStore';
import { message } from 'ant-design-vue';

const dictStore = useDictStore();

const name = ref('');
const typeCode = ref('');
const scope = ref<'PLATFORM' | 'TENANT' | 'ORG'>('PLATFORM');
const remark = ref('');

const onSubmit = async () => {
  if (!name.value.trim() || !typeCode.value.trim()) {
    message.warning('请填写类型名称与类型编码');
    return;
  }
  await dictStore.createType({
    name: name.value.trim(),
    typeCode: typeCode.value.trim().toUpperCase(),
    scope: scope.value,
    remark: remark.value.trim(),
  });
  name.value = '';
  typeCode.value = '';
  remark.value = '';
};
</script>
