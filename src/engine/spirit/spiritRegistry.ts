import { SpiritConfig } from './types';
import { MOCK_SHOPS, ShopItem } from '../../data/mockShops';
import { SUPPLIERS } from '../../data/initialTemplates';
import { MOCK_PRODUCTS, ProductItem } from '../../data/mockProducts';

/**
 * 全局查询精灵注册中心 (Spirit Registry)
 * 业务模块只需注册配置，无需再编写独立 Modal 代码！
 */
class SpiritRegistry {
  private registry = new Map<string, SpiritConfig<any>>();

  public register<T = any>(config: SpiritConfig<T>) {
    this.registry.set(config.spiritKey.toUpperCase(), config);
  }

  public get<T = any>(key: string): SpiritConfig<T> | undefined {
    return this.registry.get(key.toUpperCase());
  }

  public has(key: string): boolean {
    return this.registry.has(key.toUpperCase());
  }

  public getAllKeys(): string[] {
    return Array.from(this.registry.keys());
  }
}

export const spiritRegistry = new SpiritRegistry();

/**
 * 1. 核心预置：门店查询精灵 (SHOP Spirit)
 * 满足上下结构：上面多维度过滤，下面 vxe-table 网格双击/确定选择，自动回填 shopCode/shopName
 */
export const SHOP_SPIRIT_CONFIG: SpiritConfig<ShopItem> = {
  spiritKey: 'SHOP',
  title: '门店查询精灵 (Shop Spirit)',
  subTitle: '全渠道门店网络·双击行或选中确定回填',
  valueField: 'shopCode',
  displayField: 'shopName',
  codeField: 'shopCode',
  nameField: 'shopName',
  // 核心规则：确认选中门店后，将门店编码与门店全称同时回传
  defaultMapping: {
    shopCode: 'shopCode',
    shopName: 'shopName',
    storeCode: 'shopCode',
    storeName: 'shopName',
  },
  onSpiritSelect: ({ selected }) => ({
    shopCode: selected.shopCode,
    shopName: selected.shopName,
    storeCode: selected.shopCode,
    storeName: selected.shopName,
  }),
  dialogWidth: '920px',
  quickSearchFields: ['shopCode', 'shopName', 'city', 'manager', 'shortName'],

  // 上半部分：查询条件表单
  searchFields: [
    {
      field: 'keyword',
      label: '综合搜索',
      type: 'input',
      placeholder: '输入门店编码/门店名称/店长...',
    },
    {
      field: 'city',
      label: '所在城市',
      type: 'select',
      options: [
        { label: '全部城市', value: '' },
        { label: '北京市', value: '北京市' },
        { label: '上海市', value: '上海市' },
        { label: '深圳市', value: '深圳市' },
        { label: '广州市', value: '广州市' },
        { label: '杭州市', value: '杭州市' },
        { label: '成都市', value: '成都市' },
        { label: '武汉市', value: '武汉市' },
        { label: '南京市', value: '南京市' },
      ],
    },
    {
      field: 'shopType',
      label: '门店业态',
      type: 'select',
      options: [
        { label: '全部业态', value: '' },
        { label: '直营旗舰店', value: '直营旗舰店' },
        { label: '标准专卖店', value: '标准专卖店' },
        { label: '商超体验中心', value: '商超体验中心' },
        { label: '自动化前置仓', value: '自动化前置仓' },
      ],
    },
    {
      field: 'status',
      label: '营业状态',
      type: 'select',
      options: [
        { label: '全部状态', value: '' },
        { label: '营业中', value: '营业中' },
        { label: '筹备装修', value: '筹备装修' },
        { label: '盘点闭店', value: '盘点闭店' },
      ],
    },
  ],

  // 下半部分：vxe-table 网格列定义
  columns: [
    { type: 'seq', field: 'seq', title: '序号', width: 55, align: 'center' },
    {
      field: 'shopCode',
      title: '门店编码',
      width: 130,
      sortable: true,
      align: 'center',
    },
    {
      field: 'shopName',
      title: '门店全称',
      minWidth: 200,
      sortable: true,
    },
    {
      field: 'city',
      title: '城市',
      width: 90,
      align: 'center',
    },
    {
      field: 'shopType',
      title: '门店业态',
      width: 120,
    },
    {
      field: 'manager',
      title: '店长/负责人',
      width: 100,
    },
    {
      field: 'phone',
      title: '联系电话',
      width: 125,
    },
    {
      field: 'status',
      title: '营业状态',
      width: 95,
      align: 'center',
      type: 'status',
    },
    {
      field: 'address',
      title: '详细地址',
      minWidth: 220,
    },
  ],

  // 查询与数据源过滤
  fetchData: async (params: Record<string, any>) => {
    let result = [...MOCK_SHOPS];

    if (params.keyword && String(params.keyword).trim()) {
      const kw = String(params.keyword).trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.shopCode.toLowerCase().includes(kw) ||
          s.shopName.toLowerCase().includes(kw) ||
          s.city.toLowerCase().includes(kw) ||
          s.manager.toLowerCase().includes(kw) ||
          s.address.toLowerCase().includes(kw)
      );
    }

    if (params.city) {
      result = result.filter((s) => s.city === params.city);
    }

    if (params.shopType) {
      result = result.filter((s) => s.shopType === params.shopType);
    }

    if (params.status) {
      result = result.filter((s) => s.status === params.status);
    }

    return result;
  },
};

/**
 * 2. 预置扩展：供应商查询精灵 (SUPPLIER Spirit) - 证明架构可扩展性
 */
export const SUPPLIER_SPIRIT_CONFIG: SpiritConfig = {
  spiritKey: 'SUPPLIER',
  title: '供应商查询精灵 (Supplier Spirit)',
  subTitle: '合格供应商主数据·双击行或选中确定回填',
  valueField: 'id',
  displayField: 'name',
  dialogWidth: '880px',
  quickSearchFields: ['code', 'name', 'contact', 'phone'],
  searchFields: [
    { field: 'keyword', label: '综合搜索', type: 'input', placeholder: '编码/客商名称/联系人...' },
  ],
  columns: [
    { type: 'seq', field: 'seq', title: '序号', width: 55, align: 'center' },
    { field: 'code', title: '供应商代码', width: 120, sortable: true },
    { field: 'name', title: '企业全称', minWidth: 220, sortable: true },
    { field: 'contact', title: '商务联系人', width: 150 },
    { field: 'phone', title: '联系方式', width: 130 },
    { field: 'taxNumber', title: '统一纳税人识别号', width: 180 },
  ],
  fetchData: async (params: Record<string, any>) => {
    let result = [...SUPPLIERS];
    if (params.keyword) {
      const kw = String(params.keyword).toLowerCase();
      result = result.filter(
        (s) =>
          s.code.toLowerCase().includes(kw) ||
          s.name.toLowerCase().includes(kw) ||
          s.contact.toLowerCase().includes(kw)
      );
    }
    return result;
  },
};

/**
 * 3. 预置核心：商品查询精灵 (PRODUCT Spirit) - 专用于明细网格录单
 * 满足上下结构：支持综合多维检索、分类筛选、网格展示建议单价与实时库存，支持单选与批量多选
 */
export const PRODUCT_SPIRIT_CONFIG: SpiritConfig<ProductItem> = {
  spiritKey: 'PRODUCT',
  title: '商品查询精灵 (Product Spirit)',
  subTitle: '物料与商品主数据库·支持全维度检索、单价库存联动与批量多选插行',
  valueField: 'productCode',
  displayField: 'productName',
  dialogWidth: '1020px',
  multiple: true,
  quickSearchFields: ['productCode', 'productName', 'spec', 'barcode', 'category', 'brand'],
  searchFields: [
    {
      field: 'keyword',
      label: '综合搜索',
      type: 'input',
      placeholder: '编码/品名/条码/规格/品牌/原厂型号...',
    },
    {
      field: 'category',
      label: '商品分类',
      type: 'select',
      defaultValue: '',
      options: [
        { label: '全部分类', value: '' },
        { label: '电子元器件', value: '电子元器件' },
        { label: '核心板卡', value: '核心板卡' },
        { label: '通信接口', value: '通信接口' },
        { label: '工业电源', value: '工业电源' },
        { label: '人机交互', value: '人机交互' },
        { label: '智能传感', value: '智能传感' },
        { label: '机械电机', value: '机械电机' },
        { label: '线缆耗材', value: '线缆耗材' },
      ],
    },
    {
      field: 'status',
      label: '供货状态',
      type: 'select',
      defaultValue: '',
      options: [
        { label: '全部状态', value: '' },
        { label: '在售', value: '在售' },
        { label: '缺货', value: '缺货' },
        { label: '下架', value: '下架' },
      ],
    },
  ],
  columns: [
    { type: 'seq', field: 'seq', title: '序号', width: 50, align: 'center', fixed: 'left' },
    { field: 'productCode', title: '商品编码', width: 135, sortable: true, fixed: 'left' },
    { field: 'productName', title: '商品名称', minWidth: 200, sortable: true },
    { field: 'spec', title: '规格型号', width: 170 },
    { field: 'category', title: '所属分类', width: 100, align: 'center' },
    { field: 'unit', title: '单位', width: 65, align: 'center' },
    { field: 'retailPrice', title: '建议单价(¥)', width: 110, align: 'right', type: 'currency', sortable: true },
    { field: 'stockQty', title: '可用库存', width: 95, align: 'right', sortable: true },
    { field: 'brand', title: '品牌', width: 90 },
    { field: 'barcode', title: '国际条码', width: 130 },
    { field: 'status', title: '状态', width: 75, align: 'center', type: 'status' },
  ],
  fetchData: async (params: Record<string, any>) => {
    let result = [...MOCK_PRODUCTS];

    if (params.keyword) {
      const kw = String(params.keyword).toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.productCode.toLowerCase().includes(kw) ||
          p.productName.toLowerCase().includes(kw) ||
          p.spec.toLowerCase().includes(kw) ||
          p.barcode.toLowerCase().includes(kw) ||
          p.brand.toLowerCase().includes(kw) ||
          p.category.toLowerCase().includes(kw)
      );
    }

    if (params.category) {
      result = result.filter((p) => p.category === params.category);
    }

    if (params.status) {
      result = result.filter((p) => p.status === params.status);
    }

    return result;
  },
};

// 默认完成注册
spiritRegistry.register(SHOP_SPIRIT_CONFIG);
spiritRegistry.register(SUPPLIER_SPIRIT_CONFIG);
spiritRegistry.register(PRODUCT_SPIRIT_CONFIG);
