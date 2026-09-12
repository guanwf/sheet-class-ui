import { DocListConfig } from '../../engine/types';
import { SUPPLIERS } from '../../data/initialTemplates';
import ReturnOrderCustomStatusBar from './ReturnOrderCustomStatusBar.vue';

/**
 * 采购退货单业务模块 - 单据列表专属配置 (listConfig.ts)
 * 独立维护当前退货单单据的：
 * 1. 专属定制 HTML 顶栏状态组件 (customStatusBarComponent - 方案一)
 * 2. 专属查询筛选字段 (searchFields，突出退货门店、退货供应商等)
 * 3. vxe-table 台账网格列定义 (columns，突出退货单号、退货金额、冲抵方式等)
 */
export const returnOrderListConfig: DocListConfig = {
  moduleKey: 'RETURN_ORDER',
  moduleName: '采购退货单台账',

  // 1. 【方案一落地】自定义 HTML 状态栏组件：直接挂载专属 Vue 组件，无需受限于标准 4 格小卡片
  customStatusBarComponent: ReturnOrderCustomStatusBar,

  // 默认备用 KPI 卡片 (若移除 customStatusBarComponent 会自动回退显示这些卡片)
  statsCards: [
    {
      key: 'total',
      label: '退货申请单总数',
      subLabel: '系统全部采购退货台账',
      icon: 'Layers',
      color: 'rose',
      unit: '单',
      compute: (docs) => docs.length,
    },
    {
      key: 'pending',
      label: '待品保审批',
      subLabel: '等待品质检验与主管核准',
      icon: 'Clock',
      color: 'amber',
      unit: '单',
      filterStatus: 'pending',
      compute: (docs) => docs.filter((d) => (d.header?.status || d.status) === 'pending').length,
    },
    {
      key: 'approved',
      label: '已核准退货',
      subLabel: '已下达仓库安排物料退运出库',
      icon: 'CheckCircle2',
      color: 'emerald',
      unit: '单',
      filterStatus: 'approved',
      compute: (docs) => docs.filter((d) => (d.header?.status || d.status) === 'approved').length,
    },
    {
      key: 'amountSum',
      label: '申请退款总额 (¥)',
      subLabel: '全部退货商品价税折让总金额',
      icon: 'DollarSign',
      color: 'purple',
      isCurrency: true,
      compute: (_docs, flatDocs) =>
        flatDocs.reduce((sum, d) => sum + (Number(d.totalAmount) || 0), 0),
    },
  ],

  // 2. 退货单专属查询条件区字段配置
  searchFields: [
    {
      field: 'keyword',
      label: '综合搜索',
      type: 'input',
      placeholder: '搜索退货单号、供应商、经办人、退货门店...',
      width: '280px',
    },
    {
      field: 'status',
      label: '退货状态',
      type: 'select',
      defaultValue: 'ALL',
      options: [
        { label: '全部状态', value: 'ALL' },
        { label: '草稿申请中', value: 'draft' },
        { label: '待品质审批', value: 'pending' },
        { label: '已核准生效', value: 'approved' },
        { label: '审批驳回', value: 'rejected' },
        { label: '已作废', value: 'voided' },
      ],
    },
    {
      field: 'partnerCode',
      label: '退货供应商',
      type: 'select',
      defaultValue: 'ALL',
      options: [
        { label: '全部供应商', value: 'ALL' },
        ...SUPPLIERS.map((s) => ({ label: `${s.code} - ${s.name}`, value: s.code })),
      ],
    },
    {
      field: 'storeName',
      label: '经办门店/仓库',
      type: 'select',
      defaultValue: 'ALL',
      options: [
        { label: '全部门店/仓库', value: 'ALL' },
        { label: '深圳南山科技园直营店', value: '深圳南山科技园直营店' },
        { label: 'WH-01 主料总仓', value: 'WH-01 主料总仓' },
        { label: 'WH-02 自动化立库', value: 'WH-02 自动化立库' },
        { label: 'WH-03 电子元器件仓', value: 'WH-03 电子元器件仓' },
      ],
    },
  ],

  // 3. 退货单台账专属网格列配置 (基于 vxe-table 渲染)
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
      title: '退货单号',
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
      title: '退货供应商',
      type: 'partner',
      minWidth: 200,
    },
    {
      field: 'totalAmount',
      title: '退货退款金额 (¥)',
      type: 'currency',
      width: 145,
      align: 'right',
      sortable: true,
    },
    {
      field: 'docDate',
      title: '申请日期',
      type: 'date',
      width: 110,
      align: 'center',
      sortable: true,
    },
    {
      field: 'storeName',
      title: '经办门店/仓库',
      width: 170,
    },
    {
      field: 'buyer',
      title: '退货申请人',
      width: 120,
    },
    {
      field: 'paymentTerm',
      title: '冲账方式',
      width: 130,
    },
    {
      field: 'itemsCount',
      title: '退货物料项数',
      width: 105,
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
