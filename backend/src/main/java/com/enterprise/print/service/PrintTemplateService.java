package com.enterprise.print.service;

import com.enterprise.print.model.entity.PrintTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 打印模板业务服务接口
 */
public interface PrintTemplateService {

    /**
     * 查询指定业务模块的打印模板列表
     */
    List<PrintTemplate> listTemplates(String moduleId, String keyword, Integer flag);

    /**
     * 获取指定模块的默认生效模板
     */
    PrintTemplate getDefaultTemplate(String moduleId);

    /**
     * 上传并注册/更新打印模板（上传自动 version + 1，支持提取 param_schema 与自动编译为 .jasper）
     */
    PrintTemplate uploadTemplate(
            String moduleId,
            String templateId,
            String templateName,
            Integer isDefault,
            String remark,
            MultipartFile jrxmlFile,
            MultipartFile jasperFile,
            String operator
    ) throws Exception;

    /**
     * 设置某个模板为模块的唯一默认模板 (事务保证互斥)
     */
    void setDefaultTemplate(Long id, String operator);

    /**
     * 启停模板
     */
    void toggleFlag(Long id, String operator);

    /**
     * 重新编译源 JRXML 模板生成对应版本的 .jasper 执行文件
     */
    PrintTemplate recompileTemplate(Long id, String operator) throws Exception;

    /**
     * 更新模板参数说明契约
     */
    void updateParamSchema(Long id, String paramSchema, String operator);

    /**
     * 删除模板 (默认模板禁止删除)
     */
    void deleteTemplate(Long id);
}
