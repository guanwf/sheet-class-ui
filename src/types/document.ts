export type DocumentStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'closed' | 'voided';

export type DocumentType = 'PURCHASE_ORDER' | 'RETURN_ORDER' | 'SALES_DELIVERY' | 'PROD_REQUISITION';

export interface SupplierOrCustomer {
  id: string;
  code: string;
  name: string;
  contact: string;
  phone: string;
  taxNumber: string;
  address: string;
}

export interface StoreItem {
  code: string;
  name: string;
  manager?: string;
  address?: string;
}

export interface MasterHeader {
  id: string;
  docNo: string;
  docDate: string;
  docType: DocumentType;
  status: DocumentStatus;
  
  // 业务实体
  partnerId: string;
  partnerName: string;
  partnerCode: string;
  contactPerson: string;
  contactPhone: string;

  // 退货门店字段 (退货单专属)
  storeCode?: string;
  storeName?: string;
  
  // 组织架构
  department: string;
  buyer: string;
  
  // 财务商务
  currency: string;
  exchangeRate: number;
  paymentTerm: string;
  taxRateDefault: number;
  contractNo: string;
  
  // 物流
  deliveryAddress: string;
  shippingMethod: string;
  
  // 备注
  remarks: string;
  
  // 审计与版本
  createdBy: string;
  createdTime: string;
  approvedBy?: string;
  approvedTime?: string;
  approvedDate?: string;
  updatedBy: string;
  updatedTime: string;
  version: number;
}

export interface ItemDetailRow {
  id: string;
  rowNo: number;
  itemCode: string;
  itemName: string;
  // 退货商品字段别名映射
  productCode?: string;
  productName?: string;
  price?: number;
  returnReason?: string;
  spec: string;
  unit: string;
  quantity: number;
  priceWithoutTax: number;
  priceWithTax: number;
  taxRate: number; // e.g. 13 for 13%
  taxAmount: number;
  totalAmount: number;
  warehouse: string;
  batchNo: string;
  deliveryDate: string;
  sourceDocNo?: string;
  remarks: string;
  isDirty?: boolean;
}

export interface CostAllocationRow {
  id: string;
  rowNo: number;
  costItem: string;
  allocationMethod: 'AMOUNT' | 'QUANTITY' | 'VOLUME' | 'MANUAL';
  amount: number;
  payee: string;
  invoiceRequired: boolean;
  remarks: string;
}

export interface PaymentScheduleRow {
  id: string;
  stage: number;
  stageName: string;
  ratio: number; // percentage, e.g. 30 for 30%
  amount: number;
  dueDate: string;
  condition: string;
  paymentMethod: string;
  status: 'PENDING' | 'PARTIAL' | 'SETTLED';
}

export interface AttachmentItem {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadTime: string;
  uploader: string;
  url: string;
}

export interface AuditLogItem {
  id: string;
  stepName: string;
  operator: string;
  role: string;
  action: 'CREATE' | 'SUBMIT' | 'APPROVE' | 'REJECT' | 'UPDATE' | 'PRINT';
  comment: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface DocumentSummary {
  totalRows: number;
  totalQuantity: number;
  totalAmountWithoutTax: number;
  totalTaxAmount: number;
  totalAmountWithTax: number;
  currencySymbol: string;
  capitalizedAmountCN: string;
}

export interface DocumentColumnConfig {
  key: keyof ItemDetailRow;
  title: string;
  width: number;
  fixed?: 'left' | 'right';
  editable: boolean;
  type: 'text' | 'number' | 'select' | 'date';
  options?: string[];
  align?: 'left' | 'center' | 'right';
  required?: boolean;
  format?: 'currency' | 'number' | 'date' | 'percent';
  description?: string;
}

export interface DocumentSchemaConfig {
  docType: DocumentType;
  title: string;
  columns: DocumentColumnConfig[];
  customRules: {
    allowNegativeQty: boolean;
    requireDeliveryDate: boolean;
    maxRowsWarning: number;
  };
}

export interface DocumentRecord {
  header: MasterHeader;
  items: ItemDetailRow[];
  costs: CostAllocationRow[];
  paymentSchedule: PaymentScheduleRow[];
  attachments: AttachmentItem[];
  logs: AuditLogItem[];
}

export type ModuleKey = 'PURCHASE_ORDER' | 'RETURN_ORDER';

export interface ModuleSessionState {
  tabs: TabPageItem[];
  activeTabId: string;
}

export interface OuterModuleTabItem {
  id: ModuleKey;
  title: string;
  code: string;
  icon: string;
  description: string;
}

export type TabPageType = 'LIST' | 'DOCUMENT';

export interface TabPageItem {
  id: string;
  type: TabPageType;
  title: string;
  docId?: string;
  closable: boolean;
  isNew?: boolean;
  status?: DocumentStatus;
  isDirty?: boolean;
  moduleId?: ModuleKey;
}
