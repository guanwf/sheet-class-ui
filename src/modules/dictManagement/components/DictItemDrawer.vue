<template>
  <div
    v-if="dictStore.itemDrawerVisible"
    class="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end"
    role="dialog"
    aria-modal="true"
    aria-labelledby="drawer-title"
  >
    <div
      class="w-full max-w-[540px] bg-white h-full shadow-2xl flex flex-col border-l border-[#DDE3EA] animate-in slide-in-from-right duration-200"
    >
      <!-- 抽屉头部 -->
      <div class="px-6 py-4 border-b border-[#DDE3EA] flex items-center justify-between bg-[#F8FAFC]">
        <div>
          <h3 id="drawer-title" class="text-sm font-bold text-[#0F172A] m-0">
            {{ isEdit ? '编辑字典条目' : '新增字典条目' }}
          </h3>
          <p class="text-xs text-[#64748B] m-0 mt-0.5">
            所属字典类型: <span class="font-mono text-[#0F172A] font-semibold">{{ dictStore.selectedTypeCode }}</span>
          </p>
        </div>
        <button
          type="button"
          @click="dictStore.itemDrawerVisible = false"
          aria-label="关闭抽屉"
          class="w-10 h-10 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded-[6px] transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 抽屉表单主体 -->
      <form @submit.prevent="onSubmit" class="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
        <!-- 1. 条目编码 (编辑时只读) -->
        <div class="space-y-1.5">
          <label for="drawer-item-code" class="block font-medium text-[#0F172A]">
            条目编码 (item_code) <span class="text-[#DC2626]">*</span>
          </label>
          <div class="relative">
            <input
              id="drawer-item-code"
              v-model="form.itemCode"
              :readonly="isEdit"
              required
              placeholder="例如：VIP_GOLD"
              aria-label="条目编码"
              :class="[
                'w-full h-11 min-h-[44px] px-3 font-mono text-xs border rounded-[6px] transition-colors',
                isEdit
                  ? 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1] cursor-not-allowed'
                  : 'bg-white text-[#0F172A] border-[#CBD5E1] focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]'
              ]"
            />
          </div>
          <!-- 租户前缀提示 -->
          <p v-if="!isEdit && dictStore.currentTenantId !== '0'" class="text-[11px] text-[#2563EB]">
            租户模式约束：保存时将自动校验并前缀为 <code>T{{ dictStore.currentTenantId.replace('tenant_', '') }}_</code>
          </p>
          <p v-else class="text-[11px] text-[#64748B]">
            企业规范：采用全大写英文及下划线，作为持久化主键在业务单据中存储。
          </p>
        </div>

        <!-- 2. 父级条目 (树形结构) -->
        <div class="space-y-1.5">
          <label for="drawer-parent-code" class="block font-medium text-[#0F172A]">
            父级条目 (parent_code)
          </label>
          <select
            id="drawer-parent-code"
            v-model="form.parentCode"
            aria-label="选择父级条目"
            class="w-full h-11 min-h-[44px] px-3 text-xs bg-white text-[#0F172A] border border-[#CBD5E1] rounded-[6px] focus:outline-hidden focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
          >
            <option :value="null">-- 无父级（作为顶级节点） --</option>
            <option
              v-for="parentOpt in availableParents"
              :key="parentOpt.itemCode"
              :value="parentOpt.itemCode"
            >
              {{ parentOpt.itemCode }} - {{ getZh(parentOpt) }}
            </option>
          </select>
          <p class="text-[11px] text-[#64748B]">用于多层级字典（如工单缺陷分类、组织岗位树）。</p>
        </div>

        <!-- 3. 中文展示标签 (主) -->
        <div class="space-y-1.5">
          <label for="drawer-label-zh" class="block font-medium text-[#0F172A]">
            中文展示名称 (zh-CN) <span class="text-[#DC2626]">*</span>
          </label>
          <input
            id="drawer-label-zh"
            v-model="form.labelZh"
            required
            placeholder="例如：黄金会员客户"
            aria-label="中文展示名称"
            class="w-full h-11 min-h-[44px] px-3 text-xs bg-white text-[#0F172A] border border-[#CBD5E1] rounded-[6px] focus:outline-hidden focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
          />
        </div>

        <!-- 4. 英文展示标签 (辅) -->
        <div class="space-y-1.5">
          <label for="drawer-label-en" class="block font-medium text-[#0F172A]">
            英文展示名称 (en)
          </label>
          <input
            id="drawer-label-en"
            v-model="form.labelEn"
            placeholder="例如：Gold VIP Member"
            aria-label="英文展示名称"
            class="w-full h-11 min-h-[44px] px-3 text-xs bg-white text-[#0F172A] border border-[#CBD5E1] rounded-[6px] focus:outline-hidden focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
          />
        </div>

        <!-- 5. 排序与状态 -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label for="drawer-sort-no" class="block font-medium text-[#0F172A]">
              展示排序号
            </label>
            <input
              id="drawer-sort-no"
              v-model.number="form.sortNo"
              type="number"
              aria-label="排序号"
              class="w-full h-11 min-h-[44px] px-3 font-mono text-xs bg-white text-[#0F172A] border border-[#CBD5E1] rounded-[6px] focus:outline-hidden focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
            />
          </div>

          <div class="space-y-1.5">
            <label for="drawer-status" class="block font-medium text-[#0F172A]">
              启停状态
            </label>
            <select
              id="drawer-status"
              v-model.number="form.status"
              aria-label="启停状态"
              class="w-full h-11 min-h-[44px] px-3 text-xs bg-white text-[#0F172A] border border-[#CBD5E1] rounded-[6px] focus:outline-hidden focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
            >
              <option :value="1">启用中</option>
              <option :value="0">已停用</option>
            </select>
          </div>
        </div>

        <!-- 6. 有效期范围 (validFrom, validTo) -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label for="drawer-valid-from" class="block font-medium text-[#0F172A]">
              生效起始日期
            </label>
            <input
              id="drawer-valid-from"
              v-model="form.validFrom"
              type="date"
              aria-label="生效起始日期"
              class="w-full h-11 min-h-[44px] px-3 text-xs bg-white text-[#0F172A] border border-[#CBD5E1] rounded-[6px] focus:outline-hidden focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
            />
          </div>

          <div class="space-y-1.5">
            <label for="drawer-valid-to" class="block font-medium text-[#0F172A]">
              失效截止日期
            </label>
            <input
              id="drawer-valid-to"
              v-model="form.validTo"
              type="date"
              aria-label="失效截止日期"
              class="w-full h-11 min-h-[44px] px-3 text-xs bg-white text-[#0F172A] border border-[#CBD5E1] rounded-[6px] focus:outline-hidden focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
            />
          </div>
        </div>

        <!-- 7. 扩展属性 (JSON 编辑器 + 校验) -->
        <div class="space-y-1.5 pt-1">
          <div class="flex items-center justify-between">
            <label for="drawer-ext-json" class="block font-medium text-[#0F172A]">
              扩展属性 (JSON 格式)
            </label>
            <button
              type="button"
              @click="formatExtJson"
              aria-label="格式化 JSON 扩展属性"
              class="text-[11px] text-[#1F4FD8] hover:underline cursor-pointer"
            >
              格式化 JSON
            </button>
          </div>
          <textarea
            id="drawer-ext-json"
            v-model="form.extString"
            rows="5"
            placeholder='{\n  "discount": 0.9,\n  "badgeColor": "#1F4FD8"\n}'
            aria-label="扩展属性 JSON"
            class="w-full font-mono text-[11px] p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px] focus:outline-hidden focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
          ></textarea>
          <p v-if="jsonError" class="text-[11px] text-[#DC2626]">
            JSON 语法错误: {{ jsonError }}
          </p>
        </div>

        <!-- 底部占位 -->
        <div class="h-4"></div>
      </form>

      <!-- 抽屉底部按钮栏 -->
      <div class="px-6 py-4 bg-[#F8FAFC] border-t border-[#DDE3EA] flex items-center justify-end space-x-3">
        <button
          type="button"
          @click="dictStore.itemDrawerVisible = false"
          aria-label="取消并关闭"
          class="h-11 min-h-[44px] px-4 text-xs font-medium text-[#475569] bg-white border border-[#CBD5E1] rounded-[6px] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
        >
          取消
        </button>

        <button
          type="button"
          @click="onSubmit"
          aria-label="暂存条目至草稿"
          class="h-11 min-h-[44px] px-5 text-xs font-medium text-white bg-[#1F4FD8] rounded-[6px] hover:bg-[#1940B0] active:bg-[#153494] transition-colors cursor-pointer shadow-xs"
        >
          暂存至草稿
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useDictStore } from '../store/dictStore';
import { DictItem } from '../types/dict';
import { message } from 'ant-design-vue';

const dictStore = useDictStore();

const isEdit = computed(() => !!dictStore.editingItem && !!dictStore.editingItem.id && !dictStore.editingItem.id.startsWith('draft_'));

const availableParents = computed(() => {
  return dictStore.items.filter((i) => !i.parentCode && i.itemCode !== form.value.itemCode);
});

const form = ref({
  itemCode: '',
  parentCode: null as string | null,
  labelZh: '',
  labelEn: '',
  sortNo: 10,
  status: 1,
  validFrom: '' as string | null,
  validTo: '' as string | null,
  extString: '{}',
});

const jsonError = ref('');

watch(
  () => dictStore.editingItem,
  (newItem) => {
    if (!newItem) return;
    let zh = '';
    let en = '';
    if (typeof newItem.labelI18n === 'object') {
      zh = newItem.labelI18n['zh-CN'] || '';
      en = newItem.labelI18n.en || '';
    } else {
      try {
        const parsed = JSON.parse(newItem.labelI18n || '{}');
        zh = parsed['zh-CN'] || '';
        en = parsed.en || '';
      } catch {
        zh = newItem.labelI18n as string;
      }
    }

    let extStr = '{}';
    if (typeof newItem.ext === 'object' && newItem.ext !== null) {
      extStr = JSON.stringify(newItem.ext, null, 2);
    } else if (typeof newItem.ext === 'string') {
      extStr = newItem.ext;
    }

    form.value = {
      itemCode: newItem.itemCode || '',
      parentCode: newItem.parentCode || null,
      labelZh: zh,
      labelEn: en,
      sortNo: newItem.sortNo ?? 10,
      status: newItem.status ?? 1,
      validFrom: newItem.validFrom || null,
      validTo: newItem.validTo || null,
      extString: extStr,
    };
    jsonError.value = '';
  },
  { immediate: true }
);

const getZh = (item: DictItem) => {
  if (typeof item.labelI18n === 'object') return item.labelI18n['zh-CN'] || item.itemCode;
  return item.itemCode;
};

const formatExtJson = () => {
  try {
    const parsed = JSON.parse(form.value.extString || '{}');
    form.value.extString = JSON.stringify(parsed, null, 2);
    jsonError.value = '';
    message.success('JSON 已格式化');
  } catch (err: any) {
    jsonError.value = err.message;
  }
};

const onSubmit = async () => {
  if (!form.value.itemCode.trim()) {
    message.warning('请输入条目编码');
    return;
  }
  if (!form.value.labelZh.trim()) {
    message.warning('请输入中文展示名称');
    return;
  }

  let parsedExt = {};
  if (form.value.extString.trim()) {
    try {
      parsedExt = JSON.parse(form.value.extString);
      jsonError.value = '';
    } catch (err: any) {
      jsonError.value = err.message;
      message.error('扩展属性 JSON 语法错误，请检查');
      return;
    }
  }

  const payload = {
    id: dictStore.editingItem?.id,
    itemCode: form.value.itemCode.trim().toUpperCase(),
    parentCode: form.value.parentCode,
    labelI18n: {
      'zh-CN': form.value.labelZh.trim(),
      en: form.value.labelEn.trim(),
    },
    sortNo: form.value.sortNo,
    status: form.value.status,
    validFrom: form.value.validFrom || null,
    validTo: form.value.validTo || null,
    ext: parsedExt,
  };

  await dictStore.saveItemDraft(payload, isEdit.value);
};
</script>
