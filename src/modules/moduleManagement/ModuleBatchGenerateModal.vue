<template>
  <a-modal
    :open="visible"
    title="快速批量生成模拟业务模块 (pbs_module 压测)"
    :width="520"
    :mask-closable="false"
    :keyboard="false"
    destroy-on-close
    @cancel="$emit('update:visible', false)"
    @ok="handleBatchGenerate"
    ok-text="立即生成并追加"
    cancel-text="取消"
  >
    <div class="space-y-4 text-xs select-none">
      <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 leading-relaxed text-[11px]">
        一键批量生成合规的 ERP 业务模块定义数据，自动派发 19 位雪花ID、保证 <code>module_id</code> 与 <code>module_name</code> 唯一性，并模拟各种业务场景的按位权限掩码。
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="font-medium text-slate-700 block mb-1">生成数量 (个):</label>
          <div class="flex items-center space-x-1.5">
            <a-input-number v-model:value="count" :min="1" :max="1000" class="flex-1" size="middle" />
            <button
              type="button"
              @click="count = 20"
              class="px-2 py-1 text-[11px] font-mono bg-blue-50 hover:bg-blue-100 text-[#25548d] rounded border border-blue-200 transition cursor-pointer"
            >
              20
            </button>
            <button
              type="button"
              @click="count = 100"
              class="px-2 py-1 text-[11px] font-mono bg-purple-50 hover:bg-purple-100 text-purple-700 rounded border border-purple-200 transition cursor-pointer"
            >
              100
            </button>
          </div>
        </div>

        <div>
          <label class="font-medium text-slate-700 block mb-1">模块ID前缀:</label>
          <a-input v-model:value="prefix" placeholder="如：BIZ_MOD_" class="font-mono uppercase font-semibold" />
        </div>
      </div>

      <div>
        <label class="font-medium text-slate-700 block mb-1">默认操作类型:</label>
        <a-select v-model:value="actiontypeid" class="w-full">
          <a-select-option value="RANDOM">随机分配多种类型 (TAB_PAGE, MENU, MODAL, LINK)</a-select-option>
          <a-select-option value="TAB_PAGE">全部固定为：工作区页签 (TAB_PAGE)</a-select-option>
          <a-select-option value="MENU">全部固定为：系统导航菜单 (MENU)</a-select-option>
        </a-select>
      </div>

      <div>
        <label class="font-medium text-slate-700 block mb-1">权限掩码生成策略:</label>
        <a-select v-model:value="permStrategy" class="w-full">
          <a-select-option value="RANDOM">真实业务随机组合 (增删改查+不同高级位)</a-select-option>
          <a-select-option value="ALL">全部赋予全量权限 (2047)</a-select-option>
          <a-select-option value="STANDARD">标准单据业务权限 (1279)</a-select-option>
          <a-select-option value="READONLY">全部只读查询权限 (1)</a-select-option>
        </a-select>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PbsModule } from '../../types/module';
import { pageUtils } from '../../utils/pageUtils';

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'generate', modules: PbsModule[]): void;
}>();

const count = ref(20);
const prefix = ref('SYS_MOD_');
const actiontypeid = ref('RANDOM');
const permStrategy = ref('RANDOM');

const DOMAIN_NAMES = [
  '工单流转调度', '质检抽样巡检', '备件安全库存', '包装出厂赋码', '设备润滑点检',
  '能源计量采集', '工艺工时定额', '委外加工送审', '成品条码追踪', '客诉售后追溯',
  '研发BOM变更', '标准工时测算', '物料齐套分析', '车间看板大屏', '供应商打分评价',
  '电子印章审批', '税务专票查验', '固定资产盘存', '劳保物资申领', '特种工种认证',
];

const handleBatchGenerate = () => {
  const result: PbsModule[] = [];
  const baseTime = Date.now();
  const dateStr = new Date().toISOString().split('T')[0];
  const typePool = ['TAB_PAGE', 'MENU', 'MODAL_DIALOG', 'EXTERNAL_LINK', 'BUTTON_ACTION'];

  for (let i = 1; i <= count.value; i++) {
    const seq = String(i).padStart(4, '0');
    const domainName = DOMAIN_NAMES[(i - 1) % DOMAIN_NAMES.length];
    const modId = `${prefix.value}${baseTime.toString().slice(-4)}_${seq}`;
    const modName = `${domainName} #${i}`;
    const snowflakeId = `1839${baseTime}${seq}`;

    let finalType = actiontypeid.value;
    if (finalType === 'RANDOM') {
      finalType = typePool[i % typePool.length];
    }

    let rightvalues = 2047;
    if (permStrategy.value === 'ALL') {
      rightvalues = 2047;
    } else if (permStrategy.value === 'STANDARD') {
      rightvalues = 1279;
    } else if (permStrategy.value === 'READONLY') {
      rightvalues = 1;
    } else {
      // 随机组合但包含查询(1)
      const base = pageUtils.PERM.QUERY;
      const flags = [
        pageUtils.PERM.ADD,
        pageUtils.PERM.EDIT,
        pageUtils.PERM.DELETE,
        pageUtils.PERM.SAVE,
        pageUtils.PERM.CANCEL,
        pageUtils.PERM.AUDIT,
        pageUtils.PERM.EXPORT,
        pageUtils.PERM.IMPORT,
        pageUtils.PERM.VOID,
        pageUtils.PERM.PRINT,
      ];
      let mask = base;
      for (const f of flags) {
        if (Math.random() > 0.4) {
          mask |= f;
        }
      }
      rightvalues = mask;
    }

    result.push({
      id: snowflakeId,
      module_id: modId,
      module_name: modName,
      hint: `${domainName}标准业务执行与操作核对`,
      rightvalues,
      actionurl: `/system/biz/${modId.toLowerCase()}`,
      actiontypeid: finalType,
      actionparams: '{"density":"compact"}',
      flag: i % 15 === 0 ? 0 : 1,
      creater: '刘工 (主控业务员)',
      create_time: dateStr,
      modifyer: '系统管理员',
      modify_time: dateStr,
      remark: '批量模拟压测注入的业务模块数据。',
    });
  }

  emit('generate', result);
  emit('update:visible', false);
};
</script>
