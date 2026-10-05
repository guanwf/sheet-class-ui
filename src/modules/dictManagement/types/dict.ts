export type ScopeType = 'ALL' | 'PLATFORM' | 'TENANT' | 'ORG';

export interface LabelI18n {
  'zh-CN': string;
  en?: string;
  [lang: string]: string | undefined;
}

export interface DictType {
  id: string;
  typeCode: string;
  name: string;
  scope: 'PLATFORM' | 'TENANT' | 'ORG';
  tenantId: string;
  isBuiltin: 0 | 1;
  editable: 0 | 1;
  version: number;
  status: 0 | 1;
  remark?: string;
  creator?: string;
  createTime?: string;
  modifier?: string;
  modifyTime?: string;
}

export interface DictItem {
  id: string;
  typeCode: string;
  tenantId: string;
  itemCode: string;
  parentCode?: string | null;
  labelI18n: LabelI18n | string;
  sortNo: number;
  ext?: Record<string, any> | string;
  status: 0 | 1;
  validFrom?: string | null;
  validTo?: string | null;
  creator?: string;
  createTime?: string;
  modifier?: string;
  modifyTime?: string;
  // UI 辅助属性
  children?: DictItem[];
  _draftStatus?: 'NEW' | 'MODIFIED' | 'TOGGLED';
  _pendingStatus?: 0 | 1;
}

export interface DictDraft {
  id: string;
  tenantId: string;
  typeCode: string;
  itemCode: string;
  action: 'ADD' | 'UPDATE' | 'TOGGLE_STATUS';
  draftContent: string | Record<string, any>;
  createdBy: string;
  createTime: string;
}

export interface DictChangeLog {
  id: string;
  tenantId: string;
  typeCode: string;
  version: number;
  actionType: 'CREATE_TYPE' | 'ADD_ITEM' | 'UPDATE_ITEM' | 'TOGGLE_ITEM' | 'PUBLISH' | 'ROLLBACK' | 'DISCARD_DRAFT';
  targetCode?: string | null;
  beforeContent?: string | null;
  afterContent?: string | null;
  operator: string;
  operateTime: string;
  remark?: string | null;
}

export interface TableReference {
  systemName: string;
  tableName: string;
  columnName: string;
  count: number;
  description: string;
}

export interface DictUsageVO {
  typeCode: string;
  hasReferences: boolean;
  references: TableReference[];
  totalRowCount: number;
}

export interface TenantOption {
  id: string;
  name: string;
  code: string;
}
