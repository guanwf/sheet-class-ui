-- ====================================================================
-- 企业级数据字典管理系统 DDL (MySQL 8.0+ / OceanBase 兼容)
-- ====================================================================

-- 1. 字典类型表
CREATE TABLE IF NOT EXISTS dict_type (
  id           BIGINT NOT NULL COMMENT '主键ID（雪花ID）',
  type_code    VARCHAR(64) NOT NULL COMMENT '字典类型编码（唯一，大写下划线）',
  name         VARCHAR(128) NOT NULL COMMENT '字典类型名称',
  scope        VARCHAR(20) NOT NULL DEFAULT 'PLATFORM' COMMENT '作用范围：PLATFORM-平台级 / TENANT-租户级 / ORG-组织级',
  tenant_id    VARCHAR(64) NOT NULL DEFAULT '0' COMMENT '租户ID（平台级默认为 0）',
  is_builtin   TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否内置：1-是（不可删除不可改编码），0-否',
  editable     TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否可编辑：1-可编辑，0-只读锁定',
  version      INT NOT NULL DEFAULT 1 COMMENT '当前生效版本号（发布成功递增）',
  status       TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-停用',
  remark       VARCHAR(512) DEFAULT NULL COMMENT '业务说明备注',
  creator      VARCHAR(64) DEFAULT 'SYSTEM' COMMENT '创建人',
  create_time  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  modifier     VARCHAR(64) DEFAULT 'SYSTEM' COMMENT '修改人',
  modify_time  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (id),
  UNIQUE KEY uq_dict_type (tenant_id, type_code),
  KEY idx_scope_status (scope, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据字典类型表';

-- 2. 字典条目表
CREATE TABLE IF NOT EXISTS dict_item (
  id           BIGINT NOT NULL COMMENT '主键ID（雪花ID）',
  type_code    VARCHAR(64) NOT NULL COMMENT '字典类型编码',
  tenant_id    VARCHAR(64) NOT NULL DEFAULT '0' COMMENT '所属租户ID（平台级为 0）',
  item_code    VARCHAR(64) NOT NULL COMMENT '字典条目编码（业务持久化字段）',
  parent_code  VARCHAR(64) DEFAULT NULL COMMENT '父级条目编码（支持树形层级字典）',
  label_i18n   JSON NOT NULL COMMENT '多语言展示标签 JSON，例如 {"zh-CN":"金牌","en":"Gold"}',
  sort_no      INT NOT NULL DEFAULT 0 COMMENT '展示排序号（升序）',
  ext          JSON DEFAULT NULL COMMENT '扩展属性 JSON，例如 {"color":"#1F4FD8","discount":0.85}',
  status       TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-停用（业务不可删除只能停用）',
  valid_from   DATETIME DEFAULT NULL COMMENT '有效期开始时间',
  valid_to     DATETIME DEFAULT NULL COMMENT '有效期结束时间',
  creator      VARCHAR(64) DEFAULT 'SYSTEM' COMMENT '创建人',
  create_time  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  modifier     VARCHAR(64) DEFAULT 'SYSTEM' COMMENT '修改人',
  modify_time  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (id),
  UNIQUE KEY uq_dict_item (tenant_id, type_code, item_code),
  KEY idx_parent_item (tenant_id, type_code, parent_code),
  KEY idx_sort_status (tenant_id, type_code, sort_no, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据字典明细条目表';

-- 3. 字典变更与发布历史审计表
CREATE TABLE IF NOT EXISTS dict_change_log (
  id              BIGINT NOT NULL COMMENT '主键ID',
  tenant_id       VARCHAR(64) NOT NULL DEFAULT '0' COMMENT '租户ID',
  type_code       VARCHAR(64) NOT NULL COMMENT '字典类型编码',
  version         INT NOT NULL COMMENT '对应发布版本号',
  action_type     VARCHAR(32) NOT NULL COMMENT '操作类型：CREATE_TYPE, ADD_ITEM, UPDATE_ITEM, TOGGLE_ITEM, PUBLISH, ROLLBACK',
  target_code     VARCHAR(64) DEFAULT NULL COMMENT '操作针对的 item_code',
  before_content  JSON DEFAULT NULL COMMENT '变更前快照数据',
  after_content   JSON DEFAULT NULL COMMENT '变更后快照数据',
  operator        VARCHAR(64) NOT NULL COMMENT '操作人姓名或工号',
  operate_time    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作记录时间',
  remark          VARCHAR(512) DEFAULT NULL COMMENT '变更说明或审批单据号',
  PRIMARY KEY (id),
  KEY idx_history (tenant_id, type_code, version),
  KEY idx_time (operate_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典变更审计与发布历史表';

-- 4. 字典草稿暂存表（发布前不影响线上读流量）
CREATE TABLE IF NOT EXISTS dict_draft (
  id             BIGINT NOT NULL COMMENT '主键ID',
  tenant_id      VARCHAR(64) NOT NULL DEFAULT '0' COMMENT '租户ID',
  type_code      VARCHAR(64) NOT NULL COMMENT '字典类型编码',
  item_code      VARCHAR(64) NOT NULL COMMENT '目标条目编码',
  action         VARCHAR(20) NOT NULL COMMENT '暂存操作类型：ADD(新增), UPDATE(更新), TOGGLE_STATUS(启停)',
  draft_content  JSON NOT NULL COMMENT '暂存修改条目完整 JSON 快照',
  created_by     VARCHAR(64) NOT NULL COMMENT '编辑人',
  create_time    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '草稿创建时间',
  PRIMARY KEY (id),
  UNIQUE KEY uq_draft_target (tenant_id, type_code, item_code),
  KEY idx_draft_type (tenant_id, type_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典草稿编辑暂存表';
