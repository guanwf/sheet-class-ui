/**
 * 转换数字金额为人民币大写汉字
 * 遵循中国人民银行结算办法凭证大写规范
 */
export function numberToChinese(num: number): string {
  if (num === null || num === undefined || isNaN(num)) {
    return '零元整';
  }

  if (num === 0) {
    return '零元整';
  }

  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ];

  const head = num < 0 ? '欠人民币' : '人民币';
  num = Math.abs(num);

  let s = '';

  // 处理角分
  const decPart = Math.round((num % 1) * 100);
  const jiao = Math.floor(decPart / 10);
  const fen = decPart % 10;

  if (jiao > 0) s += digit[jiao] + fraction[0];
  if (fen > 0) s += digit[fen] + fraction[1];
  if (s === '') {
    s = '整';
  } else if (jiao === 0 && fen > 0) {
    s = '零' + s;
  }

  // 处理整数部分
  let intPart = Math.floor(num);
  for (let i = 0; i < unit[0].length && intPart > 0; i++) {
    let p = '';
    for (let j = 0; j < unit[1].length && intPart > 0; j++) {
      p = digit[intPart % 10] + unit[1][j] + p;
      intPart = Math.floor(intPart / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }

  const result = head + (s
    .replace(/(零.)*零元/, '元')
    .replace(/(零.)+/g, '零')
    .replace(/^整$/, '零元整') || '零元整');

  return result;
}

export function formatCurrency(num: number, currency: string = 'CNY'): string {
  if (num === undefined || num === null || isNaN(num)) return '¥0.00';
  const prefix = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥';
  return `${prefix}${num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(num: number, decimals: number = 2): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
