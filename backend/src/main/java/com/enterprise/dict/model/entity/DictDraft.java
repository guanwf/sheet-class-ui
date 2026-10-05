package com.enterprise.dict.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 字典草稿暂存实体（审批发布前不影响线上生效缓存）
 */
@Data
@TableName("dict_draft")
public class DictDraft implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 主键雪花ID */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /** 租户ID */
    private String tenantId;

    /** 字典类型编码 */
    private String typeCode;

    /** 目标条目编码 */
    private String itemCode;

    /** 暂存操作类型：ADD(新增), UPDATE(更新), TOGGLE_STATUS(启停) */
    private String action;

    /** 暂存修改条目完整 JSON 快照 */
    private String draftContent;

    /** 编辑人 */
    private String createdBy;

    /** 草稿创建时间 */
    private LocalDateTime createTime;
}
