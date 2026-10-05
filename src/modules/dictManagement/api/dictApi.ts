import {
  DictType,
  DictItem,
  DictDraft,
  DictChangeLog,
  DictUsageVO,
  TenantOption,
} from '../types/dict';

export const TENANTS: TenantOption[] = [
  { id: '0', name: '全平台通用 (Platform)', code: 'PLATFORM' },
  { id: 'tenant_1001', name: '华东制造一厂 (Tenant 1001)', code: 'EAST_MFG' },
  { id: 'tenant_1002', name: '华南国际贸易中心 (Tenant 1002)', code: 'SOUTH_TRADE' },
  { id: 'tenant_1003', name: '西南智能仓储中心 (Tenant 1003)', code: 'WEST_LOGISTICS' },
];

// 初始静态基线数据
const INITIAL_TYPES: DictType[] = [
  {
    id: '1001',
    typeCode: 'CUSTOMER_LEVEL',
    name: '客户等级',
    scope: 'PLATFORM',
    tenantId: '0',
    isBuiltin: 1,
    editable: 1,
    version: 1,
    status: 1,
    remark: '全平台客户资质与信用分级管理体系，关联商务折扣与账期风控',
    creator: '系统内置',
    createTime: '2024-01-01 09:00:00',
    modifier: '系统管理员',
    modifyTime: '2024-01-01 09:00:00',
  },
  {
    id: '1002',
    typeCode: 'TICKET_TYPE',
    name: '工单类型',
    scope: 'PLATFORM',
    tenantId: '0',
    isBuiltin: 0,
    editable: 1,
    version: 2,
    status: 1,
    remark: '研发与运维服务工单分类目录（支持树形层级展开）',
    creator: '刘工 (主控管理员)',
    createTime: '2024-01-05 14:00:00',
    modifier: '刘工 (主控管理员)',
    modifyTime: '2024-02-10 16:30:00',
  },
  {
    id: '1003',
    typeCode: 'CURRENCY_CODE',
    name: '币种',
    scope: 'PLATFORM',
    tenantId: '0',
    isBuiltin: 1,
    editable: 1,
    version: 1,
    status: 1,
    remark: '国际供应链多币种结算货币标准编码 (ISO 4217)',
    creator: '财务主管',
    createTime: '2024-01-01 10:00:00',
    modifier: '财务主管',
    modifyTime: '2024-01-01 10:00:00',
  },
  {
    id: '1004',
    typeCode: 'APPROVAL_NODE_TYPE',
    name: '审批节点类型',
    scope: 'PLATFORM',
    tenantId: '0',
    isBuiltin: 1,
    editable: 0,
    version: 1,
    status: 1,
    remark: 'BPM 流程审批核心引擎底层控制节点配置（不可修改编码与核心属性）',
    creator: '架构组',
    createTime: '2024-01-01 08:30:00',
    modifier: '架构组',
    modifyTime: '2024-01-01 08:30:00',
  },
];

const INITIAL_ITEMS: DictItem[] = [
  // 1. CUSTOMER_LEVEL
  {
    id: '2001',
    typeCode: 'CUSTOMER_LEVEL',
    tenantId: '0',
    itemCode: 'LEVEL_NORMAL',
    parentCode: null,
    labelI18n: { 'zh-CN': '普通客户', en: 'Normal Customer' },
    sortNo: 10,
    ext: { discount: 1.0, creditLimit: 50000, themeColor: '#6B7280' },
    status: 1,
    validFrom: '2024-01-01',
    validTo: null,
    creator: '系统内置',
    createTime: '2024-01-01 09:00:00',
  },
  {
    id: '2002',
    typeCode: 'CUSTOMER_LEVEL',
    tenantId: '0',
    itemCode: 'LEVEL_SILVER',
    parentCode: null,
    labelI18n: { 'zh-CN': '白银客户', en: 'Silver Customer' },
    sortNo: 20,
    ext: { discount: 0.95, creditLimit: 200000, themeColor: '#94A3B8' },
    status: 1,
    validFrom: '2024-01-01',
    validTo: null,
    creator: '系统内置',
    createTime: '2024-01-01 09:00:00',
  },
  {
    id: '2003',
    typeCode: 'CUSTOMER_LEVEL',
    tenantId: '0',
    itemCode: 'LEVEL_GOLD',
    parentCode: null,
    labelI18n: { 'zh-CN': '黄金客户', en: 'Gold VIP' },
    sortNo: 30,
    ext: { discount: 0.9, creditLimit: 500000, themeColor: '#F59E0B' },
    status: 1,
    validFrom: '2024-01-01',
    validTo: null,
    creator: '系统内置',
    createTime: '2024-01-01 09:00:00',
  },
  {
    id: '2004',
    typeCode: 'CUSTOMER_LEVEL',
    tenantId: '0',
    itemCode: 'LEVEL_DIAMOND',
    parentCode: null,
    labelI18n: { 'zh-CN': '钻石客户', en: 'Diamond Elite' },
    sortNo: 40,
    ext: { discount: 0.82, creditLimit: 2000000, themeColor: '#1F4FD8' },
    status: 1,
    validFrom: '2024-01-01',
    validTo: null,
    creator: '系统内置',
    createTime: '2024-01-01 09:00:00',
  },

  // 2. TICKET_TYPE (Tree)
  {
    id: '2010',
    typeCode: 'TICKET_TYPE',
    tenantId: '0',
    itemCode: 'BUG',
    parentCode: null,
    labelI18n: { 'zh-CN': '系统缺陷', en: 'Software Bug' },
    sortNo: 10,
    ext: { slaHours: 4, severity: 'HIGH' },
    status: 1,
    validFrom: '2024-01-01',
    validTo: null,
    creator: '刘工',
    createTime: '2024-01-05 14:00:00',
  },
  {
    id: '2011',
    typeCode: 'TICKET_TYPE',
    tenantId: '0',
    itemCode: 'BUG_FRONTEND',
    parentCode: 'BUG',
    labelI18n: { 'zh-CN': '前端界面缺陷', en: 'Frontend Bug' },
    sortNo: 11,
    ext: { team: 'FE_SQUAD', autoTriage: true },
    status: 1,
    validFrom: '2024-02-10',
    validTo: null,
    creator: '刘工',
    createTime: '2024-02-10 16:00:00',
  },
  {
    id: '2012',
    typeCode: 'TICKET_TYPE',
    tenantId: '0',
    itemCode: 'BUG_BACKEND',
    parentCode: 'BUG',
    labelI18n: { 'zh-CN': '后端服务缺陷', en: 'Backend Bug' },
    sortNo: 12,
    ext: { team: 'BE_SQUAD', autoTriage: true },
    status: 1,
    validFrom: '2024-02-10',
    validTo: null,
    creator: '刘工',
    createTime: '2024-02-10 16:00:00',
  },
  {
    id: '2013',
    typeCode: 'TICKET_TYPE',
    tenantId: '0',
    itemCode: 'FEATURE',
    parentCode: null,
    labelI18n: { 'zh-CN': '需求新功能', en: 'Feature Request' },
    sortNo: 20,
    ext: { slaHours: 48, severity: 'NORMAL' },
    status: 1,
    validFrom: '2024-01-01',
    validTo: null,
    creator: '刘工',
    createTime: '2024-01-05 14:00:00',
  },
  {
    id: '2014',
    typeCode: 'TICKET_TYPE',
    tenantId: '0',
    itemCode: 'CONSULT',
    parentCode: null,
    labelI18n: { 'zh-CN': '业务咨询', en: 'Consultation' },
    sortNo: 30,
    ext: { slaHours: 8, severity: 'LOW' },
    status: 1,
    validFrom: '2024-01-01',
    validTo: null,
    creator: '刘工',
    createTime: '2024-01-05 14:00:00',
  },

  // 3. CURRENCY_CODE
  {
    id: '2020',
    typeCode: 'CURRENCY_CODE',
    tenantId: '0',
    itemCode: 'CNY',
    parentCode: null,
    labelI18n: { 'zh-CN': '人民币', en: 'Chinese Yuan (CNY)' },
    sortNo: 1,
    ext: { symbol: '¥', precision: 2, numCode: 156 },
    status: 1,
    validFrom: '2024-01-01',
    validTo: null,
    creator: '财务主管',
    createTime: '2024-01-01 10:00:00',
  },
  {
    id: '2021',
    typeCode: 'CURRENCY_CODE',
    tenantId: '0',
    itemCode: 'USD',
    parentCode: null,
    labelI18n: { 'zh-CN': '美元', en: 'US Dollar (USD)' },
    sortNo: 2,
    ext: { symbol: '$', precision: 2, numCode: 840 },
    status: 1,
    validFrom: '2024-01-01',
    validTo: null,
    creator: '财务主管',
    createTime: '2024-01-01 10:00:00',
  },
  {
    id: '2022',
    typeCode: 'CURRENCY_CODE',
    tenantId: '0',
    itemCode: 'EUR',
    parentCode: null,
    labelI18n: { 'zh-CN': '欧元', en: 'Euro (EUR)' },
    sortNo: 3,
    ext: { symbol: '€', precision: 2, numCode: 978 },
    status: 1,
    validFrom: '2024-01-01',
    validTo: null,
    creator: '财务主管',
    createTime: '2024-01-01 10:00:00',
  },
  {
    id: '2023',
    typeCode: 'CURRENCY_CODE',
    tenantId: '0',
    itemCode: 'HKD',
    parentCode: null,
    labelI18n: { 'zh-CN': '港币', en: 'Hong Kong Dollar' },
    sortNo: 4,
    ext: { symbol: 'HK$', precision: 2, numCode: 344 },
    status: 1,
    validFrom: '2024-01-01',
    validTo: null,
    creator: '财务主管',
    createTime: '2024-01-01 10:00:00',
  },

  // 4. APPROVAL_NODE_TYPE
  {
    id: '2030',
    typeCode: 'APPROVAL_NODE_TYPE',
    tenantId: '0',
    itemCode: 'START',
    parentCode: null,
    labelI18n: { 'zh-CN': '发起人节点', en: 'Start Node' },
    sortNo: 1,
    ext: { allowReject: false, nodeColor: '#10B981' },
    status: 1,
    validFrom: '2024-01-01',
    validTo: null,
    creator: '架构组',
    createTime: '2024-01-01 08:30:00',
  },
  {
    id: '2031',
    typeCode: 'APPROVAL_NODE_TYPE',
    tenantId: '0',
    itemCode: 'APPROVER',
    parentCode: null,
    labelI18n: { 'zh-CN': '人工审批', en: 'User Approval' },
    sortNo: 2,
    ext: { allowReject: true, multiSign: 'ALL_OR_ONE' },
    status: 1,
    validFrom: '2024-01-01',
    validTo: null,
    creator: '架构组',
    createTime: '2024-01-01 08:30:00',
  },
  {
    id: '2032',
    typeCode: 'APPROVAL_NODE_TYPE',
    tenantId: '0',
    itemCode: 'CONDITIONAL',
    parentCode: null,
    labelI18n: { 'zh-CN': '条件分支', en: 'Condition Branch' },
    sortNo: 3,
    ext: { allowReject: false, evalEngine: 'SPEL' },
    status: 1,
    validFrom: '2024-01-01',
    validTo: null,
    creator: '架构组',
    createTime: '2024-01-01 08:30:00',
  },
  {
    id: '2033',
    typeCode: 'APPROVAL_NODE_TYPE',
    tenantId: '0',
    itemCode: 'CC',
    parentCode: null,
    labelI18n: { 'zh-CN': '抄送节点', en: 'Carbon Copy' },
    sortNo: 4,
    ext: { allowReject: false, asyncNotify: true },
    status: 1,
    validFrom: '2024-01-01',
    validTo: null,
    creator: '架构组',
    createTime: '2024-01-01 08:30:00',
  },
  {
    id: '2034',
    typeCode: 'APPROVAL_NODE_TYPE',
    tenantId: '0',
    itemCode: 'END',
    parentCode: null,
    labelI18n: { 'zh-CN': '结束节点', en: 'End Node' },
    sortNo: 5,
    ext: { allowReject: false, archiveDoc: true },
    status: 1,
    validFrom: '2024-01-01',
    validTo: null,
    creator: '架构组',
    createTime: '2024-01-01 08:30:00',
  },
];

const INITIAL_LOGS: DictChangeLog[] = [
  {
    id: '3001',
    tenantId: '0',
    typeCode: 'CUSTOMER_LEVEL',
    version: 1,
    actionType: 'PUBLISH',
    targetCode: null,
    beforeContent: null,
    afterContent: JSON.stringify({ count: 4, version: 1, note: '初始基线发布' }, null, 2),
    operator: '刘工 (主控管理员)',
    operateTime: '2024-01-01 09:00:00',
    remark: '初始化客户等级基线字典',
  },
  {
    id: '3002',
    tenantId: '0',
    typeCode: 'TICKET_TYPE',
    version: 1,
    actionType: 'PUBLISH',
    targetCode: null,
    beforeContent: null,
    afterContent: JSON.stringify({ count: 3, version: 1 }, null, 2),
    operator: '刘工 (主控管理员)',
    operateTime: '2024-01-05 14:00:00',
    remark: '创建工单缺陷一级主类目',
  },
  {
    id: '3003',
    tenantId: '0',
    typeCode: 'TICKET_TYPE',
    version: 2,
    actionType: 'PUBLISH',
    targetCode: 'BUG_FRONTEND',
    beforeContent: JSON.stringify({ count: 3, version: 1 }, null, 2),
    afterContent: JSON.stringify({ count: 5, version: 2, diff: '新增 BUG_FRONTEND 与 BUG_BACKEND 树形子节点' }, null, 2),
    operator: '刘工 (主控管理员)',
    operateTime: '2024-02-10 16:30:00',
    remark: '细化工单缺陷层级，挂载前端与后端子项',
  },
  {
    id: '3004',
    tenantId: '0',
    typeCode: 'CURRENCY_CODE',
    version: 1,
    actionType: 'PUBLISH',
    targetCode: null,
    beforeContent: null,
    afterContent: JSON.stringify({ count: 4, version: 1 }, null, 2),
    operator: '财务主管',
    operateTime: '2024-01-01 10:00:00',
    remark: '发布常用结算货币基线',
  },
  {
    id: '3005',
    tenantId: '0',
    typeCode: 'APPROVAL_NODE_TYPE',
    version: 1,
    actionType: 'PUBLISH',
    targetCode: null,
    beforeContent: null,
    afterContent: JSON.stringify({ count: 5, version: 1 }, null, 2),
    operator: '架构组',
    operateTime: '2024-01-01 08:30:00',
    remark: '发布工作流审批节点元数据配置',
  },
];

// 本地持久化缓存状态
class DictMockBackend {
  private types: DictType[] = [];
  private items: DictItem[] = [];
  private drafts: DictDraft[] = [];
  private logs: DictChangeLog[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedTypes = localStorage.getItem('erp_dict_types');
      const storedItems = localStorage.getItem('erp_dict_items');
      const storedDrafts = localStorage.getItem('erp_dict_drafts');
      const storedLogs = localStorage.getItem('erp_dict_logs');

      this.types = storedTypes ? JSON.parse(storedTypes) : JSON.parse(JSON.stringify(INITIAL_TYPES));
      this.items = storedItems ? JSON.parse(storedItems) : JSON.parse(JSON.stringify(INITIAL_ITEMS));
      this.drafts = storedDrafts ? JSON.parse(storedDrafts) : [];
      this.logs = storedLogs ? JSON.parse(storedLogs) : JSON.parse(JSON.stringify(INITIAL_LOGS));
    } catch {
      this.types = JSON.parse(JSON.stringify(INITIAL_TYPES));
      this.items = JSON.parse(JSON.stringify(INITIAL_ITEMS));
      this.drafts = [];
      this.logs = JSON.parse(JSON.stringify(INITIAL_LOGS));
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('erp_dict_types', JSON.stringify(this.types));
      localStorage.setItem('erp_dict_items', JSON.stringify(this.items));
      localStorage.setItem('erp_dict_drafts', JSON.stringify(this.drafts));
      localStorage.setItem('erp_dict_logs', JSON.stringify(this.logs));
    } catch (e) {
      console.error('Failed to save dict storage', e);
    }
  }

  public getTypes(scope?: string, keyword?: string, tenantId = '0'): DictType[] {
    let list = this.types.filter((t) => t.tenantId === '0' || t.tenantId === tenantId);
    if (scope && scope !== 'ALL') {
      list = list.filter((t) => t.scope === scope);
    }
    if (keyword && keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(kw) || t.typeCode.toLowerCase().includes(kw));
    }
    return JSON.parse(JSON.stringify(list));
  }

  public getType(tenantId: string, typeCode: string): DictType | undefined {
    let t = this.types.find((item) => item.tenantId === tenantId && item.typeCode === typeCode);
    if (!t && tenantId !== '0') {
      t = this.types.find((item) => item.tenantId === '0' && item.typeCode === typeCode);
    }
    return t ? JSON.parse(JSON.stringify(t)) : undefined;
  }

  public createType(payload: Partial<DictType>, operator = '当前操作员'): DictType {
    const tenant = payload.tenantId || '0';
    const code = (payload.typeCode || '').trim().toUpperCase();
    if (!code) throw new Error('字典编码不能为空');

    const exist = this.types.find((t) => t.tenantId === tenant && t.typeCode === code);
    if (exist) throw new Error(`当前租户下编码 ${code} 已存在`);

    const newType: DictType = {
      id: Date.now().toString(),
      typeCode: code,
      name: payload.name || code,
      scope: (payload.scope as any) || 'PLATFORM',
      tenantId: tenant,
      isBuiltin: 0,
      editable: 1,
      version: 1,
      status: 1,
      remark: payload.remark || '',
      creator: operator,
      createTime: new Date().toLocaleString(),
      modifier: operator,
      modifyTime: new Date().toLocaleString(),
    };

    this.types.unshift(newType);
    this.logs.unshift({
      id: Date.now().toString(),
      tenantId: tenant,
      typeCode: code,
      version: 1,
      actionType: 'CREATE_TYPE',
      targetCode: null,
      beforeContent: null,
      afterContent: JSON.stringify(newType, null, 2),
      operator,
      operateTime: new Date().toLocaleString(),
      remark: '新建字典类型',
    });

    this.saveToStorage();
    return JSON.parse(JSON.stringify(newType));
  }

  public getItemsWithType(tenantId: string, typeCode: string) {
    const type = this.getType(tenantId, typeCode);
    if (!type) throw new Error(`字典类型 ${typeCode} 不存在`);

    // 获取正式数据（本租户优先，若无回退到平台 '0'）
    let currentItems = this.items.filter((i) => i.tenantId === type.tenantId && i.typeCode === typeCode);
    if (currentItems.length === 0 && type.tenantId !== '0') {
      currentItems = this.items.filter((i) => i.tenantId === '0' && i.typeCode === typeCode);
    }

    // 复制并附加草稿
    const drafts = this.drafts.filter((d) => d.tenantId === type.tenantId && d.typeCode === typeCode);

    const mergedItems: DictItem[] = JSON.parse(JSON.stringify(currentItems));

    // 将草稿标记映射在列表上
    for (const d of drafts) {
      const content = typeof d.draftContent === 'string' ? JSON.parse(d.draftContent) : d.draftContent;
      if (d.action === 'ADD') {
        mergedItems.push({
          id: 'draft_' + d.id,
          typeCode: d.typeCode,
          tenantId: d.tenantId,
          itemCode: d.itemCode,
          parentCode: content.parentCode || null,
          labelI18n: content.labelI18n || { 'zh-CN': d.itemCode },
          sortNo: content.sortNo || 999,
          ext: content.ext || {},
          status: content.status ?? 1,
          validFrom: content.validFrom || null,
          validTo: content.validTo || null,
          creator: d.createdBy,
          createTime: d.createTime,
          _draftStatus: 'NEW',
        });
      } else if (d.action === 'UPDATE') {
        const target = mergedItems.find((i) => i.itemCode === d.itemCode);
        if (target) {
          target._draftStatus = 'MODIFIED';
          if (content.labelI18n) target.labelI18n = content.labelI18n;
          if (content.sortNo !== undefined) target.sortNo = content.sortNo;
          if (content.parentCode !== undefined) target.parentCode = content.parentCode;
          if (content.ext !== undefined) target.ext = content.ext;
          if (content.validFrom !== undefined) target.validFrom = content.validFrom;
          if (content.validTo !== undefined) target.validTo = content.validTo;
        }
      } else if (d.action === 'TOGGLE_STATUS') {
        const target = mergedItems.find((i) => i.itemCode === d.itemCode);
        if (target) {
          target._draftStatus = 'TOGGLED';
          target._pendingStatus = content.status;
        }
      }
    }

    // 排序
    mergedItems.sort((a, b) => a.sortNo - b.sortNo);

    return {
      type,
      items: mergedItems,
      drafts,
      draftCount: drafts.length,
    };
  }

  public addItemDraft(dto: any, operator = '当前操作员'): DictDraft {
    const tenant = dto.tenantId || '0';
    let itemCode = (dto.itemCode || '').trim();

    // 租户新增项命名空间前缀强制校验
    if (tenant !== '0') {
      const prefix = 'T' + tenant.replace('tenant_', '') + '_';
      if (!itemCode.startsWith(prefix)) {
        itemCode = prefix + itemCode;
      }
    }

    const exist = this.items.find((i) => i.tenantId === tenant && i.typeCode === dto.typeCode && i.itemCode === itemCode);
    if (exist) throw new Error(`条目编码 ${itemCode} 已在正式字典中存在`);

    // 移除已有相同草稿
    this.drafts = this.drafts.filter((d) => !(d.tenantId === tenant && d.typeCode === dto.typeCode && d.itemCode === itemCode));

    const draft: DictDraft = {
      id: Date.now().toString(),
      tenantId: tenant,
      typeCode: dto.typeCode,
      itemCode,
      action: 'ADD',
      draftContent: {
        ...dto,
        itemCode,
      },
      createdBy: operator,
      createTime: new Date().toLocaleString(),
    };

    this.drafts.push(draft);
    this.saveToStorage();
    return draft;
  }

  public updateItemDraft(dto: any, operator = '当前操作员'): DictDraft {
    const item = this.items.find((i) => i.id === dto.id.toString());
    if (!item) throw new Error('待编辑的条目不存在');

    this.drafts = this.drafts.filter((d) => !(d.tenantId === item.tenantId && d.typeCode === item.typeCode && d.itemCode === item.itemCode));

    const draft: DictDraft = {
      id: Date.now().toString(),
      tenantId: item.tenantId,
      typeCode: item.typeCode,
      itemCode: item.itemCode,
      action: 'UPDATE',
      draftContent: dto,
      createdBy: operator,
      createTime: new Date().toLocaleString(),
    };

    this.drafts.push(draft);
    this.saveToStorage();
    return draft;
  }

  public toggleItemStatus(id: string, operator = '当前操作员'): DictDraft {
    const item = this.items.find((i) => i.id === id.toString());
    if (!item) throw new Error('条目不存在');

    const nextStatus = item.status === 1 ? 0 : 1;
    this.drafts = this.drafts.filter((d) => !(d.tenantId === item.tenantId && d.typeCode === item.typeCode && d.itemCode === item.itemCode));

    const draft: DictDraft = {
      id: Date.now().toString(),
      tenantId: item.tenantId,
      typeCode: item.typeCode,
      itemCode: item.itemCode,
      action: 'TOGGLE_STATUS',
      draftContent: { id: item.id, status: nextStatus },
      createdBy: operator,
      createTime: new Date().toLocaleString(),
    };

    this.drafts.push(draft);
    this.saveToStorage();
    return draft;
  }

  public discardDrafts(tenantId: string, typeCode: string, operator = '当前操作员') {
    const count = this.drafts.filter((d) => d.tenantId === tenantId && d.typeCode === typeCode).length;
    this.drafts = this.drafts.filter((d) => !(d.tenantId === tenantId && d.typeCode === typeCode));

    if (count > 0) {
      this.logs.unshift({
        id: Date.now().toString(),
        tenantId,
        typeCode,
        version: 0,
        actionType: 'DISCARD_DRAFT',
        targetCode: null,
        beforeContent: null,
        afterContent: null,
        operator,
        operateTime: new Date().toLocaleString(),
        remark: `放弃了 ${count} 条暂存的草稿改动`,
      });
    }

    this.saveToStorage();
  }

  public publishType(tenantId: string, typeCode: string, remark = '', operator = '当前操作员'): DictType {
    const type = this.types.find((t) => t.tenantId === tenantId && t.typeCode === typeCode);
    if (!type) throw new Error('字典类型不存在');

    const drafts = this.drafts.filter((d) => d.tenantId === tenantId && d.typeCode === typeCode);
    if (drafts.length === 0) throw new Error('当前没有可发布的草稿内容');

    const beforeSnap = JSON.stringify(this.items.filter((i) => i.tenantId === tenantId && i.typeCode === typeCode));

    // 应用草稿
    for (const d of drafts) {
      const content = typeof d.draftContent === 'string' ? JSON.parse(d.draftContent) : d.draftContent;
      if (d.action === 'ADD') {
        const newItem: DictItem = {
          id: Date.now().toString() + Math.floor(Math.random() * 100),
          typeCode: d.typeCode,
          tenantId: d.tenantId,
          itemCode: d.itemCode,
          parentCode: content.parentCode || null,
          labelI18n: content.labelI18n || { 'zh-CN': d.itemCode },
          sortNo: content.sortNo || 0,
          ext: content.ext || {},
          status: content.status ?? 1,
          validFrom: content.validFrom || null,
          validTo: content.validTo || null,
          creator: operator,
          createTime: new Date().toLocaleString(),
          modifier: operator,
          modifyTime: new Date().toLocaleString(),
        };
        this.items.push(newItem);
      } else if (d.action === 'UPDATE') {
        const exist = this.items.find((i) => i.id === content.id?.toString());
        if (exist) {
          if (content.labelI18n) exist.labelI18n = content.labelI18n;
          if (content.sortNo !== undefined) exist.sortNo = content.sortNo;
          if (content.parentCode !== undefined) exist.parentCode = content.parentCode;
          if (content.ext !== undefined) exist.ext = content.ext;
          if (content.validFrom !== undefined) exist.validFrom = content.validFrom;
          if (content.validTo !== undefined) exist.validTo = content.validTo;
          exist.modifier = operator;
          exist.modifyTime = new Date().toLocaleString();
        }
      } else if (d.action === 'TOGGLE_STATUS') {
        const exist = this.items.find((i) => i.id === content.id?.toString());
        if (exist) {
          exist.status = content.status;
          exist.modifier = operator;
          exist.modifyTime = new Date().toLocaleString();
        }
      }
    }

    // 移除草稿
    this.drafts = this.drafts.filter((d) => !(d.tenantId === tenantId && d.typeCode === typeCode));

    // 版本升级 + 1
    const oldVersion = type.version;
    type.version += 1;
    type.modifier = operator;
    type.modifyTime = new Date().toLocaleString();

    const afterSnap = JSON.stringify(this.items.filter((i) => i.tenantId === tenantId && i.typeCode === typeCode));

    this.logs.unshift({
      id: Date.now().toString(),
      tenantId,
      typeCode,
      version: type.version,
      actionType: 'PUBLISH',
      targetCode: null,
      beforeContent: beforeSnap,
      afterContent: afterSnap,
      operator,
      operateTime: new Date().toLocaleString(),
      remark: remark || `审批通过，版本从 v${oldVersion} 升级生效至 v${type.version}`,
    });

    this.saveToStorage();
    return JSON.parse(JSON.stringify(type));
  }

  public rollbackVersion(tenantId: string, typeCode: string, targetVersion: number, operator = '当前操作员'): DictType {
    const type = this.types.find((t) => t.tenantId === tenantId && t.typeCode === typeCode);
    if (!type) throw new Error('字典类型不存在');

    const log = this.logs.find((l) => l.tenantId === tenantId && l.typeCode === typeCode && l.version === targetVersion && l.actionType === 'PUBLISH');
    if (!log || !log.afterContent) {
      throw new Error(`未找到目标版本 v${targetVersion} 的完整快照`);
    }

    try {
      const snapItems: DictItem[] = JSON.parse(log.afterContent);
      // 清理当前类型的正式数据
      this.items = this.items.filter((i) => !(i.tenantId === tenantId && i.typeCode === typeCode));
      // 回填快照项
      this.items.push(...snapItems);
      // 清空草稿
      this.drafts = this.drafts.filter((d) => !(d.tenantId === tenantId && d.typeCode === typeCode));

      const oldVersion = type.version;
      type.version += 1;
      type.modifier = operator;
      type.modifyTime = new Date().toLocaleString();

      this.logs.unshift({
        id: Date.now().toString(),
        tenantId,
        typeCode,
        version: type.version,
        actionType: 'ROLLBACK',
        targetCode: `v${targetVersion}`,
        beforeContent: `Current Active: v${oldVersion}`,
        afterContent: `Rollbacked to v${targetVersion} baseline snapshot`,
        operator,
        operateTime: new Date().toLocaleString(),
        remark: `一键回滚历史版本 v${targetVersion}，升级为当前版本 v${type.version}`,
      });

      this.saveToStorage();
      return JSON.parse(JSON.stringify(type));
    } catch (e: any) {
      throw new Error('回滚失败: ' + e.message);
    }
  }

  public getHistory(tenantId: string, typeCode: string): DictChangeLog[] {
    return JSON.parse(JSON.stringify(this.logs.filter((l) => (l.tenantId === tenantId || l.tenantId === '0') && l.typeCode === typeCode)));
  }

  public getUsage(tenantId: string, typeCode: string): DictUsageVO {
    const refs = [];
    if (typeCode === 'CUSTOMER_LEVEL') {
      refs.push(
        { systemName: 'ERP供应链系统', tableName: 'pbs_purchase_order', columnName: 'partner_level', count: 128, description: '采购订单商业伙伴会员评级' },
        { systemName: 'CRM客户中心', tableName: 'crm_customer_profile', columnName: 'member_tier', count: 2450, description: '全渠道会员客户基础建档' },
        { systemName: '财务核算中台', tableName: 'fin_credit_limit', columnName: 'customer_level', count: 86, description: '客户信用评级授信额度矩阵' }
      );
    } else if (typeCode === 'TICKET_TYPE') {
      refs.push(
        { systemName: '运维工单平台', tableName: 'pbs_ticket_master', columnName: 'ticket_category', count: 580, description: '研发运维售后问题单分类' },
        { systemName: '质量管理QMS', tableName: 'qms_defect_record', columnName: 'defect_type', count: 320, description: '生产与质量缺陷留痕' }
      );
    } else if (typeCode === 'CURRENCY_CODE') {
      refs.push(
        { systemName: '财务收支中心', tableName: 'pbs_finance_settlement', columnName: 'settle_currency', count: 3420, description: '多币种国际收支与对账' },
        { systemName: 'ERP采购系统', tableName: 'pbs_purchase_order', columnName: 'currency', count: 1520, description: '采购订单币种配置' }
      );
    } else if (typeCode === 'APPROVAL_NODE_TYPE') {
      refs.push(
        { systemName: 'BPM工作流引擎', tableName: 'bpm_flow_node_config', columnName: 'node_type', count: 94, description: '审批流程模板各环节节点类型' }
      );
    } else {
      refs.push({ systemName: '通用系统字典表', tableName: 'pbs_sys_reference', columnName: 'dict_code', count: 12, description: '系统业务引用' });
    }

    const total = refs.reduce((acc, r) => acc + r.count, 0);
    return {
      typeCode,
      hasReferences: total > 0,
      references: refs,
      totalRowCount: total,
    };
  }

  public importData(items: any[], tenantId = '0', operator = '当前操作员'): number {
    let count = 0;
    for (const raw of items) {
      if (!raw.typeCode || !raw.itemCode) continue;
      const exist = this.items.find((i) => i.tenantId === tenantId && i.typeCode === raw.typeCode && i.itemCode === raw.itemCode);
      if (exist) {
        exist.parentCode = raw.parentCode ?? exist.parentCode;
        exist.labelI18n = raw.labelI18n ?? exist.labelI18n;
        exist.sortNo = raw.sortNo ?? exist.sortNo;
        exist.ext = raw.ext ?? exist.ext;
        exist.status = raw.status ?? exist.status;
        exist.modifier = operator;
        exist.modifyTime = new Date().toLocaleString();
      } else {
        this.items.push({
          id: Date.now().toString() + Math.floor(Math.random() * 1000),
          typeCode: raw.typeCode,
          tenantId,
          itemCode: raw.itemCode,
          parentCode: raw.parentCode || null,
          labelI18n: raw.labelI18n || { 'zh-CN': raw.itemCode },
          sortNo: raw.sortNo || 0,
          ext: raw.ext || {},
          status: raw.status ?? 1,
          validFrom: raw.validFrom || null,
          validTo: raw.validTo || null,
          creator: operator,
          createTime: new Date().toLocaleString(),
          modifier: operator,
          modifyTime: new Date().toLocaleString(),
        });
      }
      count++;
    }
    this.saveToStorage();
    return count;
  }

  public exportData(typeCode: string, tenantId = '0'): DictItem[] {
    return JSON.parse(JSON.stringify(this.items.filter((i) => (i.tenantId === tenantId || i.tenantId === '0') && i.typeCode === typeCode)));
  }
}

export const dictBackend = new DictMockBackend();

// REST API 请求封装
export const dictApi = {
  getTypes: async (scope?: string, keyword?: string, tenantId = '0'): Promise<DictType[]> => {
    return dictBackend.getTypes(scope, keyword, tenantId);
  },
  getItems: async (typeCode: string, tenantId = '0') => {
    return dictBackend.getItemsWithType(tenantId, typeCode);
  },
  createType: async (payload: Partial<DictType>, operator?: string): Promise<DictType> => {
    return dictBackend.createType(payload, operator);
  },
  addItemDraft: async (dto: any, operator?: string): Promise<DictDraft> => {
    return dictBackend.addItemDraft(dto, operator);
  },
  updateItemDraft: async (dto: any, operator?: string): Promise<DictDraft> => {
    return dictBackend.updateItemDraft(dto, operator);
  },
  toggleItemStatus: async (id: string, operator?: string): Promise<DictDraft> => {
    return dictBackend.toggleItemStatus(id, operator);
  },
  discardDrafts: async (typeCode: string, tenantId = '0', operator?: string) => {
    return dictBackend.discardDrafts(tenantId, typeCode, operator);
  },
  publishType: async (typeCode: string, tenantId = '0', remark = '', operator?: string): Promise<DictType> => {
    return dictBackend.publishType(tenantId, typeCode, remark, operator);
  },
  rollbackVersion: async (typeCode: string, targetVersion: number, tenantId = '0', operator?: string): Promise<DictType> => {
    return dictBackend.rollbackVersion(tenantId, typeCode, targetVersion, operator);
  },
  getHistory: async (typeCode: string, tenantId = '0'): Promise<DictChangeLog[]> => {
    return dictBackend.getHistory(tenantId, typeCode);
  },
  getUsage: async (typeCode: string, tenantId = '0'): Promise<DictUsageVO> => {
    return dictBackend.getUsage(tenantId, typeCode);
  },
  importData: async (items: any[], tenantId = '0', operator?: string): Promise<number> => {
    return dictBackend.importData(items, tenantId, operator);
  },
  exportData: async (typeCode: string, tenantId = '0'): Promise<DictItem[]> => {
    return dictBackend.exportData(typeCode, tenantId);
  },
};
