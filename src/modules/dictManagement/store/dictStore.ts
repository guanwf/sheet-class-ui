import { defineStore } from 'pinia';
import {
  DictType,
  DictItem,
  DictDraft,
  DictChangeLog,
  DictUsageVO,
  ScopeType,
} from '../types/dict';
import { dictApi, TENANTS } from '../api/dictApi';
import { message } from 'ant-design-vue';

export const useDictStore = defineStore('dictStore', {
  state: () => ({
    currentTenantId: '0',
    tenants: TENANTS,
    types: [] as DictType[],
    selectedTypeCode: 'CUSTOMER_LEVEL',
    activeScopeFilter: 'ALL' as ScopeType,
    searchKeyword: '',
    
    // 当前选中类型的详情
    currentType: null as DictType | null,
    items: [] as DictItem[],
    drafts: [] as DictDraft[],
    draftCount: 0,

    // 历史与引用检查
    changeLogs: [] as DictChangeLog[],
    usageData: null as DictUsageVO | null,

    // 状态与弹窗控制
    loading: false,
    itemDrawerVisible: false,
    editingItem: null as DictItem | null,
    historyDrawerVisible: false,
    usageModalVisible: false,
    typeModalVisible: false,
    importExportModalVisible: false,
  }),

  getters: {
    filteredTypes(state): DictType[] {
      let result = state.types;
      if (state.activeScopeFilter !== 'ALL') {
        result = result.filter((t) => t.scope === state.activeScopeFilter);
      }
      if (state.searchKeyword.trim()) {
        const kw = state.searchKeyword.trim().toLowerCase();
        result = result.filter(
          (t) =>
            t.name.toLowerCase().includes(kw) ||
            t.typeCode.toLowerCase().includes(kw)
        );
      }
      return result;
    },

    hasPendingDrafts(state): boolean {
      return state.draftCount > 0;
    },

    // 转换为树形结构（若存在 parentCode，挂载到对应父节点的 children 数组中）
    treeItems(state): DictItem[] {
      const itemsMap = new Map<string, DictItem>();
      const roots: DictItem[] = [];

      // 先深度复制，避免修改原对象
      const rawList: DictItem[] = JSON.parse(JSON.stringify(state.items));
      for (const item of rawList) {
        item.children = [];
        itemsMap.set(item.itemCode, item);
      }

      for (const item of rawList) {
        if (item.parentCode && itemsMap.has(item.parentCode)) {
          const parent = itemsMap.get(item.parentCode)!;
          parent.children = parent.children || [];
          parent.children.push(item);
        } else {
          roots.push(item);
        }
      }

      return roots;
    },
  },

  actions: {
    async fetchTypes() {
      this.loading = true;
      try {
        const list = await dictApi.getTypes(
          this.activeScopeFilter === 'ALL' ? undefined : this.activeScopeFilter,
          this.searchKeyword,
          this.currentTenantId
        );
        this.types = list;
        if (list.length > 0) {
          const exists = list.some((t) => t.typeCode === this.selectedTypeCode);
          if (!exists) {
            this.selectedTypeCode = list[0].typeCode;
          }
          await this.fetchCurrentTypeItems();
        } else {
          this.currentType = null;
          this.items = [];
          this.drafts = [];
          this.draftCount = 0;
        }
      } catch (err: any) {
        message.error(err.message || '加载字典类型失败');
      } finally {
        this.loading = false;
      }
    },

    async selectType(typeCode: string) {
      if (this.selectedTypeCode === typeCode) return;
      this.selectedTypeCode = typeCode;
      await this.fetchCurrentTypeItems();
    },

    async switchTenant(tenantId: string) {
      this.currentTenantId = tenantId;
      await this.fetchTypes();
    },

    async fetchCurrentTypeItems() {
      if (!this.selectedTypeCode) return;
      this.loading = true;
      try {
        const res = await dictApi.getItems(this.selectedTypeCode, this.currentTenantId);
        this.currentType = res.type;
        this.items = res.items;
        this.drafts = res.drafts;
        this.draftCount = res.draftCount;
      } catch (err: any) {
        message.error(err.message || '加载字典条目失败');
      } finally {
        this.loading = false;
      }
    },

    async createType(payload: Partial<DictType>) {
      try {
        const created = await dictApi.createType({
          ...payload,
          tenantId: this.currentTenantId,
        });
        message.success(`字典类型 [${created.name}] 创建成功`);
        this.typeModalVisible = false;
        await this.fetchTypes();
        this.selectedTypeCode = created.typeCode;
        await this.fetchCurrentTypeItems();
      } catch (err: any) {
        message.error(err.message || '创建字典类型失败');
        throw err;
      }
    },

    openAddDrawer(parentCode?: string) {
      this.editingItem = {
        id: '',
        typeCode: this.selectedTypeCode,
        tenantId: this.currentTenantId,
        itemCode: '',
        parentCode: parentCode || null,
        labelI18n: { 'zh-CN': '', en: '' },
        sortNo: (this.items.length + 1) * 10,
        ext: {},
        status: 1,
        validFrom: null,
        validTo: null,
      };
      this.itemDrawerVisible = true;
    },

    openEditDrawer(item: DictItem) {
      this.editingItem = JSON.parse(JSON.stringify(item));
      this.itemDrawerVisible = true;
    },

    async saveItemDraft(payload: any, isEdit: boolean) {
      try {
        if (isEdit) {
          await dictApi.updateItemDraft({
            ...payload,
            tenantId: this.currentTenantId,
          });
          message.success('编辑内容已暂存至草稿，发布后生效');
        } else {
          await dictApi.addItemDraft({
            ...payload,
            tenantId: this.currentTenantId,
            typeCode: this.selectedTypeCode,
          });
          message.success('新增条目已暂存至草稿，发布后生效');
        }
        this.itemDrawerVisible = false;
        await this.fetchCurrentTypeItems();
      } catch (err: any) {
        message.error(err.message || '保存草稿失败');
        throw err;
      }
    },

    async toggleStatus(id: string) {
      try {
        await dictApi.toggleItemStatus(id);
        message.success('状态变更已暂存至草稿，发布审批后生效');
        await this.fetchCurrentTypeItems();
      } catch (err: any) {
        message.error(err.message || '状态切换失败');
      }
    },

    async discardDrafts() {
      if (!this.selectedTypeCode) return;
      try {
        await dictApi.discardDrafts(this.selectedTypeCode, this.currentTenantId);
        message.success('已放弃全部未发布的草稿修改');
        await this.fetchCurrentTypeItems();
      } catch (err: any) {
        message.error(err.message || '操作失败');
      }
    },

    async publish(remark: string) {
      if (!this.selectedTypeCode) return;
      try {
        const updated = await dictApi.publishType(this.selectedTypeCode, this.currentTenantId, remark);
        message.success(`审批发布成功！当前版本升级至 v${updated.version}，系统全局缓存已广播同步`);
        await this.fetchTypes();
        await this.fetchCurrentTypeItems();
      } catch (err: any) {
        message.error(err.message || '发布失败');
        throw err;
      }
    },

    async openHistory() {
      if (!this.selectedTypeCode) return;
      try {
        const logs = await dictApi.getHistory(this.selectedTypeCode, this.currentTenantId);
        this.changeLogs = logs;
        this.historyDrawerVisible = true;
      } catch (err: any) {
        message.error(err.message || '获取历史记录失败');
      }
    },

    async rollback(version: number) {
      if (!this.selectedTypeCode) return;
      try {
        const res = await dictApi.rollbackVersion(this.selectedTypeCode, version, this.currentTenantId);
        message.success(`已成功回滚至历史版本 v${version} 基线，当前生效版本递增为 v${res.version}`);
        this.historyDrawerVisible = false;
        await this.fetchTypes();
        await this.fetchCurrentTypeItems();
      } catch (err: any) {
        message.error(err.message || '版本回滚失败');
      }
    },

    async openUsageCheck() {
      if (!this.selectedTypeCode) return;
      try {
        const res = await dictApi.getUsage(this.selectedTypeCode, this.currentTenantId);
        this.usageData = res;
        this.usageModalVisible = true;
      } catch (err: any) {
        message.error(err.message || '引用检查失败');
      }
    },

    async importData(items: any[]) {
      try {
        const count = await dictApi.importData(items, this.currentTenantId);
        message.success(`成功导入并幂等更新 ${count} 条字典项`);
        this.importExportModalVisible = false;
        await this.fetchCurrentTypeItems();
      } catch (err: any) {
        message.error(err.message || '导入失败');
      }
    },
  },
});
