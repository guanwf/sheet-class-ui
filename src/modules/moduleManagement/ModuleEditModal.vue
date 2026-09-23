<template>
  <a-modal
    :open="visible"
    :title="isEdit ? `编辑系统模块定义 [ ${formData.module_id} ]` : '新建系统模块 (pbs_module)'"
    :width="920"
    :confirm-loading="submitting"
    :mask-closable="false"
    :keyboard="false"
    destroy-on-close
    @cancel="handleCancel"
    @ok="handleSubmit"
    ok-text="确认保存模块"
    cancel-text="放弃编辑"
  >
    <div class="max-h-[75vh] overflow-y-auto px-1 py-1 space-y-4 text-xs select-none">
      <!-- 顶部信息说明栏 -->
      <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start space-x-3">
        <div class="w-8 h-8 rounded-full bg-[#25548d] text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-sm">
          <Layers class="w-4 h-4" />
        </div>
        <div class="flex-1 text-[11px] text-slate-600 leading-relaxed">
          <div class="font-semibold text-slate-800 text-xs mb-0.5">
            pbs_module 基础元数据规范
          </div>
          <div>
            1. <strong>模块ID (module_id)</strong> 与 <strong>模块名称 (module_name)</strong> 分别受数据库唯一约束 (UQ01/UQ02) 保障，不可重复。<br />
            2. <strong>权限值 (rightvalues)</strong> 通过 11 位二进制掩码位或运算（<code>val1 | val2 | ...</code>）合并计算，支持颗粒度细化到查询、审核、作废等 11 类独立操作。
          </div>
        </div>
      </div>

      <!-- 表单主体 -->
      <a-form layout="vertical" class="space-y-3">
        <!-- 第 1 行: 模块ID & 模块名称 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a-form-item label="模块ID (module_id)" required class="!mb-0">
            <template #tooltip>
              全局唯一业务编码，通常为大写英文字符与下划线，例如：PURCHASE_ORDER、SYSTEM_USER
            </template>
            <a-input
              v-model:value="formData.module_id"
              placeholder="请输入模块ID，如：INVENTORY_CHECK"
              :disabled="isEdit"
              @input="onModuleIdInput"
              class="font-mono uppercase font-semibold"
              allow-clear
            />
          </a-form-item>

          <a-form-item label="模块名称 (module_name)" required class="!mb-0">
            <template #tooltip>
              全局唯一业务展示名称，如：采购订单、库存盘点单
            </template>
            <a-input
              v-model:value="formData.module_name"
              placeholder="请输入模块名称，如：库存实物盘点单"
              allow-clear
            />
          </a-form-item>
        </div>

        <!-- 第 2 行: 提示信息 (hint) & 启用状态 (flag) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-2">
            <a-form-item label="提示信息 (hint)" class="!mb-0">
              <template #tooltip>
                在功能入口、面包屑导航或鼠标悬浮时展示的轻量提示文案
              </template>
              <a-input
                v-model:value="formData.hint"
                placeholder="简要提示该模块的核心业务功能，如：实物盘点、盘盈盘亏过账与差异冲减"
                allow-clear
              />
            </a-form-item>
          </div>

          <div>
            <a-form-item label="是否启用 (flag)" required class="!mb-0">
              <template #tooltip>
                0=停用（不可见/不可点击），1=启用（正常授权访问）
              </template>
              <div class="flex items-center space-x-3 h-8 px-2 bg-slate-50 border border-slate-200 rounded">
                <a-switch
                  v-model:checked="isFlagEnabled"
                  checked-children="启用 (1)"
                  un-checked-children="停用 (0)"
                />
                <span class="text-[11px]" :class="isFlagEnabled ? 'text-emerald-700 font-medium' : 'text-slate-400'">
                  {{ isFlagEnabled ? '正处于有效状态' : '已停用此模块' }}
                </span>
              </div>
            </a-form-item>
          </div>
        </div>

        <!-- 第 3 行: 操作地址 (actionurl) & 操作类型 (actiontypeid) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a-form-item label="操作地址 (actionurl)" required class="!mb-0">
            <template #tooltip>
              前端路由 Path、微应用访问 URL 或特定跳转链接，如：/purchase/order
            </template>
            <a-input
              v-model:value="formData.actionurl"
              placeholder="请输入操作路由或链接，如：/stock/check"
              class="font-mono text-xs"
              allow-clear
            >
              <template #prefix>
                <Link2 class="w-3.5 h-3.5 text-slate-400 mr-1" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item label="操作类型 (actiontypeid)" required class="!mb-0">
            <template #tooltip>
              定义该模块的承载宿主形式，支持工作区页签、系统菜单、弹窗或外链
            </template>
            <a-select
              v-model:value="formData.actiontypeid"
              placeholder="请选择操作类型"
              class="w-full text-xs"
            >
              <a-select-option
                v-for="item in ACTION_TYPE_OPTIONS"
                :key="item.id"
                :value="item.id"
              >
                <div class="flex items-center justify-between text-xs py-0.5">
                  <span class="font-medium">{{ item.name }}</span>
                </div>
              </a-select-option>
            </a-select>
          </a-form-item>
        </div>

        <!-- 第 4 行: 操作参数 (actionparams) -->
        <a-form-item label="操作参数 (actionparams)" class="!mb-0">
          <template #tooltip>
            启动该模块时透传的 URL Query 或 JSON 参数，如：{"density":"compact","readonly":false}
          </template>
          <a-input
            v-model:value="formData.actionparams"
            placeholder='JSON 格式或 URL 参数，如：{"density":"compact"}'
            class="font-mono text-xs"
            allow-clear
          />
        </a-form-item>

        <!-- 第 5 行: 核心设计 —— 权限值 (rightvalues) 位掩码选择器 -->
        <div class="p-3.5 bg-slate-50 border border-slate-300/80 rounded-lg space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/90 pb-2.5">
            <div class="flex items-center space-x-2">
              <Key class="w-4 h-4 text-[#25548d]" />
              <span class="font-bold text-slate-800 text-xs">权限值 (rightvalues) 配置</span>
              <span class="text-[11px] text-slate-500 font-normal">
                — 基于 <code>pageUtils.PERM</code> 按位或运算
              </span>
            </div>

            <!-- 掩码快捷预置方案 -->
            <div class="flex items-center space-x-1.5 flex-wrap">
              <span class="text-[11px] text-slate-400 mr-1">快捷方案:</span>
              <button
                v-for="preset in PERM_PRESETS"
                :key="preset.name"
                type="button"
                @click="applyPreset(preset.value)"
                class="px-2 py-0.5 rounded text-[10px] font-medium border bg-white text-slate-700 hover:text-[#25548d] hover:border-[#25548d] transition shadow-2xs cursor-pointer"
                :title="preset.hint"
              >
                {{ preset.name }}
              </button>
              <button
                type="button"
                @click="clearAllPerms"
                class="px-2 py-0.5 rounded text-[10px] font-medium border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition shadow-2xs cursor-pointer"
              >
                清空 (0)
              </button>
            </div>
          </div>

          <!-- 复选框矩阵网格 (11 个原子权限 + 全部(2047)) -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-1">
            <div
              v-for="opt in ATOMIC_PERM_OPTIONS"
              :key="opt.value"
              @click="toggleAtomicPerm(opt.value)"
              :class="[
                'p-2 rounded border transition cursor-pointer select-none flex flex-col justify-between',
                isPermSelected(opt.value)
                  ? 'bg-blue-50/80 border-[#25548d] text-[#25548d] shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              ]"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs">{{ opt.name }}</span>
                <span class="font-mono text-[10px] px-1 rounded bg-slate-100 text-slate-500">
                  {{ opt.value }}
                </span>
              </div>
              <div class="text-[10px] text-slate-400 mt-1 line-clamp-1" :title="opt.description">
                {{ opt.description }}
              </div>
              <div class="mt-1 flex items-center justify-between">
                <span class="text-[9px] font-mono text-slate-400">bit: 2^{{ opt.bitIndex }}</span>
                <input
                  type="checkbox"
                  :checked="isPermSelected(opt.value)"
                  class="rounded border-slate-300 text-[#25548d] focus:ring-0 pointer-events-none w-3.5 h-3.5"
                />
              </div>
            </div>

            <!-- "全部(2047)" 聚合开关项 -->
            <div
              @click="toggleAllPerm"
              :class="[
                'p-2 rounded border transition cursor-pointer select-none flex flex-col justify-between col-span-2 sm:col-span-1 md:col-span-2 lg:col-span-1',
                isAllPermSelected
                  ? 'bg-gradient-to-br from-amber-50 to-amber-100/70 border-amber-500 text-amber-900 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
              ]"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs flex items-center">
                  <Sparkles class="w-3.5 h-3.5 mr-1 text-amber-600" />
                  全部权限
                </span>
                <span class="font-mono text-[10px] px-1 rounded bg-amber-200/60 text-amber-800 font-bold">
                  2047
                </span>
              </div>
              <div class="text-[10px] text-slate-500 mt-1">
                一键激活全部 11 维业务操作
              </div>
              <div class="mt-1 flex items-center justify-between">
                <span class="text-[9px] font-mono text-amber-700 font-semibold">ALL: 0x07FF</span>
                <input
                  type="checkbox"
                  :checked="isAllPermSelected"
                  class="rounded border-amber-400 text-amber-600 focus:ring-0 pointer-events-none w-3.5 h-3.5"
                />
              </div>
            </div>
          </div>

          <!-- 运算结果实时可视化面板 -->
          <div class="bg-white border border-slate-200 rounded p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex items-center space-x-3 flex-wrap">
              <span class="text-slate-500">计算结果:</span>
              <div class="flex items-baseline space-x-1">
                <span class="text-[11px] text-slate-400">十进制 (INT):</span>
                <strong class="font-mono text-base text-[#25548d] font-bold">{{ computedRightvalues }}</strong>
              </div>
              <div class="flex items-baseline space-x-1">
                <span class="text-[11px] text-slate-400">十六进制:</span>
                <span class="font-mono text-xs font-semibold text-slate-700">{{ toHex4(computedRightvalues) }}</span>
              </div>
              <div class="flex items-baseline space-x-1">
                <span class="text-[11px] text-slate-400">二进制位 (11-Bit):</span>
                <span class="font-mono text-[11px] tracking-widest px-1 py-0.2 bg-slate-100 rounded text-slate-800">
                  {{ toBinary11(computedRightvalues) }}
                </span>
              </div>
            </div>

            <!-- 直接输入/微调数字输入框 -->
            <div class="flex items-center space-x-1.5">
              <span class="text-[11px] text-slate-500">直接微调数值:</span>
              <a-input-number
                v-model:value="manualRightvalues"
                :min="0"
                :max="2047"
                size="small"
                class="w-24 font-mono font-bold"
                @change="onManualNumberChange"
              />
            </div>
          </div>
        </div>

        <!-- 第 6 行: 备注 (remark) -->
        <a-form-item label="备注说明 (remark)" class="!mb-0">
          <a-textarea
            v-model:value="formData.remark"
            placeholder="填写关于该模块业务用途、设计背景或特殊约束的备注信息"
            :rows="2"
            :maxlength="512"
            show-count
          />
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Layers, Link2, Key, Sparkles } from 'lucide-vue-next';
import { message } from 'ant-design-vue';
import { PbsModule, ACTION_TYPE_OPTIONS } from '../../types/module';
import {
  pageUtils,
  ATOMIC_PERM_OPTIONS,
  PERM_PRESETS,
  toBinary11,
  toHex4,
  decodeRightValues,
  encodeRightValues,
} from '../../utils/pageUtils';

const props = defineProps<{
  visible: boolean;
  initialData?: PbsModule | null;
  existingModules: PbsModule[];
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'submit', module: PbsModule): void;
}>();

const submitting = ref(false);

const isEdit = computed(() => !!props.initialData?.id);

// 表单响应式数据
const formData = ref<Partial<PbsModule>>({
  module_id: '',
  module_name: '',
  hint: '',
  rightvalues: pageUtils.PERM.ALL,
  actionurl: '',
  actiontypeid: 'TAB_PAGE',
  actionparams: '',
  flag: 1,
  remark: '',
});

// 选中的权限原子值列表 (e.g. [1, 2, 4])
const selectedPermValues = ref<number[]>([]);
// 手工数值输入框同步
const manualRightvalues = ref<number>(2047);

// 监听弹窗打开并初始化
watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.initialData) {
        formData.value = { ...props.initialData };
        const rv = props.initialData.rightvalues ?? 0;
        selectedPermValues.value = decodeRightValues(rv);
        manualRightvalues.value = rv;
      } else {
        // 新建默认值
        formData.value = {
          module_id: '',
          module_name: '',
          hint: '',
          rightvalues: 2047,
          actionurl: '',
          actiontypeid: 'TAB_PAGE',
          actionparams: '{"density":"compact"}',
          flag: 1,
          remark: '',
        };
        selectedPermValues.value = decodeRightValues(2047);
        manualRightvalues.value = 2047;
      }
    }
  },
  { immediate: true }
);

// 是否启用开关转换
const isFlagEnabled = computed({
  get: () => formData.value.flag === 1,
  set: (val: boolean) => {
    formData.value.flag = val ? 1 : 0;
  },
});

// 计算当前的 rightvalues 总值
const computedRightvalues = computed(() => {
  return encodeRightValues(selectedPermValues.value);
});

// 检查某个原子权限是否被选中
const isPermSelected = (permValue: number) => {
  return selectedPermValues.value.includes(permValue);
};

// 检查是否所有 11 个原子权限都被选中
const isAllPermSelected = computed(() => {
  return ATOMIC_PERM_OPTIONS.every(opt => selectedPermValues.value.includes(opt.value));
});

// 切换某个原子权限项
const toggleAtomicPerm = (permValue: number) => {
  const index = selectedPermValues.value.indexOf(permValue);
  let updated = [...selectedPermValues.value];
  if (index >= 0) {
    updated.splice(index, 1);
    // 移除全部(2047)标记
    const allIndex = updated.indexOf(pageUtils.PERM.ALL);
    if (allIndex >= 0) updated.splice(allIndex, 1);
  } else {
    updated.push(permValue);
    // 如果全部 11 个原子权限都齐了，补充 ALL(2047)
    if (ATOMIC_PERM_OPTIONS.every(opt => updated.includes(opt.value))) {
      if (!updated.includes(pageUtils.PERM.ALL)) {
        updated.push(pageUtils.PERM.ALL);
      }
    }
  }
  selectedPermValues.value = updated;
  manualRightvalues.value = encodeRightValues(updated);
};

// 切换“全部权限 (2047)”
const toggleAllPerm = () => {
  if (isAllPermSelected.value) {
    // 已经全选 -> 取消全选
    selectedPermValues.value = [];
    manualRightvalues.value = 0;
  } else {
    // 未全选 -> 选满 11 个原子项 + ALL
    selectedPermValues.value = [...ATOMIC_PERM_OPTIONS.map(o => o.value), pageUtils.PERM.ALL];
    manualRightvalues.value = pageUtils.PERM.ALL;
  }
};

// 应用预设方案
const applyPreset = (mask: number) => {
  selectedPermValues.value = decodeRightValues(mask);
  manualRightvalues.value = mask;
  message.info(`已应用预置权限组合 (数值: ${mask})`);
};

// 清空全部权限
const clearAllPerms = () => {
  selectedPermValues.value = [];
  manualRightvalues.value = 0;
};

// 手工输入数字微调
const onManualNumberChange = (val: number | null) => {
  const num = typeof val === 'number' && !isNaN(val) ? Math.max(0, Math.min(2047, val)) : 0;
  selectedPermValues.value = decodeRightValues(num);
};

// 模块ID转大写并过滤非法字符
const onModuleIdInput = () => {
  if (formData.value.module_id) {
    formData.value.module_id = formData.value.module_id
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '');
  }
};

// 取消编辑
const handleCancel = () => {
  emit('update:visible', false);
};

// 提交保存
const handleSubmit = () => {
  // 1. 校验必填字段
  if (!formData.value.module_id || !formData.value.module_id.trim()) {
    message.error('请填写模块ID (module_id)');
    return;
  }
  if (!formData.value.module_name || !formData.value.module_name.trim()) {
    message.error('请填写模块名称 (module_name)');
    return;
  }
  if (!formData.value.actionurl || !formData.value.actionurl.trim()) {
    message.error('请填写操作地址 (actionurl)');
    return;
  }
  if (!formData.value.actiontypeid) {
    message.error('请选择操作类型 (actiontypeid)');
    return;
  }

  const cleanModuleId = formData.value.module_id.trim().toUpperCase();
  const cleanModuleName = formData.value.module_name.trim();

  // 2. 数据库唯一键校验 (pbs_module_UQ01 & pbs_module_UQ02)
  const currentId = props.initialData?.id;

  const idConflict = props.existingModules.some(
    m => m.id !== currentId && m.module_id.toUpperCase() === cleanModuleId
  );
  if (idConflict) {
    message.error(`违反唯一约束 pbs_module_UQ01：模块ID [ ${cleanModuleId} ] 已存在，请更换！`);
    return;
  }

  const nameConflict = props.existingModules.some(
    m => m.id !== currentId && m.module_name.trim() === cleanModuleName
  );
  if (nameConflict) {
    message.error(`违反唯一约束 pbs_module_UQ02：模块名称 [ ${cleanModuleName} ] 已存在，请更换！`);
    return;
  }

  submitting.value = true;
  try {
    const finalRightvalues = computedRightvalues.value;
    const finalModule: PbsModule = {
      id: currentId || `1839${Date.now()}${Math.floor(Math.random() * 899 + 100)}`,
      module_id: cleanModuleId,
      module_name: cleanModuleName,
      hint: formData.value.hint?.trim() || '',
      rightvalues: finalRightvalues,
      actionurl: formData.value.actionurl.trim(),
      actiontypeid: formData.value.actiontypeid,
      actionparams: formData.value.actionparams?.trim() || '',
      flag: formData.value.flag ?? 1,
      creater: formData.value.creater || '刘工 (主控业务员)',
      create_time: formData.value.create_time || new Date().toISOString().split('T')[0],
      modifyer: '刘工 (主控业务员)',
      modify_time: new Date().toISOString().split('T')[0],
      remark: formData.value.remark?.trim() || '',
    };

    emit('submit', finalModule);
    emit('update:visible', false);
    message.success(isEdit.value ? '模块元数据更新成功！' : '新模块创建成功！');
  } catch (err: any) {
    message.error(err.message || '保存失败');
  } finally {
    submitting.value = false;
  }
};
</script>
