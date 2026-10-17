/**
 * 系统参数配置 (pbs_config) 实体与类型定义
 * 表结构新增 tag 字段 (VARCHAR(64) NOT NULL COMMENT '标签分类')
 */

export type ConfigValueType = 'STRING' | 'JSON' | 'NUMBER' | 'BOOLEAN';

export interface ConfigRecord {
  /** 主键ID（雪花ID） */
  id: string;
  /** 租户ID (默认 1) */
  tenantId: number;
  /** 标签分类 (业务域分类) */
  tag: string;
  /** 参数名，唯一标识，如 agent.log.query.http.timeout */
  name: string;
  /** 参数值（字符串或JSON序列化文本） */
  value: string;
  /** 参数值类型：STRING / JSON / NUMBER / BOOLEAN */
  valueType: ConfigValueType;
  /** 参数描述 */
  description?: string;
  /** 是否重启生效：0=否，1=是 */
  needRestart: number;
  /** 是否可编辑：0=只读，1=可编辑 */
  editable: number;
  /** 是否在前端展示：0=隐藏，1=展示 */
  visible: number;
  /** 排序权重，数值越小越靠前 */
  sortOrder: number;
  /** 创建人 */
  creater?: string;
  /** 创建时间 */
  createTime?: string;
  /** 修改人 */
  modifyer?: string;
  /** 修改时间 */
  modifyTime?: string;
}

export interface ConfigFormPayload {
  tenantId: number;
  tag: string;
  name: string;
  value: string;
  valueType: ConfigValueType;
  description?: string;
  needRestart: number;
  editable: number;
  visible: number;
  sortOrder: number;
}

export interface TenantOption {
  id: number;
  name: string;
  code: string;
}
