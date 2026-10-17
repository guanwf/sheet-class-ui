import { defineStore } from 'pinia';
import { ConfigRecord, ConfigFormPayload, ConfigValueType } from '../types/config';
import { configApi } from '../api/configApi';
import { message } from 'ant-design-vue';

export const useConfigStore = defineStore('configStore', {
  state: () => ({
    configs: [] as ConfigRecord[],
    selectedTag: 'ALL', // 业务域标签分类筛选：读取 tag 字段
    selectedValueType: 'ALL' as 'ALL' | ConfigValueType,
    filterNeedRestart: -1, // -1: 全部, 1: 需重启, 0: 热生效
    filterEditable: -1, // -1: 全部, 1: 可编辑, 0: 只读
    includeHidden: false, // 默认隐藏 visible=0 项
    searchKeyword: '',
    loading: false,

    // 当前操作的对象 (仅用于查看详情和修改)
    activeConfig: null as ConfigRecord | null,

    // 弹窗与抽屉可见性
    editModalVisible: false,
    detailDrawerVisible: false,
    exportModalVisible: false,
  }),

  getters: {
    /**
     * 业务域分类列表 (通过动态读取配置项中的 tag 字段聚合生成)
     */
    tags(state): string[] {
      const set = new Set<string>();
      state.configs.forEach((c) => {
        if (c.tag && c.tag.trim()) {
          set.add(c.tag.trim());
        }
      });
      return ['ALL', ...Array.from(set).sort()];
    },

    /**
     * 各业务域分类下参数数量聚合统计
     */
    tagCounts(state): Record<string, number> {
      const counts: Record<string, number> = { ALL: state.configs.length };
      state.configs.forEach((c) => {
        if (c.tag && c.tag.trim()) {
          const t = c.tag.trim();
          counts[t] = (counts[t] || 0) + 1;
        }
      });
      return counts;
    },

    filteredConfigs(state): ConfigRecord[] {
      let list = state.configs;

      // 业务域标签分类筛选 (读取 tag 字段)
      if (state.selectedTag !== 'ALL') {
        list = list.filter((c) => c.tag === state.selectedTag);
      }

      // 可见性筛选 (visible)
      if (!state.includeHidden) {
        list = list.filter((c) => c.visible === 1);
      }

      // 值类型筛选 (value_type)
      if (state.selectedValueType !== 'ALL') {
        list = list.filter((c) => c.valueType === state.selectedValueType);
      }

      // 重启生效筛选 (need_restart)
      if (state.filterNeedRestart !== -1) {
        list = list.filter((c) => c.needRestart === state.filterNeedRestart);
      }

      // 可编辑筛选 (editable)
      if (state.filterEditable !== -1) {
        list = list.filter((c) => c.editable === state.filterEditable);
      }

      // 关键字搜索 (支持参数名、业务域tag、描述及参数值)
      if (state.searchKeyword.trim()) {
        const kw = state.searchKeyword.trim().toLowerCase();
        list = list.filter(
          (c) =>
            c.name.toLowerCase().includes(kw) ||
            (c.tag && c.tag.toLowerCase().includes(kw)) ||
            (c.description && c.description.toLowerCase().includes(kw)) ||
            c.value.toLowerCase().includes(kw)
        );
      }

      // 排序: sort_order 升序 -> name 升序
      return list.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }
        return a.name.localeCompare(b.name);
      });
    },

    stats(state) {
      const scoped = state.configs;

      const total = scoped.length;
      const hotReload = scoped.filter((c) => c.needRestart === 0).length;
      const restartReq = scoped.filter((c) => c.needRestart === 1).length;
      const readOnly = scoped.filter((c) => c.editable === 0).length;
      const jsonType = scoped.filter((c) => c.valueType === 'JSON').length;
      const boolType = scoped.filter((c) => c.valueType === 'BOOLEAN').length;
      const numType = scoped.filter((c) => c.valueType === 'NUMBER').length;
      const strType = scoped.filter((c) => c.valueType === 'STRING').length;

      return {
        total,
        hotReload,
        restartReq,
        readOnly,
        jsonType,
        boolType,
        numType,
        strType,
      };
    },
  },

  actions: {
    async fetchConfigs() {
      this.loading = true;
      try {
        const list = await configApi.getConfigs(
          undefined,
          undefined,
          undefined,
          undefined,
          true
        );
        this.configs = list;
      } catch (err: any) {
        message.error(err.message || '加载系统参数配置失败');
      } finally {
        this.loading = false;
      }
    },

    openEditModal(config: ConfigRecord) {
      if (config.editable === 0) {
        message.warning(`参数【${config.name}】为系统底层内置只读项，不允许在线修改`);
        return;
      }
      this.activeConfig = config;
      this.editModalVisible = true;
    },

    openDetailDrawer(config: ConfigRecord) {
      this.activeConfig = config;
      this.detailDrawerVisible = true;
    },

    async saveConfig(payload: ConfigFormPayload, id?: string) {
      if (!id) {
        message.error('系统参数由后台统一初始化预置，禁止在线新增记录');
        return;
      }
      this.loading = true;
      try {
        const saved = await configApi.saveConfig(payload, id, '当前管理员 (Admin)');
        message.success(
          `参数【${saved.name}】已成功更新${saved.needRestart === 1 ? ' (注意：需重启微服务容器生效)' : ' (热重载即时生效)'}`
        );
        this.editModalVisible = false;
        await this.fetchConfigs();
      } catch (err: any) {
        message.error(err.message || '保存配置失败');
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async quickToggleBoolean(id: string) {
      try {
        const target = this.configs.find((c) => c.id === id);
        if (!target) return;
        const res = await configApi.quickToggleBoolean(id, '快捷切换');
        message.success(
          `参数【${res.name}】已切换为 ${res.value === 'true' ? '【开启 / true】' : '【关闭 / false】'}${res.needRestart === 1 ? ' (需重启生效)' : ''}`
        );
        await this.fetchConfigs();
      } catch (err: any) {
        message.error(err.message || '切换失败');
      }
    },

    resetFilters() {
      this.selectedTag = 'ALL';
      this.selectedValueType = 'ALL';
      this.filterNeedRestart = -1;
      this.filterEditable = -1;
      this.includeHidden = false;
      this.searchKeyword = '';
    },
  },
});
