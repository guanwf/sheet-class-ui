package com.enterprise.dict.cache;

import com.alibaba.fastjson2.JSON;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.io.Serializable;

/**
 * 变更广播器：发布版本升级事件，结合 Spring 内部事件与 Redis Pub/Sub 实现跨节点无延迟同步
 */
@Slf4j
@Component
public class DictEventPublisher {

    private final ApplicationEventPublisher springPublisher;
    private final StringRedisTemplate redisTemplate;
    private final String redisChannel;

    public DictEventPublisher(ApplicationEventPublisher springPublisher,
                              StringRedisTemplate redisTemplate,
                              @Value("${dict.broadcast.redis-channel:enterprise:dict:sync:channel}") String redisChannel) {
        this.springPublisher = springPublisher;
        this.redisTemplate = redisTemplate;
        this.redisChannel = redisChannel;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DictInvalidateMessage implements Serializable {
        private String tenantId;
        private String typeCode;
        private Integer oldVersion;
        private Integer newVersion;
        private String eventType; // PUBLISH / ROLLBACK
    }

    /**
     * 广播字典失效与版本升级消息
     */
    public void publishInvalidate(String tenantId, String typeCode, Integer oldVersion, Integer newVersion, String eventType) {
        DictInvalidateMessage msg = new DictInvalidateMessage(tenantId, typeCode, oldVersion, newVersion, eventType);

        // 1. 发送 Spring 本地事件
        springPublisher.publishEvent(msg);

        // 2. 发送 Redis Pub/Sub 分布式广播
        try {
            redisTemplate.convertAndSend(redisChannel, JSON.toJSONString(msg));
            log.info("[Dict广播] 成功广播字典失效消息: tenant={}, type={}, version={}->{}",
                    tenantId, typeCode, oldVersion, newVersion);
        } catch (Exception e) {
            log.error("[Dict广播] Redis 广播失败", e);
        }
    }
}
