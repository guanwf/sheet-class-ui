import { ConfigRecord, ConfigFormPayload, ConfigValueType, TenantOption } from '../types/config';

export const TENANTS: TenantOption[] = [
  { id: 1, name: '主租户 (租户ID: 1 - 平台默认)', code: 'DEFAULT_TENANT' },
  { id: 2, name: '华东大区 (租户ID: 2 - 零售供应链)', code: 'EAST_CHINA_TENANT' },
  { id: 3, name: '华南大区 (租户ID: 3 - 跨境保税区)', code: 'SOUTH_CHINA_TENANT' },
];

const INITIAL_CONFIGS: ConfigRecord[] = [
  {
    id: '1001001001',
    tenantId: 1,
    tag: '日志与监控',
    name: 'agent.log.query.http.timeout',
    value: '5000',
    valueType: 'NUMBER',
    description: '采集代理日志 HTTP 查询超时时间 (毫秒)，防止慢查询阻塞线程池',
    needRestart: 0,
    editable: 1,
    visible: 1,
    sortOrder: 10,
    creater: 'admin',
    createTime: '2026-03-01 10:00:00',
    modifyer: '系统管理员',
    modifyTime: '2026-03-10 14:20:00',
  },
  {
    id: '1001001002',
    tenantId: 1,
    tag: '安全中心',
    name: 'security.jwt.expiration',
    value: '86400',
    valueType: 'NUMBER',
    description: '用户会话 JWT Token 有效期（秒，默认 24 小时）',
    needRestart: 0,
    editable: 1,
    visible: 1,
    sortOrder: 20,
    creater: 'admin',
    createTime: '2026-03-01 10:00:00',
    modifyer: '安全组',
    modifyTime: '2026-03-05 09:12:00',
  },
  {
    id: '1001001003',
    tenantId: 1,
    tag: '网关服务',
    name: 'gateway.cors.allow_origins',
    value: JSON.stringify(['https://app.enterprise.com', 'https://admin.enterprise.com', 'https://h5.enterprise.com'], null, 2),
    valueType: 'JSON',
    description: 'API 网关跨域资源共享 (CORS) 允许请求源白名单列表',
    needRestart: 1,
    editable: 1,
    visible: 1,
    sortOrder: 30,
    creater: 'admin',
    createTime: '2026-03-02 11:30:00',
    modifyer: '运维团队',
    modifyTime: '2026-03-08 17:45:00',
  },
  {
    id: '1001001004',
    tenantId: 1,
    tag: '基础中间件',
    name: 'cache.cluster.nodes',
    value: JSON.stringify([
      { host: '10.0.1.11', port: 6379, role: 'master' },
      { host: '10.0.1.12', port: 6379, role: 'slave' },
      { host: '10.0.1.13', port: 6379, role: 'slave' }
    ], null, 2),
    valueType: 'JSON',
    description: 'Redis 高可用二级缓存集群节点拓扑配置',
    needRestart: 1,
    editable: 1,
    visible: 1,
    sortOrder: 40,
    creater: 'dba',
    createTime: '2026-03-02 11:30:00',
    modifyer: 'dba',
    modifyTime: '2026-03-06 16:30:00',
  },
  {
    id: '1001001005',
    tenantId: 1,
    tag: '系统运维',
    name: 'system.maintenance.enabled',
    value: 'false',
    valueType: 'BOOLEAN',
    description: '系统全局停机维护模式开关（开启后普通用户访问重定向至维护告示页）',
    needRestart: 0,
    editable: 1,
    visible: 1,
    sortOrder: 50,
    creater: 'admin',
    createTime: '2026-03-01 10:00:00',
    modifyer: '系统管理员',
    modifyTime: '2026-03-12 11:10:00',
  },
  {
    id: '1001001006',
    tenantId: 1,
    tag: '安全中心',
    name: 'security.password.complex_check',
    value: 'true',
    valueType: 'BOOLEAN',
    description: '强制启用账号密码高强度校验（大写字母+数字+特殊字符且长度>=8）',
    needRestart: 0,
    editable: 1,
    visible: 1,
    sortOrder: 60,
    creater: 'sec_admin',
    createTime: '2026-03-01 10:00:00',
    modifyer: 'sec_admin',
    modifyTime: '2026-03-01 10:00:00',
  },
  {
    id: '1001001007',
    tenantId: 1,
    tag: '消息通知',
    name: 'notification.email.smtp.host',
    value: 'smtp.enterprise-cloud.com',
    valueType: 'STRING',
    description: '企业邮件告警及审批通知发送服务器 (SMTP) 主机地址',
    needRestart: 0,
    editable: 1,
    visible: 1,
    sortOrder: 70,
    creater: 'admin',
    createTime: '2026-03-03 14:00:00',
    modifyer: '系统管理员',
    modifyTime: '2026-03-04 15:20:00',
  },
  {
    id: '1001001008',
    tenantId: 1,
    tag: '网关服务',
    name: 'gateway.rate_limiter.policy',
    value: JSON.stringify({
      defaultQps: 500,
      burstCapacity: 1000,
      enableHeaderCheck: true,
      whitelistIps: ['127.0.0.1', '10.0.0.1/24', '192.168.1.100']
    }, null, 2),
    valueType: 'JSON',
    description: 'API 网关全局令牌桶限流速率与突发流量保护策略',
    needRestart: 0,
    editable: 1,
    visible: 1,
    sortOrder: 80,
    creater: 'admin',
    createTime: '2026-03-03 14:00:00',
    modifyer: '网关管理员',
    modifyTime: '2026-03-09 18:00:00',
  },
  {
    id: '1001001009',
    tenantId: 1,
    tag: '系统内核',
    name: 'system.kernel.build_version',
    value: 'v3.16.8-LTS-RELEASE-x86_64',
    valueType: 'STRING',
    description: '核心底座内核发布版本号（系统内置关键基线，只读保护）',
    needRestart: 1,
    editable: 0,
    visible: 1,
    sortOrder: 90,
    creater: 'system_core',
    createTime: '2026-01-01 00:00:00',
    modifyer: 'system_core',
    modifyTime: '2026-01-01 00:00:00',
  },
  {
    id: '1001001010',
    tenantId: 1,
    tag: '审计与合规',
    name: 'audit.event.retention_days',
    value: '180',
    valueType: 'NUMBER',
    description: '合规性操作日志在 Elasticsearch/ClickHouse 中的保留生命周期 (天)',
    needRestart: 0,
    editable: 1,
    visible: 1,
    sortOrder: 100,
    creater: 'compliance',
    createTime: '2026-03-01 10:00:00',
    modifyer: '合规组',
    modifyTime: '2026-03-07 10:45:00',
  },
  {
    id: '1001001011',
    tenantId: 1,
    tag: '打印服务',
    name: 'print.default.paper_size',
    value: 'A4_PORTRAIT',
    valueType: 'STRING',
    description: '单据报表套打全局默认纸张与方向（A4_PORTRAIT / CONTINUOUS_241）',
    needRestart: 0,
    editable: 1,
    visible: 1,
    sortOrder: 110,
    creater: 'admin',
    createTime: '2026-03-05 09:30:00',
    modifyer: '业务主管',
    modifyTime: '2026-03-11 13:20:00',
  },
  {
    id: '1001001012',
    tenantId: 1,
    tag: '安全中心',
    name: 'security.internal.token_secret',
    value: 'ENC(7f8a8b8c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a)',
    valueType: 'STRING',
    description: '微服务内部安全调用密钥密文（核心脱敏隐藏参数，需管理员权限展示）',
    needRestart: 1,
    editable: 0,
    visible: 0,
    sortOrder: 999,
    creater: 'root',
    createTime: '2026-01-01 00:00:00',
    modifyer: 'root',
    modifyTime: '2026-01-01 00:00:00',
  },
  {
    id: '1001002001',
    tenantId: 1,
    tag: '日志与监控',
    name: 'agent.log.query.east.compensation_ms',
    value: '8000',
    valueType: 'NUMBER',
    description: '跨机房专线网络延迟补偿配置 (毫秒)',
    needRestart: 0,
    editable: 1,
    visible: 1,
    sortOrder: 120,
    creater: 'east_admin',
    createTime: '2026-03-05 10:00:00',
    modifyer: 'east_admin',
    modifyTime: '2026-03-05 10:00:00',
  },
  {
    id: '1001002002',
    tenantId: 1,
    tag: '系统运维',
    name: 'system.async_task.max_workers',
    value: '16',
    valueType: 'NUMBER',
    description: '后台异步数据处理线程池最大并发工作线程数',
    needRestart: 1,
    editable: 1,
    visible: 1,
    sortOrder: 130,
    creater: 'admin',
    createTime: '2026-03-05 10:00:00',
    modifyer: '运维管理员',
    modifyTime: '2026-03-05 10:00:00',
  },
];

class ConfigMockStorage {
  private configs: ConfigRecord[] = [];

  constructor() {
    this.init();
  }

  private init() {
    const raw = localStorage.getItem('pbs_system_config_v2');
    if (raw) {
      try {
        const parsed: ConfigRecord[] = JSON.parse(raw);
        // 校验并补充可能缺失的 tag 字段
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(p => p.tag)) {
          this.configs = parsed;
          return;
        }
      } catch (e) {
        console.error('Failed to parse cached pbs_config', e);
      }
    }
    this.configs = JSON.parse(JSON.stringify(INITIAL_CONFIGS));
    this.save();
  }

  private save() {
    try {
      localStorage.setItem('pbs_system_config_v2', JSON.stringify(this.configs));
    } catch (e) {
      console.error('Failed to save pbs_system_config_v2', e);
    }
  }

  public getConfigs(
    tag?: string,
    keyword?: string,
    valueType?: string,
    needRestart?: number,
    includeHidden: boolean = false
  ): ConfigRecord[] {
    let list = this.configs;

    if (tag && tag !== 'ALL') {
      list = list.filter((c) => c.tag === tag);
    }

    if (!includeHidden) {
      list = list.filter((c) => c.visible === 1);
    }

    if (valueType && valueType !== 'ALL') {
      list = list.filter((c) => c.valueType === valueType);
    }

    if (needRestart !== undefined && needRestart !== -1) {
      list = list.filter((c) => c.needRestart === needRestart);
    }

    if (keyword && keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(kw) ||
          c.tag.toLowerCase().includes(kw) ||
          (c.description && c.description.toLowerCase().includes(kw)) ||
          c.value.toLowerCase().includes(kw)
      );
    }

    // 按 sort_order 正序排列，若相同则按 name
    list.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.name.localeCompare(b.name);
    });

    return JSON.parse(JSON.stringify(list));
  }

  public getById(id: string): ConfigRecord | undefined {
    const item = this.configs.find((c) => c.id === id);
    return item ? JSON.parse(JSON.stringify(item)) : undefined;
  }

  public saveConfig(payload: ConfigFormPayload, id?: string, operator = '当前操作员'): ConfigRecord {
    const nowStr = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    const name = payload.name.trim();

    if (!payload.tag || !payload.tag.trim()) {
      throw new Error('业务域标签分类 (tag) 不能为空');
    }

    // 校验唯一性 (tenant_id, name)
    const duplicate = this.configs.find(
      (c) => c.tenantId === payload.tenantId && c.name.toLowerCase() === name.toLowerCase() && c.id !== id
    );
    if (duplicate) {
      throw new Error(`参数名【${name}】已存在，违反 uk_name 唯一键约束`);
    }

    // 根据 valueType 对 value 做合理合法性校验
    this.validateValueByType(payload.value, payload.valueType);

    if (id) {
      // 仅支持修改已初始化的记录
      const index = this.configs.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('配置项不存在');

      const existing = this.configs[index];
      if (existing.editable === 0) {
        throw new Error(`参数【${existing.name}】为系统内置只读项 (editable=0)，禁止在线修改`);
      }

      existing.tenantId = payload.tenantId;
      existing.tag = payload.tag.trim();
      existing.name = name;
      existing.value = payload.value;
      existing.valueType = payload.valueType;
      existing.description = payload.description;
      existing.needRestart = payload.needRestart;
      existing.editable = payload.editable;
      existing.visible = payload.visible;
      existing.sortOrder = Number(payload.sortOrder) || 0;
      existing.modifyer = operator;
      existing.modifyTime = nowStr;

      this.save();
      return JSON.parse(JSON.stringify(existing));
    } else {
      throw new Error('系统参数由后台统一初始化预置，禁止在线新增参数');
    }
  }

  public quickToggleBoolean(id: string, operator = '当前操作员'): ConfigRecord {
    const item = this.configs.find((c) => c.id === id);
    if (!item) throw new Error('配置项不存在');
    if (item.valueType !== 'BOOLEAN') {
      throw new Error('仅布尔类型 (BOOLEAN) 支持快捷切换');
    }
    if (item.editable === 0) {
      throw new Error('该配置项为系统内置只读，禁止切换');
    }

    const currentVal = item.value.trim().toLowerCase();
    const nextVal = currentVal === 'true' || currentVal === '1' ? 'false' : 'true';
    item.value = nextVal;
    item.modifyer = operator;
    item.modifyTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    this.save();
    return JSON.parse(JSON.stringify(item));
  }

  /**
   * 针对不同 valueType 的语义智能校验
   */
  private validateValueByType(value: string, type: ConfigValueType) {
    if (type === 'NUMBER') {
      if (isNaN(Number(value)) || value.trim() === '') {
        throw new Error(`参数类型为 NUMBER，值【${value}】不是合法的数值`);
      }
    } else if (type === 'BOOLEAN') {
      const v = value.trim().toLowerCase();
      if (v !== 'true' && v !== 'false' && v !== '1' && v !== '0') {
        throw new Error(`参数类型为 BOOLEAN，值应为 true/false 或 1/0，当前值为【${value}】`);
      }
    } else if (type === 'JSON') {
      try {
        JSON.parse(value);
      } catch (err: any) {
        throw new Error(`参数类型为 JSON，语法校验失败: ${err.message}`);
      }
    }
  }
}

export const configStorage = new ConfigMockStorage();

export const configApi = {
  getConfigs: async (
    tag?: string,
    keyword?: string,
    valueType?: string,
    needRestart?: number,
    includeHidden: boolean = false
  ) => {
    return configStorage.getConfigs(tag, keyword, valueType, needRestart, includeHidden);
  },
  getById: async (id: string) => {
    return configStorage.getById(id);
  },
  saveConfig: async (payload: ConfigFormPayload, id?: string, operator?: string) => {
    return configStorage.saveConfig(payload, id, operator);
  },
  quickToggleBoolean: async (id: string, operator?: string) => {
    return configStorage.quickToggleBoolean(id, operator);
  },
  getTenants: () => {
    return TENANTS;
  },
};
