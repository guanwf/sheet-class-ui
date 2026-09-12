import { BusinessModuleDefinition } from '../types';
import { returnOrderModuleConfig } from './schema';
import { useReturnOrderLogic } from './useReturnOrderLogic';
import ReturnOrderMasterSlot from './ReturnOrderMasterSlot.vue';
import ReturnOrderRecomposedSidebar from './ReturnOrderRecomposedSidebar.vue';
import { buildDocumentDeltaPayload } from '../../engine';

export * from './schema';
export * from './useReturnOrderLogic';
export { default as ReturnOrderMasterSlot } from './ReturnOrderMasterSlot.vue';
export { default as ReturnOrderRecomposedSidebar } from './ReturnOrderRecomposedSidebar.vue';

export const returnOrderModule: BusinessModuleDefinition = {
  moduleKey: 'RETURN_ORDER',
  docType: 'RETURN_ORDER',
  moduleTitle: '采购退货单',
  isReturnOrder: true,
  slaveTableKey: 'ReturnItem',
  itemsTitle: '退货商品明细清单',
  enableGridFilter: false,
  enableGridSort: false,
  config: returnOrderModuleConfig,
  slaveColumns: returnOrderModuleConfig.slaves.ReturnItem.columns,
  useLogic: useReturnOrderLogic,
  logic: useReturnOrderLogic(),
  MasterSlotComponent: ReturnOrderMasterSlot,
  RecomposedSidebarComponent: ReturnOrderRecomposedSidebar,
  buildDeltaPayload: (doc, isDirty) => {
    return buildDocumentDeltaPayload(
      doc.header,
      false,
      isDirty,
      {
        ReturnItem: {
          allCurrent: doc.items,
        },
      },
      { onlyChangedSlaves: false }
    );
  },
};
