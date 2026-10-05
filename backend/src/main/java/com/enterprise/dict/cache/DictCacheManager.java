package com.enterprise.dict.cache;

import com.alibaba.fastjson2.JSON;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.enterprise.dict.model.entity.DictItem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 字典二级缓存管理器：
 * L1: Caffeine 高性能本地堆内缓存
 * L2: Redis 分布式集群共享缓存 (Key: dict:cache:{tenant}:{typeCode}:{version})
 */
@Slf4j
@Component
public class DictCacheManager {

    private final StringRedisTemplate redisTemplate;
    private final Cache<String, List<DictItem>> localCache;

    public DictCacheManager(StringRedisTemplate redisTemplate,
                            @Value("${dict.cache.local-max-size:10000}") int maxSize,
                            @Value("${dict.cache.local-expire-after-write-minutes:60}") int expireMinutes) {
        this.redisTemplate = redisTemplate;
        this.localCache = Caffeine.newBuilder()
                .maximumSize(maxSize)
                .expireAfterWrite(expireMinutes, TimeUnit.MINUTES)
                .recordStats()
                .build();
    }

    private String buildCacheKey(String tenantId, String typeCode, Integer version) {
        return "dict:cache:" + (tenantId != null ? tenantId : "0") + ":" + typeCode + ":v" + version;
    }

    /**
     * 获取字典项列表（先查本地 Caffeine，未命中查 Redis，回填本地）
     */
    public List<DictItem> get(String tenantId, String typeCode, Integer version) {
        String key = buildCacheKey(tenantId, typeCode, version);

        // 1. L1 Caffeine 查询
        List<DictItem> cached = localCache.getIfPresent(key);
        if (cached != null) {
            return cached;
        }

        // 2. L2 Redis 查询
        try {
            String redisVal = redisTemplate.opsForValue().get(key);
            if (redisVal != null) {
                List<DictItem> items = JSON.parseArray(redisVal, DictItem.class);
                localCache.put(key, items);
                return items;
            }
        } catch (Exception e) {
            log.warn("Redis 二级缓存读取失败: key={}", key, e);
        }

        return null;
    }

    /**
     * 写入二级缓存
     */
    public void put(String tenantId, String typeCode, Integer version, List<DictItem> items) {
        if (items == null) {
            items = Collections.emptyList();
        }
        String key = buildCacheKey(tenantId, typeCode, version);
        localCache.put(key, items);

        try {
            // Redis 缓存持久化（发布时主动刷新，无强 TTL 依赖）
            redisTemplate.opsForValue().set(key, JSON.toJSONString(items), 7, TimeUnit.DAYS);
        } catch (Exception e) {
            log.warn("Redis 二级缓存写入失败: key={}", key, e);
        }
    }

    /**
     * 淘汰本地缓存（收到 MQ 或 Redis Pub/Sub 广播时触发）
     */
    public void evictLocal(String tenantId, String typeCode, Integer version) {
        String key = buildCacheKey(tenantId, typeCode, version);
        localCache.invalidate(key);
        log.info("[Caffeine] 已淘汰本地缓存: {}", key);
    }
}
