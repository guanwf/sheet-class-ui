package com.enterprise.dict.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.enterprise.dict.model.entity.DictChangeLog;
import org.apache.ibatis.annotations.Mapper;

/**
 * 字典审计历史持久层
 */
@Mapper
public interface DictChangeLogMapper extends BaseMapper<DictChangeLog> {
}
