import { BusinessModuleDefinition } from '../types';
import { purchaseOrderModuleConfig } from './schema';
import { purchaseOrderListConfig } from './listConfig';
import { usePurchaseOrderLogic } from './usePurchaseOrderLogic';
import PurchaseOrderMasterSlot from './PurchaseOrderMasterSlot.vue';
import PurchaseOrderRecomposedSidebar from './PurchaseOrderRecomposedSidebar.vue';
import { buildDocumentDeltaPayload } from '../../engine';

export * from './schema';
export * from './listConfig';
export * from './usePurchaseOrderLogic';
export { default as PurchaseOrderMasterSlot } from './PurchaseOrderMasterSlot.vue';
export { default as PurchaseOrderRecomposedSidebar } from './PurchaseOrderRecomposedSidebar.vue';

export const purchaseOrderModule: BusinessModuleDefinition = {
  moduleKey: 'PURCHASE_ORDER',
  docType: 'PURCHASE_ORDER',
  moduleTitle: '标准采购订单',
  isReturnOrder: false,
  slaveTableKey: 'OrderItem',
  itemsTitle: '物料明细清单',
  enableGridFilter: true,
  enableGridSort: true,
  config: purchaseOrderModuleConfig,
  listConfig: purchaseOrderListConfig,
  slaveColumns: purchaseOrderModuleConfig.slaves.OrderItem.columns,
  useLogic: usePurchaseOrderLogic,
  logic: usePurchaseOrderLogic(),
  MasterSlotComponent: PurchaseOrderMasterSlot,
  RecomposedSidebarComponent: PurchaseOrderRecomposedSidebar,
  buildDeltaPayload: (doc, isDirty) => {

    return buildDocumentDeltaPayload(
      doc.header,
      false,
      isDirty,
      {
        OrderItem: {
          allCurrent: doc.items,
        },
        OrderPay: {
          allCurrent: doc.paymentSchedule,
        },
        OrderCost: {
          allCurrent: doc.costs,
        },
      },
      { onlyChangedSlaves: false }
    );
  },
};
