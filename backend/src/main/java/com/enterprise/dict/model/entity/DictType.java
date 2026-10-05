package com.enterprise.dict.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 字典类型实体
 */
@Data
@TableName("dict_type")
public class DictType implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 主键雪花ID */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /** 字典类型编码 (唯一，如 CUSTOMER_LEVEL) */
    private String typeCode;

    /** 字典类型展示名称 */
    private String name;

    /** 作用范围：PLATFORM-平台级 / TENANT-租户级 / ORG-组织级 */
    private String scope;

    /** 租户ID（平台级默认为 '0'） */
    private String tenantId;

    /** 是否内置：1-是（不可删除不可改编码），0-否 */
    private Integer isBuiltin;

    /** 是否可编辑：1-可编辑，0-只读锁定 */
    private Integer editable;

    /** 当前生效版本号（发布审批后自增） */
    private Integer version;

    /** 状态：1-启用，0-停用 */
    private Integer status;

    /** 业务说明备注 */
    private String remark;

    /** 创建人 */
    private String creator;

    /** 创建时间 */
    private LocalDateTime createTime;

    /** 修改人 */
    private String modifier;

    /** 修改时间 */
    private LocalDateTime modifyTime;
}
