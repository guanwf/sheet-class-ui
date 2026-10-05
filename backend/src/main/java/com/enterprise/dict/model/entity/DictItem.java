package com.enterprise.dict.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 字典条目实体（业务表只存 item_code，不存 id 和 label）
 */
@Data
@TableName("dict_item")
public class DictItem implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 主键雪花ID */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /** 字典类型编码 */
    private String typeCode;

    /** 所属租户ID（平台级为 '0'） */
    private String tenantId;

    /** 字典条目编码（业务持久化字段，租户级必带租户前缀） */
    private String itemCode;

    /** 父级条目编码（用于树形字典结构，如工单二级分类） */
    private String parentCode;

    /** 多语言展示标签 JSON，例如 {"zh-CN":"金牌客户","en":"Gold Member"} */
    private String labelI18n;

    /** 展示排序号（升序排列） */
    private Integer sortNo;

    /** 扩展属性 JSON，例如 {"discount":0.9,"color":"#1F4FD8"} */
    private String ext;

    /** 状态：1-启用，0-停用（业务不可物理删除，仅可停用） */
    private Integer status;

    /** 有效期开始时间 */
    private LocalDateTime validFrom;

    /** 有效期结束时间 */
    private LocalDateTime validTo;

    /** 创建人 */
    private String creator;

    /** 创建时间 */
    private LocalDateTime createTime;

    /** 修改人 */
    private String modifier;

    /** 修改时间 */
    private LocalDateTime modifyTime;
}
