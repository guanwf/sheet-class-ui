package com.enterprise.dict.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * 创建字典类型入参
 */
@Data
public class DictTypeCreateDTO {

    @NotBlank(message = "类型编码不能为空")
    @Pattern(regexp = "^[A-Z0-9_]{2,64}$", message = "类型编码必须为2-64位大写英文字母、数字或下划线")
    private String typeCode;

    @NotBlank(message = "类型名称不能为空")
    private String name;

    @NotBlank(message = "作用范围不能为空")
    private String scope; // PLATFORM / TENANT / ORG

    private String tenantId = "0";

    private Integer isBuiltin = 0;

    private Integer editable = 1;

    private String remark;
}
