<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <!-- 弹窗顶栏 -->
      <div class="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div class="flex items-center space-x-2">
          <Printer class="w-4 h-4 text-indigo-600" />
          <h3 class="text-sm font-bold text-slate-800">标准企业采购订单凭证套打预览</h3>
        </div>

        <div class="flex items-center space-x-2">
          <button
            type="button"
            @click="triggerPrint"
            class="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-2xs transition flex items-center space-x-1"
          >
            <Printer class="w-3.5 h-3.5 mr-1" />
            <span>立即打印凭证</span>
          </button>
          <button
            type="button"
            @click="$emit('close')"
            class="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- 套打凭证纸张区域 (A4 模拟) -->
      <div class="flex-1 overflow-y-auto p-6 bg-slate-100/70">
        <div class="bg-white p-8 border border-slate-300 rounded shadow-md max-w-3xl mx-auto text-slate-900 text-xs font-sans print:shadow-none print:border-none">
          <!-- 凭证抬头 -->
          <div class="text-center pb-4 border-b-2 border-slate-900">
            <h1 class="text-xl font-black tracking-widest text-slate-900">江苏智造云科技有限公司</h1>
            <h2 class="text-base font-bold tracking-wider text-slate-800 mt-1">标准物料采购订货单</h2>
            <div class="text-[11px] text-slate-500 mt-1">
              JIANGSU SMART MANUFACTURING CLOUD CO., LTD. PURCHASE ORDER
            </div>
          </div>

          <!-- 凭证关键主信息 -->
          <div class="grid grid-cols-2 gap-y-2 gap-x-4 py-4 border-b border-slate-300 text-xs">
            <div><strong>单据编号：</strong><span class="font-mono">{{ doc.header.docNo }}</span></div>
            <div><strong>订购日期：</strong><span class="font-mono">{{ doc.header.docDate }}</span></div>
            <div><strong>供应商名称：</strong>{{ doc.header.partnerName }}</div>
            <div><strong>联系人/电话：</strong>{{ doc.header.contactPerson }} ({{ doc.header.contactPhone }})</div>
            <div><strong>经办业务员：</strong>{{ doc.header.buyer }}</div>
            <div><strong>经办采购部：</strong>{{ doc.header.department }}</div>
            <div><strong>结算币种：</strong>{{ doc.header.currency }} (汇率: {{ doc.header.exchangeRate }})</div>
            <div><strong>付款条件：</strong>{{ doc.header.paymentTerm }}</div>
            <div class="col-span-2"><strong>交货目的地：</strong>{{ doc.header.deliveryAddress }}</div>
          </div>

          <!-- 凭证物料明细表 -->
          <div class="py-4">
            <table class="w-full text-xs border-collapse border border-slate-400">
              <thead>
                <tr class="bg-slate-100 font-bold text-slate-800">
                  <th class="border border-slate-400 p-1.5 w-10 text-center">序</th>
                  <th class="border border-slate-400 p-1.5 text-left">物料编码</th>
                  <th class="border border-slate-400 p-1.5 text-left">物料名称与规格型号</th>
                  <th class="border border-slate-400 p-1.5 w-12 text-center">单位</th>
                  <th class="border border-slate-400 p-1.5 w-16 text-right">数量</th>
                  <th class="border border-slate-400 p-1.5 w-20 text-right">含税单价</th>
                  <th class="border border-slate-400 p-1.5 w-24 text-right">金额小计</th>
                  <th class="border border-slate-400 p-1.5 w-20 text-center">交货日期</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in doc.items" :key="item.id">
                  <td class="border border-slate-300 p-1.5 text-center font-mono">{{ item.rowNo }}</td>
                  <td class="border border-slate-300 p-1.5 font-mono">{{ item.itemCode }}</td>
                  <td class="border border-slate-300 p-1.5">
                    <div class="font-medium">{{ item.itemName }}</div>
                    <div class="text-[10px] text-slate-500">{{ item.spec }}</div>
                  </td>
                  <td class="border border-slate-300 p-1.5 text-center">{{ item.unit }}</td>
                  <td class="border border-slate-300 p-1.5 text-right font-mono font-bold">{{ item.quantity }}</td>
                  <td class="border border-slate-300 p-1.5 text-right font-mono">¥{{ Number(item.priceWithTax).toFixed(2) }}</td>
                  <td class="border border-slate-300 p-1.5 text-right font-mono font-bold">¥{{ Number(item.totalAmount).toFixed(2) }}</td>
                  <td class="border border-slate-300 p-1.5 text-center font-mono text-[11px]">{{ item.deliveryDate }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="font-bold bg-slate-50">
                  <td colspan="4" class="border border-slate-400 p-2 text-center">合 计 汇 总</td>
                  <td class="border border-slate-400 p-2 text-right font-mono text-amber-800">{{ summary.totalQuantity }}</td>
                  <td class="border border-slate-400 p-2 text-right">--</td>
                  <td class="border border-slate-400 p-2 text-right font-mono text-indigo-900">¥{{ summary.totalAmountWithTax.toFixed(2) }}</td>
                  <td class="border border-slate-400 p-2 text-center">--</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- 金额大写与备注 -->
          <div class="p-3 bg-slate-50 border border-slate-300 rounded space-y-1 text-xs mb-8">
            <div>
              <strong>人民币大写合计：</strong>
              <span class="font-bold text-slate-900 text-sm ml-1">{{ summary.capitalizedAmountCN }}</span>
            </div>
            <div><strong>特别约定条款：</strong>{{ doc.header.remarks || '按国家质量检验标准执行，如发生争议由买方所在地人民法院管辖。' }}</div>
          </div>

          <!-- 签字盖章栏 -->
          <div class="grid grid-cols-4 gap-4 pt-6 text-xs text-slate-700">
            <div>
              <div>制单人员：{{ doc.header.createdBy }}</div>
              <div class="mt-6 border-b border-slate-400 w-32"></div>
            </div>
            <div>
              <div>业务部门审核：{{ doc.header.buyer }}</div>
              <div class="mt-6 border-b border-slate-400 w-32"></div>
            </div>
            <div>
              <div>财务主管终审：{{ doc.header.approvedBy || '待终审签署' }}</div>
              <div class="mt-6 border-b border-slate-400 w-32"></div>
            </div>
            <div>
              <div>供方代表签字 (盖章)：</div>
              <div class="mt-6 border-b border-slate-400 w-32"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DocumentRecord } from '../../types/document';
import { computeDocumentSummary } from '../../utils/formulas';
import { Printer, X } from 'lucide-vue-next';

const props = defineProps<{
  visible: boolean;
  doc: DocumentRecord;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const summary = computed(() =>
  computeDocumentSummary(props.doc.items, props.doc.header.currency)
);

const triggerPrint = () => {
  window.print();
};
</script>
