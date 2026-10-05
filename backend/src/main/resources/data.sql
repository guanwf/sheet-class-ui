-- ====================================================================
-- 企业级数据字典管理系统 - 初始种子数据 (Seed Data)
-- ====================================================================

-- 1. 初始化 4 类业务字典类型
INSERT INTO dict_type (id, type_code, name, scope, tenant_id, is_builtin, editable, version, status, remark, creator)
VALUES
  (1001, 'CUSTOMER_LEVEL', '客户会员等级', 'PLATFORM', '0', 1, 1, 1, 1, '全平台客户资质与信用分级管理', 'ADMIN'),
  (1002, 'TICKET_TYPE', '工单缺陷类型', 'PLATFORM', '0', 0, 1, 2, 1, '研发与运营售后工单分类体系（树形多层级）', 'ADMIN'),
  (1003, 'CURRENCY_CODE', '国际结算币种', 'PLATFORM', '0', 1, 1, 1, 1, '跨国贸易与供应链金融常用结算货币', 'ADMIN'),
  (1004, 'APPROVAL_NODE_TYPE', '流程审批节点类型', 'PLATFORM', '0', 1, 0, 1, 1, '工作流 BPM 引擎底层控制节点模型', 'ADMIN');

-- 2. 种子数据 1：客户等级 (CUSTOMER_LEVEL)
INSERT INTO dict_item (id, type_code, tenant_id, item_code, parent_code, label_i18n, sort_no, ext, status, valid_from, valid_to, creator)
VALUES
  (2001, 'CUSTOMER_LEVEL', '0', 'LEVEL_NORMAL', NULL, '{"zh-CN":"普通客户","en":"Normal Member"}', 10, '{"discount":1.00,"creditLimit":50000,"badgeColor":"#6B7280"}', 1, '2024-01-01 00:00:00', NULL, 'ADMIN'),
  (2002, 'CUSTOMER_LEVEL', '0', 'LEVEL_SILVER', NULL, '{"zh-CN":"白银客户","en":"Silver Member"}', 20, '{"discount":0.95,"creditLimit":200000,"badgeColor":"#94A3B8"}', 1, '2024-01-01 00:00:00', NULL, 'ADMIN'),
  (2003, 'CUSTOMER_LEVEL', '0', 'LEVEL_GOLD', NULL, '{"zh-CN":"黄金客户","en":"Gold VIP"}', 30, '{"discount":0.90,"creditLimit":500000,"badgeColor":"#F59E0B"}', 1, '2024-01-01 00:00:00', NULL, 'ADMIN'),
  (2004, 'CUSTOMER_LEVEL', '0', 'LEVEL_DIAMOND', NULL, '{"zh-CN":"钻石客户","en":"Diamond Elite"}', 40, '{"discount":0.82,"creditLimit":2000000,"badgeColor":"#1F4FD8"}', 1, '2024-01-01 00:00:00', NULL, 'ADMIN');

-- 3. 种子数据 2：工单类型 (TICKET_TYPE - 树形结构)
INSERT INTO dict_item (id, type_code, tenant_id, item_code, parent_code, label_i18n, sort_no, ext, status, valid_from, valid_to, creator)
VALUES
  (2010, 'TICKET_TYPE', '0', 'BUG', NULL, '{"zh-CN":"系统缺陷","en":"Software Bug"}', 10, '{"slaHours":4,"severityLevel":"HIGH"}', 1, '2024-01-01 00:00:00', NULL, 'ADMIN'),
  (2011, 'TICKET_TYPE', '0', 'BUG_FRONTEND', 'BUG', '{"zh-CN":"前端界面缺陷","en":"Frontend Defect"}', 11, '{"assignGroup":"FE_TEAM","autoAssign":true}', 1, '2024-01-01 00:00:00', NULL, 'ADMIN'),
  (2012, 'TICKET_TYPE', '0', 'BUG_BACKEND', 'BUG', '{"zh-CN":"后端服务缺陷","en":"Backend Issue"}', 12, '{"assignGroup":"BE_TEAM","autoAssign":true}', 1, '2024-01-01 00:00:00', NULL, 'ADMIN'),
  (2013, 'TICKET_TYPE', '0', 'FEATURE', NULL, '{"zh-CN":"需求新功能","en":"New Feature Request"}', 20, '{"slaHours":48,"severityLevel":"NORMAL"}', 1, '2024-01-01 00:00:00', NULL, 'ADMIN'),
  (2014, 'TICKET_TYPE', '0', 'CONSULT', NULL, '{"zh-CN":"业务操作咨询","en":"Consultation & Support"}', 30, '{"slaHours":8,"severityLevel":"LOW"}', 1, '2024-01-01 00:00:00', NULL, 'ADMIN');

-- 4. 种子数据 3：币种 (CURRENCY_CODE)
INSERT INTO dict_item (id, type_code, tenant_id, item_code, parent_code, label_i18n, sort_no, ext, status, valid_from, valid_to, creator)
VALUES
  (2020, 'CURRENCY_CODE', '0', 'CNY', NULL, '{"zh-CN":"人民币","en":"Chinese Yuan"}', 1, '{"symbol":"¥","precision":2,"isoNumber":156}', 1, '2024-01-01 00:00:00', NULL, 'ADMIN'),
  (2021, 'CURRENCY_CODE', '0', 'USD', NULL, '{"zh-CN":"美元","en":"US Dollar"}', 2, '{"symbol":"$","precision":2,"isoNumber":840}', 1, '2024-01-01 00:00:00', NULL, 'ADMIN'),
  (2022, 'CURRENCY_CODE', '0', 'EUR', NULL, '{"zh-CN":"欧元","en":"Euro"}', 3, '{"symbol":"€","precision":2,"isoNumber":978}', 1, '2024-01-01 00:00:00', NULL, 'ADMIN'),
  (2023, 'CURRENCY_CODE', '0', 'HKD', NULL, '{"zh-CN":"港币","en":"Hong Kong Dollar"}', 4, '{"symbol":"HK$","precision":2,"isoNumber":344}', 1, '2024-01-01 00:00:00', NULL, 'ADMIN');

-- 5. 种子数据 4：审批节点类型 (APPROVAL_NODE_TYPE)
INSERT INTO dict_item (id, type_code, tenant_id, item_code, parent_code, label_i18n, sort_no, ext, status, valid_from, valid_to, creator)
VALUES
  (2030, 'APPROVAL_NODE_TYPE', '0', 'START', NULL, '{"zh-CN":"发起人节点","en":"Start Node"}', 1, '{"allowReject":false,"nodeColor":"#10B981"}', 1, '2024-01-01 00:00:00', NULL, 'ADMIN'),
  (2031, 'APPROVAL_NODE_TYPE', '0', 'APPROVER', NULL, '{"zh-CN":"人工审批","en":"User Approval"}', 2, '{"allowReject":true,"multiSign":"ALL_OR_ONE"}', 1, '2024-01-01 00:00:00', NULL, 'ADMIN'),
  (2032, 'APPROVAL_NODE_TYPE', '0', 'CONDITIONAL', NULL, '{"zh-CN":"条件分支","en":"Condition Branch"}', 3, '{"allowReject":false,"evalEngine":"SPEL"}', 1, '2024-01-01 00:00:00', NULL, 'ADMIN'),
  (2033, 'APPROVAL_NODE_TYPE', '0', 'CC', NULL, '{"zh-CN":"抄送知会","en":"Carbon Copy"}', 4, '{"allowReject":false,"asyncNotify":true}', 1, '2024-01-01 00:00:00', NULL, 'ADMIN'),
  (2034, 'APPROVAL_NODE_TYPE', '0', 'END', NULL, '{"zh-CN":"结束归档","en":"End Node"}', 5, '{"allowReject":false,"archiveDoc":true}', 1, '2024-01-01 00:00:00', NULL, 'ADMIN');

-- 6. 初始变更审计日志
INSERT INTO dict_change_log (id, tenant_id, type_code, version, action_type, target_code, before_content, after_content, operator, operate_time, remark)
VALUES
  (3001, '0', 'CUSTOMER_LEVEL', 1, 'PUBLISH', NULL, NULL, '{"total":4,"version":1}', '刘工 (主控管理员)', '2024-01-01 10:00:00', '系统初始基线字典发布上线'),
  (3002, '0', 'TICKET_TYPE', 1, 'PUBLISH', NULL, NULL, '{"total":3,"version":1}', '刘工 (主控管理员)', '2024-01-05 14:30:00', '初始化研发工单类型字典'),
  (3003, '0', 'TICKET_TYPE', 2, 'PUBLISH', 'BUG_FRONTEND', '{"total":3,"version":1}', '{"total":5,"version":2,"diff":"新增 BUG 前后端子节点"}', '刘工 (主控管理员)', '2024-02-10 16:00:00', '工单缺陷分类拆分前后端明细'),
  (3004, '0', 'CURRENCY_CODE', 1, 'PUBLISH', NULL, NULL, '{"total":4,"version":1}', '财务主管', '2024-01-01 10:00:00', '国际结算主流币种初始化'),
  (3005, '0', 'APPROVAL_NODE_TYPE', 1, 'PUBLISH', NULL, NULL, '{"total":5,"version":1}', '系统架构师', '2024-01-01 10:00:00', 'BPM工作流节点元模型发布');
