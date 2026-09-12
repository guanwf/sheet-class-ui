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
