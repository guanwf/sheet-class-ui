package com.enterprise.dict.starter;

import com.enterprise.dict.model.entity.DictItem;
import com.enterprise.dict.service.DictService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 容器启动校验器：
 * 验证工程硬编码核心枚举是否在字典中全部存在，缺失则打印 ERROR 告警，保障静态数据与运行时代码强一致性。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DictStartupValidator implements ApplicationRunner {

    private final DictService dictService;

    // 示例：系统中必须存在的核心客户等级代码
    private static final String REQUIRED_TYPE = "CUSTOMER_LEVEL";
    private static final Set<String> CORE_CODES = Set.of(
            "LEVEL_NORMAL",
            "LEVEL_SILVER",
            "LEVEL_GOLD",
            "LEVEL_DIAMOND"
    );

    @Override
    public void run(ApplicationArguments args) {
        log.info("[DictValidator] 启动执行静态数据字典基线强校验...");
        try {
            List<DictItem> items = dictService.getEffectiveItems("0", REQUIRED_TYPE);
            Set<String> existingCodes = items.stream().map(DictItem::getItemCode).collect(Collectors.toSet());

            for (String code : CORE_CODES) {
                if (!existingCodes.contains(code)) {
                    log.error("[CRITICAL WARNING] 代码核心枚举项 [{}] 在字典 [{}] 中缺失！请及时补齐！", code, REQUIRED_TYPE);
                }
            }
            log.info("[DictValidator] 静态字典基线检查通过，共检测 {} 个核心项。", CORE_CODES.size());
        } catch (Exception e) {
            log.warn("[DictValidator] 启动字典校验异常 (可能在首次初始化建表阶段): {}", e.getMessage());
        }
    }
}
