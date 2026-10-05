package com.enterprise.dict.controller;

import com.enterprise.dict.model.dto.DictItemCreateDTO;
import com.enterprise.dict.model.dto.DictItemUpdateDTO;
import com.enterprise.dict.model.dto.DictTypeCreateDTO;
import com.enterprise.dict.model.entity.DictChangeLog;
import com.enterprise.dict.model.entity.DictDraft;
import com.enterprise.dict.model.entity.DictItem;
import com.enterprise.dict.model.entity.DictType;
import com.enterprise.dict.model.vo.DictUsageVO;
import com.enterprise.dict.service.DictService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 数据字典管理 REST 控制器
 */
@RestController
@RequestMapping("/api/dict")
@RequiredArgsConstructor
public class DictController {

    private final DictService dictService;

    /**
     * 查询字典类型列表
     */
    @GetMapping("/types")
    public ResponseEntity<List<DictType>> listTypes(
            @RequestParam(required = false) String scope,
            @RequestParam(required = false) String keyword,
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "0") String tenantId) {
        return ResponseEntity.ok(dictService.listTypes(scope, keyword, tenantId));
    }

    /**
     * 查询字典类型详情及所属条目（包含草稿状态）
     */
    @GetMapping("/types/{typeCode}/items")
    public ResponseEntity<Map<String, Object>> getItems(
            @PathVariable String typeCode,
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "0") String tenantId) {
        return ResponseEntity.ok(dictService.listItemsWithType(tenantId, typeCode));
    }

    /**
     * 新建字典类型
     */
    @PostMapping("/types")
    public ResponseEntity<DictType> createType(
            @Valid @RequestBody DictTypeCreateDTO dto,
            @RequestHeader(value = "X-Operator", defaultValue = "当前管理员") String operator) {
        return ResponseEntity.ok(dictService.createType(dto, operator));
    }

    /**
     * 新增字典条目（暂存至草稿）
     */
    @PostMapping("/items")
    public ResponseEntity<DictDraft> addItem(
            @Valid @RequestBody DictItemCreateDTO dto,
            @RequestHeader(value = "X-Operator", defaultValue = "当前管理员") String operator) {
        return ResponseEntity.ok(dictService.addItemDraft(dto, operator));
    }

    /**
     * 编辑字典条目（暂存至草稿）
     */
    @PutMapping("/items/{id}")
    public ResponseEntity<DictDraft> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody DictItemUpdateDTO dto,
            @RequestHeader(value = "X-Operator", defaultValue = "当前管理员") String operator) {
        dto.setId(id);
        return ResponseEntity.ok(dictService.updateItemDraft(dto, operator));
    }

    /**
     * 停用/启用条目（暂存至草稿）
     */
    @PostMapping("/items/{id}/toggle")
    public ResponseEntity<DictDraft> toggleItem(
            @PathVariable Long id,
            @RequestHeader(value = "X-Operator", defaultValue = "当前管理员") String operator) {
        return ResponseEntity.ok(dictService.toggleItemStatus(id, operator));
    }

    /**
     * 放弃未发布草稿修改
     */
    @PostMapping("/types/{typeCode}/discard")
    public ResponseEntity<Map<String, Object>> discardDrafts(
            @PathVariable String typeCode,
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "0") String tenantId,
            @RequestHeader(value = "X-Operator", defaultValue = "当前管理员") String operator) {
        dictService.discardDrafts(tenantId, typeCode, operator);
        return ResponseEntity.ok(Map.of("success", true, "message", "已放弃未发布的草稿修改"));
    }

    /**
     * 审批通过后发布生效（版本自增+1并广播）
     */
    @PostMapping("/types/{typeCode}/publish")
    public ResponseEntity<DictType> publish(
            @PathVariable String typeCode,
            @RequestBody(required = false) Map<String, String> body,
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "0") String tenantId,
            @RequestHeader(value = "X-Operator", defaultValue = "当前管理员") String operator) {
        String remark = body != null ? body.get("remark") : "";
        return ResponseEntity.ok(dictService.publishType(tenantId, typeCode, remark, operator));
    }

    /**
     * 版本一键回滚
     */
    @PostMapping("/types/{typeCode}/rollback")
    public ResponseEntity<DictType> rollback(
            @PathVariable String typeCode,
            @RequestParam Integer version,
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "0") String tenantId,
            @RequestHeader(value = "X-Operator", defaultValue = "当前管理员") String operator) {
        return ResponseEntity.ok(dictService.rollbackVersion(tenantId, typeCode, version, operator));
    }

    /**
     * 查询变更与发布历史
     */
    @GetMapping("/types/{typeCode}/history")
    public ResponseEntity<List<DictChangeLog>> getHistory(
            @PathVariable String typeCode,
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "0") String tenantId) {
        return ResponseEntity.ok(dictService.getChangeLogs(tenantId, typeCode));
    }

    /**
     * 引用检查（删除或停用前校验）
     */
    @GetMapping("/types/{typeCode}/usage")
    public ResponseEntity<DictUsageVO> checkUsage(
            @PathVariable String typeCode,
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "0") String tenantId) {
        return ResponseEntity.ok(dictService.checkUsage(tenantId, typeCode));
    }

    /**
     * 批量导入数据（按 type_code + item_code 幂等覆盖或插入）
     */
    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importData(
            @RequestBody List<DictItemCreateDTO> items,
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "0") String tenantId,
            @RequestHeader(value = "X-Operator", defaultValue = "当前管理员") String operator) {
        int count = dictService.importData(tenantId, items, operator);
        return ResponseEntity.ok(Map.of("importedCount", count, "status", "SUCCESS"));
    }

    /**
     * 导出字典数据
     */
    @GetMapping("/export")
    public ResponseEntity<List<DictItem>> exportData(
            @RequestParam String typeCode,
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "0") String tenantId) {
        return ResponseEntity.ok(dictService.exportData(tenantId, typeCode));
    }

    /**
     * 前端批量拉取（ETag 304 缓存优化）
     */
    @GetMapping("/batch")
    public ResponseEntity<?> batchFetch(
            @RequestParam String types,
            @RequestParam(required = false) String versions,
            @RequestHeader(value = "If-None-Match", required = false) String ifNoneMatch,
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "0") String tenantId) {
        List<String> typeList = Arrays.asList(types.split(","));
        Map<String, Integer> versionMap = new HashMap<>();
        if (versions != null) {
            String[] vPairs = versions.split(";");
            for (String pair : vPairs) {
                String[] kv = pair.split(":");
                if (kv.length == 2) {
                    versionMap.put(kv[0], Integer.parseInt(kv[1]));
                }
            }
        }

        Map<String, Object> batchResult = dictService.getBatchDicts(tenantId, typeList, versionMap);
        boolean modified = (boolean) batchResult.get("modified");

        if (!modified && ifNoneMatch != null) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).build();
        }

        String newEtag = "\"" + UUID.randomUUID().toString().substring(0, 8) + "\"";
        return ResponseEntity.ok()
                .header("ETag", newEtag)
                .body(batchResult.get("data"));
    }
}
