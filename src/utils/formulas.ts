import { ItemDetailRow, DocumentSummary } from '../types/document';
import { numberToChinese } from './numberToChinese';

/**
 * 针对单行明细进行公式联动计算
 * 规则：
 * 1. 若修改了含税单价 priceWithTax 和税率 taxRate:
 *    priceWithoutTax = priceWithTax / (1 + taxRate/100)
 *    totalAmount = quantity * priceWithTax
 *    taxAmount = totalAmount - (quantity * priceWithoutTax)
 * 2. 保证浮点数精度规整（两位小数）
 */
export function recalculateItemRow(
  row: ItemDetailRow,
  changedField?: keyof ItemDetailRow
): ItemDetailRow {
  const rawQty = Number(row.quantity);
  const qty = isNaN(rawQty) ? 0 : Math.max(0, rawQty);
  const taxRate = Number(row.taxRate) || 0;

  // 兼容退货单模块的 price 字段
  if (changedField === ('price' as any) || row.price !== undefined) {
    const rawPrice = Math.max(0, Number(row.price ?? row.priceWithTax) || 0);
    row.price = rawPrice;
    row.priceWithTax = rawPrice;
  }

  let priceWithTax = Math.max(0, Number(row.priceWithTax ?? row.price) || 0);
  let priceWithoutTax = Math.max(0, Number(row.priceWithoutTax) || 0);

  if (changedField === 'priceWithoutTax') {
    priceWithTax = Math.round(priceWithoutTax * (1 + taxRate / 100) * 100) / 100;
  } else if (changedField === 'priceWithTax' || (changedField as any) === 'price' || !changedField || changedField === 'taxRate') {
    priceWithoutTax = Math.round((priceWithTax / (1 + taxRate / 100)) * 10000) / 10000;
  }

  const totalAmount = Math.round(qty * priceWithTax * 100) / 100;
  const totalWithoutTax = Math.round(qty * priceWithoutTax * 100) / 100;
  const taxAmount = Math.round((totalAmount - totalWithoutTax) * 100) / 100;

  return {
    ...row,
    price: priceWithTax,
    priceWithTax,
    priceWithoutTax,
    taxAmount,
    totalAmount,
    isDirty: true,
  };
}

/**
 * 计算整单汇总指标
 */
export function computeDocumentSummary(
  items: ItemDetailRow[],
  currency: string = 'CNY'
): DocumentSummary {
  let totalQty = 0;
  let totalWithoutTax = 0;
  let totalTax = 0;
  let totalWithTax = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    totalQty += Number(item.quantity) || 0;
    totalWithoutTax += Number(item.quantity) * Number(item.priceWithoutTax) || 0;
    totalTax += Number(item.taxAmount) || 0;
    totalWithTax += Number(item.totalAmount) || 0;
  }

  totalWithoutTax = Math.round(totalWithoutTax * 100) / 100;
  totalTax = Math.round(totalTax * 100) / 100;
  totalWithTax = Math.round(totalWithTax * 100) / 100;

  return {
    totalRows: items.length,
    totalQuantity: totalQty,
    totalAmountWithoutTax: totalWithoutTax,
    totalTaxAmount: totalTax,
    totalAmountWithTax: totalWithTax,
    currencySymbol: currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥',
    capitalizedAmountCN: numberToChinese(totalWithTax),
  };
}

/**
 * 快速大批量数据生成器（用于性能压测 1000 ~ 10000 行）
 */
export function generateBulkItems(
  count: number,
  startRowNo: number = 1
): ItemDetailRow[] {
  const warehouses = ['WH-01 主料总仓', 'WH-02 自动化立库', 'WH-03 电子元器件仓', 'WH-04 保税监管仓'];
  const units = ['PCS', 'BOX', 'KG', 'SET', 'M'];
  const specs = [
    { code: 'IC-STM32F407', name: '32位 Cortex-M4 微控制器', spec: 'LQFP-100 168MHz 512KB', basePrice: 42.5 },
    { code: 'RES-0805-10K', name: '贴片精密薄膜电阻', spec: '0805 10kΩ ±0.1% 1/8W', basePrice: 0.35 },
    { code: 'CAP-MLCC-10uF', name: '高频多层陶瓷电容', spec: '1206 X7R 10uF 50V', basePrice: 1.15 },
    { code: 'RELAY-HF49FD', name: '微型大功率功率继电器', spec: 'DC24V 10A 5PIN', basePrice: 14.8 },
    { code: 'PCB-MAIN-V4', name: '工业主控八层阻抗板', spec: 'FR4 1.6mm 沉金工艺', basePrice: 88.0 },
    { code: 'CONN-RJ45-LED', name: '带变压器双灯千兆网口', spec: 'RJ45 1000M 带屏蔽', basePrice: 11.2 },
    { code: 'PWR-DC-24V5A', name: '导轨型工业开关电源', spec: 'AC220V转DC24V 120W', basePrice: 135.0 },
    { code: 'LCD-TFT-7INCH', name: '工业电容触控高亮屏', spec: '7.0寸 1024x600 IPS', basePrice: 210.0 },
  ];

  const now = new Date();
  const rows: ItemDetailRow[] = [];

  for (let i = 0; i < count; i++) {
    const template = specs[i % specs.length];
    const rowNo = startRowNo + i;
    const qty = ((i * 7 + 13) % 490) + 10;
    const priceWithTax = Math.round((template.basePrice * (1 + ((i % 20) - 10) * 0.02)) * 100) / 100;
    const taxRate = 13;
    const priceWithoutTax = Math.round((priceWithTax / 1.13) * 10000) / 10000;
    const totalAmount = Math.round(qty * priceWithTax * 100) / 100;
    const totalWithoutTax = Math.round(qty * priceWithoutTax * 100) / 100;
    const taxAmount = Math.round((totalAmount - totalWithoutTax) * 100) / 100;

    const deliveryDateObj = new Date(now.getTime() + (i % 30 + 3) * 86400000);
    const deliveryDate = deliveryDateObj.toISOString().split('T')[0];

    rows.push({
      id: `item-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 6)}`,
      rowNo,
      itemCode: `${template.code}-${String((i % 99) + 1).padStart(2, '0')}`,
      itemName: template.name,
      spec: template.spec,
      unit: units[i % units.length],
      quantity: qty,
      priceWithTax,
      priceWithoutTax,
      taxRate,
      taxAmount,
      totalAmount,
      warehouse: warehouses[i % warehouses.length],
      batchNo: `BAT-2026-${String((i % 50) + 1).padStart(3, '0')}`,
      deliveryDate,
      sourceDocNo: i % 3 === 0 ? `PR-2026-0${100 + (i % 20)}` : '',
      remarks: i % 5 === 0 ? '加急特批物料' : '',
    });
  }

  return rows;
}
