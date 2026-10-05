package com.enterprise.dict.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.enterprise.dict.model.entity.DictDraft;
import org.apache.ibatis.annotations.Mapper;

/**
 * 字典草稿暂存持久层
 */
@Mapper
public interface DictDraftMapper extends BaseMapper<DictDraft> {
}
