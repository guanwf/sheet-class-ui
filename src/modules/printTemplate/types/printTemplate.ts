export interface ReportParameterDef {
  name: string;
  type: 'String' | 'Integer' | 'Double' | 'BigDecimal' | 'Date' | 'Boolean' | 'Object';
  required?: boolean;
  defaultValue?: string;
  description: string;
}

export interface ReportFieldDef {
  name: string;
  type: 'String' | 'Integer' | 'Double' | 'BigDecimal' | 'Date';
  description: string;
}

export interface ReportBandDef {
  name: 'title' | 'pageHeader' | 'columnHeader' | 'detail' | 'columnFooter' | 'pageFooter' | 'summary';
  height: number;
  description?: string;
}

export interface PrintParamSchema {
  reportTitle?: string;
  pageSize?: 'A4' | 'A5' | 'A3' | 'CONTINUOUS_241' | 'CUSTOM';
  orientation?: 'PORTRAIT' | 'LANDSCAPE';
  margins?: { top: number; bottom: number; left: number; right: number };
  parameters: ReportParameterDef[];
  fields: ReportFieldDef[];
  bands?: ReportBandDef[];
}

export interface PrintTemplateRecord {
  id: string;
  moduleId: string;
  templateId: string;
  templateName: string;
  isDefault: 0 | 1;
  version: number;
  jrxmlPath?: string | null;
  jasperPath?: string | null;
  paramSchema?: string | null;
  flag: 0 | 1;
  creator?: string;
  createTime?: string;
  modifier?: string;
  modifyTime?: string;
  remark?: string;
  // UI 辅助属性
  fileSizeKb?: number;
  compiledAt?: string;
  parsedSchema?: PrintParamSchema;
}

export interface ModuleCategory {
  id: string;
  name: string;
  code: string;
  icon: string;
  description: string;
  defaultPaper: string;
}

export interface TemplateUploadPayload {
  moduleId: string;
  templateId: string;
  templateName: string;
  isDefault: boolean;
  jrxmlFile?: File | null;
  jrxmlContent?: string;
  jasperFile?: File | null;
  jasperContent?: string;
  paramSchemaText?: string;
  remark?: string;
  autoCompile?: boolean;
}
