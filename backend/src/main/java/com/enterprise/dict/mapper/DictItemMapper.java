package com.enterprise.dict.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.enterprise.dict.model.entity.DictItem;
import org.apache.ibatis.annotations.Mapper;

/**
 * 字典明细条目持久层
 */
@Mapper
public interface DictItemMapper extends BaseMapper<DictItem> {
}
