<template>
  <a-modal
    :open="visible"
    :title="isEdit ? `编辑用户信息 [ ${formData.user_code} ]` : '新建系统用户 (pbs_user)'"
    :width="900"
    :confirm-loading="submitting"
    destroy-on-close
    @cancel="handleCancel"
    @ok="handleSubmit"
    ok-text="保存用户"
    cancel-text="取消"
  >
    <div class="max-h-[70vh] overflow-y-auto px-2 py-1 select-text">
      <!-- 提示条 (仅在编辑已有用户时展示雪花主键与租户；新增时后台自动生成无需显示) -->
      <div v-if="isEdit" class="mb-4 px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 flex items-center justify-between">
        <div class="flex items-center space-x-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-[#25548d]"></span>
          <span>雪花算法全局唯一ID：<strong class="font-mono text-slate-800">{{ formData.id }}</strong></span>
        </div>
        <span class="text-slate-500 font-mono text-[11px]">租户 (tenant_id): {{ formData.tenant_id }}</span>
      </div>

      <a-form layout="vertical" :model="formData">
        <!-- 分组 1: 核心身份凭证 -->
        <div class="text-xs font-bold text-slate-800 pb-1.5 mb-3 border-b border-slate-200 flex items-center space-x-1.5">
          <span class="w-1 h-3.5 bg-[#25548d] rounded-full"></span>
          <span>1. 基础身份与组织凭据</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-xs">
          <a-form-item label="用户账号 (user_code)" required>
            <a-input
              v-model:value="formData.user_code"
              placeholder="请输入唯一用户账号，如 zhangsan"
              :disabled="isEdit"
              size="middle"
            />
          </a-form-item>

          <a-form-item label="用户姓名 (user_name)" required>
            <a-input
              v-model:value="formData.user_name"
              placeholder="请输入姓名"
              size="middle"
            />
          </a-form-item>

          <a-form-item label="所属组织 (org_id)" required>
            <a-select
              v-model:value="formData.org_id"
              placeholder="请选择组织架构"
              size="middle"
              @change="onOrgChange"
            >
              <a-select-option v-for="org in orgs" :key="org.id" :value="org.id">
                {{ org.org_name }} ({{ org.org_code }})
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="用户类型 (user_type)" required>
            <a-select v-model:value="formData.user_type" size="middle">
              <a-select-option :value="0">普通用户 (业务经办)</a-select-option>
              <a-select-option :value="1">管理用户 (主管审核)</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="性别 (gender)">
            <a-select v-model:value="formData.gender" size="middle">
              <a-select-option :value="1">男</a-select-option>
              <a-select-option :value="2">女</a-select-option>
              <a-select-option :value="0">保密</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="密码 (password)" :required="!isEdit">
            <a-input-password
              v-model:value="formData.password"
              :placeholder="isEdit ? '留空则保持原密码不变' : '请输入初始登录密码'"
              size="middle"
            />
          </a-form-item>
        </div>

        <!-- 分组 2: 安全策略与状态控制 -->
        <div class="text-xs font-bold text-slate-800 pb-1.5 my-3 border-b border-slate-200 flex items-center space-x-1.5">
          <span class="w-1 h-3.5 bg-[#25548d] rounded-full"></span>
          <span>2. 安全管控与生命周期</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-xs">
          <a-form-item label="是否启用 (flag)">
            <a-select v-model:value="formData.flag" size="middle">
              <a-select-option :value="1">🟢 启用 (正常访问)</a-select-option>
              <a-select-option :value="0">🔴 禁用 (禁止登录)</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="在职状态 (user_status)">
            <a-select v-model:value="formData.user_status" size="middle">
              <a-select-option :value="1">在职员工</a-select-option>
              <a-select-option :value="0">已离职</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="密码策略 (pass_type)">
            <a-select v-model:value="formData.pass_type" size="middle">
              <a-select-option :value="0">普通策略 (简单复杂度)</a-select-option>
              <a-select-option :value="1">加强策略 (高强度加密)</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="默认系统语言 (language_id)">
            <a-select v-model:value="formData.language_id" size="middle">
              <a-select-option :value="1">简体中文 (zh-CN)</a-select-option>
              <a-select-option :value="2">English (en-US)</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="账号生效日 (begindate)">
            <a-date-picker
              v-model:value="begindateVal"
              value-format="YYYY-MM-DD"
              class="w-full"
              size="middle"
              placeholder="生效起始日"
            />
          </a-form-item>

          <a-form-item label="账号失效日 (enddate)">
            <a-date-picker
              v-model:value="enddateVal"
              value-format="YYYY-MM-DD"
              class="w-full"
              size="middle"
              placeholder="失效截止日"
            />
          </a-form-item>

          <a-form-item label="密码生效日 (pwdbegindate)">
            <a-date-picker
              v-model:value="pwdbegindateVal"
              value-format="YYYY-MM-DD"
              class="w-full"
              size="middle"
              placeholder="密码生效日"
            />
          </a-form-item>

          <a-form-item label="密码失效日 (pwdenddate)">
            <a-date-picker
              v-model:value="pwdenddateVal"
              value-format="YYYY-MM-DD"
              class="w-full"
              size="middle"
              placeholder="密码过期强制更换日"
            />
          </a-form-item>
        </div>

        <!-- 分组 3: 个人联络与档案信息 -->
        <div class="text-xs font-bold text-slate-800 pb-1.5 my-3 border-b border-slate-200 flex items-center space-x-1.5">
          <span class="w-1 h-3.5 bg-[#25548d] rounded-full"></span>
          <span>3. 联络通讯与人事档案</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-xs">
          <a-form-item label="手机号码 (mobile)">
            <a-input v-model:value="formData.mobile" placeholder="如 13800000000" size="middle" />
          </a-form-item>

          <a-form-item label="电子邮箱 (email)">
            <a-input v-model:value="formData.email" placeholder="如 user@example.com" size="middle" />
          </a-form-item>

          <a-form-item label="身份证/护照号 (idcard)">
            <a-input v-model:value="formData.idcard" placeholder="18~20位证件号码" size="middle" />
          </a-form-item>

          <a-form-item label="出生日期 (birthday)">
            <a-date-picker
              v-model:value="birthdayVal"
              value-format="YYYY-MM-DD"
              class="w-full"
              size="middle"
              placeholder="选择生日"
            />
          </a-form-item>

          <a-form-item label="入职日期 (entrydate)">
            <a-date-picker
              v-model:value="entrydateVal"
              value-format="YYYY-MM-DD"
              class="w-full"
              size="middle"
              placeholder="选择入职日期"
            />
          </a-form-item>

          <a-form-item label="国家 / 城市 (country / city)">
            <div class="grid grid-cols-2 gap-2">
              <a-input v-model:value="formData.country" placeholder="国家" size="middle" />
              <a-input v-model:value="formData.city" placeholder="城市" size="middle" />
            </div>
          </a-form-item>
        </div>

        <a-form-item label="详细居住/联络地址 (address)" class="mt-1">
          <a-input v-model:value="formData.address" placeholder="请输入详细工作或居住地址" size="middle" />
        </a-form-item>

        <a-form-item label="备注说明 (remark)" class="mt-1">
          <a-textarea
            v-model:value="formData.remark"
            :rows="2"
            placeholder="填写用户业务分工、调动或权限特殊说明..."
          />
        </a-form-item>

        <!-- 审计追踪信息展示 (只在编辑态显示) -->
        <div v-if="isEdit" class="mt-2 p-2.5 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-500 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>创建人: <span class="text-slate-700 font-mono">{{ formData.creator || '-' }}</span></div>
          <div>创建时间: <span class="text-slate-700 font-mono">{{ formData.create_time || '-' }}</span></div>
          <div>修改人: <span class="text-slate-700 font-mono">{{ formData.modifier || '-' }}</span></div>
          <div>修改时间: <span class="text-slate-700 font-mono">{{ formData.modify_time || '-' }}</span></div>
        </div>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { message } from 'ant-design-vue';
import { PbsUser, PbsOrg } from '../../types/user';
import dayjs, { Dayjs } from 'dayjs';

const props = defineProps<{
  visible: boolean;
  user?: PbsUser | null;
  orgs: PbsOrg[];
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'save', user: PbsUser): void;
}>();

const isEdit = computed(() => !!props.user && !!props.user.id);
const submitting = ref(false);

const formData = ref<PbsUser>({
  id: '',
  tenant_id: 1,
  user_code: '',
  user_name: '',
  user_type: 0,
  password: '',
  org_id: '',
  org_name: '',
  avatar: '',
  gender: 1,
  pass_type: 1,
  flag: 1,
  user_status: 1,
  begindate: dayjs().format('YYYY-MM-DD'),
  enddate: '2035-12-31',
  language_id: 1,
  pwdbegindate: dayjs().format('YYYY-MM-DD'),
  pwdenddate: dayjs().add(1, 'year').format('YYYY-MM-DD'),
  mobile: '',
  birthday: null,
  entrydate: dayjs().format('YYYY-MM-DD'),
  email: '',
  idcard: '',
  country: '中国',
  city: '上海',
  address: '',
  creator: 'current_user',
  create_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  modifier: 'current_user',
  modify_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  remark: '',
});

// 日期中转绑定
const begindateVal = ref<string | null>(null);
const enddateVal = ref<string | null>(null);
const pwdbegindateVal = ref<string | null>(null);
const pwdenddateVal = ref<string | null>(null);
const birthdayVal = ref<string | null>(null);
const entrydateVal = ref<string | null>(null);

watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.user) {
        formData.value = { ...props.user };
        begindateVal.value = props.user.begindate || null;
        enddateVal.value = props.user.enddate || null;
        pwdbegindateVal.value = props.user.pwdbegindate || null;
        pwdenddateVal.value = props.user.pwdenddate || null;
        birthdayVal.value = props.user.birthday || null;
        entrydateVal.value = props.user.entrydate || null;
      } else {
        // 生成新的雪花ID (19位大整数模拟)
        const snowflakeId = `1839${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;
        formData.value = {
          id: snowflakeId,
          tenant_id: 1,
          user_code: '',
          user_name: '',
          user_type: 0,
          password: '',
          org_id: props.orgs[0]?.id || '',
          org_name: props.orgs[0]?.org_name || '',
          gender: 1,
          pass_type: 1,
          flag: 1,
          user_status: 1,
          begindate: dayjs().format('YYYY-MM-DD'),
          enddate: '2035-12-31',
          language_id: 1,
          pwdbegindate: dayjs().format('YYYY-MM-DD'),
          pwdenddate: dayjs().add(1, 'year').format('YYYY-MM-DD'),
          mobile: '',
          birthday: null,
          entrydate: dayjs().format('YYYY-MM-DD'),
          email: '',
          idcard: '',
          country: '中国',
          city: '上海',
          address: '',
          creator: 'liu_buyer',
          create_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          modifier: 'liu_buyer',
          modify_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          remark: '',
        };
        begindateVal.value = formData.value.begindate || null;
        enddateVal.value = formData.value.enddate || null;
        pwdbegindateVal.value = formData.value.pwdbegindate || null;
        pwdenddateVal.value = formData.value.pwdenddate || null;
        birthdayVal.value = null;
        entrydateVal.value = formData.value.entrydate || null;
      }
    }
  },
  { immediate: true }
);

const onOrgChange = (orgId: string) => {
  const org = props.orgs.find((o) => o.id === orgId);
  if (org) {
    formData.value.org_name = org.org_name;
  }
};

const handleCancel = () => {
  emit('update:visible', false);
};

const handleSubmit = () => {
  if (!formData.value.user_code?.trim()) {
    message.error('请填写用户账号 (user_code)！');
    return;
  }
  if (!formData.value.user_name?.trim()) {
    message.error('请填写用户姓名 (user_name)！');
    return;
  }
  if (!formData.value.org_id) {
    message.error('请选择所属组织 (org_id)！');
    return;
  }
  if (!isEdit.value && !formData.value.password?.trim()) {
    message.error('新建用户必须设置初始密码！');
    return;
  }

  // 同步日期字段
  formData.value.begindate = begindateVal.value;
  formData.value.enddate = enddateVal.value;
  formData.value.pwdbegindate = pwdbegindateVal.value;
  formData.value.pwdenddate = pwdenddateVal.value;
  formData.value.birthday = birthdayVal.value;
  formData.value.entrydate = entrydateVal.value;

  formData.value.modify_time = dayjs().format('YYYY-MM-DD HH:mm:ss');
  formData.value.modifier = 'liu_buyer';

  emit('save', { ...formData.value });
  emit('update:visible', false);
};
</script>
