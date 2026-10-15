package com.enterprise.print.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 打印模板实体类 (pbs_print_template)
 */
@Data
@TableName("pbs_print_template")
public class PrintTemplate implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 主键ID（雪花ID） */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /** 业务模块，如 order、invoice、return_order */
    private String moduleId;

    /** 模板编码 (唯一约束 uk_module_id: module_id + template_id) */
    private String templateId;

    /** 模板名称 */
    private String templateName;

    /** 模块默认模板 (1=是, 0=否) */
    private Integer isDefault;

    /** 每次上传+1，用于报表引擎缓存失效 (Cache-Busting) */
    private Integer version;

    /** 源文件对象ID / 存储路径 (FileObject.id 或 OSS Key) */
    private String jrxmlPath;

    /** 编译后文件对象ID / 存储路径 (FileObject.id 或 OSS Key) */
    private String jasperPath;

    /** 模板参数/字段说明（JSON 文本，定义 parameters 和 fields 契约） */
    private String paramSchema;

    /** 状态：1启用 0停用 */
    private Integer flag;

    /** 创建人 */
    private String creator;

    /** 创建时间 */
    private LocalDateTime createTime;

    /** 修改人 */
    private String modifier;

    /** 修改时间 */
    private LocalDateTime modifyTime;

    /** 备注 */
    private String remark;
}
