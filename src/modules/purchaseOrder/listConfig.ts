import { DocListConfig } from '../../engine/types';
import { SUPPLIERS, BUYERS } from '../../data/initialTemplates';

/**
 * 采购订单业务模块 - 单据列表专属配置 (listConfig.ts)
 * 独立维护当前单据的：
 * 1. 顶部状态/KPI 卡片定义 (statsCards)
 * 2. 专属查询筛选字段 (searchFields)
 * 3. vxe-table 台账网格列定义 (columns)
 */
export const purchaseOrderListConfig: DocListConfig = {
  moduleKey: 'PURCHASE_ORDER',
  moduleName: '采购订单台账',

  // 1. 顶部业务指标状态栏卡片 (支持点击联动快速筛选状态)
  statsCards: [
    {
      key: 'total',
      label: '采购订单总数',
      subLabel: '系统全部有效采购单据台账',
      icon: 'Layers',
      color: 'indigo',
      unit: '单',
      compute: (docs) => docs.length,
    },
    {
      key: 'pending',
      label: '待审核审批',
      subLabel: '等待部门主管与财务核准',
      icon: 'Clock',
      color: 'amber',
      unit: '单',
      filterStatus: 'pending',
      compute: (docs) => docs.filter((d) => (d.header?.status || d.status) === 'pending').length,
    },
    {
      key: 'approved',
      label: '已生效采购单',
      subLabel: '已下达下游供应商交付与质检',
      icon: 'CheckCircle2',
      color: 'emerald',
      unit: '单',
      filterStatus: 'approved',
      compute: (docs) => docs.filter((d) => (d.header?.status || d.status) === 'approved').length,
    },
    {
      key: 'amountSum',
      label: '采购合同总额 (¥)',
      subLabel: '全部采购订单价税合计总额',
      icon: 'DollarSign',
      color: 'indigo',
      isCurrency: true,
      compute: (_docs, flatDocs) =>
        flatDocs.reduce((sum, d) => sum + (Number(d.totalAmount) || 0), 0),
    },
  ],

  // 2. 查询条件区字段配置 (每个单据可灵活增减专属字段)
  searchFields: [
    {
      field: 'keyword',
      label: '综合搜索',
      type: 'input',
      placeholder: '搜索采购单号、供应商、经办人、合同号...',
      width: '280px',
    },
    {
      field: 'status',
      label: '单据状态',
      type: 'select',
      defaultValue: 'ALL',
      options: [
        { label: '全部状态', value: 'ALL' },
        { label: '草稿编制中', value: 'draft' },
        { label: '待审核审批', value: 'pending' },
        { label: '已核准生效', value: 'approved' },
        { label: '审批已驳回', value: 'rejected' },
        { label: '单据已作废', value: 'voided' },
      ],
    },
    {
      field: 'partnerCode',
      label: '供应商',
      type: 'select',
      defaultValue: 'ALL',
      options: [
        { label: '全部供应商', value: 'ALL' },
        ...SUPPLIERS.map((s) => ({ label: `${s.code} - ${s.name}`, value: s.code })),
      ],
    },
    {
      field: 'buyer',
      label: '采购员',
      type: 'select',
      defaultValue: 'ALL',
      options: [
        { label: '全部采购员', value: 'ALL' },
        ...BUYERS.map((b) => ({ label: b, value: b })),
      ],
    },
  ],

  // 3. 采购订单台账专属网格列配置 (基于 vxe-table 渲染)
  columns: [
    {
      field: '_checkbox',
      title: '',
      type: 'checkbox',
      width: 45,
      align: 'center',
      fixed: 'left',
    },
    {
      field: '_seq',
      title: '序号',
      type: 'seq',
      width: 55,
      align: 'center',
      fixed: 'left',
    },
    {
      field: 'docNo',
      title: '采购单号',
      type: 'docNo',
      width: 180,
      sortable: true,
      fixed: 'left',
    },
    {
      field: 'status',
      title: '状态',
      type: 'statusBadge',
      width: 110,
      align: 'center',
    },
    {
      field: 'partnerName',
      title: '供应商名称',
      type: 'partner',
      minWidth: 200,
    },
    {
      field: 'totalAmount',
      title: '采购合同金额 (¥)',
      type: 'currency',
      width: 145,
      align: 'right',
      sortable: true,
    },
    {
      field: 'docDate',
      title: '下单日期',
      type: 'date',
      width: 110,
      align: 'center',
      sortable: true,
    },
    {
      field: 'buyer',
      title: '采购经办人',
      width: 130,
    },
    {
      field: 'department',
      title: '经办部门',
      width: 150,
    },
    {
      field: 'contractNo',
      title: '框架合同号',
      width: 150,
    },
    {
      field: 'itemsCount',
      title: '明细项数',
      width: 90,
      align: 'center',
    },
    {
      field: '_actions',
      title: '操作',
      type: 'actions',
      width: 170,
      align: 'center',
      fixed: 'right',
    },
  ],
};
