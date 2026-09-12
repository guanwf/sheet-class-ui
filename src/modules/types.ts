import { Component } from 'vue';
import { DocModuleConfig, SlaveColumnConfig, DeltaPayload } from '../engine/types';
import { DocumentRecord } from '../types/document';

/**
 * 业务模块统一接口规范 (Business Module Interface)
 * 供业务模块（如采购订单、采购退货单等）自闭环实现 HTML、JS、配置，并向引擎层暴露
 */
export interface BusinessModuleDefinition {
  moduleKey: string;
  docType: string;
  moduleTitle: string;
  isReturnOrder: boolean;
  slaveTableKey: string;
  itemsTitle: string;
  config: DocModuleConfig;
  slaveColumns: SlaveColumnConfig[];
  // 网格能力特性自定义：采购单开启，退货单不开启
  enableGridFilter: boolean;
  enableGridSort: boolean;
  useLogic: () => any;
  logic: any;
  // 业务模块自身维护的 HTML 插槽定制组件 (替换整块表头)
  MasterSlotComponent: Component;
  // 业务模块自身维护的左右分栏侧边栏组件
  RecomposedSidebarComponent: Component;
  // 业务模块自身维护的增量保存报文生成器
  buildDeltaPayload: (doc: DocumentRecord, isDirty: boolean) => DeltaPayload;
}
