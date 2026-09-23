<template>
  <a-modal
    :open="visible"
    :title="`模块元数据详情 [ ${moduleData?.module_id || ''} ]`"
    :width="800"
    :mask-closable="false"
    :keyboard="false"
    :footer="null"
    destroy-on-close
    @cancel="$emit('update:visible', false)"
  >
    <div v-if="moduleData" class="space-y-4 text-xs select-none max-h-[75vh] overflow-y-auto px-1 py-1">
      <!-- 头部概览卡片 -->
      <div class="p-3.5 bg-gradient-to-r from-slate-900 to-[#1e3a5f] rounded-lg text-white flex items-center justify-between shadow-xs">
        <div class="space-y-1">
          <div class="flex items-center space-x-2">
            <span class="text-base font-bold font-mono">{{ moduleData.module_name }}</span>
            <span class="px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/40 text-[11px] font-mono">
              {{ moduleData.module_id }}
            </span>
            <span
              :class="[
                'px-1.5 py-0.2 rounded text-[10px] font-medium border',
                moduleData.flag === 1
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
              ]"
            >
              {{ moduleData.flag === 1 ? '● 正常启用' : '○ 停用封存' }}
            </span>
          </div>
          <div class="text-slate-300 text-[11px]">
            {{ moduleData.hint || '暂无业务提示信息' }}
          </div>
        </div>

        <div class="text-right">
          <div class="text-[10px] text-slate-400">主键雪花ID</div>
          <div class="font-mono font-bold text-xs text-[#93c5fd]">{{ moduleData.id }}</div>
        </div>
      </div>

      <!-- 属性网格列表 -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div>
          <span class="text-[11px] text-slate-400 block mb-0.5">操作类型 (actiontypeid):</span>
          <span class="inline-flex items-center px-2 py-0.5 rounded bg-white border border-slate-300 font-medium text-slate-800">
            {{ moduleData.actiontypeid }}
          </span>
        </div>

        <div class="col-span-1 md:col-span-2">
          <span class="text-[11px] text-slate-400 block mb-0.5">操作地址 (actionurl):</span>
          <code class="px-2 py-0.5 rounded bg-white border border-slate-300 text-indigo-700 font-mono text-[11px] block truncate">
            {{ moduleData.actionurl }}
          </code>
        </div>

        <div class="col-span-2 md:col-span-3">
          <span class="text-[11px] text-slate-400 block mb-0.5">操作参数 (actionparams):</span>
          <code class="px-2 py-1 rounded bg-white border border-slate-300 text-slate-700 font-mono text-[11px] block break-all">
            {{ moduleData.actionparams || '(未配置参数)' }}
          </code>
        </div>

        <div>
          <span class="text-[11px] text-slate-400 block mb-0.5">创建人 / 时间:</span>
          <span class="text-slate-700">{{ moduleData.creater || '-' }} / {{ moduleData.create_time || '-' }}</span>
        </div>

        <div>
          <span class="text-[11px] text-slate-400 block mb-0.5">修改人 / 时间:</span>
          <span class="text-slate-700">{{ moduleData.modifyer || '-' }} / {{ moduleData.modify_time || '-' }}</span>
        </div>

        <div>
          <span class="text-[11px] text-slate-400 block mb-0.5">备注说明:</span>
          <span class="text-slate-700 truncate block">{{ moduleData.remark || '-' }}</span>
        </div>
      </div>

      <!-- 权限值位掩码解析面板 (Bitmask Breakdown) -->
      <div class="p-3 bg-white border border-slate-200 rounded-lg space-y-2.5">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <div class="flex items-center space-x-2">
            <ShieldCheck class="w-4 h-4 text-[#25548d]" />
            <span class="font-bold text-slate-800 text-xs">权限位掩码矩阵 (rightvalues: {{ moduleData.rightvalues }})</span>
          </div>
          <div class="flex items-center space-x-2 font-mono text-[11px]">
            <span class="text-slate-400">16进制: <strong class="text-slate-700">{{ toHex4(moduleData.rightvalues) }}</strong></span>
            <span class="text-slate-300">|</span>
            <span class="text-slate-400">2进制: <strong class="text-slate-700 tracking-wider">{{ toBinary11(moduleData.rightvalues) }}</strong></span>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
          <div
            v-for="opt in ATOMIC_PERM_OPTIONS"
            :key="opt.value"
            :class="[
              'p-2 rounded border flex items-center justify-between text-xs',
              (moduleData.rightvalues & opt.value) === opt.value
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
            ]"
          >
            <div class="flex items-center space-x-1.5">
              <span
                class="w-2 h-2 rounded-full"
                :class="(moduleData.rightvalues & opt.value) === opt.value ? 'bg-emerald-500' : 'bg-slate-300'"
              ></span>
              <span>{{ opt.name }}</span>
            </div>
            <span class="font-mono text-[10px]">
              {{ (moduleData.rightvalues & opt.value) === opt.value ? `+${opt.value}` : '0' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 快速导出 SQL 预览 -->
      <div class="p-3 bg-slate-900 rounded-lg text-slate-200 space-y-2">
        <div class="flex items-center justify-between text-[11px]">
          <span class="text-slate-400 font-mono">SQL INSERT 语句 (已按雪花ID生成):</span>
          <button
            type="button"
            @click="copySql"
            class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[#93c5fd] border border-slate-700 transition cursor-pointer text-[10px] font-mono"
          >
            {{ copied ? '已复制 ✓' : '复制 SQL' }}
          </button>
        </div>
        <pre class="bg-black/40 p-2.5 rounded font-mono text-[10px] leading-relaxed text-emerald-400 overflow-x-auto select-all whitespace-pre-wrap">{{ sqlString }}</pre>
      </div>

      <div class="flex justify-end pt-2">
        <button
          type="button"
          @click="$emit('update:visible', false)"
          class="px-4 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium transition cursor-pointer"
        >
          关闭
        </button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ShieldCheck } from 'lucide-vue-next';
import { message } from 'ant-design-vue';
import { PbsModule } from '../../types/module';
import { ATOMIC_PERM_OPTIONS, toBinary11, toHex4 } from '../../utils/pageUtils';

const props = defineProps<{
  visible: boolean;
  moduleData: PbsModule | null;
}>();

defineEmits<{
  (e: 'update:visible', val: boolean): void;
}>();

const copied = ref(false);

const sqlString = computed(() => {
  if (!props.moduleData) return '';
  const m = props.moduleData;
  return `INSERT INTO pbs_module (
  id, module_id, module_name, hint, rightvalues,
  actionurl, actiontypeid, actionparams, flag,
  creater, create_time, modifyer, modify_time, remark
) VALUES (
  ${m.id}, '${m.module_id}', '${m.module_name}', '${m.hint || ''}', ${m.rightvalues},
  '${m.actionurl}', '${m.actiontypeid}', '${m.actionparams || ''}', ${m.flag},
  '${m.creater || 'system'}', '${m.create_time || '2026-09-22'}', '${m.modifyer || 'system'}', '${m.modify_time || '2026-09-22'}', '${m.remark || ''}'
);`;
});

const copySql = async () => {
  try {
    await navigator.clipboard.writeText(sqlString.value);
    copied.value = true;
    message.success('SQL 插入语句已复制至剪贴板！');
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    message.error('复制失败，请手工选中文本复制');
  }
};
</script>
