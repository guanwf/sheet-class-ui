package com.enterprise.dict.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 字典变更与发布历史审计实体
 */
@Data
@TableName("dict_change_log")
public class DictChangeLog implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 主键雪花ID */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /** 租户ID */
    private String tenantId;

    /** 字典类型编码 */
    private String typeCode;

    /** 对应生效版本号 */
    private Integer version;

    /** 操作类型：CREATE_TYPE, ADD_ITEM, UPDATE_ITEM, TOGGLE_ITEM, PUBLISH, ROLLBACK */
    private String actionType;

    /** 目标条目编码 */
    private String targetCode;

    /** 变更前完整快照 JSON */
    private String beforeContent;

    /** 变更后完整快照 JSON */
    private String afterContent;

    /** 操作人姓名或工号 */
    private String operator;

    /** 操作记录时间 */
    private LocalDateTime operateTime;

    /** 变更说明或审批单据号 */
    private String remark;
}
