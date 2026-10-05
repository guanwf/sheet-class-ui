package com.enterprise.dict.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 修改字典条目入参（编码只读，更新写入草稿表）
 */
@Data
public class DictItemUpdateDTO {

    @NotNull(message = "ID不能为空")
    private Long id;

    private String parentCode;

    private String labelI18n;

    private Integer sortNo;

    private String ext;

    private Integer status;

    private String validFrom;

    private String validTo;
}
