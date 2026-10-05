<template>
  <div
    v-if="dictStore.usageModalVisible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="usage-modal-title"
  >
    <div class="bg-white rounded-[8px] border border-[#DDE3EA] shadow-xl w-full max-w-[640px] p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
      <div class="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div>
          <h3 id="usage-modal-title" class="text-sm font-bold text-[#0F172A] m-0">
            字典类型业务引用关系检查
          </h3>
          <p class="text-xs text-[#64748B] m-0 mt-0.5">
            检查对象: <span class="font-mono text-[#0F172A] font-semibold">{{ dictStore.selectedTypeCode }}</span>
          </p>
        </div>
        <button
          type="button"
          @click="dictStore.usageModalVisible = false"
          aria-label="关闭引用检查弹窗"
          class="text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 核心规则警告 -->
      <div class="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[6px] text-xs text-[#991B1B] flex items-start space-x-2">
        <svg class="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <p class="font-bold m-0">核心约束提示：系统内只允许逻辑停用，严禁物理删除！</p>
          <p class="m-0 mt-0.5 text-[#B91C1C]">
            静态字典条目编码已深度渗透至业务单据主从表。删除前已自动扫描以下业务数据实体：
          </p>
        </div>
      </div>

      <!-- 引用表格 -->
      <div class="border border-[#CBD5E1] rounded-[6px] overflow-hidden text-xs">
        <table class="w-full text-left border-collapse">
          <thead class="bg-[#F1F5F9] text-[#475569] font-medium border-b border-[#CBD5E1]">
            <tr>
              <th class="py-2.5 px-3">业务系统</th>
              <th class="py-2.5 px-3">关联数据表</th>
              <th class="py-2.5 px-3">持久化字段</th>
              <th class="py-2.5 px-3 text-right">引用记录数</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#E2E8F0]">
            <tr
              v-for="(refItem, index) in dictStore.usageData?.references || []"
              :key="index"
              class="hover:bg-[#F8FAFC]"
            >
              <td class="py-2.5 px-3 text-[#0F172A] font-medium">{{ refItem.systemName }}</td>
              <td class="py-2.5 px-3 font-mono text-[#334155]">{{ refItem.tableName }}</td>
              <td class="py-2.5 px-3 font-mono text-[#1F4FD8]">{{ refItem.columnName }}</td>
              <td class="py-2.5 px-3 text-right font-mono font-bold text-[#0F172A]">
                {{ refItem.count.toLocaleString() }}
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-[#F8FAFC] font-semibold text-[#0F172A] border-t border-[#CBD5E1]">
            <tr>
              <td colspan="3" class="py-2.5 px-3 text-right">总匹配外键数据行数:</td>
              <td class="py-2.5 px-3 text-right font-mono text-[#DC2626]">
                {{ (dictStore.usageData?.totalRowCount || 0).toLocaleString() }} 行
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- 底部关闭按钮 -->
      <div class="flex items-center justify-end pt-2">
        <button
          type="button"
          @click="dictStore.usageModalVisible = false"
          aria-label="我知道了，关闭"
          class="h-11 min-h-[44px] px-5 text-xs font-semibold text-white bg-[#1F4FD8] rounded-[6px] hover:bg-[#1940B0] transition-colors cursor-pointer"
        >
          我知道了
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDictStore } from '../store/dictStore';

const dictStore = useDictStore();
</script>
