package com.enterprise.print.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.enterprise.print.model.entity.PrintTemplate;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Update;

/**
 * 打印模板持久层
 */
@Mapper
public interface PrintTemplateMapper extends BaseMapper<PrintTemplate> {

    /**
     * 重置某个业务模块下的所有默认模板为 0 (保障同一模块下默认模板唯一互斥)
     */
    @Update("UPDATE pbs_print_template SET is_default = 0, modify_time = NOW() WHERE module_id = #{moduleId}")
    int clearDefaultByModule(String moduleId);
}
