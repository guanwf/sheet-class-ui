import { defineStore } from 'pinia';
import {
  PrintTemplateRecord,
  TemplateUploadPayload,
} from '../types/printTemplate';
import { printTemplateApi, MODULE_CATEGORIES } from '../api/printTemplateApi';
import { message } from 'ant-design-vue';

export const usePrintTemplateStore = defineStore('printTemplateStore', {
  state: () => ({
    templates: [] as PrintTemplateRecord[],
    categories: MODULE_CATEGORIES,
    selectedModuleId: 'all',
    searchKeyword: '',
    filterFlag: -1, // -1: 全部, 1: 启用, 0: 停用
    filterDefault: -1, // -1: 全部, 1: 仅默认, 0: 仅非默认
    loading: false,

    // 当前选中的活动模板 (用于抽屉/弹窗)
    activeTemplate: null as PrintTemplateRecord | null,

    // 模态框与抽屉控制
    uploadModalVisible: false,
    editModalVisible: false,
    isNewVersionMode: false,
    paramSchemaDrawerVisible: false,
    testPrintModalVisible: false,
    versionHistoryModalVisible: false,
  }),

  getters: {
    filteredTemplates(state): PrintTemplateRecord[] {
      let list = state.templates;
      if (state.selectedModuleId !== 'all') {
        list = list.filter((t) => t.moduleId === state.selectedModuleId);
      }
      if (state.filterFlag !== -1) {
        list = list.filter((t) => t.flag === state.filterFlag);
      }
      if (state.filterDefault !== -1) {
        list = list.filter((t) => t.isDefault === state.filterDefault);
      }
      if (state.searchKeyword.trim()) {
        const kw = state.searchKeyword.trim().toLowerCase();
        list = list.filter(
          (t) =>
            t.templateName.toLowerCase().includes(kw) ||
            t.templateId.toLowerCase().includes(kw) ||
            t.moduleId.toLowerCase().includes(kw) ||
            (t.remark && t.remark.toLowerCase().includes(kw))
        );
      }
      return list;
    },

    categoryCounts(state) {
      const counts: Record<string, number> = { all: state.templates.length };
      state.categories.forEach((cat) => {
        if (cat.id !== 'all') {
          counts[cat.id] = state.templates.filter((t) => t.moduleId === cat.id).length;
        }
      });
      return counts;
    },

    stats(state) {
      const total = state.templates.length;
      const active = state.templates.filter((t) => t.flag === 1).length;
      const defaults = state.templates.filter((t) => t.isDefault === 1).length;
      const compiled = state.templates.filter((t) => !!t.jasperPath).length;
      return { total, active, defaults, compiled };
    },
  },

  actions: {
    async fetchTemplates() {
      this.loading = true;
      try {
        const data = await printTemplateApi.getTemplates(
          this.selectedModuleId === 'all' ? undefined : this.selectedModuleId,
          this.searchKeyword,
          this.filterFlag === -1 ? undefined : this.filterFlag
        );
        this.templates = data;
      } catch (err: any) {
        message.error(err.message || '加载模板列表失败');
      } finally {
        this.loading = false;
      }
    },

    selectModule(moduleId: string) {
      this.selectedModuleId = moduleId;
    },

    openEditModal(targetTemplate: PrintTemplateRecord) {
      this.activeTemplate = targetTemplate;
      this.editModalVisible = true;
    },

    async updateBasicInfo(
      id: string,
      data: { templateName?: string; moduleId?: string; remark?: string; isDefault?: boolean }
    ) {
      this.loading = true;
      try {
        const res = await printTemplateApi.updateBasicInfo(id, data, '刘工 (主控业务员)');
        message.success(`模板【${res.templateName}】基本信息已更新`);
        this.editModalVisible = false;
        await this.fetchTemplates();
      } catch (err: any) {
        message.error(err.message || '更新模板失败');
        throw err;
      } finally {
        this.loading = false;
      }
    },

    resetFilters() {
      this.selectedModuleId = 'all';
      this.filterFlag = -1;
      this.filterDefault = -1;
      this.searchKeyword = '';
      this.fetchTemplates();
    },

    openUploadModal(moduleId?: string, targetTemplate?: PrintTemplateRecord) {
      if (targetTemplate) {
        this.activeTemplate = targetTemplate;
        this.isNewVersionMode = true;
      } else {
        this.activeTemplate = null;
        this.isNewVersionMode = false;
        if (moduleId && moduleId !== 'all') {
          this.selectedModuleId = moduleId;
        }
      }
      this.uploadModalVisible = true;
    },

    async uploadTemplate(payload: TemplateUploadPayload) {
      this.loading = true;
      try {
        const res = await printTemplateApi.uploadTemplate(payload, '刘工 (主控业务员)');
        message.success(
          `模板【${res.templateName}】${this.isNewVersionMode ? '新版本 v' + res.version + ' 发布成功' : '创建成功'}`
        );
        this.uploadModalVisible = false;
        await this.fetchTemplates();
      } catch (err: any) {
        message.error(err.message || '上传模板失败');
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async setDefault(id: string) {
      try {
        const updated = await printTemplateApi.setDefault(id, '刘工 (主控业务员)');
        message.success(`已将【${updated.templateName}】设为模块 ${updated.moduleId} 的默认模板`);
        await this.fetchTemplates();
      } catch (err: any) {
        message.error(err.message || '设为默认失败');
      }
    },

    async toggleFlag(id: string) {
      try {
        const updated = await printTemplateApi.toggleFlag(id, '刘工 (主控业务员)');
        message.info(`模板【${updated.templateName}】已切换为 ${updated.flag === 1 ? '启用' : '停用'}`);
        await this.fetchTemplates();
      } catch (err: any) {
        message.error(err.message || '切换状态失败');
      }
    },

    async recompile(id: string) {
      try {
        const updated = await printTemplateApi.recompile(id, '刘工 (主控业务员)');
        message.success(`模板【${updated.templateName}】后台动态编译已完成 (*.jasper)`);
        await this.fetchTemplates();
      } catch (err: any) {
        message.error(err.message || '重新编译失败');
      }
    },

    async deleteTemplate(id: string) {
      try {
        await printTemplateApi.deleteTemplate(id);
        message.success('模板已成功删除');
        await this.fetchTemplates();
      } catch (err: any) {
        message.error(err.message || '删除失败');
      }
    },

    openParamSchemaDrawer(template: PrintTemplateRecord) {
      this.activeTemplate = template;
      this.paramSchemaDrawerVisible = true;
    },

    async saveParamSchema(id: string, schemaText: string) {
      try {
        await printTemplateApi.updateParamSchema(id, schemaText, '刘工 (主控业务员)');
        message.success('参数与字段契约说明保存成功');
        this.paramSchemaDrawerVisible = false;
        await this.fetchTemplates();
      } catch (err: any) {
        message.error(err.message || '保存参数说明失败');
      }
    },

    openTestPrint(template: PrintTemplateRecord) {
      this.activeTemplate = template;
      this.testPrintModalVisible = true;
    },
  },
});
