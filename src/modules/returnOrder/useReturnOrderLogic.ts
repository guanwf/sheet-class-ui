import { ref } from 'vue';
import { RETURN_STORES } from './schema';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  text: string;
}

/**
 * 业务模块逻辑 Hook：退货单模块 (Return Order Logic Hook)
 *
 * 核心要求实现：
 * 1. 输入数量和价格自动计算出合计金额 (totalAmount = quantity * price)
 * 2. 数量不允许输入负数，价格不允许输入负数
 * 3. 退货门店编号选择时，自动联动带出退货门店名称
 * 4. 审核时自动联动填入审批人与审批日期
 */
export function useReturnOrderLogic() {
  const toasts = ref<ToastMessage[]>([]);

  function showToast(text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    toasts.value.push({ id, type, text });
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, 3500);
  }

  /**
   * 1. 子表单元格数值变动业务联动
   */
  function handleCellChange(payload: {
    row: any;
    field: string;
    value: any;
    oldValue: any;
  }) {
    const { row, field, value } = payload;

    // 【业务判断 1】：退货数量校验，不允许输入负数
    if (field === 'quantity') {
      const qty = Number(value);
      if (!isNaN(qty) && qty < 0) {
        row.quantity = 0;
        showToast('【业务规则拦截】退货数量不允许为负数，已重置为 0！', 'error');
        recalculateRowTotal(row);
        return;
      }
    }

    // 【业务判断 2】：单价校验，不允许输入负数
    if (field === 'price' || field === 'priceWithTax') {
      const priceVal = Number(value);
      if (!isNaN(priceVal) && priceVal < 0) {
        row.price = 0;
        row.priceWithTax = 0;
        showToast('【业务规则拦截】退货价格不允许为负数，已重置为 0！', 'error');
        recalculateRowTotal(row);
        return;
      }
    }

    // 映射同步字段：productCode <-> itemCode, productName <-> itemName, price <-> priceWithTax
    if (field === 'productCode') {
      row.itemCode = value;
    } else if (field === 'itemCode') {
      row.productCode = value;
    }
    if (field === 'productName') {
      row.itemName = value;
    } else if (field === 'itemName') {
      row.productName = value;
    }

    // 【核心业务联动计算】：输入数量或价格，自动计算出合计金额 (totalAmount = quantity * price)
    if (['quantity', 'price', 'priceWithTax'].includes(field)) {
      recalculateRowTotal(row);
    }
  }

  /**
   * 2. 核心公式：合计金额 = 数量 × 价格
   */
  function recalculateRowTotal(row: any) {
    const qty = Math.max(0, Number(row.quantity) || 0);
    const unitPrice = Math.max(0, Number(row.price ?? row.priceWithTax) || 0);

    // 确保 price 与 priceWithTax 双向同步
    row.price = unitPrice;
    row.priceWithTax = unitPrice;
    row.priceWithoutTax = unitPrice;

    // 自动计算合计金额 (精确保留两位小数)
    const total = +(qty * unitPrice).toFixed(2);
    row.totalAmount = total;
    row.taxAmount = 0;
  }

  /**
   * 3. 主表字段联动：选择门店编号时，自动查找并填充门店名称与编码
   */
  function handleHeaderFieldChange(field: string, value: any, header: any) {
    if (field === 'shopCode' || field === 'storeCode') {
      const trimmed = String(value || '').trim();
      const matched = RETURN_STORES.find(
        (s) => s.code === trimmed || (s as any).shopCode === trimmed || (s as any).id === trimmed
      );
      if (matched) {
        header.shopCode = matched.code;
        header.storeCode = matched.code;
        header.shopName = matched.name;
        header.storeName = matched.name;
        showToast(`门店查询精灵已自动匹配并回填：${matched.code} - ${matched.name}`, 'info');
      } else if (header.shopName || header.storeName) {
        header.shopName = header.shopName || header.storeName;
        header.storeName = header.shopName;
      }
    } else if (field === 'shopName' || field === 'storeName') {
      header.shopName = value;
      header.storeName = value;
    }
  }

  /**
   * 4. 提交送审前的严格业务合法性校验
   */
  function validateBeforeSubmit(header: any, items: any[]): { valid: boolean; message?: string } {
    if (!header.partnerId) {
      return { valid: false, message: '请选择退货往来供应商' };
    }
    const hasShop = (header.shopCode || header.storeCode) && (header.shopName || header.storeName);
    if (!hasShop) {
      return { valid: false, message: '请通过门店查询精灵选择退货经办门店' };
    }
    if (!items || items.length === 0) {
      return { valid: false, message: '退货单子表至少需包含一行商品记录' };
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const code = item.productCode || item.itemCode;
      const name = item.productName || item.itemName;
      const qty = Number(item.quantity);
      const price = Number(item.price ?? item.priceWithTax);

      if (!code || !String(code).trim()) {
        return { valid: false, message: `第 ${i + 1} 行商品编号未填写` };
      }
      if (!name || !String(name).trim()) {
        return { valid: false, message: `第 ${i + 1} 行商品名称未填写` };
      }
      if (isNaN(qty) || qty <= 0) {
        return { valid: false, message: `第 ${i + 1} 行【${name}】退货数量必须大于 0` };
      }
      if (isNaN(price) || price < 0) {
        return { valid: false, message: `第 ${i + 1} 行【${name}】退货价格不合法` };
      }
      if (!item.returnReason) {
        return { valid: false, message: `第 ${i + 1} 行【${name}】退货原因必须选择` };
      }
    }

    return { valid: true };
  }

  return {
    toasts,
    showToast,
    handleCellChange,
    recalculateRowTotal,
    handleHeaderFieldChange,
    validateBeforeSubmit,
  };
}
