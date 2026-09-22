<template>
  <a-modal
    :open="visible"
    :title="`用户档案与全字段明细卡 [ ${user?.user_code || ''} ]`"
    :width="760"
    destroy-on-close
    :footer="null"
    @cancel="$emit('update:visible', false)"
  >
    <div v-if="user" class="py-2 space-y-4 text-xs select-text">
      <!-- 头部概览 -->
      <div class="flex items-center justify-between p-3.5 bg-[#f0f5fa] border border-[#cbdff2] rounded-lg">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-[#25548d] text-white flex items-center justify-center font-bold text-sm">
            {{ user.user_name.slice(0, 1) }}
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-bold text-slate-900 text-sm">{{ user.user_name }}</span>
              <span class="font-mono text-xs px-2 py-0.5 rounded bg-white border border-[#cbdff2] text-[#25548d]">
                {{ user.user_code }}
              </span>
              <span
                :class="[
                  'px-2 py-0.5 rounded text-[10px] font-medium',
                  user.flag === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                ]"
              >
                {{ user.flag === 1 ? '已启用' : '已禁用' }}
              </span>
              <span
                :class="[
                  'px-2 py-0.5 rounded text-[10px] font-medium',
                  user.user_status === 1 ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                ]"
              >
                {{ user.user_status === 1 ? '在职' : '离职' }}
              </span>
            </div>
            <div class="text-slate-500 mt-1 flex items-center space-x-3 text-[11px]">
              <span>所属组织: <strong class="text-slate-700">{{ user.org_name }}</strong></span>
              <span>•</span>
              <span>账号类型: <strong class="text-slate-700">{{ user.user_type === 1 ? '管理用户' : '普通用户' }}</strong></span>
            </div>
          </div>
        </div>

        <div class="text-right font-mono text-[11px] text-slate-500">
          <div>租户: {{ user.tenant_id }}</div>
          <div class="text-slate-400">ID: {{ user.id }}</div>
        </div>
      </div>

      <!-- 详细字段网格表 -->
      <div class="border border-slate-200 rounded overflow-hidden">
        <div class="bg-slate-100 px-3 py-1.5 font-bold text-slate-700 border-b border-slate-200">
          数据库表字段映射一览 (pbs_user)
        </div>

        <table class="w-full text-xs text-left">
          <tbody class="divide-y divide-slate-200">
            <tr class="bg-white">
              <td class="px-3 py-2 bg-slate-50 font-medium text-slate-600 w-36">雪花主键 ID (id)</td>
              <td class="px-3 py-2 font-mono text-slate-800">{{ user.id }}</td>
              <td class="px-3 py-2 bg-slate-50 font-medium text-slate-600 w-36">组织架构ID (org_id)</td>
              <td class="px-3 py-2 font-mono text-slate-800">{{ user.org_id }} ({{ user.org_name }})</td>
            </tr>
            <tr class="bg-white">
              <td class="px-3 py-2 bg-slate-50 font-medium text-slate-600">性别 (gender)</td>
              <td class="px-3 py-2 text-slate-800">{{ user.gender === 1 ? '男' : user.gender === 2 ? '女' : '保密' }}</td>
              <td class="px-3 py-2 bg-slate-50 font-medium text-slate-600">密码策略 (pass_type)</td>
              <td class="px-3 py-2 text-slate-800">{{ user.pass_type === 1 ? '加强加密策略' : '普通策略' }}</td>
            </tr>
            <tr class="bg-white">
              <td class="px-3 py-2 bg-slate-50 font-medium text-slate-600">账号起止有效期</td>
              <td class="px-3 py-2 font-mono text-slate-800">{{ user.begindate || '不限' }} ~ {{ user.enddate || '不限' }}</td>
              <td class="px-3 py-2 bg-slate-50 font-medium text-slate-600">默认语言 (language_id)</td>
              <td class="px-3 py-2 text-slate-800">{{ user.language_id === 1 ? '简体中文 (zh-CN)' : 'English (en-US)' }}</td>
            </tr>
            <tr class="bg-white">
              <td class="px-3 py-2 bg-slate-50 font-medium text-slate-600">密码有效期</td>
              <td class="px-3 py-2 font-mono text-slate-800">{{ user.pwdbegindate || '-' }} ~ {{ user.pwdenddate || '-' }}</td>
              <td class="px-3 py-2 bg-slate-50 font-medium text-slate-600">入职日期 (entrydate)</td>
              <td class="px-3 py-2 font-mono text-slate-800">{{ user.entrydate || '-' }}</td>
            </tr>
            <tr class="bg-white">
              <td class="px-3 py-2 bg-slate-50 font-medium text-slate-600">手机号码 (mobile)</td>
              <td class="px-3 py-2 font-mono text-slate-800">{{ user.mobile || '-' }}</td>
              <td class="px-3 py-2 bg-slate-50 font-medium text-slate-600">电子邮箱 (email)</td>
              <td class="px-3 py-2 font-mono text-slate-800">{{ user.email || '-' }}</td>
            </tr>
            <tr class="bg-white">
              <td class="px-3 py-2 bg-slate-50 font-medium text-slate-600">身份证号 (idcard)</td>
              <td class="px-3 py-2 font-mono text-slate-800">{{ user.idcard || '-' }}</td>
              <td class="px-3 py-2 bg-slate-50 font-medium text-slate-600">出生日期 (birthday)</td>
              <td class="px-3 py-2 font-mono text-slate-800">{{ user.birthday || '-' }}</td>
            </tr>
            <tr class="bg-white">
              <td class="px-3 py-2 bg-slate-50 font-medium text-slate-600">国家与城市</td>
              <td class="px-3 py-2 text-slate-800" colspan="3">{{ user.country || '' }} - {{ user.city || '' }}</td>
            </tr>
            <tr class="bg-white">
              <td class="px-3 py-2 bg-slate-50 font-medium text-slate-600">详细通讯地址 (address)</td>
              <td class="px-3 py-2 text-slate-800" colspan="3">{{ user.address || '-' }}</td>
            </tr>
            <tr class="bg-white">
              <td class="px-3 py-2 bg-slate-50 font-medium text-slate-600">备注信息 (remark)</td>
              <td class="px-3 py-2 text-slate-800" colspan="3">{{ user.remark || '无特殊说明' }}</td>
            </tr>
            <tr class="bg-white">
              <td class="px-3 py-2 bg-slate-50 font-medium text-slate-600">创建人 / 时间</td>
              <td class="px-3 py-2 font-mono text-slate-800">{{ user.creator }} ({{ user.create_time }})</td>
              <td class="px-3 py-2 bg-slate-50 font-medium text-slate-600">最后修改人 / 时间</td>
              <td class="px-3 py-2 font-mono text-slate-800">{{ user.modifier }} ({{ user.modify_time }})</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-end pt-2">
        <button
          type="button"
          @click="$emit('update:visible', false)"
          class="px-4 py-1.5 rounded bg-[#25548d] hover:bg-[#1e4676] text-white text-xs font-medium cursor-pointer"
        >
          关闭
        </button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { PbsUser } from '../../types/user';

defineProps<{
  visible: boolean;
  user: PbsUser | null;
}>();

defineEmits<{
  (e: 'update:visible', val: boolean): void;
}>();
</script>
