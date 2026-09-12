// 通用查询精灵核心类型规范 (Spirit Core Types)

export type SpiritKey = 'SHOP' | 'SUPPLIER' | 'PRODUCT' | string;

/**
 * 精灵网格列配置 (基于 vxe-table)
 */
export interface SpiritColumnConfig {
  field: string;
  title: string;
  width?: number | string;
  minWidth?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  fixed?: 'left' | 'right';
  type?: 'seq' | 'checkbox' | 'tag' | 'currency' | 'status';
  formatter?: (row: any) => string;
}

/**
 * 精灵顶部查询条件字段配置
 */
export interface SpiritSearchFieldConfig {
  field: string;
  label: string;
  type?: 'input' | 'select';
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  defaultValue?: any;
}

/**
 * 精灵通用定义模型 (SpiritConfig)
 */
export interface SpiritConfig<T = any> {
  spiritKey: SpiritKey;
  title: string;
  subTitle?: string;
  // 主键值字段 (如 'shopCode')
  valueField: string;
  // 显示标签字段 (如 'shopName')
  displayField: string;
  // 关联编码字段 (缺省与 valueField 一致)
  codeField?: string;
  // 关联名称字段 (缺省与 displayField 一致)
  nameField?: string;
  // 默认字段联动回传映射 (确认选中时，自动将这些源字段与目标字段同时回传)
  defaultMapping?: SpiritFieldMapping;
  // 自定义回调处理
  onSpiritSelect?: (payload: { selected: T; allSelected?: T[]; context?: any }) => void | Record<string, any>;
  // 顶部查询字段列表
  searchFields: SpiritSearchFieldConfig[];
  // 底部网格列定义
  columns: SpiritColumnConfig[];
  // 数据获取接口 (支持同步数据或异步 Promise)
  fetchData: (params: Record<string, any>) => Promise<T[]> | T[];
  // 快速模糊匹配字段列表 (在输入框直接回车搜索时用)
  quickSearchFields?: string[];
  // 弹窗建议宽度 (默认 860px)
  dialogWidth?: string;
  // 是否允许空选
  allowEmpty?: boolean;
  // 是否支持多选 (常用于网格批量选品)
  multiple?: boolean;
}

/**
 * 字段联动回填映射规则:
 * key: 调用方表单字段 (如 'shopCode', 'shopName', 'deliveryAddress')
 * value: 精灵实体对应字段 (如 'shopCode', 'shopName', 'address')
 */
export type SpiritFieldMapping = Record<string, string>;
