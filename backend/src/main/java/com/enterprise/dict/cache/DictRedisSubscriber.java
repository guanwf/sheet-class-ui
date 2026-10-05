package com.enterprise.dict.cache;

import com.alibaba.fastjson2.JSON;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

/**
 * 监听 Redis 广播，主动淘汰或加载本地 Caffeine 缓存，不依赖 TTL
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DictRedisSubscriber implements MessageListener {

    private final DictCacheManager cacheManager;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String json = new String(message.getBody(), StandardCharsets.UTF_8);
            DictEventPublisher.DictInvalidateMessage msg = JSON.parseObject(json, DictEventPublisher.DictInvalidateMessage.class);
            if (msg != null) {
                // 淘汰旧版本的本地缓存
                cacheManager.evictLocal(msg.getTenantId(), msg.getTypeCode(), msg.getOldVersion());
                log.info("[DictSubscriber] 收到 Redis 广播，已清除本地旧缓存: typeCode={}, oldV={}, newV={}",
                        msg.getTypeCode(), msg.getOldVersion(), msg.getNewVersion());
            }
        } catch (Exception e) {
            log.error("[DictSubscriber] 处理 Redis 广播消息失败", e);
        }
    }
}
