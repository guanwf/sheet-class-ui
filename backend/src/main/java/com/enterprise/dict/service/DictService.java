package com.enterprise.dict.service;

import com.enterprise.dict.model.dto.DictItemCreateDTO;
import com.enterprise.dict.model.dto.DictItemUpdateDTO;
import com.enterprise.dict.model.dto.DictTypeCreateDTO;
import com.enterprise.dict.model.entity.DictChangeLog;
import com.enterprise.dict.model.entity.DictDraft;
import com.enterprise.dict.model.entity.DictItem;
import com.enterprise.dict.model.entity.DictType;
import com.enterprise.dict.model.vo.DictUsageVO;

import java.util.List;
import java.util.Map;

/**
 * 数据字典业务服务接口
 */
public interface DictService {

    /** 查询字典类型列表 */
    List<DictType> listTypes(String scope, String keyword, String tenantId);

    /** 根据编码获取字典类型 */
    DictType getTypeByCode(String tenantId, String typeCode);

    /** 创建字典类型 */
    DictType createType(DictTypeCreateDTO dto, String operator);

    /** 查询指定类型的当前生效条目列表（附带未发布的草稿状态标记） */
    Map<String, Object> listItemsWithType(String tenantId, String typeCode);

    /** 获取底层已发布的生效条目（供 DictClient 缓存） */
    List<DictItem> getEffectiveItems(String tenantId, String typeCode);

    /** 新增字典条目（先写入草稿） */
    DictDraft addItemDraft(DictItemCreateDTO dto, String operator);

    /** 编辑字典条目（写入草稿） */
    DictDraft updateItemDraft(DictItemUpdateDTO dto, String operator);

    /** 停用/启用条目（写入草稿） */
    DictDraft toggleItemStatus(Long id, String operator);

    /** 放弃修改（清空草稿） */
    void discardDrafts(String tenantId, String typeCode, String operator);

    /** 审批并发布（草稿生效，版本号+1，广播清缓存） */
    DictType publishType(String tenantId, String typeCode, String remark, String operator);

    /** 版本一键回滚 */
    DictType rollbackVersion(String tenantId, String typeCode, Integer targetVersion, String operator);

    /** 获取版本变更历史 */
    List<DictChangeLog> getChangeLogs(String tenantId, String typeCode);

    /** 字典引用检查 */
    DictUsageVO checkUsage(String tenantId, String typeCode);

    /** 批量拉取字典条目（支持 ETag 304） */
    Map<String, Object> getBatchDicts(String tenantId, List<String> types, Map<String, Integer> versions);

    /** 批量导入字典数据（幂等更新） */
    int importData(String tenantId, List<DictItemCreateDTO> items, String operator);

    /** 导出字典数据 */
    List<DictItem> exportData(String tenantId, String typeCode);
}
