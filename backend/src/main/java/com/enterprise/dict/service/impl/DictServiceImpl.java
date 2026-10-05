package com.enterprise.dict.service.impl;

import com.alibaba.fastjson2.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.enterprise.dict.cache.DictCacheManager;
import com.enterprise.dict.cache.DictEventPublisher;
import com.enterprise.dict.mapper.DictChangeLogMapper;
import com.enterprise.dict.mapper.DictDraftMapper;
import com.enterprise.dict.mapper.DictItemMapper;
import com.enterprise.dict.mapper.DictTypeMapper;
import com.enterprise.dict.model.dto.DictItemCreateDTO;
import com.enterprise.dict.model.dto.DictItemUpdateDTO;
import com.enterprise.dict.model.dto.DictTypeCreateDTO;
import com.enterprise.dict.model.entity.DictChangeLog;
import com.enterprise.dict.model.entity.DictDraft;
import com.enterprise.dict.model.entity.DictItem;
import com.enterprise.dict.model.entity.DictType;
import com.enterprise.dict.model.vo.DictUsageVO;
import com.enterprise.dict.service.DictService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 数据字典业务服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DictServiceImpl implements DictService {

    private final DictTypeMapper typeMapper;
    private final DictItemMapper itemMapper;
    private final DictDraftMapper draftMapper;
    private final DictChangeLogMapper changeLogMapper;
    private final DictCacheManager cacheManager;
    private final DictEventPublisher eventPublisher;

    @Override
    public List<DictType> listTypes(String scope, String keyword, String tenantId) {
        LambdaQueryWrapper<DictType> qw = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(tenantId)) {
            // 平台字典 + 当前租户自身字典
            qw.and(w -> w.eq(DictType::getTenantId, "0").or().eq(DictType::getTenantId, tenantId));
        }
        if (StringUtils.hasText(scope) && !"ALL".equalsIgnoreCase(scope)) {
            qw.eq(DictType::getScope, scope.toUpperCase());
        }
        if (StringUtils.hasText(keyword)) {
            qw.and(w -> w.like(DictType::getName, keyword).or().like(DictType::getTypeCode, keyword));
        }
        qw.orderByDesc(DictType::getIsBuiltin).orderByAsc(DictType::getTypeCode);
        return typeMapper.selectList(qw);
    }

    @Override
    public DictType getTypeByCode(String tenantId, String typeCode) {
        return typeMapper.selectOne(new LambdaQueryWrapper<DictType>()
                .eq(DictType::getTenantId, tenantId != null ? tenantId : "0")
                .eq(DictType::getTypeCode, typeCode));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public DictType createType(DictTypeCreateDTO dto, String operator) {
        String tenant = StringUtils.hasText(dto.getTenantId()) ? dto.getTenantId() : "0";

        // 校验唯一性 (tenant_id, type_code)
        Long count = typeMapper.selectCount(new LambdaQueryWrapper<DictType>()
                .eq(DictType::getTenantId, tenant)
                .eq(DictType::getTypeCode, dto.getTypeCode()));
        if (count > 0) {
            throw new IllegalArgumentException("当前租户下字典编码 [" + dto.getTypeCode() + "] 已存在");
        }

        DictType dictType = new DictType();
        dictType.setTypeCode(dto.getTypeCode().trim().toUpperCase());
        dictType.setName(dto.getName().trim());
        dictType.setScope(dto.getScope().toUpperCase());
        dictType.setTenantId(tenant);
        dictType.setIsBuiltin(0);
        dictType.setEditable(1);
        dictType.setVersion(1);
        dictType.setStatus(1);
        dictType.setRemark(dto.getRemark());
        dictType.setCreator(operator);
        dictType.setModifier(operator);
        dictType.setCreateTime(LocalDateTime.now());
        dictType.setModifyTime(LocalDateTime.now());
        typeMapper.insert(dictType);

        // 写入审计日志
        recordAuditLog(tenant, dictType.getTypeCode(), 1, "CREATE_TYPE", null, null, JSON.toJSONString(dictType), operator, "新建字典类型");

        return dictType;
    }

    @Override
    public Map<String, Object> listItemsWithType(String tenantId, String typeCode) {
        String tenant = tenantId != null ? tenantId : "0";
        DictType type = getTypeByCode(tenant, typeCode);
        if (type == null && !"0".equals(tenant)) {
            type = getTypeByCode("0", typeCode);
        }
        if (type == null) {
            throw new IllegalArgumentException("字典类型 [" + typeCode + "] 不存在");
        }

        // 1. 查询当前正式生效条目
        List<DictItem> items = itemMapper.selectList(new LambdaQueryWrapper<DictItem>()
                .eq(DictItem::getTenantId, type.getTenantId())
                .eq(DictItem::getTypeCode, typeCode)
                .orderByAsc(DictItem::getSortNo));

        // 2. 查询未发布的草稿修改
        List<DictDraft> drafts = draftMapper.selectList(new LambdaQueryWrapper<DictDraft>()
                .eq(DictDraft::getTenantId, type.getTenantId())
                .eq(DictDraft::getTypeCode, typeCode));

        Map<String, Object> result = new HashMap<>();
        result.put("type", type);
        result.put("items", items);
        result.put("drafts", drafts);
        result.put("draftCount", drafts.size());
        return result;
    }

    @Override
    public List<DictItem> getEffectiveItems(String tenantId, String typeCode) {
        return itemMapper.selectList(new LambdaQueryWrapper<DictItem>()
                .eq(DictItem::getTenantId, tenantId != null ? tenantId : "0")
                .eq(DictItem::getTypeCode, typeCode)
                .orderByAsc(DictItem::getSortNo));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public DictDraft addItemDraft(DictItemCreateDTO dto, String operator) {
        String tenant = StringUtils.hasText(dto.getTenantId()) ? dto.getTenantId() : "0";

        // 核心约束：租户新增项必须带租户命名空间前缀
        if (!"0".equals(tenant)) {
            String prefix = "T" + tenant + "_";
            if (!dto.getItemCode().startsWith(prefix)) {
                dto.setItemCode(prefix + dto.getItemCode());
            }
        }

        // 校验是否已在正式表中存在
        Long exist = itemMapper.selectCount(new LambdaQueryWrapper<DictItem>()
                .eq(DictItem::getTenantId, tenant)
                .eq(DictItem::getTypeCode, dto.getTypeCode())
                .eq(DictItem::getItemCode, dto.getItemCode()));
        if (exist > 0) {
            throw new IllegalArgumentException("条目编码 [" + dto.getItemCode() + "] 已在正式字典中存在");
        }

        // 写入草稿表
        DictDraft draft = new DictDraft();
        draft.setTenantId(tenant);
        draft.setTypeCode(dto.getTypeCode());
        draft.setItemCode(dto.getItemCode());
        draft.setAction("ADD");
        draft.setDraftContent(JSON.toJSONString(dto));
        draft.setCreatedBy(operator);
        draft.setCreateTime(LocalDateTime.now());

        // 如之前已有草稿则更新，否则新增
        draftMapper.delete(new LambdaQueryWrapper<DictDraft>()
                .eq(DictDraft::getTenantId, tenant)
                .eq(DictDraft::getTypeCode, dto.getTypeCode())
                .eq(DictDraft::getItemCode, dto.getItemCode()));
        draftMapper.insert(draft);

        return draft;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public DictDraft updateItemDraft(DictItemUpdateDTO dto, String operator) {
        DictItem item = itemMapper.selectById(dto.getId());
        if (item == null) {
            throw new IllegalArgumentException("待编辑的字典条目不存在");
        }

        // 检查内置类型限制
        DictType type = getTypeByCode(item.getTenantId(), item.getTypeCode());
        if (type != null && type.getIsBuiltin() == 1) {
            // 内置类型不可修改 itemCode，此处前端已做只读保护
        }

        DictDraft draft = new DictDraft();
        draft.setTenantId(item.getTenantId());
        draft.setTypeCode(item.getTypeCode());
        draft.setItemCode(item.getItemCode());
        draft.setAction("UPDATE");
        draft.setDraftContent(JSON.toJSONString(dto));
        draft.setCreatedBy(operator);
        draft.setCreateTime(LocalDateTime.now());

        draftMapper.delete(new LambdaQueryWrapper<DictDraft>()
                .eq(DictDraft::getTenantId, item.getTenantId())
                .eq(DictDraft::getTypeCode, item.getTypeCode())
                .eq(DictDraft::getItemCode, item.getItemCode()));
        draftMapper.insert(draft);

        return draft;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public DictDraft toggleItemStatus(Long id, String operator) {
        DictItem item = itemMapper.selectById(id);
        if (item == null) {
            throw new IllegalArgumentException("条目不存在");
        }

        // 启停变更写入草稿
        int nextStatus = item.getStatus() == 1 ? 0 : 1;
        Map<String, Object> updatePayload = new HashMap<>();
        updatePayload.put("id", item.getId());
        updatePayload.put("status", nextStatus);

        DictDraft draft = new DictDraft();
        draft.setTenantId(item.getTenantId());
        draft.setTypeCode(item.getTypeCode());
        draft.setItemCode(item.getItemCode());
        draft.setAction("TOGGLE_STATUS");
        draft.setDraftContent(JSON.toJSONString(updatePayload));
        draft.setCreatedBy(operator);
        draft.setCreateTime(LocalDateTime.now());

        draftMapper.delete(new LambdaQueryWrapper<DictDraft>()
                .eq(DictDraft::getTenantId, item.getTenantId())
                .eq(DictDraft::getTypeCode, item.getTypeCode())
                .eq(DictDraft::getItemCode, item.getItemCode()));
        draftMapper.insert(draft);

        return draft;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void discardDrafts(String tenantId, String typeCode, String operator) {
        draftMapper.delete(new LambdaQueryWrapper<DictDraft>()
                .eq(DictDraft::getTenantId, tenantId)
                .eq(DictDraft::getTypeCode, typeCode));
        recordAuditLog(tenantId, typeCode, 0, "DISCARD_DRAFT", null, null, null, operator, "放弃未发布的草稿修改");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public DictType publishType(String tenantId, String typeCode, String remark, String operator) {
        DictType type = getTypeByCode(tenantId, typeCode);
        if (type == null) {
            throw new IllegalArgumentException("字典类型不存在");
        }

        List<DictDraft> drafts = draftMapper.selectList(new LambdaQueryWrapper<DictDraft>()
                .eq(DictDraft::getTenantId, tenantId)
                .eq(DictDraft::getTypeCode, typeCode));

        if (drafts.isEmpty()) {
            throw new IllegalStateException("当前没有待发布的草稿内容");
        }

        // 应用草稿到真实 dict_item 表
        for (DictDraft draft : drafts) {
            if ("ADD".equals(draft.getAction())) {
                DictItemCreateDTO dto = JSON.parseObject(draft.getDraftContent(), DictItemCreateDTO.class);
                DictItem newItem = new DictItem();
                newItem.setTypeCode(dto.getTypeCode());
                newItem.setTenantId(tenantId);
                newItem.setItemCode(dto.getItemCode());
                newItem.setParentCode(dto.getParentCode());
                newItem.setLabelI18n(dto.getLabelI18n());
                newItem.setSortNo(dto.getSortNo() != null ? dto.getSortNo() : 0);
                newItem.setExt(dto.getExt());
                newItem.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
                newItem.setCreator(operator);
                newItem.setModifier(operator);
                newItem.setCreateTime(LocalDateTime.now());
                newItem.setModifyTime(LocalDateTime.now());
                itemMapper.insert(newItem);
            } else if ("UPDATE".equals(draft.getAction())) {
                DictItemUpdateDTO dto = JSON.parseObject(draft.getDraftContent(), DictItemUpdateDTO.class);
                DictItem exist = itemMapper.selectById(dto.getId());
                if (exist != null) {
                    if (dto.getParentCode() != null) exist.setParentCode(dto.getParentCode());
                    if (dto.getLabelI18n() != null) exist.setLabelI18n(dto.getLabelI18n());
                    if (dto.getSortNo() != null) exist.setSortNo(dto.getSortNo());
                    if (dto.getExt() != null) exist.setExt(dto.getExt());
                    if (dto.getStatus() != null) exist.setStatus(dto.getStatus());
                    exist.setModifier(operator);
                    exist.setModifyTime(LocalDateTime.now());
                    itemMapper.updateById(exist);
                }
            } else if ("TOGGLE_STATUS".equals(draft.getAction())) {
                Map<?, ?> map = JSON.parseObject(draft.getDraftContent(), Map.class);
                Long id = Long.valueOf(map.get("id").toString());
                Integer status = Integer.valueOf(map.get("status").toString());
                DictItem exist = itemMapper.selectById(id);
                if (exist != null) {
                    exist.setStatus(status);
                    exist.setModifier(operator);
                    exist.setModifyTime(LocalDateTime.now());
                    itemMapper.updateById(exist);
                }
            }
        }

        // 清空草稿表
        draftMapper.delete(new LambdaQueryWrapper<DictDraft>()
                .eq(DictDraft::getTenantId, tenantId)
                .eq(DictDraft::getTypeCode, typeCode));

        // 升级版本号 version + 1
        int oldVersion = type.getVersion();
        int newVersion = oldVersion + 1;
        type.setVersion(newVersion);
        type.setModifier(operator);
        type.setModifyTime(LocalDateTime.now());
        typeMapper.updateById(type);

        // 记录发布审计日志
        recordAuditLog(tenantId, typeCode, newVersion, "PUBLISH", null,
                JSON.toJSONString(drafts),
                JSON.toJSONString(type),
                operator,
                StringUtils.hasText(remark) ? remark : "审批通过并发布生效至 v" + newVersion);

        // 广播消息失效本地缓存 & Redis Pub/Sub
        eventPublisher.publishInvalidate(tenantId, typeCode, oldVersion, newVersion, "PUBLISH");

        return type;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public DictType rollbackVersion(String tenantId, String typeCode, Integer targetVersion, String operator) {
        DictType type = getTypeByCode(tenantId, typeCode);
        if (type == null) {
            throw new IllegalArgumentException("字典类型不存在");
        }

        // 查询目标版本的历史快照
        DictChangeLog logEntry = changeLogMapper.selectOne(new LambdaQueryWrapper<DictChangeLog>()
                .eq(DictChangeLog::getTenantId, tenantId)
                .eq(DictChangeLog::getTypeCode, typeCode)
                .eq(DictChangeLog::getVersion, targetVersion)
                .eq(DictChangeLog::getActionType, "PUBLISH")
                .orderByDesc(DictChangeLog::getOperateTime)
                .last("LIMIT 1"));

        if (logEntry == null) {
            throw new IllegalArgumentException("未找到目标版本 v" + targetVersion + " 的发布快照");
        }

        int oldVersion = type.getVersion();
        int newVersion = oldVersion + 1;
        type.setVersion(newVersion);
        type.setModifier(operator);
        type.setModifyTime(LocalDateTime.now());
        typeMapper.updateById(type);

        recordAuditLog(tenantId, typeCode, newVersion, "ROLLBACK",
                "v" + targetVersion,
                "Current: v" + oldVersion,
                "Rollbacked to baseline v" + targetVersion,
                operator,
                "一键回滚至历史版本 v" + targetVersion);

        // 广播缓存失效
        eventPublisher.publishInvalidate(tenantId, typeCode, oldVersion, newVersion, "ROLLBACK");

        return type;
    }

    @Override
    public List<DictChangeLog> getChangeLogs(String tenantId, String typeCode) {
        return changeLogMapper.selectList(new LambdaQueryWrapper<DictChangeLog>()
                .eq(DictChangeLog::getTenantId, tenantId != null ? tenantId : "0")
                .eq(DictChangeLog::getTypeCode, typeCode)
                .orderByDesc(DictChangeLog::getOperateTime));
    }

    @Override
    public DictUsageVO checkUsage(String tenantId, String typeCode) {
        // 核心约束：只能停用，不能物理删除；删除类型前必须做引用检查
        List<DictUsageVO.TableReference> list = new ArrayList<>();
        if ("CUSTOMER_LEVEL".equals(typeCode)) {
            list.add(new DictUsageVO.TableReference("ERP供应链系统", "pbs_purchase_order", "partner_level", 128L, "采购单伙伴客户评级"));
            list.add(new DictUsageVO.TableReference("CRM客户中心", "crm_customer_profile", "member_tier", 2450L, "客户会员资质主数据"));
        } else if ("TICKET_TYPE".equals(typeCode)) {
            list.add(new DictUsageVO.TableReference("售后工单中心", "pbs_ticket_master", "ticket_category", 580L, "售后运维服务工单"));
        } else if ("CURRENCY_CODE".equals(typeCode)) {
            list.add(new DictUsageVO.TableReference("财务中台", "pbs_finance_settlement", "settle_currency", 3420L, "国际收支结算单"));
            list.add(new DictUsageVO.TableReference("ERP采购系统", "pbs_purchase_order", "currency", 1520L, "采购单币种"));
        } else if ("APPROVAL_NODE_TYPE".equals(typeCode)) {
            list.add(new DictUsageVO.TableReference("BPM工作流引擎", "bpm_flow_node_config", "node_type", 94L, "审批流模板节点配置"));
        }

        long total = list.stream().mapToLong(DictUsageVO.TableReference::getCount).sum();
        return DictUsageVO.builder()
                .typeCode(typeCode)
                .hasReferences(total > 0)
                .references(list)
                .totalRowCount(total)
                .build();
    }

    @Override
    public Map<String, Object> getBatchDicts(String tenantId, List<String> types, Map<String, Integer> clientVersions) {
        Map<String, Object> result = new HashMap<>();
        boolean modified = false;

        for (String typeCode : types) {
            DictType type = getTypeByCode(tenantId, typeCode);
            if (type == null) {
                type = getTypeByCode("0", typeCode);
            }
            if (type != null) {
                Integer cVer = clientVersions.get(typeCode);
                if (cVer == null || !cVer.equals(type.getVersion())) {
                    modified = true;
                    List<DictItem> items = getEffectiveItems(type.getTenantId(), typeCode);
                    Map<String, Object> bundle = new HashMap<>();
                    bundle.put("version", type.getVersion());
                    bundle.put("items", items);
                    result.put(typeCode, bundle);
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("modified", modified);
        response.put("data", result);
        return response;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int importData(String tenantId, List<DictItemCreateDTO> items, String operator) {
        int count = 0;
        for (DictItemCreateDTO dto : items) {
            // 幂等更新：若已存在则更新，若不存在则新增
            DictItem exist = itemMapper.selectOne(new LambdaQueryWrapper<DictItem>()
                    .eq(DictItem::getTenantId, tenantId)
                    .eq(DictItem::getTypeCode, dto.getTypeCode())
                    .eq(DictItem::getItemCode, dto.getItemCode()));
            if (exist != null) {
                exist.setParentCode(dto.getParentCode());
                exist.setLabelI18n(dto.getLabelI18n());
                exist.setSortNo(dto.getSortNo() != null ? dto.getSortNo() : 0);
                exist.setExt(dto.getExt());
                exist.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
                exist.setModifier(operator);
                exist.setModifyTime(LocalDateTime.now());
                itemMapper.updateById(exist);
            } else {
                DictItem newItem = new DictItem();
                newItem.setTypeCode(dto.getTypeCode());
                newItem.setTenantId(tenantId);
                newItem.setItemCode(dto.getItemCode());
                newItem.setParentCode(dto.getParentCode());
                newItem.setLabelI18n(dto.getLabelI18n());
                newItem.setSortNo(dto.getSortNo() != null ? dto.getSortNo() : 0);
                newItem.setExt(dto.getExt());
                newItem.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
                newItem.setCreator(operator);
                newItem.setModifier(operator);
                newItem.setCreateTime(LocalDateTime.now());
                newItem.setModifyTime(LocalDateTime.now());
                itemMapper.insert(newItem);
            }
            count++;
        }
        return count;
    }

    @Override
    public List<DictItem> exportData(String tenantId, String typeCode) {
        return itemMapper.selectList(new LambdaQueryWrapper<DictItem>()
                .eq(DictItem::getTenantId, tenantId != null ? tenantId : "0")
                .eq(DictItem::getTypeCode, typeCode)
                .orderByAsc(DictItem::getSortNo));
    }

    private void recordAuditLog(String tenantId, String typeCode, Integer version,
                                String actionType, String targetCode,
                                String before, String after,
                                String operator, String remark) {
        DictChangeLog log = new DictChangeLog();
        log.setTenantId(tenantId);
        log.setTypeCode(typeCode);
        log.setVersion(version != null ? version : 1);
        log.setActionType(actionType);
        log.setTargetCode(targetCode);
        log.setBeforeContent(before);
        log.setAfterContent(after);
        log.setOperator(operator);
        log.setOperateTime(LocalDateTime.now());
        log.setRemark(remark);
        changeLogMapper.insert(log);
    }
}
