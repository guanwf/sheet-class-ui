<template>
  <div class="flex-1 p-4 bg-slate-50 overflow-y-auto">
    <div class="max-w-3xl mx-auto bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
      <div class="flex items-center justify-between pb-3 mb-5 border-b border-slate-200">
        <div>
          <h3 class="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <GitCommit class="w-4 h-4 text-indigo-600" />
            <span>单据业务审批流转与审计日志 (Audit Trail)</span>
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">
            完整记录自建单、送审、会签、核准到驳回的不可篡改历史记录
          </p>
        </div>
        <span class="text-xs font-mono text-slate-400">共 {{ logs.length }} 条轨迹记录</span>
      </div>

      <!-- 时间线列表 -->
      <div class="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        <div
          v-for="log in logs"
          :key="log.id"
          class="relative group"
        >
          <!-- 时间线节点图标 -->
          <span
            :class="[
              'absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white',
              log.action === 'APPROVE'
                ? 'bg-emerald-500 text-white'
                : log.action === 'REJECT'
                ? 'bg-rose-500 text-white'
                : log.action === 'SUBMIT'
                ? 'bg-blue-500 text-white'
                : 'bg-indigo-500 text-white'
            ]"
          >
            <Check v-if="log.action === 'APPROVE'" class="w-3 h-3" />
            <X v-else-if="log.action === 'REJECT'" class="w-3 h-3" />
            <ArrowRight v-else-if="log.action === 'SUBMIT'" class="w-3 h-3" />
            <Clock v-else class="w-3 h-3" />
          </span>

          <div class="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-md p-3 transition">
            <div class="flex items-center justify-between text-xs mb-1.5">
              <div class="flex items-center space-x-2">
                <span class="font-bold text-slate-900">{{ log.stepName }}</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700 font-medium">
                  {{ log.role }}
                </span>
                <span class="text-slate-700 font-medium">{{ log.operator }}</span>
              </div>
              <span class="font-mono text-slate-400 text-[11px]">{{ log.timestamp }}</span>
            </div>

            <div class="text-xs text-slate-600 bg-white p-2 rounded border border-slate-200/80">
              {{ log.comment }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AuditLogItem } from '../../types/document';
import {
  GitCommit,
  Check,
  X,
  ArrowRight,
  Clock,
} from 'lucide-vue-next';

defineProps<{
  logs: AuditLogItem[];
}>();
</script>
