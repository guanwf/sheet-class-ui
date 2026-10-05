package com.enterprise.dict.starter;

import com.enterprise.dict.cache.DictCacheManager;
import com.enterprise.dict.model.entity.DictItem;
import com.enterprise.dict.model.entity.DictType;
import com.enterprise.dict.service.DictService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 业务系统统一访问 SDK 客户端：
 * 封装 Starter 标准 API，业务工程注入此类使用，不直接读写字典数据库。
 * 支持三级覆盖策略：组织级(ORG) -> 租户级(TENANT) -> 平台基线(PLATFORM)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DictClient {

    private final DictService dictService;
    private final DictCacheManager cacheManager;

    /**
     * 获取指定条目
     *
     * @param typeCode 字典类型编码
     * @param itemCode 条目编码
     * @return DictItem 或 null
     */
    public DictItem get(String typeCode, String itemCode) {
        String currentTenant = getCurrentTenantId();
        List<DictItem> items = list(typeCode);
        return items.stream()
                .filter(item -> item.getItemCode().equals(itemCode))
                .findFirst()
                .orElse(null);
    }

    /**
     * 获取当前上下文有效的全部启用字典项
     * 查询继承顺序：ORG -> TENANT -> PLATFORM（覆盖规则：子级有相同 itemCode 则覆盖父级）
     */
    public List<DictItem> list(String typeCode) {
        String currentTenant = getCurrentTenantId();
        DictType type = dictService.getTypeByCode(currentTenant, typeCode);
        if (type == null) {
            // 降级查询平台级字典类型
            type = dictService.getTypeByCode("0", typeCode);
        }
        if (type == null) {
            log.warn("[DictClient] 未找到字典类型配置: typeCode={}", typeCode);
            return Collections.emptyList();
        }

        // 走缓存获取数据
        List<DictItem> cached = cacheManager.get(type.getTenantId(), type.getTypeCode(), type.getVersion());
        if (cached != null) {
            return cached.stream().filter(i -> i.getStatus() == 1).collect(Collectors.toList());
        }

        // 未命中则从数据库加载并回填缓存
        List<DictItem> dbItems = dictService.getEffectiveItems(type.getTenantId(), typeCode);
        cacheManager.put(type.getTenantId(), typeCode, type.getVersion(), dbItems);

        return dbItems.stream().filter(i -> i.getStatus() == 1).collect(Collectors.toList());
    }

    /**
     * 获取多语言展示标签（支持 zh-CN, en 等）
     */
    public String getLabel(String typeCode, String itemCode, String lang) {
        DictItem item = get(typeCode, itemCode);
        if (item == null) {
            return itemCode;
        }
        try {
            com.alibaba.fastjson2.JSONObject json = com.alibaba.fastjson2.JSON.parseObject(item.getLabelI18n());
            if (json != null && json.containsKey(lang)) {
                return json.getString(lang);
            }
            if (json != null && json.containsKey("zh-CN")) {
                return json.getString("zh-CN");
            }
        } catch (Exception ignored) {}
        return itemCode;
    }

    /**
     * 获取上下文中的租户 ID（结合 ThreadLocal / SecurityContext）
     */
    private String getCurrentTenantId() {
        // 默认为平台租户 '0'，实际中可从多租户上下文获取
        return "0";
    }
}
