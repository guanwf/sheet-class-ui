import { Component } from 'vue';

// 通用单据引擎核心类型定义 (Doc Engine Types)

export type DocStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'voided';

export type DeltaFlag = 'I' | 'U' | 'D' | 'N';

export interface DocActionContext {
  status: DocStatus;
  isReadOnly: boolean;
  isDirty: boolean;
  doc: any;
}

export interface DocActionItem {
  code: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline';
  title?: string;
  shortcut?: string;
  visible?: (ctx: DocActionContext) => boolean;
  disabled?: (ctx: DocActionContext) => boolean;
  onClick?: (ctx: DocActionContext) => void | Promise<void>;
}

export interface FieldOption {
  label: string;
  value: string | number;
  [key: string]: any;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'custom';
  span?: number; // 1 ~ 6 栅格跨度，默认 1
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
}

export interface ColumnRule {
  required?: boolean;
  min?: number;
  max?: number;
  message?: string;
  validator?: (params: { cellValue: any; row: any; column: any }) => boolean | string | Error | Promise<any>;
}

export interface SlaveColumnFilterOption {
  label: string;
  value: any;
  checked?: boolean;
  [key: string]: any;
}

export interface SlaveColumnConfig {
  field: string;
  title: string;
  width?: number | string;
  minWidth?: number;
  fixed?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  editable?: boolean;
  type?: 'text' | 'number' | 'select' | 'date';
  options?: Array<FieldOption | string>;
  summary?: 'sum' | 'count' | 'avg' | 'none';
  required?: boolean;
  defaultValue?: any; // 只有显式指定了 defaultValue 才在新增时填入，否则留空
  format?: 'currency' | 'number' | 'percent' | 'date';
  placeholder?: string;
  precision?: number;
  min?: number; // 数值类型下限（例如 min: 0 禁止负数）
  max?: number; // 数值类型上限
  rules?: ColumnRule[]; // 校验规则
  sortable?: boolean; // 是否支持单列排序（默认 true）
  filterable?: boolean; // 是否支持通过配置开启单列过滤
  filters?: SlaveColumnFilterOption[]; // 自定义静态过滤选项（如仓库、单位下拉选项等）
  filterMultiple?: boolean; // 是否支持多选过滤（默认 true）
  filterMethod?: (params: { value: any; option: any; cellValue: any; row: any; column: any }) => boolean; // 自定义过滤判断方法
}

export interface SlaveTableConfig {
  key: string;
  title: string;
  icon?: string;
  columns: SlaveColumnConfig[];
  allowAdd?: boolean;
  allowDelete?: boolean;
  allowDuplicate?: boolean;
  allowPaste?: boolean;
  autoSummary?: boolean;
  enableFilter?: boolean; // 网格是否开启过滤（采购单开启，退货单不开启）
  enableSort?: boolean;   // 网格是否开启排序（采购单开启，退货单不开启）
}

export interface DocModuleConfig {
  moduleKey: string;
  moduleName: string;
  actions: DocActionItem[];
  masterFields: FieldConfig[];
  slaves: Record<string, SlaveTableConfig>;
}

export interface DeltaPayload {
  master: Record<string, any> & { _flag: DeltaFlag };
  slaves: Record<string, Array<Record<string, any> & { _flag: DeltaFlag }>>;
}

/**
 * 单据列表台账顶部 KPI 指标卡配置
 */
export interface DocListStatsCardConfig {
  key: string;
  label: string;
  subLabel?: string;
  icon?: string; // 'Layers' | 'Clock' | 'CheckCircle2' | 'DollarSign' | 'AlertCircle' | 'Package' 等
  color?: 'indigo' | 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate';
  filterStatus?: string; // 点击卡片直接过滤状态（如 'pending' | 'approved' | 'draft' 等）
  isCurrency?: boolean;
  unit?: string; // '单' | '笔' 等
  compute?: (docs: any[], flatDocs: any[]) => number;
}

/**
 * 单据列表台账查询条件表单字段配置
 */
export interface DocListSearchFieldConfig {
  field: string;
  label: string;
  type: 'input' | 'select' | 'date';
  placeholder?: string;
  width?: string;
  options?: Array<{ label: string; value: any }>;
  defaultValue?: any;
}

/**
 * 单据列表台账 vxe-table 列配置
 */
export interface DocListColumnConfig {
  field: string;
  title: string;
  width?: number | string;
  minWidth?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  fixed?: 'left' | 'right';
  type?: 'seq' | 'checkbox' | 'docNo' | 'statusBadge' | 'currency' | 'date' | 'partner' | 'actions' | 'custom';
  format?: 'currency' | 'date' | 'number';
  cellRenderSlot?: string;
}

/**
 * 业务模块单据列表台账独立配置模型 (DocListConfig)
 * 每个业务模块可在专属 listConfig.ts 中独立维护状态卡片、查询表单与网格列定义
 */
export interface DocListConfig {
  moduleKey: string;
  moduleName: string;
  // 支持业务模块完全自定义顶栏状态 HTML 组件 (若配置则替代默认的 4 格卡片)
  customStatusBarComponent?: Component;
  statsCards?: DocListStatsCardConfig[];
  searchFields?: DocListSearchFieldConfig[];
  columns: DocListColumnConfig[];
}

