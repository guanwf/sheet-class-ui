import { BusinessModuleDefinition } from './types';
import { purchaseOrderModule } from './purchaseOrder';
import { returnOrderModule } from './returnOrder';

export * from './types';
export { purchaseOrderModule } from './purchaseOrder';
export { returnOrderModule } from './returnOrder';

const moduleRegistry: Record<string, BusinessModuleDefinition> = {
  PURCHASE_ORDER: purchaseOrderModule,
  RETURN_ORDER: returnOrderModule,
};

/**
 * 获取业务模块定义 (根据 moduleKey 或 docType 匹配)
 */
export function getBusinessModule(keyOrDocType: string): BusinessModuleDefinition {
  return moduleRegistry[keyOrDocType] || purchaseOrderModule;
}

/**
 * 获取所有已注册的业务模块
 */
export function getAllBusinessModules(): BusinessModuleDefinition[] {
  return Object.values(moduleRegistry);
}
