import { DeltaFlag, DeltaPayload } from '../types';

export interface DeltaCollectorOptions {
  onlyChangedSlaves?: boolean; // 如果为 true，只保留 _flag 为 I, U, D 的行，过滤 N
  includeUnchangedInMaster?: boolean;
}

/**
 * 差集与状态追踪工具
 */
export function buildDocumentDeltaPayload(
  master: any,
  isNew: boolean,
  isDirty: boolean,
  slaveTableRecords: Record<string, {
    inserts?: any[];
    updates?: any[];
    removes?: any[];
    allCurrent?: any[];
  }>,
  options: DeltaCollectorOptions = { onlyChangedSlaves: false }
): DeltaPayload {
  // 1. 主表状态: 新增(I), 修改(U), 无变更(N)
  const masterFlag: DeltaFlag = isNew ? 'I' : (isDirty ? 'U' : 'N');

  const masterPayload = {
    ...master,
    _flag: masterFlag,
  };

  // 2. 从表多子表增量状态组装
  const slavesPayload: Record<string, any[]> = {};

  for (const [slaveKey, recs] of Object.entries(slaveTableRecords)) {
    const list: any[] = [];
    const inserts = (recs.inserts || []).map(r => ({ ...r, _flag: 'I' as DeltaFlag }));
    const updates = (recs.updates || []).map(r => ({ ...r, _flag: 'U' as DeltaFlag }));
    const removes = (recs.removes || []).map(r => ({ ...r, _flag: 'D' as DeltaFlag }));

    const changedIds = new Set([
      ...inserts.map(r => r.id),
      ...updates.map(r => r.id),
      ...removes.map(r => r.id),
    ]);

    // 如果不过滤 N，将未修改的当前行补齐标记为 N
    if (!options.onlyChangedSlaves && recs.allCurrent) {
      const unchangeds = recs.allCurrent
        .filter(r => !changedIds.has(r.id))
        .map(r => ({ ...r, _flag: 'N' as DeltaFlag }));
      list.push(...unchangeds);
    }

    // 合并增删改
    list.push(...inserts, ...updates, ...removes);
    slavesPayload[slaveKey] = list;
  }

  return {
    master: masterPayload,
    slaves: slavesPayload,
  };
}
