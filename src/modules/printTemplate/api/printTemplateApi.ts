import {
  PrintTemplateRecord,
  PrintParamSchema,
  ModuleCategory,
  TemplateUploadPayload,
} from '../types/printTemplate';

export const MODULE_CATEGORIES: ModuleCategory[] = [
  { id: 'all', name: '全部业务模块', code: 'ALL', icon: '🗂️', description: '所有已注册的业务单据套打模板', defaultPaper: '混合纸型' },
  { id: 'order', name: '采购订单 (PO)', code: 'order', icon: '📦', description: '标准采购合同、供应商供货送货单、到货验收套打', defaultPaper: 'A4 / 241三联单' },
  { id: 'return_order', name: '采购退货单 (RO)', code: 'return_order', icon: '🔄', description: '门店不良品退货、冲抵对账凭单、退厂返修单', defaultPaper: 'A4 纵向' },
  { id: 'invoice', name: '发票与对账单', code: 'invoice', icon: '🧾', description: '增值税对账单、财务往来结算回单、销项凭证', defaultPaper: 'A4 / A5 横向' },
  { id: 'inventory', name: '入库与库管单', code: 'inventory', icon: '🏢', description: '仓库入库验收单、库内移库凭证、盘点差异单', defaultPaper: 'A4 连打' },
  { id: 'delivery', name: '发运与物流单', code: 'delivery', icon: '🚚', description: '物流运输交接单、出库发货标签、司机签收联', defaultPaper: '热敏三联 / 241mm' },
];

const SAMPLE_JRXML_PO = `<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
  name="PO_A4_STANDARD" pageWidth="595" pageHeight="842" columnWidth="535"
  leftMargin="30" rightMargin="30" topMargin="20" bottomMargin="20">
  <parameter name="docNo" class="java.lang.String"/>
  <parameter name="docDate" class="java.lang.String"/>
  <parameter name="partnerName" class="java.lang.String"/>
  <parameter name="buyer" class="java.lang.String"/>
  <parameter name="currency" class="java.lang.String"/>
  <parameter name="totalAmount" class="java.lang.Double"/>
  <field name="lineNo" class="java.lang.Integer"/>
  <field name="skuCode" class="java.lang.String"/>
  <field name="skuName" class="java.lang.String"/>
  <field name="spec" class="java.lang.String"/>
  <field name="unit" class="java.lang.String"/>
  <field name="qty" class="java.lang.Double"/>
  <field name="unitPrice" class="java.lang.Double"/>
  <field name="amount" class="java.lang.Double"/>
</jasperReport>`;

const INITIAL_SCHEMAS: Record<string, PrintParamSchema> = {
  PO_A4_STANDARD: {
    reportTitle: '标准采购订单激光套打报表 (A4)',
    pageSize: 'A4',
    orientation: 'PORTRAIT',
    margins: { top: 20, bottom: 20, left: 30, right: 30 },
    parameters: [
      { name: 'docNo', type: 'String', required: true, description: '采购单号 (如 PO-2026-0001)' },
      { name: 'docDate', type: 'String', required: true, description: '业务发生日期 (YYYY-MM-DD)' },
      { name: 'partnerName', type: 'String', required: true, description: '供应商公司全称' },
      { name: 'buyer', type: 'String', required: false, description: '采购经办员姓名' },
      { name: 'department', type: 'String', required: false, description: '归属采购部门' },
      { name: 'currency', type: 'String', required: false, defaultValue: 'CNY', description: '结算币种' },
      { name: 'totalAmount', type: 'BigDecimal', required: true, description: '含税总计金额 (¥)' },
      { name: 'deliveryAddress', type: 'String', required: false, description: '收货仓库与送货地址' },
    ],
    fields: [
      { name: 'lineNo', type: 'Integer', description: '行号 (序号)' },
      { name: 'skuCode', type: 'String', description: '物料编码 (SKU ID)' },
      { name: 'skuName', type: 'String', description: '品名及规格描述' },
      { name: 'spec', type: 'String', description: '规格型号' },
      { name: 'unit', type: 'String', description: '计量单位 (如 PCS, KG)' },
      { name: 'qty', type: 'Double', description: '采购订货数量' },
      { name: 'unitPrice', type: 'Double', description: '未税/含税采购单价' },
      { name: 'taxRate', type: 'Double', description: '适用增值税率 (%)' },
      { name: 'amount', type: 'BigDecimal', description: '行小计金额' },
    ],
    bands: [
      { name: 'title', height: 60, description: '企业抬头、LOGO及单据主题' },
      { name: 'pageHeader', height: 80, description: '单据主表商务信息与甲乙方抬头' },
      { name: 'columnHeader', height: 26, description: '物料明细数据网格表头' },
      { name: 'detail', height: 22, description: '采购明细行循环渲染带' },
      { name: 'summary', height: 90, description: '大小写金额、审批签章留白与防伪二维码' },
    ],
  },
  PO_TRIPLE_241: {
    reportTitle: '采购订单三联针式打字纸套打 (241mm宽)',
    pageSize: 'CONTINUOUS_241',
    orientation: 'PORTRAIT',
    parameters: [
      { name: 'docNo', type: 'String', required: true, description: '采购单号' },
      { name: 'partnerName', type: 'String', required: true, description: '供应商名称' },
      { name: 'totalAmount', type: 'BigDecimal', required: true, description: '总计金额' },
    ],
    fields: [
      { name: 'lineNo', type: 'Integer', description: '序号' },
      { name: 'skuName', type: 'String', description: '物料名称' },
      { name: 'qty', type: 'Double', description: '数量' },
      { name: 'amount', type: 'BigDecimal', description: '金额' },
    ],
  },
  RO_A4_STANDARD: {
    reportTitle: '采购退货单标准质检退厂凭据 (A4)',
    pageSize: 'A4',
    orientation: 'PORTRAIT',
    parameters: [
      { name: 'docNo', type: 'String', required: true, description: '退货单号 (如 RO-2026-0001)' },
      { name: 'partnerName', type: 'String', required: true, description: '供应商名称' },
      { name: 'returnReason', type: 'String', required: false, description: '退货原因及质检判定' },
      { name: 'totalRefund', type: 'BigDecimal', required: true, description: '应退金额小计' },
    ],
    fields: [
      { name: 'lineNo', type: 'Integer', description: '行号' },
      { name: 'skuCode', type: 'String', description: '物料编码' },
      { name: 'skuName', type: 'String', description: '退货物料品名' },
      { name: 'defectReason', type: 'String', description: '缺陷归因说明' },
      { name: 'returnQty', type: 'Double', description: '退货出库件数' },
      { name: 'unitPrice', type: 'Double', description: '原进货单价' },
      { name: 'refundAmount', type: 'BigDecimal', description: '退货金额' },
    ],
  },
};

const INITIAL_TEMPLATES: PrintTemplateRecord[] = [
  {
    id: '8001001',
    moduleId: 'order',
    templateId: 'PO_A4_STANDARD',
    templateName: '采购订单标准A4激光套打模板',
    isDefault: 1,
    version: 3,
    jrxmlPath: 'oss://erp-templates/order/PO_A4_STANDARD_v3.jrxml',
    jasperPath: 'oss://erp-templates/order/PO_A4_STANDARD_v3.jasper',
    paramSchema: JSON.stringify(INITIAL_SCHEMAS.PO_A4_STANDARD, null, 2),
    flag: 1,
    creator: '刘工 (主控业务员)',
    createTime: '2025-06-12 10:30:00',
    modifier: '刘工 (主控业务员)',
    modifyTime: '2026-03-10 14:22:15',
    remark: '生产与物资采购标准A4报表，带公司公章印鉴与三方签约条款',
    fileSizeKb: 48.6,
    compiledAt: '2026-03-10 14:22:18',
  },
  {
    id: '8001002',
    moduleId: 'order',
    templateId: 'PO_TRIPLE_241',
    templateName: '采购订单三联针式连打凭单 (241mm)',
    isDefault: 0,
    version: 1,
    jrxmlPath: 'oss://erp-templates/order/PO_TRIPLE_241_v1.jrxml',
    jasperPath: 'oss://erp-templates/order/PO_TRIPLE_241_v1.jasper',
    paramSchema: JSON.stringify(INITIAL_SCHEMAS.PO_TRIPLE_241, null, 2),
    flag: 1,
    creator: '仓储物流部',
    createTime: '2025-08-20 09:15:00',
    modifier: '仓储物流部',
    modifyTime: '2025-08-20 09:15:00',
    remark: '适用于 Epson 630K 针式打印机，第一联存根、第二联客户、第三联财务',
    fileSizeKb: 32.4,
    compiledAt: '2025-08-20 09:15:05',
  },
  {
    id: '8001003',
    moduleId: 'return_order',
    templateId: 'RO_A4_STANDARD',
    templateName: '采购退货单标准A4套打模板',
    isDefault: 1,
    version: 2,
    jrxmlPath: 'oss://erp-templates/return_order/RO_A4_STANDARD_v2.jrxml',
    jasperPath: 'oss://erp-templates/return_order/RO_A4_STANDARD_v2.jasper',
    paramSchema: JSON.stringify(INITIAL_SCHEMAS.RO_A4_STANDARD, null, 2),
    flag: 1,
    creator: '质检科',
    createTime: '2025-09-05 16:40:00',
    modifier: '质检科',
    modifyTime: '2026-01-18 11:20:00',
    remark: '包含质检不良留样照片占位与冲抵供应商台账确认联',
    fileSizeKb: 41.2,
    compiledAt: '2026-01-18 11:20:04',
  },
  {
    id: '8001004',
    moduleId: 'invoice',
    templateId: 'INV_BILL_STANDARD',
    templateName: '财务供应链结算对账联 (A4横版)',
    isDefault: 1,
    version: 1,
    jrxmlPath: 'oss://erp-templates/invoice/INV_BILL_STANDARD_v1.jrxml',
    jasperPath: 'oss://erp-templates/invoice/INV_BILL_STANDARD_v1.jasper',
    paramSchema: JSON.stringify({
      reportTitle: '供应商往来对账单',
      pageSize: 'A4',
      orientation: 'LANDSCAPE',
      parameters: [{ name: 'statementNo', type: 'String', required: true, description: '对账周期单号' }],
      fields: [{ name: 'invoiceCode', type: 'String', description: '发票代码' }],
    }, null, 2),
    flag: 1,
    creator: '财务部',
    createTime: '2025-11-01 14:00:00',
    modifier: '财务部',
    modifyTime: '2025-11-01 14:00:00',
    remark: '按自然月度出具跨国采购收支对账',
    fileSizeKb: 36.8,
    compiledAt: '2025-11-01 14:00:03',
  },
  {
    id: '8001005',
    moduleId: 'inventory',
    templateId: 'STOCK_IN_TICKET',
    templateName: '仓储入库上架条码交接单',
    isDefault: 1,
    version: 1,
    jrxmlPath: 'oss://erp-templates/inventory/STOCK_IN_TICKET_v1.jrxml',
    jasperPath: 'oss://erp-templates/inventory/STOCK_IN_TICKET_v1.jasper',
    paramSchema: JSON.stringify({
      reportTitle: '智能仓储入库单',
      pageSize: 'A4',
      orientation: 'PORTRAIT',
      parameters: [{ name: 'warehouseName', type: 'String', required: true, description: '目的仓库' }],
      fields: [{ name: 'locationCode', type: 'String', description: '推荐储位' }],
    }, null, 2),
    flag: 1,
    creator: '仓储总管',
    createTime: '2025-10-15 15:10:00',
    modifier: '仓储总管',
    modifyTime: '2025-10-15 15:10:00',
    remark: '包含托盘条形码与库位二维码快速引导',
    fileSizeKb: 39.5,
    compiledAt: '2025-10-15 15:10:04',
  },
];

class PrintTemplateMockStorage {
  private templates: PrintTemplateRecord[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      const stored = localStorage.getItem('pbs_print_templates');
      if (stored) {
        this.templates = JSON.parse(stored);
      } else {
        this.templates = JSON.parse(JSON.stringify(INITIAL_TEMPLATES));
      }
    } catch {
      this.templates = JSON.parse(JSON.stringify(INITIAL_TEMPLATES));
    }
  }

  private save() {
    try {
      localStorage.setItem('pbs_print_templates', JSON.stringify(this.templates));
    } catch (e) {
      console.error('Failed to save pbs_print_templates', e);
    }
  }

  public getTemplates(moduleId?: string, keyword?: string, flag?: number): PrintTemplateRecord[] {
    let list = this.templates;
    if (moduleId && moduleId !== 'all') {
      list = list.filter((t) => t.moduleId === moduleId);
    }
    if (flag !== undefined && flag !== -1) {
      list = list.filter((t) => t.flag === flag);
    }
    if (keyword && keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.templateName.toLowerCase().includes(kw) ||
          t.templateId.toLowerCase().includes(kw) ||
          t.moduleId.toLowerCase().includes(kw)
      );
    }
    return JSON.parse(JSON.stringify(list));
  }

  public getById(id: string): PrintTemplateRecord | undefined {
    const item = this.templates.find((t) => t.id === id);
    return item ? JSON.parse(JSON.stringify(item)) : undefined;
  }

  public uploadTemplate(payload: TemplateUploadPayload, operator = '当前操作员'): PrintTemplateRecord {
    const mod = payload.moduleId.trim();
    const tplId = payload.templateId.trim().toUpperCase();

    // 寻找是否已有相同 (module_id, template_id)
    const existingIndex = this.templates.findIndex(
      (t) => t.moduleId === mod && t.templateId === tplId
    );

    const nowStr = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');

    if (payload.isDefault) {
      // 保证同一 module_id 下只有一个 is_default = 1
      this.templates.forEach((t) => {
        if (t.moduleId === mod) {
          t.isDefault = 0;
        }
      });
    }

    if (existingIndex >= 0) {
      // 更新现有模板，版本 version + 1
      const exist = this.templates[existingIndex];
      const nextVersion = exist.version + 1;

      exist.templateName = payload.templateName || exist.templateName;
      exist.version = nextVersion;
      exist.isDefault = payload.isDefault ? 1 : exist.isDefault;
      exist.jrxmlPath = `oss://erp-templates/${mod}/${tplId}_v${nextVersion}.jrxml`;
      exist.jasperPath = payload.autoCompile !== false
        ? `oss://erp-templates/${mod}/${tplId}_v${nextVersion}.jasper`
        : exist.jasperPath;
      if (payload.paramSchemaText) {
        exist.paramSchema = payload.paramSchemaText;
      }
      exist.modifier = operator;
      exist.modifyTime = nowStr;
      if (payload.remark !== undefined) {
        exist.remark = payload.remark;
      }
      exist.fileSizeKb = payload.jrxmlFile ? Math.round(payload.jrxmlFile.size / 102.4) / 10 : 45.2;
      exist.compiledAt = nowStr;

      this.save();
      return JSON.parse(JSON.stringify(exist));
    } else {
      // 全新上传
      const newId = Date.now().toString();
      const version = 1;
      const newRecord: PrintTemplateRecord = {
        id: newId,
        moduleId: mod,
        templateId: tplId,
        templateName: payload.templateName.trim(),
        isDefault: payload.isDefault ? 1 : 0,
        version: version,
        jrxmlPath: `oss://erp-templates/${mod}/${tplId}_v1.jrxml`,
        jasperPath: payload.autoCompile !== false
          ? `oss://erp-templates/${mod}/${tplId}_v1.jasper`
          : null,
        paramSchema: payload.paramSchemaText || JSON.stringify(INITIAL_SCHEMAS.PO_A4_STANDARD, null, 2),
        flag: 1,
        creator: operator,
        createTime: nowStr,
        modifier: operator,
        modifyTime: nowStr,
        remark: payload.remark || '首次上传模板源文件',
        fileSizeKb: payload.jrxmlFile ? Math.round(payload.jrxmlFile.size / 102.4) / 10 : 38.0,
        compiledAt: payload.autoCompile !== false ? nowStr : undefined,
      };

      this.templates.unshift(newRecord);
      this.save();
      return JSON.parse(JSON.stringify(newRecord));
    }
  }

  public setDefault(id: string, operator = '当前操作员'): PrintTemplateRecord {
    const target = this.templates.find((t) => t.id === id);
    if (!target) throw new Error('模板不存在');

    // 清除同模块下其他模板的默认状态
    this.templates.forEach((t) => {
      if (t.moduleId === target.moduleId) {
        t.isDefault = 0;
      }
    });

    target.isDefault = 1;
    target.modifier = operator;
    target.modifyTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    this.save();
    return JSON.parse(JSON.stringify(target));
  }

  public toggleFlag(id: string, operator = '当前操作员'): PrintTemplateRecord {
    const target = this.templates.find((t) => t.id === id);
    if (!target) throw new Error('模板不存在');

    target.flag = target.flag === 1 ? 0 : 1;
    target.modifier = operator;
    target.modifyTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    this.save();
    return JSON.parse(JSON.stringify(target));
  }

  public updateParamSchema(id: string, schemaJsonText: string, operator = '当前操作员'): PrintTemplateRecord {
    const target = this.templates.find((t) => t.id === id);
    if (!target) throw new Error('模板不存在');

    target.paramSchema = schemaJsonText;
    target.modifier = operator;
    target.modifyTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    this.save();
    return JSON.parse(JSON.stringify(target));
  }

  public recompile(id: string, operator = '当前操作员'): PrintTemplateRecord {
    const target = this.templates.find((t) => t.id === id);
    if (!target) throw new Error('模板不存在');

    const nowStr = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    target.jasperPath = `oss://erp-templates/${target.moduleId}/${target.templateId}_v${target.version}.jasper`;
    target.compiledAt = nowStr;
    target.modifier = operator;
    target.modifyTime = nowStr;
    this.save();
    return JSON.parse(JSON.stringify(target));
  }

  public updateBasicInfo(
    id: string,
    data: { templateName?: string; moduleId?: string; remark?: string; isDefault?: boolean },
    operator = '当前操作员'
  ): PrintTemplateRecord {
    const target = this.templates.find((t) => t.id === id);
    if (!target) throw new Error('模板不存在');

    if (data.moduleId && data.moduleId !== target.moduleId) {
      const duplicate = this.templates.find(
        (t) => t.moduleId === data.moduleId && t.templateId === target.templateId && t.id !== id
      );
      if (duplicate) {
        throw new Error(`业务模块【${data.moduleId}】下已存在模板编码【${target.templateId}】，违反唯一键约束`);
      }
      target.moduleId = data.moduleId;
    }

    if (data.templateName && data.templateName.trim()) {
      target.templateName = data.templateName.trim();
    }
    if (data.remark !== undefined) {
      target.remark = data.remark;
    }
    if (data.isDefault !== undefined) {
      if (data.isDefault) {
        this.templates.forEach((t) => {
          if (t.moduleId === target.moduleId) t.isDefault = 0;
        });
        target.isDefault = 1;
      } else {
        target.isDefault = 0;
      }
    }

    target.modifier = operator;
    target.modifyTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    this.save();
    return JSON.parse(JSON.stringify(target));
  }

  public deleteTemplate(id: string): boolean {
    const target = this.templates.find((t) => t.id === id);
    if (!target) return false;
    if (target.isDefault === 1) {
      throw new Error('默认模板禁止删除！请先将其他模板设为默认后再操作。');
    }
    this.templates = this.templates.filter((t) => t.id !== id);
    this.save();
    return true;
  }
}

export const printTemplateStorage = new PrintTemplateMockStorage();

/**
 * 前端/后端通用的 JRXML 智能解析工具：
 * 从 XML 字符串中提取 <parameter> 与 <field>，自动生成 param_schema 契约
 */
export function parseJrxmlParameters(xmlString: string): PrintParamSchema {
  const parameters: Array<{ name: string; type: any; required: boolean; description: string }> = [];
  const fields: Array<{ name: string; type: any; description: string }> = [];

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // 解析 parameter
    const paramNodes = xmlDoc.getElementsByTagName('parameter');
    for (let i = 0; i < paramNodes.length; i++) {
      const p = paramNodes[i];
      const name = p.getAttribute('name');
      const rawClass = p.getAttribute('class') || 'java.lang.String';
      const cleanType = rawClass.replace('java.lang.', '').replace('java.math.', '') as any;

      if (name && !name.startsWith('REPORT_') && !name.startsWith('JASPER_')) {
        parameters.push({
          name,
          type: cleanType || 'String',
          required: true,
          description: `单据头报表参数 [${name}]`,
        });
      }
    }

    // 解析 field
    const fieldNodes = xmlDoc.getElementsByTagName('field');
    for (let i = 0; i < fieldNodes.length; i++) {
      const f = fieldNodes[i];
      const name = f.getAttribute('name');
      const rawClass = f.getAttribute('class') || 'java.lang.String';
      const cleanType = rawClass.replace('java.lang.', '').replace('java.math.', '') as any;

      if (name) {
        fields.push({
          name,
          type: cleanType || 'String',
          description: `数据网格明细字段 [${name}]`,
        });
      }
    }

    const reportNode = xmlDoc.getElementsByTagName('jasperReport')[0];
    const reportTitle = reportNode ? reportNode.getAttribute('name') || '报表套打' : '报表套打';

    return {
      reportTitle,
      pageSize: 'A4',
      orientation: 'PORTRAIT',
      parameters,
      fields,
    };
  } catch (e) {
    console.warn('JRXML parsing fallback:', e);
    return {
      reportTitle: '自定义套打模板',
      pageSize: 'A4',
      parameters,
      fields,
    };
  }
}

export const printTemplateApi = {
  getTemplates: async (moduleId?: string, keyword?: string, flag?: number) => {
    return printTemplateStorage.getTemplates(moduleId, keyword, flag);
  },
  getTemplateById: async (id: string) => {
    return printTemplateStorage.getById(id);
  },
  uploadTemplate: async (payload: TemplateUploadPayload, operator?: string) => {
    return printTemplateStorage.uploadTemplate(payload, operator);
  },
  setDefault: async (id: string, operator?: string) => {
    return printTemplateStorage.setDefault(id, operator);
  },
  toggleFlag: async (id: string, operator?: string) => {
    return printTemplateStorage.toggleFlag(id, operator);
  },
  updateParamSchema: async (id: string, schemaJsonText: string, operator?: string) => {
    return printTemplateStorage.updateParamSchema(id, schemaJsonText, operator);
  },
  updateBasicInfo: async (
    id: string,
    data: { templateName?: string; moduleId?: string; remark?: string; isDefault?: boolean },
    operator?: string
  ) => {
    return printTemplateStorage.updateBasicInfo(id, data, operator);
  },
  recompile: async (id: string, operator?: string) => {
    return printTemplateStorage.recompile(id, operator);
  },
  deleteTemplate: async (id: string) => {
    return printTemplateStorage.deleteTemplate(id);
  },
  getModuleCategories: () => {
    return MODULE_CATEGORIES;
  },
  getSampleJrxml: () => {
    return SAMPLE_JRXML_PO;
  },
};
