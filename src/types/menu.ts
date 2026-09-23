/**
 * 系统菜单与文件夹数据类型定义 (pbs_menufolder & pbs_menufolderitem)
 */

export interface PbsMenuFolder {
  /** 雪花主键ID (BIGINT以字符串存储防JS溢出) */
  id: string;

  /** 目录标题 */
  caption: string;

  /** 父ID ("0"=顶级目录) */
  parentid: string;

  /** 排序号 */
  orderno: number;

  /** 图标名称 (Ant Design 或常用图标组件标识) */
  icon?: string;

  /** 状态 (0=禁用, 1=启用) */
  flag: number;

  /** 创建人 */
  creator?: string;

  /** 创建时间 */
  create_time?: string;

  /** 修改人 */
  modifier?: string;

  /** 修改时间 */
  modify_time?: string;

  /** 树形层级子目录集合 (前端展示辅助) */
  children?: PbsMenuFolder[];
}

export interface PbsMenuFolderItem {
  /** 雪花主键ID */
  id: string;

  /** 所属文件夹ID */
  folderid: string;

  /** 关联模块ID (type=1 模块菜单时使用，唯一绑定) */
  module_id?: string;

  /** 菜单标题 (唯一) */
  caption: string;

  /** 菜单类型 (1=模块菜单, 2=外链) */
  type: 1 | 2;

  /** 外链URL (type=2 时使用) */
  link_url?: string;

  /** 排序号 */
  orderno: number;

  /** 创建人 */
  creator?: string;

  /** 创建时间 */
  create_time?: string;

  /** 修改人 */
  modifier?: string;

  /** 修改时间 */
  modify_time?: string;

  /** 关联模块拓展字段 (前端联合查询展示) */
  moduleName?: string;
  moduleHint?: string;
  moduleUrl?: string;
  rightvalues?: number;
  actiontypeid?: string;
}

/** 常用 Ant Design 图标预选池 */
export const ANTD_ICON_OPTIONS = [
  { name: 'AppstoreOutlined', label: '应用矩阵 (Appstore)', category: '系统' },
  { name: 'ShoppingOutlined', label: '采购商城 (Shopping)', category: '供应链' },
  { name: 'DatabaseOutlined', label: '数据中心 (Database)', category: '台账' },
  { name: 'SettingOutlined', label: '系统设置 (Setting)', category: '系统' },
  { name: 'TeamOutlined', label: '组织人事 (Team)', category: '权限' },
  { name: 'SafetyCertificateOutlined', label: '安全认证 (Safety)', category: '权限' },
  { name: 'FolderOutlined', label: '常规文件夹 (Folder)', category: '通用' },
  { name: 'BarChartOutlined', label: '统计报表 (BarChart)', category: '报表' },
  { name: 'PayCircleOutlined', label: '资金财务 (PayCircle)', category: '财务' },
  { name: 'BuildOutlined', label: '制造工程 (Build)', category: '生产' },
  { name: 'ToolOutlined', label: '设备工器具 (Tool)', category: '设备' },
  { name: 'FileTextOutlined', label: '文档凭证 (FileText)', category: '单据' },
];
