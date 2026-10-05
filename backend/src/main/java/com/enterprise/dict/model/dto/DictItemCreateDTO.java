package com.enterprise.dict.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 新增字典条目入参（直接写入草稿表）
 */
@Data
public class DictItemCreateDTO {

    @NotBlank(message = "字典类型编码不能为空")
    private String typeCode;

    private String tenantId = "0";

    @NotBlank(message = "条目编码不能为空")
    private String itemCode;

    private String parentCode;

    @NotBlank(message = "多语言配置不能为空")
    private String labelI18n; // JSON 字符串

    private Integer sortNo = 0;

    private String ext; // 扩展属性 JSON 字符串

    private Integer status = 1;

    private String validFrom;

    private String validTo;
}
