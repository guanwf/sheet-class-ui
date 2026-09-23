/**
 * pageUtils - 系统页面与权限工具库
 * 提供基于位掩码 (Bitmask) 的权限定义与运算辅助工具
 */

export const pageUtils = {
  /**
   * PERM - 权限位掩码常量
   * 每个权限项独占 1 个二进制位 (Power of 2)，支持位或 (|) 聚合与位与 (&) 鉴权
   */
  PERM: {
    /** 查询(1) - 2^0 */
    QUERY: 1,
    /** 新增(2) - 2^1 */
    ADD: 2,
    /** 修改(4) - 2^2 */
    EDIT: 4,
    /** 删除(8) - 2^3 */
    DELETE: 8,
    /** 保存(16) - 2^4 */
    SAVE: 16,
    /** 取消(32) - 2^5 */
    CANCEL: 32,
    /** 审核(64) - 2^6 */
    AUDIT: 64,
    /** 导出(128) - 2^7 */
    EXPORT: 128,
    /** 导入(256) - 2^8 */
    IMPORT: 256,
    /** 作废(512) - 2^9 */
    VOID: 512,
    /** 打印(1024) - 2^10 */
    PRINT: 1024,
    /** 全部(2047) - 2^0 + 2^1 + ... + 2^10 = 2047 (0x07FF) */
    ALL: 2047,
  },
};

/** 权限项定义 */
export interface PermOptionItem {
  value: number;
  label: string;
  code: string;
  name: string;
  bitIndex: number;
  description: string;
  badgeColor: string;
}

/** 11 项原子权限（不含全部2047聚合项） */
export const ATOMIC_PERM_OPTIONS: PermOptionItem[] = [
  { value: pageUtils.PERM.QUERY, label: '查询(1)', code: 'QUERY', name: '查询', bitIndex: 0, description: '检索、查看列表及明细台账', badgeColor: '#1677ff' },
  { value: pageUtils.PERM.ADD, label: '新增(2)', code: 'ADD', name: '新增', bitIndex: 1, description: '创建新单据、新建实体记录', badgeColor: '#52c41a' },
  { value: pageUtils.PERM.EDIT, label: '修改(4)', code: 'EDIT', name: '修改', bitIndex: 2, description: '编辑未提交或草稿状态的字段数据', badgeColor: '#fa8c16' },
  { value: pageUtils.PERM.DELETE, label: '删除(8)', code: 'DELETE', name: '删除', bitIndex: 3, description: '物理/逻辑删除单据及子项行', badgeColor: '#f5222d' },
  { value: pageUtils.PERM.SAVE, label: '保存(16)', code: 'SAVE', name: '保存', bitIndex: 4, description: '暂存草稿、持久化当前表单改动', badgeColor: '#13c2c2' },
  { value: pageUtils.PERM.CANCEL, label: '取消(32)', code: 'CANCEL', name: '取消', bitIndex: 5, description: '撤销未保存改动、恢复初始状态', badgeColor: '#8c8c8c' },
  { value: pageUtils.PERM.AUDIT, label: '审核(64)', code: 'AUDIT', name: '审核', bitIndex: 6, description: '业务主管过账核准、生效推进', badgeColor: '#722ed1' },
  { value: pageUtils.PERM.EXPORT, label: '导出(128)', code: 'EXPORT', name: '导出', bitIndex: 7, description: '导出 Excel/CSV 报表文件', badgeColor: '#2f54eb' },
  { value: pageUtils.PERM.IMPORT, label: '导入(256)', code: 'IMPORT', name: '导入', bitIndex: 8, description: '批量从模板数据导入至网格', badgeColor: '#eb2f96' },
  { value: pageUtils.PERM.VOID, label: '作废(512)', code: 'VOID', name: '作废', bitIndex: 9, description: '终止单据效力、红字冲销', badgeColor: '#fa541c' },
  { value: pageUtils.PERM.PRINT, label: '打印(1024)', code: 'PRINT', name: '打印', bitIndex: 10, description: '调用套打驱动与单据预览打印', badgeColor: '#d48806' },
];

/** 权限值选项 — 基于 pageUtils.PERM 位掩码（与用户规范一致） */
export const PERM_OPTIONS = [
  ...ATOMIC_PERM_OPTIONS.map(item => ({ value: item.value, label: item.label })),
  { value: pageUtils.PERM.ALL, label: '全部(2047)' },
];

/** 预置常用权限组合模板 */
export const PERM_PRESETS = [
  { name: '只读模式', value: pageUtils.PERM.QUERY, hint: '仅支持数据浏览查询' },
  {
    name: '常规录入',
    value: pageUtils.PERM.QUERY | pageUtils.PERM.ADD | pageUtils.PERM.EDIT | pageUtils.PERM.SAVE | pageUtils.PERM.CANCEL,
    hint: '查询/新增/修改/保存/取消 (55)',
  },
  {
    name: '标准单据业务',
    value: pageUtils.PERM.QUERY | pageUtils.PERM.ADD | pageUtils.PERM.EDIT | pageUtils.PERM.DELETE | pageUtils.PERM.SAVE | pageUtils.PERM.CANCEL | pageUtils.PERM.AUDIT | pageUtils.PERM.EXPORT | pageUtils.PERM.PRINT,
    hint: '增删改查+审核+导入导出+打印 (1279)',
  },
  { name: '全部权限', value: pageUtils.PERM.ALL, hint: '全部 11 项操作全开 (2047)' },
];

/**
 * 检查是否包含某个权限位
 */
export function hasPermission(mask: number, perm: number): boolean {
  if (perm === pageUtils.PERM.ALL) {
    return (mask & pageUtils.PERM.ALL) === pageUtils.PERM.ALL;
  }
  return (mask & perm) === perm;
}

/**
 * 将整型数值解构为选中的原子权限值数组 (例如 15 => [1, 2, 4, 8])
 */
export function decodeRightValues(mask: number): number[] {
  const result: number[] = [];
  for (const opt of ATOMIC_PERM_OPTIONS) {
    if ((mask & opt.value) === opt.value) {
      result.push(opt.value);
    }
  }
  // 如果所有 11 个原子权限都包含，则把 ALL (2047) 也包含在返回列表中
  if (result.length === ATOMIC_PERM_OPTIONS.length) {
    result.push(pageUtils.PERM.ALL);
  }
  return result;
}

/**
 * 将选中的权限值数组通过按位或 (|) 聚合为最终的 rightvalues 整数
 */
export function encodeRightValues(values: number[]): number {
  if (!values || values.length === 0) return 0;
  // 如果包含了 ALL(2047)，直接返回 2047
  if (values.includes(pageUtils.PERM.ALL)) {
    return pageUtils.PERM.ALL;
  }
  return values.reduce((acc, curr) => acc | curr, 0);
}

/**
 * 获取某个 rightvalues 对应的权限项标签列表
 */
export function getActivePermBadges(mask: number): PermOptionItem[] {
  return ATOMIC_PERM_OPTIONS.filter(opt => (mask & opt.value) === opt.value);
}

/**
 * 格式化为 11 位的二进制字符串表示（如 11111111111）
 */
export function toBinary11(mask: number): string {
  const clamped = mask & pageUtils.PERM.ALL;
  return (clamped >>> 0).toString(2).padStart(11, '0');
}

/**
 * 格式化为十六进制字符串（如 0x07FF）
 */
export function toHex4(mask: number): string {
  const clamped = mask & pageUtils.PERM.ALL;
  return '0x' + clamped.toString(16).toUpperCase().padStart(4, '0');
}
