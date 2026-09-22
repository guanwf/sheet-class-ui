/**
 * 用户管理数据模型与类型定义 (pbs_user)
 * 对应表结构: pbs_user
 */

export interface PbsUser {
  id: string; // 主键采用 BIGINT，雪花ID（前端以 string 处理大整数防止溢出）
  tenant_id: number; // 租户ID
  user_code: string; // 用户账号
  user_name: string; // 用户姓名
  user_type: number; // 用户类型 0=普通用户; 1=管理用户
  password?: string; // 密码（密文）
  org_id: string; // 组织ID（雪花ID）
  org_name?: string; // 关联展示用组织名称

  avatar?: string; // 头像地址
  gender: number; // 性别(1-男 2-女 0-保密)

  pass_type: number; // 密码策略 0=普通 1=加强
  flag: number; // 是否启用 0-禁用 1-启用
  user_status: number; // 用户状态 0=离职 1=在职

  begindate?: string | null; // 账号生效日期
  enddate?: string | null; // 账号失效日期
  language_id: number; // 默认语言 1=中文 2=英文

  pwdbegindate?: string | null; // 密码生效日期
  pwdenddate?: string | null; // 密码失效日期
  mobile?: string; // 手机号码
  birthday?: string | null; // 生日
  entrydate?: string | null; // 入职日期
  email?: string; // 邮箱
  idcard?: string; // 身份证号/护照号（适当放宽到20位）

  address?: string; // 详细地址
  country?: string; // 国家
  city?: string; // 城市

  creator?: string; // 创建人账号
  create_time?: string; // 创建时间
  modifier?: string; // 最后修改人
  modify_time?: string; // 最后修改时间
  remark?: string; // 备注
}

export interface PbsOrg {
  id: string;
  org_code: string;
  org_name: string;
  parent_id?: string;
}

export const USER_TYPE_OPTIONS = [
  { label: '普通用户', value: 0 },
  { label: '管理用户', value: 1 },
];

export const GENDER_OPTIONS = [
  { label: '保密', value: 0 },
  { label: '男', value: 1 },
  { label: '女', value: 2 },
];

export const PASS_TYPE_OPTIONS = [
  { label: '普通策略', value: 0 },
  { label: '加强策略', value: 1 },
];

export const FLAG_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
];

export const USER_STATUS_OPTIONS = [
  { label: '在职', value: 1 },
  { label: '离职', value: 0 },
];

export const LANGUAGE_OPTIONS = [
  { label: '简体中文', value: 1 },
  { label: 'English', value: 2 },
];
