/**
 * pbs_module 模块表实体类型定义
 */

export interface PbsModule {
  /** 主键ID（雪花ID），以字符串存储防 JS 64位大整数精度丢失 */
  id: string;

  /** 模块ID（业务唯一标识，如 PURCHASE_ORDER, USER_MGT） */
  module_id: string;

  /** 模块名称（业务唯一名称，如 采购订单, 用户管理） */
  module_name: string;

  /** 提示信息（Tooltip 或功能副标题） */
  hint?: string;

  /** 权限值（基于 pageUtils.PERM 的二进制位或掩码，如 2047, 1279, 1） */
  rightvalues: number;

  /** 操作地址（路由 Path、微应用链接或后端入口） */
  actionurl: string;

  /** 操作类型（如 TAB_PAGE, MENU, MODAL, EXTERNAL_LINK） */
  actiontypeid: string;

  /** 操作参数（如 JSON 串或 URL 参数，如 {"density":"compact"}） */
  actionparams?: string;

  /** 是否启用; 0=不启动、1=启用 */
  flag: number;

  /** 创建人 */
  creater?: string;

  /** 创建时间 (YYYY-MM-DD) */
  create_time?: string;

  /** 修改人 */
  modifyer?: string;

  /** 修改时间 (YYYY-MM-DD) */
  modify_time?: string;

  /** 备注说明 */
  remark?: string;
}

/** 操作类型元数据选项 */
export interface ActionTypeMeta {
  id: string;
  name: string;
  badgeColor: string;
  description: string;
}

export const ACTION_TYPE_OPTIONS: ActionTypeMeta[] = [
  { id: 'TAB_PAGE', name: '工作区页签 (TAB_PAGE)', badgeColor: 'blue', description: '在主工作区以独立 TabPage 选项卡容器加载渲染' },
  { id: 'MENU', name: '系统导航菜单 (MENU)', badgeColor: 'green', description: '一级/二级侧边或全局功能菜单项' },
  { id: 'MODAL_DIALOG', name: '弹窗对话框 (MODAL)', badgeColor: 'purple', description: '模态对话框模式运行独立交互逻辑' },
  { id: 'EXTERNAL_LINK', name: '外部直达链接 (LINK)', badgeColor: 'orange', description: '嵌入 Iframe 或跳出至外部系统' },
  { id: 'BUTTON_ACTION', name: '工具栏指令 (ACTION)', badgeColor: 'cyan', description: '快捷指令、数据同步或批处理脚本触发器' },
];
