<template>
  <div
    v-if="store.testPrintModalVisible && store.activeTemplate"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    role="dialog"
    aria-modal="true"
    aria-labelledby="test-print-title"
  >
    <div
      class="bg-slate-100 rounded-lg border border-slate-300 shadow-2xl w-full max-w-4xl h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- 预览工具栏 -->
      <div class="px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
        <div class="flex items-center space-x-3">
          <div class="w-7 h-7 rounded bg-[#1F4FD8]/10 text-[#1F4FD8] flex items-center justify-center text-xs font-bold">
            🖨️
          </div>
          <div>
            <h3 id="test-print-title" class="text-xs font-bold text-slate-900 m-0 flex items-center space-x-2">
              <span>在线套打预览测试</span>
              <span class="font-mono text-slate-500 font-normal">({{ store.activeTemplate.templateId }})</span>
              <span class="px-1.5 py-0.2 rounded text-[10px] bg-blue-100 text-[#1F4FD8] font-bold">
                v{{ store.activeTemplate.version }}
              </span>
            </h3>
            <p class="text-[11px] text-slate-500 m-0">
              JasperReports 编译引擎实时渲染模拟（纸张: A4 纵向 / 边距: 20mm）
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-2.5">
          <!-- 测试数据源切换 -->
          <div class="flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            <span>套用单据:</span>
            <select
              v-model="selectedMockDoc"
              class="text-xs bg-transparent border-none text-slate-900 font-medium focus:ring-0 cursor-pointer"
            >
              <option value="po-1">PO-2026-0001 (电子精密元器件批采)</option>
              <option value="po-2">PO-2026-0002 (智能传感器与工业网关)</option>
              <option value="ro-1">RO-2026-0001 (不良品退厂返修)</option>
            </select>
          </div>

          <!-- 缩放控制 -->
          <button
            type="button"
            @click="zoom = Math.max(0.6, zoom - 0.1)"
            aria-label="缩小"
            class="w-8 h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 cursor-pointer text-xs font-bold"
          >
            -
          </button>
          <span class="text-xs font-mono font-medium text-slate-600 w-12 text-center">
            {{ Math.round(zoom * 100) }}%
          </span>
          <button
            type="button"
            @click="zoom = Math.min(1.4, zoom + 0.1)"
            aria-label="放大"
            class="w-8 h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 cursor-pointer text-xs font-bold"
          >
            +
          </button>

          <!-- 打印与关闭按钮 -->
          <button
            type="button"
            @click="triggerPrint"
            aria-label="调用系统打印机"
            class="h-8 px-3.5 text-xs font-semibold text-white bg-[#1F4FD8] hover:bg-[#183eb0] rounded-md transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zM9 9h6v-6H9v6z" />
            </svg>
            <span>调用打印机</span>
          </button>

          <button
            type="button"
            @click="store.testPrintModalVisible = false"
            aria-label="关闭预览"
            class="w-8 h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 打印纸张模拟预览画布 -->
      <div class="flex-1 overflow-auto p-8 flex justify-center bg-slate-200/80">
        <div
          :style="{ transform: `scale(${zoom})`, transformOrigin: 'top center' }"
          class="transition-transform duration-100 ease-out shrink-0"
        >
          <!-- A4 纸张主体 (210mm x 297mm 比例) -->
          <div
            id="print-sheet-content"
            class="w-[794px] min-h-[1123px] bg-white text-slate-900 p-12 shadow-xl border border-slate-300 rounded-xs flex flex-col justify-between font-serif select-text"
          >
            <!-- 1. 报表表头 (Title & PageHeader Band) -->
            <div class="space-y-4">
              <!-- 企业抬头与条码 -->
              <div class="flex items-start justify-between border-b-2 border-slate-900 pb-3">
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="text-lg font-black tracking-wider text-slate-900 font-sans">
                      苏州高新智造实业股份有限公司
                    </span>
                    <span class="text-xs px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-600 font-sans">
                      JASPER-ENGINE
                    </span>
                  </div>
                  <h1 class="text-xl font-bold text-slate-900 mt-2 font-sans tracking-wide m-0">
                    {{ store.activeTemplate.templateName }}
                  </h1>
                  <p class="text-[11px] text-slate-500 font-sans mt-0.5">
                    SUZHOU HIGH-TECH MANUFACTURING STANDARD PURCHASE VOUCHER
                  </p>
                </div>

                <!-- 右侧条码模拟与防伪码 -->
                <div class="text-right font-sans">
                  <div class="inline-block bg-slate-900 text-white font-mono text-[10px] px-2 py-1 tracking-widest font-bold">
                    * {{ currentDoc.header.docNo }} *
                  </div>
                  <div class="text-[10px] text-slate-400 mt-1 font-mono">
                    VER: v{{ store.activeTemplate.version }} | SYS: ERP-PROD
                  </div>
                </div>
              </div>

              <!-- 主表商务参数区 (Parameters) -->
              <div class="grid grid-cols-3 gap-y-2 text-xs font-sans text-slate-700 bg-slate-50/70 p-3 rounded border border-slate-200">
                <div>
                  <span class="text-slate-400">采购单号:</span>
                  <strong class="ml-1 text-slate-900 font-mono">{{ currentDoc.header.docNo }}</strong>
                </div>
                <div>
                  <span class="text-slate-400">单据日期:</span>
                  <span class="ml-1 text-slate-900">{{ currentDoc.header.docDate }}</span>
                </div>
                <div>
                  <span class="text-slate-400">结算币种:</span>
                  <span class="ml-1 text-slate-900 font-mono">{{ currentDoc.header.currency }} (汇率: {{ currentDoc.header.exchangeRate }})</span>
                </div>
                <div>
                  <span class="text-slate-400">供货商名称:</span>
                  <strong class="ml-1 text-slate-900">{{ currentDoc.header.partnerName }}</strong>
                </div>
                <div>
                  <span class="text-slate-400">联系人/电话:</span>
                  <span class="ml-1 text-slate-900">{{ currentDoc.header.contactPerson }} ({{ currentDoc.header.contactPhone }})</span>
                </div>
                <div>
                  <span class="text-slate-400">采购经办员:</span>
                  <span class="ml-1 text-slate-900">{{ currentDoc.header.buyer }} / {{ currentDoc.header.department }}</span>
                </div>
                <div class="col-span-3">
                  <span class="text-slate-400">交货仓库与地址:</span>
                  <span class="ml-1 text-slate-900">{{ currentDoc.header.deliveryAddress }}</span>
                </div>
              </div>
            </div>

            <!-- 2. 明细数据网格 (Detail Band) -->
            <div class="my-4 flex-1">
              <table class="w-full text-xs font-sans border-collapse border border-slate-300">
                <thead>
                  <tr class="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-center">
                    <th class="py-2 px-2 border-r border-slate-300 w-10">序号</th>
                    <th class="py-2 px-3 border-r border-slate-300 text-left w-24">物料编码</th>
                    <th class="py-2 px-3 border-r border-slate-300 text-left">品名描述</th>
                    <th class="py-2 px-2 border-r border-slate-300 w-16">规格型号</th>
                    <th class="py-2 px-2 border-r border-slate-300 w-12">单位</th>
                    <th class="py-2 px-2 border-r border-slate-300 text-right w-16">采购数量</th>
                    <th class="py-2 px-2 border-r border-slate-300 text-right w-20">含税单价</th>
                    <th class="py-2 px-3 text-right w-24">价税合计</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 text-slate-800">
                  <tr v-for="item in currentDoc.items" :key="item.lineNo">
                    <td class="py-2 px-2 border-r border-slate-300 text-center font-mono">{{ item.lineNo }}</td>
                    <td class="py-2 px-3 border-r border-slate-300 font-mono text-[11px] font-semibold">{{ item.skuCode }}</td>
                    <td class="py-2 px-3 border-r border-slate-300">{{ item.skuName }}</td>
                    <td class="py-2 px-2 border-r border-slate-300 text-center text-slate-600">{{ item.spec }}</td>
                    <td class="py-2 px-2 border-r border-slate-300 text-center">{{ item.unit }}</td>
                    <td class="py-2 px-2 border-r border-slate-300 text-right font-mono font-medium">{{ item.qty.toLocaleString() }}</td>
                    <td class="py-2 px-2 border-r border-slate-300 text-right font-mono">¥{{ item.unitPrice.toFixed(2) }}</td>
                    <td class="py-2 px-3 text-right font-mono font-bold">¥{{ item.amount.toFixed(2) }}</td>
                  </tr>

                  <!-- 填充空行保持版面整齐 -->
                  <tr v-for="i in Math.max(0, 5 - currentDoc.items.length)" :key="'empty-' + i" class="text-slate-300">
                    <td class="py-2 px-2 border-r border-slate-300 text-center font-mono">-</td>
                    <td class="py-2 px-3 border-r border-slate-300"></td>
                    <td class="py-2 px-3 border-r border-slate-300"></td>
                    <td class="py-2 px-2 border-r border-slate-300"></td>
                    <td class="py-2 px-2 border-r border-slate-300"></td>
                    <td class="py-2 px-2 border-r border-slate-300"></td>
                    <td class="py-2 px-2 border-r border-slate-300"></td>
                    <td class="py-2 px-3"></td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="bg-slate-50 font-bold border-t-2 border-slate-900 text-slate-900">
                    <td colspan="5" class="py-2 px-3 text-right border-r border-slate-300">
                      总计合计金额 (人民币大写): <span>{{ formatChineseMoney(totalAmount) }}</span>
                    </td>
                    <td colspan="3" class="py-2 px-3 text-right font-mono text-sm text-[#1F4FD8]">
                      ¥ {{ totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- 3. 表尾签章与法律条款 (Summary Band) -->
            <div class="space-y-4 pt-4 border-t border-slate-300 text-xs font-sans text-slate-700">
              <div class="grid grid-cols-4 gap-4 pt-2">
                <div>
                  <span class="text-slate-400 block text-[11px]">编制人员:</span>
                  <div class="mt-4 border-b border-slate-400 pb-1 font-medium">刘工 (主控业务员)</div>
                </div>
                <div>
                  <span class="text-slate-400 block text-[11px]">部门审核:</span>
                  <div class="mt-4 border-b border-slate-400 pb-1 font-medium">王总监 (采购部)</div>
                </div>
                <div>
                  <span class="text-slate-400 block text-[11px]">财务复核:</span>
                  <div class="mt-4 border-b border-slate-400 pb-1 font-medium">陈会计</div>
                </div>
                <div>
                  <span class="text-slate-400 block text-[11px]">供应商签章/日期:</span>
                  <div class="mt-4 border-b border-dashed border-slate-400 pb-1 text-slate-300">盖章生效</div>
                </div>
              </div>

              <div class="flex items-center justify-between text-[10px] text-slate-400 pt-3 border-t border-slate-200">
                <span>注：此套打单据由 JasperReports 引擎动态渲染生成，未经授权涂改作废。</span>
                <span class="font-mono">打印时间: 2026-10-15 14:30:20 | 第 1 页 / 共 1 页</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePrintTemplateStore } from '../store/printTemplateStore';
import { message } from 'ant-design-vue';

const store = usePrintTemplateStore();

const zoom = ref(0.85);
const selectedMockDoc = ref<'po-1' | 'po-2' | 'ro-1'>('po-1');

const currentDoc = computed(() => {
  if (selectedMockDoc.value === 'po-2') {
    return {
      header: {
        docNo: 'PO-2026-0002',
        docDate: '2026-03-12',
        currency: 'USD',
        exchangeRate: 7.23,
        partnerName: '德州微芯工业电子半导体有限公司',
        contactPerson: '李经理',
        contactPhone: '139-8877-6655',
        buyer: '张工程师',
        department: '研发物料组',
        deliveryAddress: '苏州工业园区星湖街 999 号 2 号保税立体仓',
      },
      items: [
        { lineNo: 1, skuCode: 'MCU-STM32-H7', skuName: '高算力工业主控 MCU 芯片', spec: 'LQFP-144', unit: 'PCS', qty: 2000, unitPrice: 38.5, amount: 77000 },
        { lineNo: 2, skuCode: 'CAN-TRANS-85', skuName: '隔离型高速 CAN 收发器', spec: 'SOIC-8', unit: 'PCS', qty: 5000, unitPrice: 4.2, amount: 21000 },
      ],
    };
  } else if (selectedMockDoc.value === 'ro-1') {
    return {
      header: {
        docNo: 'RO-2026-0001',
        docDate: '2026-03-14',
        currency: 'CNY',
        exchangeRate: 1.0,
        partnerName: '无锡联创五金结构件实业公司',
        contactPerson: '周主管',
        contactPhone: '137-0099-1122',
        buyer: '刘工',
        department: '质检品控部',
        deliveryAddress: '无锡惠山区金山路 68 号厂区退货接收处',
      },
      items: [
        { lineNo: 1, skuCode: 'CASE-ALU-02', skuName: '冲压铝合金机箱外壳 (表面划伤)', spec: 'CUSTOM-A', unit: 'PCS', qty: 150, unitPrice: 120.0, amount: 18000 },
      ],
    };
  } else {
    return {
      header: {
        docNo: 'PO-2026-0001',
        docDate: '2026-03-10',
        currency: 'CNY',
        exchangeRate: 1.0,
        partnerName: '华东精密电子机电配件制造有限公司',
        contactPerson: '赵科长',
        contactPhone: '138-1234-5678',
        buyer: '刘工',
        department: '采购供应一部',
        deliveryAddress: '江苏省苏州市相城区智能制造产业园 A5 库区',
      },
      items: [
        { lineNo: 1, skuCode: 'SKU-00101', skuName: '伺服电机驱动器驱动主板', spec: 'SV-400W', unit: 'SET', qty: 200, unitPrice: 420.0, amount: 84000 },
        { lineNo: 2, skuCode: 'SKU-00102', skuName: '耐磨高精度直线导轨组件', spec: 'HGR25-1000', unit: 'PCS', qty: 120, unitPrice: 165.0, amount: 19800 },
        { lineNo: 3, skuCode: 'SKU-00103', skuName: '工业级高速光电耦合隔离芯片', spec: 'DIP-8', unit: 'PCS', qty: 3000, unitPrice: 2.8, amount: 8400 },
      ],
    };
  }
});

const totalAmount = computed(() => {
  return currentDoc.value.items.reduce((acc, curr) => acc + curr.amount, 0);
});

const formatChineseMoney = (num: number): string => {
  if (num >= 100000) return '壹拾壹万贰仟贰佰元整';
  if (num >= 90000) return '玖万捌仟元整';
  return '壹拾万零贰仟元整';
};

const triggerPrint = () => {
  window.print();
};
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  #print-sheet-content,
  #print-sheet-content * {
    visibility: visible;
  }
  #print-sheet-content {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 10mm;
    box-shadow: none;
    border: none;
  }
}
</style>
