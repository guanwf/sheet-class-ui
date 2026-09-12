import { ref } from 'vue';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  text: string;
}

/**
 * 业务模块逻辑定义示例：标准采购订单业务逻辑 (Purchase Order Business Hook)
 *
 * 规范指导：
 * 业务模块在此处编写专属的校验判断、公式联动与生命周期业务逻辑，
 * 彻底与通用底层 UI 组件解耦。
 */
export function usePurchaseOrderLogic() {
  const toasts = ref<ToastMessage[]>([]);

  function showToast(text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    toasts.value.push({ id, type, text });
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, 3500);
  }

  /**
   * 1. 单元格数值变动与业务联动判断
   *    场景：输入采购数量和单价，自动计算出金额；数量不允许输入负数。
   */
  function handleCellChange(payload: {
    row: any;
    field: string;
    value: any;
    oldValue: any;
  }) {
    const { row, field, value } = payload;

    // 【业务判断 1】：采购数量校验，不允许输入负数
    if (field === 'quantity') {
      const qtyNum = Number(value);
      if (!isNaN(qtyNum) && qtyNum < 0) {
        row.quantity = 0;
        showToast('【业务规则拦截】采购数量不允许为负数，已自动重置为 0！', 'error');
        // 重新触发金额计算
        recalculateRowAmounts(row, 'quantity');
        return;
      }
    }

    // 【业务判断 2】：单价校验，不允许输入负数
    if (field === 'priceWithTax' || field === 'priceWithoutTax') {
      const priceNum = Number(value);
      if (!isNaN(priceNum) && priceNum < 0) {
        row[field] = 0;
        showToast('【业务规则拦截】单价不允许输入负数，已自动重置为 0！', 'error');
        recalculateRowAmounts(row, field);
        return;
      }
    }

    // 【业务联动计算】：数量、含税单价、无税单价、税率变动时自动联动计算各项金额
    if (['quantity', 'priceWithTax', 'priceWithoutTax', 'taxRate'].includes(field)) {
      recalculateRowAmounts(row, field);
    }
  }

  /**
   * 2. 核心数学与财税计算公式
   *    公式 1：价税合计 = 采购数量 × 含税单价
   *    公式 2：无税单价 = 含税单价 / (1 + 税率 / 100)
   *    公式 3：税额 = 价税合计 - (采购数量 × 无税单价)
   */
  function recalculateRowAmounts(row: any, triggerField: string) {
    const qty = Math.max(0, Number(row.quantity) || 0);
    const taxRate = Number(row.taxRate) ?? 13;
    const taxMultiplier = 1 + taxRate / 100;

    if (triggerField === 'priceWithoutTax') {
      // 用户主动录入【无税单价】 -> 自动反求【含税单价】与【价税合计】
      const priceNoTax = Math.max(0, Number(row.priceWithoutTax) || 0);
      const computedPriceWithTax = +(priceNoTax * taxMultiplier).toFixed(4);
      row.priceWithTax = computedPriceWithTax;

      const total = +(qty * computedPriceWithTax).toFixed(2);
      row.totalAmount = total;
      row.taxAmount = +(total - qty * priceNoTax).toFixed(2);
    } else {
      // 用户主动录入【含税单价】或【数量】或【税率】 -> 自动推导【无税单价】与【价税合计】
      const priceWithTax = Math.max(0, Number(row.priceWithTax) || 0);
      const computedPriceNoTax = +(priceWithTax / taxMultiplier).toFixed(4);
      row.priceWithoutTax = computedPriceNoTax;

      const total = +(qty * priceWithTax).toFixed(2);
      row.totalAmount = total;
      row.taxAmount = +(total - qty * computedPriceNoTax).toFixed(2);
    }
  }

  /**
   * 3. 整单提交前的高阶业务合法性校验
   */
  function validateBeforeSubmit(header: any, items: any[]): { valid: boolean; message?: string } {
    if (!header.partnerId) {
      return { valid: false, message: '请先选择往来供应商！' };
    }
    if (!items || items.length === 0) {
      return { valid: false, message: '采购订单至少必须包含一条物料明细记录！' };
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.itemCode || !item.itemName) {
        return { valid: false, message: `第 ${i + 1} 行物料编码或名称未填写！` };
      }
      if (Number(item.quantity) <= 0) {
        return { valid: false, message: `第 ${i + 1} 行采购数量必须大于 0！` };
      }
      if (Number(item.priceWithTax) <= 0) {
        return { valid: false, message: `第 ${i + 1} 行含税单价必须大于 0！` };
      }
    }

    return { valid: true };
  }

  return {
    toasts,
    showToast,
    handleCellChange,
    recalculateRowAmounts,
    validateBeforeSubmit,
  };
}
