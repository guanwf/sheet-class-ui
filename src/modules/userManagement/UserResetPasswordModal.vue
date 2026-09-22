<template>
  <a-modal
    :open="visible"
    title="批量重置用户密码 (密文加密)"
    :width="460"
    :mask-closable="false"
    :keyboard="false"
    destroy-on-close
    @cancel="$emit('update:visible', false)"
    @ok="handleConfirm"
    ok-text="确认重置"
    cancel-text="取消"
  >
    <div class="py-2 space-y-3 text-xs">
      <div class="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-800">
        已选中 <strong class="text-amber-900 font-mono">{{ users.length }}</strong> 位用户进行密码重置。
      </div>

      <div class="space-y-1">
        <label class="font-medium text-slate-700">新设置密码:</label>
        <a-input-password
          v-model:value="newPassword"
          placeholder="请输入新登录密码"
          size="middle"
        />
      </div>

      <div class="space-y-1">
        <label class="font-medium text-slate-700">密码策略 (pass_type):</label>
        <a-select v-model:value="passType" class="w-full" size="middle">
          <a-select-option :value="0">普通策略 (无需特殊字符)</a-select-option>
          <a-select-option :value="1">加强策略 (必须包含大小写字母与数字)</a-select-option>
        </a-select>
      </div>

      <label class="flex items-center space-x-1.5 cursor-pointer text-slate-600">
        <input type="checkbox" v-model="requireChangeOnFirstLogin" class="rounded text-[#25548d]" />
        <span>首次登录强制要求修改密码</span>
      </label>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { PbsUser } from '../../types/user';

const props = defineProps<{
  visible: boolean;
  users: PbsUser[];
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'confirm', payload: { newPass: string; passType: number; userIds: string[] }): void;
}>();

const newPassword = ref('');
const passType = ref(1);
const requireChangeOnFirstLogin = ref(true);

watch(
  () => props.visible,
  (val) => {
    if (val) {
      newPassword.value = '';
      passType.value = 1;
    }
  }
);

const handleConfirm = () => {
  if (!newPassword.value?.trim()) {
    message.error('请输入新密码！');
    return;
  }
  emit('confirm', {
    newPass: newPassword.value,
    passType: passType.value,
    userIds: props.users.map((u) => u.id),
  });
  emit('update:visible', false);
};
</script>
