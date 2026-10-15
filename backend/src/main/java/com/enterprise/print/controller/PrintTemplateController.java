package com.enterprise.print.controller;

import com.enterprise.print.model.entity.PrintTemplate;
import com.enterprise.print.service.PrintTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 打印模板管理 REST 控制器
 */
@RestController
@RequestMapping("/api/print/templates")
@RequiredArgsConstructor
public class PrintTemplateController {

    private final PrintTemplateService templateService;

    /**
     * 查询模板列表
     */
    @GetMapping
    public ResponseEntity<List<PrintTemplate>> list(
            @RequestParam(required = false) String moduleId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "-1") Integer flag) {
        return ResponseEntity.ok(templateService.listTemplates(moduleId, keyword, flag));
    }

    /**
     * 获取指定模块的默认生效模板
     */
    @GetMapping("/default")
    public ResponseEntity<PrintTemplate> getDefault(@RequestParam String moduleId) {
        return ResponseEntity.ok(templateService.getDefaultTemplate(moduleId));
    }

    /**
     * 上传/发布打印模板 (自动 version + 1 与后台编译)
     */
    @PostMapping("/upload")
    public ResponseEntity<PrintTemplate> upload(
            @RequestParam String moduleId,
            @RequestParam String templateId,
            @RequestParam String templateName,
            @RequestParam(required = false, defaultValue = "0") Integer isDefault,
            @RequestParam(required = false) String remark,
            @RequestParam(required = false) MultipartFile jrxmlFile,
            @RequestParam(required = false) MultipartFile jasperFile,
            @RequestHeader(value = "X-Operator", defaultValue = "系统操作员") String operator) throws Exception {
        return ResponseEntity.ok(templateService.uploadTemplate(
                moduleId, templateId, templateName, isDefault, remark, jrxmlFile, jasperFile, operator));
    }

    /**
     * 设为模块默认模板
     */
    @PostMapping("/{id}/default")
    public ResponseEntity<Map<String, Object>> setDefault(
            @PathVariable Long id,
            @RequestHeader(value = "X-Operator", defaultValue = "系统操作员") String operator) {
        templateService.setDefaultTemplate(id, operator);
        return ResponseEntity.ok(Map.of("success", true, "message", "已成功设为模块默认模板"));
    }

    /**
     * 启停模板
     */
    @PostMapping("/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggle(
            @PathVariable Long id,
            @RequestHeader(value = "X-Operator", defaultValue = "系统操作员") String operator) {
        templateService.toggleFlag(id, operator);
        return ResponseEntity.ok(Map.of("success", true, "message", "模板状态已切换"));
    }

    /**
     * 重新编译模板
     */
    @PostMapping("/{id}/recompile")
    public ResponseEntity<PrintTemplate> recompile(
            @PathVariable Long id,
            @RequestHeader(value = "X-Operator", defaultValue = "系统操作员") String operator) throws Exception {
        return ResponseEntity.ok(templateService.recompileTemplate(id, operator));
    }

    /**
     * 更新模板参数说明契约 (param_schema)
     */
    @PutMapping("/{id}/schema")
    public ResponseEntity<Map<String, Object>> updateSchema(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-Operator", defaultValue = "系统操作员") String operator) {
        String schema = body.get("paramSchema");
        templateService.updateParamSchema(id, schema, operator);
        return ResponseEntity.ok(Map.of("success", true, "message", "参数契约已更新"));
    }

    /**
     * 删除模板
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "模板已删除"));
    }
}
