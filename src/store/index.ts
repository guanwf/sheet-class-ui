import { createStore } from 'vuex';
import {
  DocumentRecord,
  MasterHeader,
  ItemDetailRow,
  DocumentSchemaConfig,
  CostAllocationRow,
  PaymentScheduleRow,
  AttachmentItem,
  AuditLogItem,
  TabPageItem,
  ModuleKey,
  ModuleSessionState,
  OuterModuleTabItem,
} from '../types/document';
import {
  INITIAL_DOCUMENTS,
  DOCUMENT_SCHEMAS,
  SUPPLIERS,
  BUYERS,
  DEPARTMENTS,
} from '../data/initialTemplates';
import {
  recalculateItemRow,
  computeDocumentSummary,
  generateBulkItems,
} from '../utils/formulas';

export interface State {
  documents: DocumentRecord[];
  activeModuleId: ModuleKey;
  outerModules: OuterModuleTabItem[];
  moduleSessions: Record<ModuleKey, ModuleSessionState>;
  dirtyMap: Record<string, boolean>;
  currentSchema: DocumentSchemaConfig;
}

export const store = createStore<State>({
  state: {
    documents: INITIAL_DOCUMENTS,
    activeModuleId: 'PURCHASE_ORDER',
    outerModules: [
      {
        id: 'PURCHASE_ORDER',
        title: '采购订单',
        code: 'PO',
        icon: '📦',
        description: '标准采购、费用分摊与付款排程',
      },
      {
        id: 'RETURN_ORDER',
        title: '采购退货单',
        code: 'RO',
        icon: '🔄',
        description: '门店退货、质检留样与冲抵台账',
      },
    ],
    moduleSessions: {
      PURCHASE_ORDER: {
        tabs: [
          {
            id: 'tab-po-list',
            type: 'LIST',
            title: '采购订单台账',
            closable: false,
            moduleId: 'PURCHASE_ORDER',
          },
        ],
        activeTabId: 'tab-po-list',
      },
      RETURN_ORDER: {
        tabs: [
          {
            id: 'tab-ro-list',
            type: 'LIST',
            title: '采购退货单台账',
            closable: false,
            moduleId: 'RETURN_ORDER',
          },
        ],
        activeTabId: 'tab-ro-list',
      },
    },
    dirtyMap: {},
    currentSchema: DOCUMENT_SCHEMAS.PURCHASE_ORDER,
  },

  getters: {
    documents: (state) => state.documents,
    activeModuleId: (state) => state.activeModuleId,
    currentModuleKey: (state) => state.activeModuleId,
    outerModules: (state) => state.outerModules,
    moduleSessions: (state) => state.moduleSessions,

    // 当前活跃模块的内部 Tabs
    tabs: (state) => state.moduleSessions[state.activeModuleId]?.tabs || [],
    activeTabId: (state) => state.moduleSessions[state.activeModuleId]?.activeTabId || '',
    activeTab: (state) => {
      const sess = state.moduleSessions[state.activeModuleId];
      if (!sess) return { id: 'fallback', type: 'LIST', title: '台账', closable: false };
      return sess.tabs.find((t) => t.id === sess.activeTabId) || sess.tabs[0];
    },
    activeDoc: (state) => {
      const sess = state.moduleSessions[state.activeModuleId];
      if (!sess) return null;
      const current = sess.tabs.find((t) => t.id === sess.activeTabId) || sess.tabs[0];
      if (current.type !== 'DOCUMENT' || !current.docId) return null;
      return state.documents.find((d) => d.header.id === current.docId) || null;
    },

    // 模块维度辅助检索
    getModuleTabs: (state) => (moduleId: ModuleKey) => {
      return state.moduleSessions[moduleId]?.tabs || [];
    },
    getModuleActiveTabId: (state) => (moduleId: ModuleKey) => {
      return state.moduleSessions[moduleId]?.activeTabId || '';
    },
    getModuleActiveDoc: (state) => (moduleId: ModuleKey) => {
      const sess = state.moduleSessions[moduleId];
      if (!sess) return null;
      const current = sess.tabs.find((t) => t.id === sess.activeTabId) || sess.tabs[0];
      if (!current || current.type !== 'DOCUMENT' || !current.docId) return null;
      return state.documents.find((d) => d.header.id === current.docId) || null;
    },
    getModuleDocuments: (state) => (moduleId: ModuleKey) => {
      return state.documents.filter((d) => d.header.docType === moduleId);
    },
    getModuleOpenedDocCount: (state) => (moduleId: ModuleKey) => {
      return (
        state.moduleSessions[moduleId]?.tabs.filter((t) => t.type === 'DOCUMENT').length || 0
      );
    },
    isModuleDirty: (state) => (moduleId: ModuleKey) => {
      return state.moduleSessions[moduleId]?.tabs.some((t) => t.isDirty) || false;
    },

    isDirty: (state) => (docId: string) => !!state.dirtyMap[docId],
    currentSchema: (state) => {
      const sess = state.moduleSessions[state.activeModuleId];
      if (sess) {
        const current = sess.tabs.find((t) => t.id === sess.activeTabId);
        if (current && current.type === 'DOCUMENT' && current.docId) {
          const doc = state.documents.find((d) => d.header.id === current.docId);
          if (doc && DOCUMENT_SCHEMAS[doc.header.docType]) {
            return DOCUMENT_SCHEMAS[doc.header.docType];
          }
        }
      }
      return DOCUMENT_SCHEMAS[state.activeModuleId] || state.currentSchema;
    },
  },

  mutations: {
    // 切换最外层活跃模块（一个模块占一个 page）
    SET_ACTIVE_MODULE(state, moduleId: ModuleKey) {
      state.activeModuleId = moduleId;
      state.currentSchema = DOCUMENT_SCHEMAS[moduleId] || DOCUMENT_SCHEMAS.PURCHASE_ORDER;
    },

    // 切换指定模块内部的当前 Tab
    SET_MODULE_ACTIVE_TAB(
      state,
      payload: { moduleId?: ModuleKey; tabId: string } | string
    ) {
      const moduleId =
        typeof payload === 'string'
          ? state.activeModuleId
          : payload.moduleId || state.activeModuleId;
      const tabId = typeof payload === 'string' ? payload : payload.tabId;
      if (state.moduleSessions[moduleId]) {
        state.moduleSessions[moduleId].activeTabId = tabId;
      }
    },

    // 兼容老调用
    SET_ACTIVE_TAB(state, tabId: string) {
      if (state.moduleSessions[state.activeModuleId]) {
        state.moduleSessions[state.activeModuleId].activeTabId = tabId;
      }
    },

    // 在模块内部打开单据 Tab（若未指定 moduleId，则智能路由到该单据所属模块）
    OPEN_MODULE_DOC_TAB(
      state,
      payload: { docId: string; moduleId?: ModuleKey } | string
    ) {
      const docId = typeof payload === 'string' ? payload : payload.docId;
      const targetDoc = state.documents.find((d) => d.header.id === docId);
      if (!targetDoc) return;

      const targetModule: ModuleKey =
        (typeof payload !== 'string' && payload.moduleId)
          ? payload.moduleId
          : (targetDoc.header.docType as ModuleKey) || state.activeModuleId;

      const session = state.moduleSessions[targetModule];
      if (!session) return;

      const tabId = `tab-doc-${docId}`;
      const existing = session.tabs.find((t) => t.id === tabId);
      if (!existing) {
        session.tabs.push({
          id: tabId,
          type: 'DOCUMENT',
          title: `${targetDoc.header.docNo} (${targetDoc.header.partnerName.slice(0, 6)})`,
          docId,
          closable: true,
          status: targetDoc.header.status,
          isDirty: state.dirtyMap[docId] || false,
          moduleId: targetModule,
        });
      }
      session.activeTabId = tabId;
      state.activeModuleId = targetModule;
    },

    OPEN_DOC_TAB(state, docId: string) {
      const targetDoc = state.documents.find((d) => d.header.id === docId);
      if (!targetDoc) return;
      const targetModule: ModuleKey =
        (targetDoc.header.docType as ModuleKey) || state.activeModuleId;
      const session = state.moduleSessions[targetModule];
      if (!session) return;

      const tabId = `tab-doc-${docId}`;
      const existing = session.tabs.find((t) => t.id === tabId);
      if (!existing) {
        session.tabs.push({
          id: tabId,
          type: 'DOCUMENT',
          title: `${targetDoc.header.docNo} (${targetDoc.header.partnerName.slice(0, 6)})`,
          docId,
          closable: true,
          status: targetDoc.header.status,
          isDirty: state.dirtyMap[docId] || false,
          moduleId: targetModule,
        });
      }
      session.activeTabId = tabId;
      state.activeModuleId = targetModule;
    },

    // 在模块内部新建单据 Tab
    CREATE_NEW_MODULE_DOC_TAB(state, targetModuleParam?: ModuleKey) {
      const targetModule = targetModuleParam || state.activeModuleId || 'PURCHASE_ORDER';
      const today = new Date().toISOString().split('T')[0];
      const session = state.moduleSessions[targetModule];
      if (!session) return;

      if (targetModule === 'RETURN_ORDER') {
        const newId = `doc-ro-${Date.now()}`;
        const newDocNo = `RO-${today.replace(/-/g, '')}-${String(
          Math.floor(Math.random() * 900) + 100
        )}`;

        const newDoc: DocumentRecord = {
          header: {
            id: newId,
            docNo: newDocNo,
            docDate: today,
            docType: 'RETURN_ORDER',
            status: 'draft',
            partnerId: SUPPLIERS[0].id,
            partnerCode: SUPPLIERS[0].code,
            partnerName: SUPPLIERS[0].name,
            storeCode: 'STR-BJ-01',
            storeName: '北京中关村智慧旗舰店',
            contactPerson: SUPPLIERS[0].contact,
            contactPhone: SUPPLIERS[0].phone,
            department: '品质检验科',
            buyer: '刘工 (主控业务员)',
            currency: 'CNY',
            exchangeRate: 1.0,
            paymentTerm: '原路退回冲抵往来账',
            taxRateDefault: 0,
            contractNo: '',
            deliveryAddress: '北京市海淀区中关村南大街1号物流退货区',
            shippingMethod: '供方上门提退',
            remarks: '',
            createdBy: '当前业务员',
            createdTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
            updatedBy: '当前业务员',
            updatedTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
            version: 1,
          },
          items: [
            {
              id: `ro-item-${Date.now()}-1`,
              rowNo: 1,
              itemCode: '',
              itemName: '',
              productCode: '',
              productName: '',
              spec: '',
              unit: '件',
              quantity: undefined as any,
              price: undefined as any,
              priceWithTax: undefined as any,
              priceWithoutTax: undefined as any,
              taxRate: 0,
              taxAmount: 0,
              totalAmount: 0,
              returnReason: '质量瑕疵/破损',
              warehouse: '退货暂存仓',
              batchNo: '',
              deliveryDate: today,
              remarks: '',
            },
          ],
          costs: [],
          paymentSchedule: [],
          attachments: [],
          logs: [
            {
              id: `log-${Date.now()}`,
              stepName: '手工新建退货单',
              operator: '当前业务员',
              role: '制单员',
              action: 'CREATE',
              comment: '新建采购退货单据',
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
              status: 'SUCCESS',
            },
          ],
        };

        state.documents.unshift(newDoc);
        state.dirtyMap[newId] = true;

        const tabId = `tab-doc-${newId}`;
        session.tabs.push({
          id: tabId,
          type: 'DOCUMENT',
          title: `[退货草稿] ${newDocNo}`,
          docId: newId,
          closable: true,
          isNew: true,
          status: 'draft',
          isDirty: true,
          moduleId: 'RETURN_ORDER',
        });
        session.activeTabId = tabId;
        state.activeModuleId = 'RETURN_ORDER';
        return;
      }

      // 采购订单
      const newId = `doc-po-${Date.now()}`;
      const newDocNo = `PO-${today.replace(/-/g, '')}-${String(
        Math.floor(Math.random() * 900) + 100
      )}`;

      const newDoc: DocumentRecord = {
        header: {
          id: newId,
          docNo: newDocNo,
          docDate: today,
          docType: 'PURCHASE_ORDER',
          status: 'draft',
          partnerId: SUPPLIERS[0].id,
          partnerCode: SUPPLIERS[0].code,
          partnerName: SUPPLIERS[0].name,
          contactPerson: SUPPLIERS[0].contact,
          contactPhone: SUPPLIERS[0].phone,
          department: DEPARTMENTS[0],
          buyer: BUYERS[0],
          currency: 'CNY',
          exchangeRate: 1.0,
          paymentTerm: '月结30天电汇',
          taxRateDefault: 13,
          contractNo: '',
          deliveryAddress: '江苏省苏州市工业园区纳米科技工业园A8栋',
          shippingMethod: '陆运专线',
          remarks: '',
          createdBy: '当前操作员',
          createdTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
          updatedBy: '当前操作员',
          updatedTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
          version: 1,
        },
        items: generateBulkItems(3, 1),
        costs: [],
        paymentSchedule: [],
        attachments: [],
        logs: [
          {
            id: `log-${Date.now()}`,
            stepName: '手工新建单据',
            operator: '当前操作员',
            role: '制单员',
            action: 'CREATE',
            comment: '新建空白业务单据',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            status: 'SUCCESS',
          },
        ],
      };

      state.documents.unshift(newDoc);
      state.dirtyMap[newId] = true;

      const tabId = `tab-doc-${newId}`;
      session.tabs.push({
        id: tabId,
        type: 'DOCUMENT',
        title: `[新增草稿] ${newDocNo}`,
        docId: newId,
        closable: true,
        isNew: true,
        status: 'draft',
        isDirty: true,
        moduleId: 'PURCHASE_ORDER',
      });
      session.activeTabId = tabId;
      state.activeModuleId = 'PURCHASE_ORDER';
    },

    CREATE_NEW_DOC_TAB(state, specifiedType?: 'PURCHASE_ORDER' | 'RETURN_ORDER') {
      const mod = specifiedType || state.activeModuleId;
      store.commit('CREATE_NEW_MODULE_DOC_TAB', mod);
    },

    // 关闭模块内某个 Tab
    CLOSE_MODULE_TAB(
      state,
      payload: { tabId: string; moduleId?: ModuleKey } | string
    ) {
      const tabId = typeof payload === 'string' ? payload : payload.tabId;
      const moduleId =
        typeof payload === 'string'
          ? state.activeModuleId
          : payload.moduleId || state.activeModuleId;

      const session = state.moduleSessions[moduleId];
      if (!session) return;

      const targetIdx = session.tabs.findIndex((t) => t.id === tabId);
      if (targetIdx === -1) return;
      const targetTab = session.tabs[targetIdx];
      if (!targetTab.closable) return;

      session.tabs.splice(targetIdx, 1);
      if (session.activeTabId === tabId) {
        const nextActive = session.tabs[targetIdx - 1] || session.tabs[0];
        session.activeTabId = nextActive
          ? nextActive.id
          : moduleId === 'RETURN_ORDER'
          ? 'tab-ro-list'
          : 'tab-po-list';
      }
    },

    CLOSE_TAB(state, tabId: string) {
      store.commit('CLOSE_MODULE_TAB', { tabId, moduleId: state.activeModuleId });
    },

    // 关闭模块内其他 Tabs
    CLOSE_MODULE_OTHER_TABS(
      state,
      payload: { keepTabId: string; moduleId?: ModuleKey } | string
    ) {
      const keepTabId = typeof payload === 'string' ? payload : payload.keepTabId;
      const moduleId =
        typeof payload === 'string'
          ? state.activeModuleId
          : payload.moduleId || state.activeModuleId;
      const session = state.moduleSessions[moduleId];
      if (!session) return;

      session.tabs = session.tabs.filter((t) => !t.closable || t.id === keepTabId);
      session.activeTabId = keepTabId;
    },

    CLOSE_OTHER_TABS(state, keepTabId: string) {
      store.commit('CLOSE_MODULE_OTHER_TABS', { keepTabId, moduleId: state.activeModuleId });
    },

    // 关闭模块内所有单据 Tabs
    CLOSE_MODULE_ALL_DOC_TABS(state, moduleIdParam?: ModuleKey) {
      const moduleId = moduleIdParam || state.activeModuleId;
      const session = state.moduleSessions[moduleId];
      if (!session) return;

      session.tabs = session.tabs.filter((t) => !t.closable);
      session.activeTabId = moduleId === 'RETURN_ORDER' ? 'tab-ro-list' : 'tab-po-list';
    },

    CLOSE_ALL_DOC_TABS(state) {
      store.commit('CLOSE_MODULE_ALL_DOC_TABS', state.activeModuleId);
    },

    // 辅助函数：同步所有 session 中对应单据的 tab 属性
    _SYNC_DOC_TABS(state, payload: { docId: string; updates: Partial<TabPageItem> }) {
      (Object.values(state.moduleSessions) as ModuleSessionState[]).forEach((sess) => {
        sess.tabs.forEach((tab) => {
          if (tab.docId === payload.docId) {
            Object.assign(tab, payload.updates);
          }
        });
      });
    },

    UPDATE_HEADER(
      state,
      payload: { docId: string; fields: Partial<MasterHeader> }
    ) {
      const doc = state.documents.find((d) => d.header.id === payload.docId);
      if (doc) {
        Object.assign(doc.header, payload.fields, {
          updatedTime: new Date()
            .toISOString()
            .replace('T', ' ')
            .substring(0, 19),
        });
        state.dirtyMap[payload.docId] = true;
        store.commit('_SYNC_DOC_TABS', {
          docId: payload.docId,
          updates: { isDirty: true },
        });
      }
    },

    UPDATE_ITEM_ROW(
      state,
      payload: {
        docId: string;
        rowId: string;
        fields: Partial<ItemDetailRow>;
        fieldKey?: keyof ItemDetailRow;
      }
    ) {
      const doc = state.documents.find((d) => d.header.id === payload.docId);
      if (doc) {
        const row = doc.items.find((r) => r.id === payload.rowId);
        if (row) {
          // 业务逻辑拦截：数量不允许输入负数
          if (payload.fields.quantity !== undefined && Number(payload.fields.quantity) < 0) {
            payload.fields.quantity = 0;
          }
          // 单价不允许输入负数
          if (payload.fields.priceWithTax !== undefined && Number(payload.fields.priceWithTax) < 0) {
            payload.fields.priceWithTax = 0;
          }
          if (payload.fields.priceWithoutTax !== undefined && Number(payload.fields.priceWithoutTax) < 0) {
            payload.fields.priceWithoutTax = 0;
          }

          Object.assign(row, payload.fields);
          const recalc = recalculateItemRow(row, payload.fieldKey);
          Object.assign(row, recalc);
          state.dirtyMap[payload.docId] = true;
          store.commit('_SYNC_DOC_TABS', {
            docId: payload.docId,
            updates: { isDirty: true },
          });
        }
      }
    },

    REPLACE_DOC_ITEMS(
      state,
      payload: { docId: string; items: ItemDetailRow[] }
    ) {
      const doc = state.documents.find((d) => d.header.id === payload.docId);
      if (doc) {
        doc.items = payload.items;
        state.dirtyMap[payload.docId] = true;
        store.commit('_SYNC_DOC_TABS', {
          docId: payload.docId,
          updates: { isDirty: true },
        });
      }
    },

    ADD_ITEM_ROW(
      state,
      payload: { docId: string; insertIndex?: number }
    ) {
      const doc = state.documents.find((d) => d.header.id === payload.docId);
      if (!doc) return;

      const newRow: ItemDetailRow = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        rowNo: doc.items.length + 1,
        itemCode: '',
        itemName: '',
        spec: '',
        unit: '',
        quantity: undefined as any,
        priceWithTax: undefined as any,
        priceWithoutTax: undefined as any,
        taxRate: doc.header.taxRateDefault !== undefined ? doc.header.taxRateDefault : 13,
        taxAmount: 0,
        totalAmount: 0,
        warehouse: '',
        batchNo: '',
        deliveryDate: '',
        remarks: '',
      };

      if (
        payload.insertIndex !== undefined &&
        payload.insertIndex >= 0 &&
        payload.insertIndex <= doc.items.length
      ) {
        doc.items.splice(payload.insertIndex, 0, newRow);
      } else {
        doc.items.push(newRow);
      }

      // Re-index rowNo
      doc.items.forEach((r, idx) => {
        r.rowNo = idx + 1;
      });

      state.dirtyMap[payload.docId] = true;
      store.commit('_SYNC_DOC_TABS', {
        docId: payload.docId,
        updates: { isDirty: true },
      });
    },

    DUPLICATE_ITEM_ROW(state, payload: { docId: string; rowId: string }) {
      const doc = state.documents.find((d) => d.header.id === payload.docId);
      if (!doc) return;

      const sourceIdx = doc.items.findIndex((r) => r.id === payload.rowId);
      if (sourceIdx === -1) return;
      const source = doc.items[sourceIdx];
      const cloned: ItemDetailRow = {
        ...source,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        remarks: source.remarks ? `${source.remarks} (副本)` : '副本',
      };
      doc.items.splice(sourceIdx + 1, 0, cloned);
      doc.items.forEach((r, idx) => {
        r.rowNo = idx + 1;
      });

      state.dirtyMap[payload.docId] = true;
      store.commit('_SYNC_DOC_TABS', {
        docId: payload.docId,
        updates: { isDirty: true },
      });
    },

    DELETE_ITEM_ROWS(state, payload: { docId: string; rowIds: string[] }) {
      const doc = state.documents.find((d) => d.header.id === payload.docId);
      if (!doc) return;

      const idSet = new Set(payload.rowIds);
      doc.items = doc.items.filter((r) => !idSet.has(r.id));
      doc.items.forEach((r, idx) => {
        r.rowNo = idx + 1;
      });

      state.dirtyMap[payload.docId] = true;
      store.commit('_SYNC_DOC_TABS', {
        docId: payload.docId,
        updates: { isDirty: true },
      });
    },

    UPDATE_COSTS(
      state,
      payload: { docId: string; costs: CostAllocationRow[] }
    ) {
      const doc = state.documents.find((d) => d.header.id === payload.docId);
      if (doc) {
        doc.costs = payload.costs;
        state.dirtyMap[payload.docId] = true;
      }
    },

    UPDATE_PAYMENT_SCHEDULE(
      state,
      payload: { docId: string; schedule: PaymentScheduleRow[] }
    ) {
      const doc = state.documents.find((d) => d.header.id === payload.docId);
      if (doc) {
        doc.paymentSchedule = payload.schedule;
        state.dirtyMap[payload.docId] = true;
      }
    },

    UPDATE_ATTACHMENTS(
      state,
      payload: { docId: string; attachments: AttachmentItem[] }
    ) {
      const doc = state.documents.find((d) => d.header.id === payload.docId);
      if (doc) {
        doc.attachments = payload.attachments;
        state.dirtyMap[payload.docId] = true;
      }
    },

    SAVE_DOCUMENT(state, docId: string) {
      const doc = state.documents.find((d) => d.header.id === docId);
      if (doc) {
        doc.header.version += 1;
        doc.header.updatedTime = new Date()
          .toISOString()
          .replace('T', ' ')
          .substring(0, 19);
        doc.items.forEach((r) => {
          r.isDirty = false;
        });
        state.dirtyMap[docId] = false;

        store.commit('_SYNC_DOC_TABS', {
          docId,
          updates: {
            title: `${doc.header.docNo} (${doc.header.partnerName.slice(0, 6)})`,
            isNew: false,
            isDirty: false,
          },
        });
      }
    },

    SUBMIT_DOCUMENT(state, docId: string) {
      const doc = state.documents.find((d) => d.header.id === docId);
      if (!doc) return;

      const summary = computeDocumentSummary(doc.items, doc.header.currency);
      const newLog: AuditLogItem = {
        id: `log-${Date.now()}`,
        stepName: '提交送审',
        operator: doc.header.buyer,
        role: '经办人',
        action: 'SUBMIT',
        comment: `经办人提交审批，总金额：¥${summary.totalAmountWithTax.toLocaleString()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'SUCCESS',
      };

      doc.header.status = 'pending';
      doc.logs.push(newLog);

      store.commit('_SYNC_DOC_TABS', {
        docId,
        updates: { status: 'pending' },
      });
    },

    APPROVE_DOCUMENT(state, docId: string) {
      const doc = state.documents.find((d) => d.header.id === docId);
      if (!doc) return;

      const approverName = '刘晨 (供应链VP)';
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

      const newLog: AuditLogItem = {
        id: `log-${Date.now()}`,
        stepName: '主管终审',
        operator: approverName,
        role: '审批人',
        action: 'APPROVE',
        comment: '审核通过，允许执行下游仓储与付款结算',
        timestamp: nowStr,
        status: 'SUCCESS',
      };

      doc.header.status = 'approved';
      doc.header.approvedBy = approverName;
      doc.header.approvedTime = nowStr;
      doc.header.approvedDate = nowStr.split(' ')[0];
      doc.logs.push(newLog);

      store.commit('_SYNC_DOC_TABS', {
        docId,
        updates: { status: 'approved' },
      });
    },

    REJECT_DOCUMENT(state, docId: string) {
      const doc = state.documents.find((d) => d.header.id === docId);
      if (!doc) return;

      const newLog: AuditLogItem = {
        id: `log-${Date.now()}`,
        stepName: '审批驳回/反审核',
        operator: '审批主管',
        role: '审批人',
        action: 'REJECT',
        comment: '驳回单据至草稿编制状态，需核实单价及交期',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'WARNING',
      };

      doc.header.status = 'rejected';
      doc.header.approvedBy = undefined;
      doc.header.approvedTime = undefined;
      doc.logs.push(newLog);

      store.commit('_SYNC_DOC_TABS', {
        docId,
        updates: { status: 'rejected' },
      });
    },

    BATCH_APPROVE_DOCUMENTS(state, docIds: string[]) {
      const idSet = new Set(docIds);
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      state.documents.forEach((d) => {
        if (idSet.has(d.header.id)) {
          d.header.status = 'approved';
          d.header.approvedBy = '刘晨 (批量核准)';
          d.header.approvedTime = nowStr;
          store.commit('_SYNC_DOC_TABS', {
            docId: d.header.id,
            updates: { status: 'approved' },
          });
        }
      });
    },

    DUPLICATE_DOCUMENT(state, sourceDocId: string) {
      const sourceDoc = state.documents.find((d) => d.header.id === sourceDocId);
      if (!sourceDoc) return;

      const isReturn = sourceDoc.header.docType === 'RETURN_ORDER';
      const targetModule: ModuleKey = isReturn ? 'RETURN_ORDER' : 'PURCHASE_ORDER';
      const session = state.moduleSessions[targetModule];
      if (!session) return;

      const newDocId = `doc-${isReturn ? 'ro' : 'po'}-${Date.now()}`;
      const prefix = isReturn ? 'RO' : 'PO';
      const newDocNo = `${prefix}-${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '')}-${String(Math.floor(Math.random() * 900) + 100)}`;

      const clonedDoc: DocumentRecord = {
        ...sourceDoc,
        header: {
          ...sourceDoc.header,
          id: newDocId,
          docNo: newDocNo,
          status: 'draft',
          version: 1,
          createdBy: sourceDoc.header.buyer.split(' ')[0],
          createdTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
          approvedBy: undefined,
          approvedTime: undefined,
        },
        items: sourceDoc.items.map((item, idx) => ({
          ...item,
          id: `item-${Date.now()}-${idx}`,
        })),
        logs: [
          {
            id: `log-${Date.now()}`,
            stepName: '单据复制创建',
            operator: sourceDoc.header.buyer,
            role: '制单员',
            action: 'CREATE',
            comment: `源自单据 ${sourceDoc.header.docNo} 复制生成`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            status: 'SUCCESS',
          },
        ],
      };

      state.documents.unshift(clonedDoc);
      state.dirtyMap[newDocId] = true;

      const tabId = `tab-doc-${newDocId}`;
      session.tabs.push({
        id: tabId,
        type: 'DOCUMENT',
        title: `[副本] ${newDocNo}`,
        docId: newDocId,
        closable: true,
        isNew: true,
        status: 'draft',
        isDirty: true,
        moduleId: targetModule,
      });
      session.activeTabId = tabId;
      state.activeModuleId = targetModule;
    },

    DELETE_DOCUMENT(state, docId: string) {
      state.documents = state.documents.filter((d) => d.header.id !== docId);
      const tabId = `tab-doc-${docId}`;
      (Object.values(state.moduleSessions) as ModuleSessionState[]).forEach((sess) => {
        sess.tabs = sess.tabs.filter((t) => t.id !== tabId);
        if (sess.activeTabId === tabId) {
          sess.activeTabId = sess.tabs[0]?.id || '';
        }
      });
      delete state.dirtyMap[docId];
    },

    SET_SCHEMA(state, schema: DocumentSchemaConfig) {
      state.currentSchema = schema;
    },
  },

  actions: {
    generateBulkData({ commit, state }, payload: { docId: string; count: number }) {
      const items = generateBulkItems(payload.count, 1);
      commit('REPLACE_DOC_ITEMS', { docId: payload.docId, items });
    },
  },
});
