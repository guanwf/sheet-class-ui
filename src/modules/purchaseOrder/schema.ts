import { DocModuleConfig } from '../../engine/types';
import { SUPPLIERS, BUYERS, DEPARTMENTS } from '../../data/initialTemplates';

export const purchaseOrderModuleConfig: DocModuleConfig = {
  moduleKey: 'PURCHASE_ORDER',
  moduleName: '标准采购订单',

  // 2.2.1 按钮组：统一权限、状态机与触发控制
  actions: [
    {
      code: 'save',
      label: '保存',
      icon: 'save',
      variant: 'primary',
      shortcut: 'Ctrl+S',
      disabled: ({ isReadOnly }) => isReadOnly,
    },
    {
      code: 'submit',
      label: '审核',
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
      label: '审批驳回',
      icon: 'reject',
      variant: 'danger',
      visible: ({ status }) => status === 'pending',
    },
    {
      code: 'previewDelta',
      label: '查看提交报文 (I/U/D/N)',
      icon: 'payload',
      variant: 'outline',
      title: '查看按 master + slaves 增量格式生成的 JSON Payload',
    },
    {
      code: 'duplicate',
      label: '复制单据',
      icon: 'copy',
      variant: 'secondary',
    },
    {
      code: 'print',
      label: '打印',
      icon: 'print',
      variant: 'secondary',
    },
    {
      code: 'delete',
      label: '作废删除',
      icon: 'delete',
      variant: 'danger',
      visible: ({ status }) => status !== 'approved',
    },
  ],

  // 2.2.2 主表头字段配置 (默认响应式栅格排版，也支持插槽自定义覆盖)
  masterFields: [
    {
      key: 'docDate',
      label: '单据日期',
      type: 'date',
      span: 1,
      required: true,
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
      key: 'contactPerson',
      label: '业务联系人',
      type: 'text',
      span: 1,
      placeholder: '联系人姓名',
    },
    {
      key: 'contactPhone',
      label: '联系电话',
      type: 'text',
      span: 1,
      placeholder: '手机或座机',
    },
    {
      key: 'department',
      label: '采购部门',
      type: 'select',
      span: 1,
      options: DEPARTMENTS.map((d) => ({ label: d, value: d })),
    },
    {
      key: 'buyer',
      label: '经办采购员',
      type: 'select',
      span: 1,
      options: BUYERS.map((b) => ({ label: b, value: b })),
    },
    {
      key: 'currency',
      label: '币种',
      type: 'select',
      span: 1,
      options: [
        { label: 'CNY - 人民币', value: 'CNY' },
        { label: 'USD - 美元', value: 'USD' },
        { label: 'EUR - 欧元', value: 'EUR' },
      ],
    },
    {
      key: 'taxRateDefault',
      label: '默认税率 (%)',
      type: 'number',
      span: 1,
      step: 1,
      min: 0,
      max: 100,
    },
    {
      key: 'paymentTerm',
      label: '结算方式',
      type: 'select',
      span: 1,
      options: [
        { label: '电汇 T/T 月结 30 天', value: '电汇 T/T 月结 30 天' },
        { label: '预付款 30% + 到货款 70%', value: '预付款 30% + 到货款 70%' },
        { label: '货到验收合格见票即付', value: '货到验收合格见票即付' },
      ],
    },
    {
      key: 'contractNo',
      label: '关联合同号',
      type: 'text',
      span: 2,
      placeholder: '采购框架协议或合同编号',
    },
    {
      key: 'deliveryAddress',
      label: '交货工厂及收货仓库地址',
      type: 'text',
      span: 3,
      placeholder: '详细交货仓储地址',
    },
    {
      key: 'shippingMethod',
      label: '运输及交付方式',
      type: 'select',
      span: 1,
      options: [
        { label: '公路干线快运 / 门到门', value: '公路干线快运 / 门到门' },
        { label: '航空特快专递 / 恒温', value: '航空特快专递 / 恒温' },
        { label: '供方送货上门包卸', value: '供方送货上门包卸' },
      ],
    },
    {
      key: 'remarks',
      label: '单据特约条款与备忘条款',
      type: 'textarea',
      span: 6,
      placeholder: '特别约定、包装质量要求、开票说明等...',
    },
  ],

  // 2.2.3 子表配置 (可配置多个从表，无分页，虚拟滚动，就地编辑)
  slaves: {
    OrderItem: {
      key: 'OrderItem',
      title: '采购物料明细清单',
      icon: 'package',
      allowAdd: true,
      allowDelete: true,
      allowDuplicate: true,
      allowPaste: true,
      autoSummary: true,
      enableFilter: true, // 采购单模块开启网格过滤 (vxe-table 列过滤)
      enableSort: true,   // 采购单模块开启网格排序 (vxe-table 列排序)
      columns: [
        {
          field: 'itemCode',
          title: '物料编码',
          width: 140,
          editable: true,
          required: true,
          sortable: true,
          filterable: false,
          type: 'spirit',
          spiritKey: 'PRODUCT',
          multiple: true,
          placeholder: '点击或回车选物料',
          spiritMapping: {
            itemCode: 'productCode',
            itemName: 'productName',
            spec: 'spec',
            unit: 'unit',
            priceWithTax: 'retailPrice',
          },
          onSpiritSelect: ({ row, selected }) => {
            if (!row.quantity || Number(row.quantity) <= 0) {
              row.quantity = 10;
            }
            if (selected.retailPrice !== undefined) {
              row.priceWithTax = Number(selected.retailPrice);
              const rate = Number(row.taxRate) || 13;
              row.priceWithoutTax = +(Number(selected.retailPrice) / (1 + rate / 100)).toFixed(4);
            }
            const qty = Number(row.quantity) || 0;
            const price = Number(row.priceWithTax) || 0;
            const rate = Number(row.taxRate) || 13;
            row.amountWithTax = +(qty * price).toFixed(2);
            row.amountWithoutTax = +(row.amountWithTax / (1 + rate / 100)).toFixed(2);
            row.taxAmount = +(row.amountWithTax - row.amountWithoutTax).toFixed(2);
          },
        },
        { field: 'itemName', title: '物料名称', width: 220, editable: true, required: true, sortable: true, filterable: true },
        { field: 'spec', title: '规格型号', width: 160, editable: true, sortable: true, filterable: true },
        {
          field: 'unit',
          title: '单位',
          width: 70,
          align: 'center',
          editable: true,
          type: 'select',
          options: ['PCS', '个', '套', 'KG', '米', '箱', '台'],
          sortable: true,
          filterable: true,
          filters: [
            { label: 'PCS', value: 'PCS' },
            { label: '个', value: '个' },
            { label: '套', value: '套' },
            { label: 'KG', value: 'KG' },
            { label: '米', value: '米' },
            { label: '箱', value: '箱' },
            { label: '台', value: '台' },
          ],
        },
        {
          field: 'quantity',
          title: '采购数量',
          width: 100,
          align: 'right',
          editable: true,
          type: 'number',
          summary: 'sum',
          precision: 0,
          min: 0,
          sortable: true,
          filterable: true,
          rules: [{ min: 0, message: '采购数量不允许输入负数' }],
        },
        {
          field: 'priceWithoutTax',
          title: '无税单价',
          width: 110,
          align: 'right',
          editable: true,
          type: 'number',
          format: 'currency',
          min: 0,
          precision: 4,
          sortable: true,
          filterable: true,
        },
        {
          field: 'taxRate',
          title: '税率%',
          width: 80,
          align: 'right',
          editable: true,
          type: 'number',
          format: 'percent',
          min: 0,
          max: 100,
          defaultValue: 13,
          sortable: true,
          filterable: true,
        },
        {
          field: 'priceWithTax',
          title: '含税单价',
          width: 110,
          align: 'right',
          editable: true,
          type: 'number',
          format: 'currency',
          min: 0,
          precision: 2,
          sortable: true,
          filterable: true,
        },
        { field: 'taxAmount', title: '税额', width: 100, align: 'right', type: 'number', format: 'currency', summary: 'sum', sortable: true, filterable: true },
        { field: 'totalAmount', title: '价税合计', width: 120, align: 'right', type: 'number', format: 'currency', summary: 'sum', sortable: true, filterable: true },
        {
          field: 'warehouse',
          title: '入库仓库',
          width: 150,
          editable: true,
          type: 'select',
          options: ['WH-01 主料总仓', 'WH-02 辅料副仓', 'WH-03 电子器件恒温仓', 'WH-04 待检暂存区'],
          sortable: true,
          filterable: true,
          filters: [
            { label: 'WH-01 主料总仓', value: 'WH-01 主料总仓' },
            { label: 'WH-02 辅料副仓', value: 'WH-02 辅料副仓' },
            { label: 'WH-03 电子器件恒温仓', value: 'WH-03 电子器件恒温仓' },
            { label: 'WH-04 待检暂存区', value: 'WH-04 待检暂存区' },
          ],
        },
        { field: 'batchNo', title: '批次号', width: 140, editable: true, sortable: true, filterable: true },
        { field: 'deliveryDate', title: '交货日期', width: 120, align: 'center', editable: true, type: 'date', sortable: true, filterable: true },
        { field: 'remarks', title: '行备注', width: 160, editable: true, sortable: true, filterable: true },
      ],
    },
  },
};
