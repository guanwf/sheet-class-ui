package com.enterprise.dict.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.enterprise.dict.model.entity.DictType;
import org.apache.ibatis.annotations.Mapper;

/**
 * 字典类型持久层
 */
@Mapper
public interface DictTypeMapper extends BaseMapper<DictType> {
}
