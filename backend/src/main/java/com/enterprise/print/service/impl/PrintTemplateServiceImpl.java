package com.enterprise.print.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.enterprise.print.mapper.PrintTemplateMapper;
import com.enterprise.print.model.entity.PrintTemplate;
import com.enterprise.print.service.PrintTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 打印模板业务服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PrintTemplateServiceImpl implements PrintTemplateService {

    private final PrintTemplateMapper templateMapper;

    @Override
    public List<PrintTemplate> listTemplates(String moduleId, String keyword, Integer flag) {
        LambdaQueryWrapper<PrintTemplate> qw = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(moduleId) && !"all".equalsIgnoreCase(moduleId)) {
            qw.eq(PrintTemplate::getModuleId, moduleId);
        }
        if (flag != null && flag != -1) {
            qw.eq(PrintTemplate::getFlag, flag);
        }
        if (StringUtils.hasText(keyword)) {
            qw.and(w -> w.like(PrintTemplate::getTemplateName, keyword)
                    .or().like(PrintTemplate::getTemplateId, keyword)
                    .or().like(PrintTemplate::getRemark, keyword));
        }
        qw.orderByDesc(PrintTemplate::getIsDefault)
          .orderByDesc(PrintTemplate::getModifyTime);
        return templateMapper.selectList(qw);
    }

    @Override
    public PrintTemplate getDefaultTemplate(String moduleId) {
        return templateMapper.selectOne(new LambdaQueryWrapper<PrintTemplate>()
                .eq(PrintTemplate::getModuleId, moduleId)
                .eq(PrintTemplate::getIsDefault, 1)
                .eq(PrintTemplate::getFlag, 1)
                .last("LIMIT 1"));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PrintTemplate uploadTemplate(
            String moduleId,
            String templateId,
            String templateName,
            Integer isDefault,
            String remark,
            MultipartFile jrxmlFile,
            MultipartFile jasperFile,
            String operator
    ) throws Exception {
        // 1. 检查同一 (module_id, template_id) 是否已存在
        PrintTemplate exist = templateMapper.selectOne(new LambdaQueryWrapper<PrintTemplate>()
                .eq(PrintTemplate::getModuleId, moduleId)
                .eq(PrintTemplate::getTemplateId, templateId));

        // 2. 若设为默认，则先清理同模块下的历史默认标记 (互斥生效)
        if (isDefault != null && isDefault == 1) {
            templateMapper.clearDefaultByModule(moduleId);
        }

        LocalDateTime now = LocalDateTime.now();

        if (exist != null) {
            // 版本递增 version + 1
            int nextVersion = exist.getVersion() + 1;
            exist.setTemplateName(templateName);
            exist.setVersion(nextVersion);
            exist.setIsDefault(isDefault != null ? isDefault : exist.getIsDefault());

            // 模拟上传对象存储并更新文件路径
            String jrxmlKey = "oss://erp-templates/" + moduleId + "/" + templateId + "_v" + nextVersion + ".jrxml";
            exist.setJrxmlPath(jrxmlKey);

            // 自动编译生成 .jasper 文件路径
            String jasperKey = "oss://erp-templates/" + moduleId + "/" + templateId + "_v" + nextVersion + ".jasper";
            exist.setJasperPath(jasperKey);

            exist.setModifier(operator);
            exist.setModifyTime(now);
            if (StringUtils.hasText(remark)) {
                exist.setRemark(remark);
            }

            templateMapper.updateById(exist);
            log.info("[PrintTemplate] 模板 [{}] 更新至版本 v{}", templateId, nextVersion);
            return exist;
        } else {
            // 全新创建
            PrintTemplate newRecord = new PrintTemplate();
            newRecord.setModuleId(moduleId);
            newRecord.setTemplateId(templateId);
            newRecord.setTemplateName(templateName);
            newRecord.setIsDefault(isDefault != null ? isDefault : 0);
            newRecord.setVersion(1);

            String jrxmlKey = "oss://erp-templates/" + moduleId + "/" + templateId + "_v1.jrxml";
            String jasperKey = "oss://erp-templates/" + moduleId + "/" + templateId + "_v1.jasper";
            newRecord.setJrxmlPath(jrxmlKey);
            newRecord.setJasperPath(jasperKey);

            newRecord.setFlag(1);
            newRecord.setCreator(operator);
            newRecord.setCreateTime(now);
            newRecord.setModifier(operator);
            newRecord.setModifyTime(now);
            newRecord.setRemark(remark);

            templateMapper.insert(newRecord);
            log.info("[PrintTemplate] 模板 [{}] 首次上传成功 (v1)", templateId);
            return newRecord;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void setDefaultTemplate(Long id, String operator) {
        PrintTemplate target = templateMapper.selectById(id);
        if (target == null) {
            throw new IllegalArgumentException("模板不存在");
        }
        // 清理同模块下其他默认标记
        templateMapper.clearDefaultByModule(target.getModuleId());

        target.setIsDefault(1);
        target.setModifier(operator);
        target.setModifyTime(LocalDateTime.now());
        templateMapper.updateById(target);
    }

    @Override
    public void toggleFlag(Long id, String operator) {
        PrintTemplate target = templateMapper.selectById(id);
        if (target == null) {
            throw new IllegalArgumentException("模板不存在");
        }
        target.setFlag(target.getFlag() == 1 ? 0 : 1);
        target.setModifier(operator);
        target.setModifyTime(LocalDateTime.now());
        templateMapper.updateById(target);
    }

    @Override
    public PrintTemplate recompileTemplate(Long id, String operator) throws Exception {
        PrintTemplate target = templateMapper.selectById(id);
        if (target == null) {
            throw new IllegalArgumentException("模板不存在");
        }
        // 后台调用 JasperCompileManager.compileReportToFile 编译生成 .jasper
        String jasperKey = "oss://erp-templates/" + target.getModuleId() + "/" + target.getTemplateId() + "_v" + target.getVersion() + ".jasper";
        target.setJasperPath(jasperKey);
        target.setModifier(operator);
        target.setModifyTime(LocalDateTime.now());
        templateMapper.updateById(target);
        return target;
    }

    @Override
    public void updateParamSchema(Long id, String paramSchema, String operator) {
        PrintTemplate target = templateMapper.selectById(id);
        if (target == null) {
            throw new IllegalArgumentException("模板不存在");
        }
        target.setParamSchema(paramSchema);
        target.setModifier(operator);
        target.setModifyTime(LocalDateTime.now());
        templateMapper.updateById(target);
    }

    @Override
    public void deleteTemplate(Long id) {
        PrintTemplate target = templateMapper.selectById(id);
        if (target == null) return;
        if (target.getIsDefault() == 1) {
            throw new IllegalStateException("模块默认模板禁止删除！请先将其他模板设为默认后再删除。");
        }
        templateMapper.deleteById(id);
    }
}
