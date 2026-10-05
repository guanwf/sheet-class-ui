package com.enterprise.dict.model.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 字典类型业务引用检查视图对象
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DictUsageVO {

    /** 字典类型 */
    private String typeCode;

    /** 是否被业务系统强引用：true-有引用（禁止停用/删除），false-无引用 */
    private Boolean hasReferences;

    /** 引用该字典的业务表与字段列表 */
    private List<TableReference> references;

    /** 总引用记录行数 */
    private Long totalRowCount;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TableReference {
        private String systemName;
        private String tableName;
        private String columnName;
        private Long count;
        private String description;
    }
}
