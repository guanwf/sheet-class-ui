import { DocModuleConfig } from '../../engine/types';
import { SUPPLIERS } from '../../data/initialTemplates';

export const RETURN_STORES = [
  { code: 'STR-BJ-01', name: '北京中关村智慧旗舰店' },
  { code: 'STR-SH-02', name: '上海陆家嘴概念体验中心' },
  { code: 'STR-SZ-03', name: '深圳南山科技园直营店' },
  { code: 'STR-GZ-04', name: '广州天河核心大厦店' },
  { code: 'STR-HZ-05', name: '杭州西湖湖滨百货店' },
];

export const RETURN_REASONS = [
  '质量瑕疵/破损',
  '包装严重破损',
  '规格型号不符',
  '保质期临期下架',
  '错发商品退回',
  '滞销退换货',
  '供方召回',
  '其他特约退货',
];

export const returnOrderModuleConfig: DocModuleConfig = {
  moduleKey: 'RETURN_ORDER',
  moduleName: '采购退货单',

  // 1. 操作栏按钮配置 (权限、状态机与快捷触发)
  actions: [
    {
      code: 'save',
      label: '保存退货单',
      icon: 'save',
      variant: 'primary',
      shortcut: 'Ctrl+S',
      disabled: ({ isReadOnly }) => isReadOnly,
    },
    {
      code: 'submit',
      label: '提交送审',
      icon: 'send',
      variant: 'primary',
      visible: ({ status }) => status === 'draft' || status === 'rejected',
    },
    {
      code: 'approve',
      label: '审核通过',
      icon: 'approve',
      variant: 'success',
      visible: ({ status }) => status === 'pending',
    },
    {
      code: 'reject',
      label: '退回驳回',
      icon: 'reject',
      variant: 'danger',
      visible: ({ status }) => status === 'pending',
    },
    {
      code: 'previewDelta',
      label: '增量报文 (Payload)',
      icon: 'payload',
      variant: 'outline',
      title: '查看按 master + slaves 增量格式生成的 JSON Payload',
    },
    {
      code: 'duplicate',
      label: '复制退货单',
      icon: 'copy',
      variant: 'secondary',
    },
    {
      code: 'print',
      label: '凭证套打',
      icon: 'print',
      variant: 'secondary',
    },
    {
      code: 'delete',
      label: '作废单据',
      icon: 'delete',
      variant: 'danger',
      visible: ({ status }) => status !== 'approved',
    },
  ],

  // 2. 主表头字段配置 (严格包含用户要求的全部核心字段)
  // 单据编号，供应商，退货门店编号，退货门店名称，制单人，制单日期，审批人，审批日期，备注
  masterFields: [
    {
      key: 'docNo',
      label: '退货单编号',
      type: 'text',
      span: 2,
      disabled: true,
      placeholder: '系统自动生成 (如 RO-2026...)',
    },
    {
      key: 'partnerId',
      label: '往来供应商',
      type: 'select',
      span: 2,
      required: true,
      options: SUPPLIERS.map((s) => ({
        label: `[${s.code}] ${s.name}`,
        value: s.id,
      })),
    },
    {
      key: 'docDate',
      label: '制单日期',
      type: 'date',
      span: 2,
      required: true,
    },
    {
      key: 'storeCode',
      label: '退货门店编号',
      type: 'select',
      span: 2,
      required: true,
      options: RETURN_STORES.map((st) => ({
        label: `[${st.code}] ${st.name}`,
        value: st.code,
      })),
    },
    {
      key: 'storeName',
      label: '退货门店名称',
      type: 'text',
      span: 2,
      required: true,
      placeholder: '选择门店编号后自动联动带出',
    },
    {
      key: 'createdBy',
      label: '制单人',
      type: 'text',
      span: 2,
      placeholder: '经办制单人姓名',
    },
    {
      key: 'approvedBy',
      label: '审批人',
      type: 'text',
      span: 2,
      disabled: true,
      placeholder: '审核通过后自动写入',
    },
    {
      key: 'approvedDate',
      label: '审批日期',
      type: 'date',
      span: 2,
      disabled: true,
      placeholder: '审批核准日期',
    },
    {
      key: 'remarks',
      label: '退货备注说明',
      type: 'textarea',
      span: 6,
      placeholder: '填写退货原因说明、随货退还清单及物流特约备注...',
    },
  ],

  // 3. 子表配置 (用户指定字段：商品编号，商品名称，数量，价格，退货原因，合计金额)
  slaves: {
    ReturnItem: {
      key: 'ReturnItem',
      title: '退货商品明细清单',
      icon: 'rotate-ccw',
      allowAdd: true,
      allowDelete: true,
      allowDuplicate: true,
      allowPaste: true,
      autoSummary: true,
      enableFilter: false, // 退货单模块不开启网格过滤
      enableSort: false,   // 退货单模块不开启网格排序
      columns: [
        {
          field: 'productCode',
          title: '商品编号',
          width: 140,
          editable: true,
          required: true,
          fixed: 'left',
        },
        {
          field: 'productName',
          title: '商品名称',
          width: 220,
          editable: true,
          required: true,
        },
        {
          field: 'quantity',
          title: '退货数量',
          width: 110,
          align: 'right',
          type: 'number',
          precision: 0,
          min: 0,
          required: true,
          summary: 'sum',
        },
        {
          field: 'price',
          title: '单价 (¥)',
          width: 120,
          align: 'right',
          type: 'number',
          precision: 2,
          min: 0,
          required: true,
        },
        {
          field: 'totalAmount',
          title: '合计金额 (¥)',
          width: 140,
          align: 'right',
          type: 'number',
          precision: 2,
          editable: false,
          summary: 'sum',
        },
        {
          field: 'returnReason',
          title: '退货原因',
          width: 170,
          type: 'select',
          options: RETURN_REASONS.map((r) => ({ label: r, value: r })),
          required: true,
        },
        {
          field: 'remarks',
          title: '明细备注',
          minWidth: 160,
          type: 'text',
        },
      ],
    },
  },
};
