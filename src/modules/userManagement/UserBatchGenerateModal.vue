<template>
  <a-modal
    :open="visible"
    title="快速追加生成测试用户 (支持雪花算法大ID)"
    :width="500"
    destroy-on-close
    @cancel="$emit('update:visible', false)"
    @ok="handleBatchGenerate"
    ok-text="确认批量生成"
    cancel-text="取消"
  >
    <div class="py-2 space-y-3 text-xs">
      <p class="text-slate-600">
        系统将按照 <code class="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">pbs_user</code> 表规范批量随机生成合规数据：
      </p>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="font-medium text-slate-700 block mb-1">生成数量 (行):</label>
          <a-input-number v-model:value="count" :min="1" :max="50" class="w-full" size="middle" />
        </div>
        <div>
          <label class="font-medium text-slate-700 block mb-1">账号前缀 (user_code):</label>
          <a-input v-model:value="prefix" placeholder="如 emp_" size="middle" />
        </div>
      </div>

      <div>
        <label class="font-medium text-slate-700 block mb-1">分配组织 (org_id):</label>
        <a-select v-model:value="selectedOrgId" class="w-full" size="middle">
          <a-select-option v-for="org in orgs" :key="org.id" :value="org.id">
            {{ org.org_name }} ({{ org.org_code }})
          </a-select-option>
        </a-select>
      </div>

      <div class="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-500">
        说明：生成的每条记录都会生成唯一的 19 位雪花主键 ID、自动计算有效起止期、密文密码及入职日期。
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PbsOrg, PbsUser } from '../../types/user';
import dayjs from 'dayjs';

const props = defineProps<{
  visible: boolean;
  orgs: PbsOrg[];
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'generate', users: PbsUser[]): void;
}>();

const count = ref(5);
const prefix = ref('staff_');
const selectedOrgId = ref(props.orgs[0]?.id || '1839000000000001003');

const handleBatchGenerate = () => {
  const result: PbsUser[] = [];
  const targetOrg = props.orgs.find((o) => o.id === selectedOrgId.value) || props.orgs[0];

  const firstNames = ['赵', '钱', '孙', '李', '周', '吴', '郑', '王', '冯', '陈', '楚', '魏', '蒋', '沈', '韩', '杨'];
  const lastNames = ['伟', '芳', '娜', '敏', '静', '杰', '强', '军', '磊', '洋', '勇', '艳', '博', '涛', '明', '超'];

  for (let i = 1; i <= count.value; i++) {
    const randomSuffix = Math.floor(Math.random() * 8999 + 1000);
    const code = `${prefix.value}${Date.now().toString().slice(-4)}_${i}`;
    const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]}${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const snowflakeId = `1839${Date.now()}${Math.floor(Math.random() * 899 + 100)}`;

    result.push({
      id: snowflakeId,
      tenant_id: 1,
      user_code: code,
      user_name: `${name} (批量)`,
      user_type: Math.random() > 0.8 ? 1 : 0,
      password: '●●●●●●●●',
      org_id: targetOrg.id,
      org_name: targetOrg.org_name,
      gender: Math.random() > 0.5 ? 1 : 2,
      pass_type: 1,
      flag: 1,
      user_status: 1,
      begindate: dayjs().format('YYYY-MM-DD'),
      enddate: '2035-12-31',
      language_id: 1,
      pwdbegindate: dayjs().format('YYYY-MM-DD'),
      pwdenddate: dayjs().add(1, 'year').format('YYYY-MM-DD'),
      mobile: `138${Math.floor(Math.random() * 89999999 + 10000000)}`,
      birthday: '1995-05-15',
      entrydate: dayjs().subtract(Math.floor(Math.random() * 30), 'day').format('YYYY-MM-DD'),
      email: `${code}@zhizao-cloud.com`,
      idcard: `32050119950515${randomSuffix}`,
      country: '中国',
      city: '苏州',
      address: '江苏省苏州市工业园区纳米科技工业园',
      creator: 'liu_buyer',
      create_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      modifier: 'liu_buyer',
      modify_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      remark: '通过批量辅助工具自动生成的标准用户记录',
    });
  }

  emit('generate', result);
  emit('update:visible', false);
};
</script>
