-- ====================================================================
-- 打印模板管理数据表 DDL (MySQL 8.0+ / OceanBase 兼容)
-- ====================================================================

CREATE TABLE IF NOT EXISTS pbs_print_template (
  id            BIGINT PRIMARY KEY COMMENT '主键雪花ID',
  module_id     VARCHAR(32)  NOT NULL COMMENT '业务模块，如 order、invoice、return_order',
  template_id   VARCHAR(64)  NOT NULL COMMENT '模板编码',
  template_name VARCHAR(128) NOT NULL COMMENT '模板名称',
  is_default    TINYINT      NOT NULL DEFAULT 0 COMMENT '模块默认模板（1默认 0非默认）',
  version       INT          NOT NULL DEFAULT 1 COMMENT '每次上传+1，用于缓存失效',
  jrxml_path    VARCHAR(256) COMMENT '源文件对象ID（FileObject.id）',
  jasper_path   VARCHAR(256) COMMENT '编译后文件对象ID（FileObject.id）',
  param_schema  TEXT COMMENT '模板参数/字段说明（JSON 文本）',

  flag          TINYINT      NOT NULL DEFAULT 1 COMMENT '1启用 0停用',
  creator       VARCHAR(50) COMMENT '创建人',
  create_time   DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  modifier      VARCHAR(50) COMMENT '修改人',
  modify_time   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  remark        VARCHAR(512) COMMENT '备注',
  UNIQUE KEY uk_module_id (module_id, template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='打印模板管理表';

-- 初始种子数据
INSERT INTO pbs_print_template (id, module_id, template_id, template_name, is_default, version, jrxml_path, jasper_path, param_schema, flag, creator, remark)
VALUES
(8001001, 'order', 'PO_A4_STANDARD', '采购订单标准A4激光套打模板', 1, 3, 'oss://erp-templates/order/PO_A4_STANDARD_v3.jrxml', 'oss://erp-templates/order/PO_A4_STANDARD_v3.jasper', '{"reportTitle":"采购订单标准A4","pageSize":"A4","parameters":[{"name":"docNo","type":"String","required":true,"description":"采购单号"}],"fields":[{"name":"skuCode","type":"String","description":"物料编码"}]}', 1, '刘工', '包含公章与多方签约条款'),
(8001002, 'order', 'PO_TRIPLE_241', '采购订单三联针式连打凭单 (241mm)', 0, 1, 'oss://erp-templates/order/PO_TRIPLE_241_v1.jrxml', 'oss://erp-templates/order/PO_TRIPLE_241_v1.jasper', '{"reportTitle":"采购订单三联单","pageSize":"CONTINUOUS_241"}', 1, '仓储部', '适用于 Epson 630K 针式打印机三联纸'),
(8001003, 'return_order', 'RO_A4_STANDARD', '采购退货单标准A4套打模板', 1, 2, 'oss://erp-templates/return_order/RO_A4_STANDARD_v2.jrxml', 'oss://erp-templates/return_order/RO_A4_STANDARD_v2.jasper', '{"reportTitle":"采购退货单","pageSize":"A4"}', 1, '质检科', '质检留样与退厂返修凭证');
