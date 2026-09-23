<template>
  <div class="flex-1 flex flex-col min-h-0 bg-slate-100 overflow-hidden relative">
    <!-- 1. 模块管理页签头 (与单据和用户模块统一的高密 TabBar 风格) -->
    <div class="bg-slate-200/90 border-b border-slate-300/80 px-2 pt-1 flex items-center justify-between select-none text-xs gap-2 shrink-0">
      <div class="flex items-center space-x-1 py-0.5">
        <div class="relative flex items-center h-8 px-3 rounded-t-md bg-white text-slate-900 font-semibold border-t border-l border-r border-slate-300 shadow-2xs z-10">
          <span class="absolute top-0 left-0 right-0 h-0.5 bg-[#25548d] rounded-t"></span>
          <Layers class="w-3.5 h-3.5 mr-1 text-[#25548d]" />
          <span>模块元数据中心 (pbs_module)</span>
          <span class="ml-2 px-1.5 py-0.2 bg-[#f0f5fa] border border-[#cbdff2] text-[#25548d] rounded-full text-[10px] font-mono">
            {{ modules.length }}
          </span>
        </div>
      </div>

      <div class="flex items-center space-x-2 text-slate-500 text-[11px] pr-2">
        <span class="inline-flex items-center text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          <Key class="w-3 h-3 mr-1 text-[#25548d]" />
          11维二进制位或掩码 (pageUtils.PERM) & 唯一约束校验
        </span>
      </div>
    </div>

    <!-- 2. 主体内容区 (KPI统计卡片 + 组合搜索与操作工具栏 + vxe-table数据列表 + 分页) -->
    <div class="flex-1 flex flex-col p-3 md:p-4 space-y-3 overflow-y-auto min-h-0">
      <!-- 2.1 统计指标卡片 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0 select-none">
        <div
          @click="setKpiFilter('all')"
          :class="[
            'p-3 rounded-lg border shadow-2xs flex items-center justify-between transition cursor-pointer',
            kpiFilter === 'all' ? 'ring-2 ring-[#25548d] bg-[#f0f5fa] border-[#cbdff2]' : 'bg-white border-slate-200 hover:border-[#25548d]/60'
          ]"
        >
          <div>
            <span class="text-xs font-medium text-slate-600">已注册功能模块</span>
            <div class="text-xl font-bold font-mono mt-1 text-slate-900">
              {{ modules.length }} <span class="text-xs font-normal text-slate-400">个</span>
            </div>
            <div class="text-[11px] text-slate-400 mt-0.5">pbs_module 全量业务定义</div>
          </div>
          <div class="p-2.5 rounded-full bg-slate-100 text-slate-600">
            <Layers class="w-5 h-5" />
          </div>
        </div>

        <div
          @click="setKpiFilter('active')"
          :class="[
            'p-3 rounded-lg border shadow-2xs flex items-center justify-between transition cursor-pointer',
            kpiFilter === 'active' ? 'ring-2 ring-[#25548d] bg-[#f0f5fa] border-[#cbdff2]' : 'bg-white border-slate-200 hover:border-[#25548d]/60'
          ]"
        >
          <div>
            <div class="flex items-center space-x-1.5">
              <span class="text-xs font-medium text-emerald-700">正常启用模块</span>
              <span v-if="kpiFilter === 'active'" class="text-[10px] px-1 bg-[#25548d] text-white rounded scale-90">已筛选</span>
            </div>
            <div class="text-xl font-bold font-mono mt-1 text-emerald-700">
              {{ countActiveModules }} <span class="text-xs font-normal text-slate-400">个</span>
            </div>
            <div class="text-[11px] text-slate-400 mt-0.5">flag=1 在线可调度</div>
          </div>
          <div class="p-2.5 rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle class="w-5 h-5" />
          </div>
        </div>

        <div
          @click="setKpiFilter('fullPerm')"
          :class="[
            'p-3 rounded-lg border shadow-2xs flex items-center justify-between transition cursor-pointer',
            kpiFilter === 'fullPerm' ? 'ring-2 ring-[#25548d] bg-[#f0f5fa] border-[#cbdff2]' : 'bg-white border-slate-200 hover:border-[#25548d]/60'
          ]"
        >
          <div>
            <div class="flex items-center space-x-1.5">
              <span class="text-xs font-medium text-amber-700">全量权限模块 (2047)</span>
              <span v-if="kpiFilter === 'fullPerm'" class="text-[10px] px-1 bg-[#25548d] text-white rounded scale-90">已筛选</span>
            </div>
            <div class="text-xl font-bold font-mono mt-1 text-amber-700">
              {{ countFullPermModules }} <span class="text-xs font-normal text-slate-400">个</span>
            </div>
            <div class="text-[11px] text-slate-400 mt-0.5">rightvalues = 2047 (0x07FF)</div>
          </div>
          <div class="p-2.5 rounded-full bg-amber-50 text-amber-600">
            <Sparkles class="w-5 h-5" />
          </div>
        </div>

        <div
          @click="setKpiFilter('hasAudit')"
          :class="[
            'p-3 rounded-lg border shadow-2xs flex items-center justify-between transition cursor-pointer',
            kpiFilter === 'hasAudit' ? 'ring-2 ring-[#25548d] bg-[#f0f5fa] border-[#cbdff2]' : 'bg-white border-slate-200 hover:border-[#25548d]/60'
          ]"
        >
          <div>
            <div class="flex items-center space-x-1.5">
              <span class="text-xs font-medium text-purple-700">含“审核”权单据</span>
              <span v-if="kpiFilter === 'hasAudit'" class="text-[10px] px-1 bg-[#25548d] text-white rounded scale-90">已筛选</span>
            </div>
            <div class="text-xl font-bold font-mono mt-1 text-purple-700">
              {{ countAuditModules }} <span class="text-xs font-normal text-slate-400">个</span>
            </div>
            <div class="text-[11px] text-slate-400 mt-0.5">支持主管审核过账 (bit:64)</div>
          </div>
          <div class="p-2.5 rounded-full bg-purple-50 text-purple-600">
            <ShieldAlert class="w-5 h-5" />
          </div>
        </div>
      </div>

      <!-- 2.2 筛选条件与批处理操作栏 -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-2xs p-3 space-y-3 shrink-0">
        <!-- 搜索与下拉过滤区 -->
        <div class="flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            <!-- 关键字查询 -->
            <div class="relative w-64">
              <input
                type="text"
                v-model="searchKeyword"
                placeholder="搜索模块ID、名称、地址或提示..."
                class="w-full pl-8 pr-7 py-1.5 rounded border border-slate-300 text-xs focus:outline-hidden focus:border-[#25548d] transition"
                @keyup.enter="handleSearch"
              />
              <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <button
                v-if="searchKeyword"
                type="button"
                @click="searchKeyword = ''; handleSearch()"
                class="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <!-- 操作类型过滤 -->
            <div class="flex items-center space-x-1.5">
              <span class="text-slate-500 text-[11px]">操作类型:</span>
              <select
                v-model="searchActionType"
                @change="handleSearch"
                class="border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-700 focus:outline-hidden focus:border-[#25548d]"
              >
                <option value="all">全部类型 (ALL)</option>
                <option v-for="t in ACTION_TYPE_OPTIONS" :key="t.id" :value="t.id">
                  {{ t.id }} - {{ t.name }}
                </option>
              </select>
            </div>

            <!-- 启停状态过滤 -->
            <div class="flex items-center space-x-1.5">
              <span class="text-slate-500 text-[11px]">状态:</span>
              <select
                v-model="searchFlag"
                @change="handleSearch"
                class="border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-700 focus:outline-hidden focus:border-[#25548d]"
              >
                <option value="all">全部状态</option>
                <option value="1">启用 (1)</option>
                <option value="0">停用 (0)</option>
              </select>
            </div>

            <!-- 核心特色：位掩码权限项精确过滤 -->
            <div class="flex items-center space-x-1.5">
              <span class="text-slate-500 text-[11px]">按权限位筛选:</span>
              <select
                v-model="searchPermBit"
                @change="handleSearch"
                class="border border-slate-300 rounded px-2 py-1 text-xs bg-white text-[#25548d] font-medium focus:outline-hidden focus:border-[#25548d]"
              >
                <option :value="0">不限权限位</option>
                <option v-for="p in ATOMIC_PERM_OPTIONS" :key="p.value" :value="p.value">
                  包含 {{ p.name }} (位值: {{ p.value }})
                </option>
                <option :value="2047">全量权限 (2047)</option>
              </select>
            </div>

            <button
              type="button"
              @click="handleSearch"
              class="px-3 py-1.5 rounded bg-[#25548d] hover:bg-[#1e4472] text-white font-medium text-xs shadow-2xs transition flex items-center cursor-pointer"
            >
              <Search class="w-3.5 h-3.5 mr-1" />
              <span>查询</span>
            </button>

            <button
              type="button"
              @click="handleReset"
              class="px-2.5 py-1.5 rounded border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs transition cursor-pointer"
            >
              重置
            </button>
          </div>

          <!-- 核心操作按钮组 -->
          <div class="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              @click="openAddModal"
              class="inline-flex items-center px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-2xs transition cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5 mr-1" />
              <span>新增模块 (pbs_module)</span>
            </button>

            <button
              type="button"
              @click="showBatchGenerateModal = true"
              class="inline-flex items-center px-2.5 py-1.5 rounded border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium text-xs transition cursor-pointer"
            >
              <Sparkles class="w-3.5 h-3.5 mr-1 text-purple-600" />
              <span>批量模拟生成</span>
            </button>

            <button
              type="button"
              @click="loadVirtualStressModules(1000)"
              class="inline-flex items-center px-2.5 py-1.5 rounded border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs transition cursor-pointer"
              title="一键加载1,000个业务模块并进入全量虚拟滚动验证"
            >
              <Zap class="w-3.5 h-3.5 mr-1 text-indigo-600" />
              <span>压测 1,000 模块</span>
            </button>

            <button
              type="button"
              @click="exportCsv"
              class="inline-flex items-center px-2.5 py-1.5 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs transition cursor-pointer"
            >
              <Download class="w-3.5 h-3.5 mr-1 text-slate-500" />
              <span>导出 CSV</span>
            </button>
          </div>
        </div>

        <!-- 批量勾选操作工具栏 -->
        <div
          v-if="selectedRows.length > 0"
          class="flex items-center justify-between px-3 py-1.5 bg-blue-50/70 border border-blue-200 rounded text-xs text-[#25548d] animate-in fade-in duration-150"
        >
          <div class="flex items-center space-x-2">
            <span class="font-medium">已选中 {{ selectedRows.length }} 个模块</span>
            <span class="text-blue-300">|</span>
            <span class="text-slate-500">可执行批量启停或批量移除</span>
          </div>

          <div class="flex items-center space-x-2">
            <button
              type="button"
              @click="batchSetFlag(1)"
              class="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-medium hover:bg-emerald-700 transition cursor-pointer"
            >
              批量启用 (flag=1)
            </button>
            <button
              type="button"
              @click="batchSetFlag(0)"
              class="px-2 py-0.5 rounded bg-amber-600 text-white text-[11px] font-medium hover:bg-amber-700 transition cursor-pointer"
            >
              批量停用 (flag=0)
            </button>
            <button
              type="button"
              @click="batchDelete"
              class="px-2 py-0.5 rounded bg-rose-600 text-white text-[11px] font-medium hover:bg-rose-700 transition cursor-pointer"
            >
              批量删除
            </button>
            <button
              type="button"
              @click="clearSelection"
              class="text-slate-500 hover:text-slate-800 text-[11px] ml-1 underline cursor-pointer"
            >
              取消勾选
            </button>
          </div>
        </div>
      </div>

      <!-- 2.3 数据表格与虚拟化视口容器 -->
      <div class="flex-1 flex flex-col bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden min-h-[360px]">
        <!-- 提示与统计栏 -->
        <div class="px-4 py-1.5 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 flex items-center justify-between shrink-0">
          <div class="flex items-center space-x-2">
            <span class="w-1.5 h-1.5 rounded-full bg-[#25548d]"></span>
            <span>严格遵循 <strong>pbs_module</strong> 数据库规范：具备 <code>module_id (UQ01)</code> 与 <code>module_name (UQ02)</code> 双唯一约束。</span>
            <span class="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] border border-blue-200">
              ⚡ 虚拟滚动引擎驱动
            </span>
          </div>
          <div class="flex items-center space-x-3">
            <label class="inline-flex items-center cursor-pointer select-none space-x-1.5 text-xs text-slate-700">
              <input
                type="checkbox"
                v-model="isVirtualAllMode"
                class="rounded border-slate-300 text-[#25548d] focus:ring-0 cursor-pointer"
              />
              <span :class="isVirtualAllMode ? 'font-semibold text-indigo-700' : 'text-slate-600'">全量虚拟滚动模式</span>
            </label>
            <span class="text-[#25548d] font-medium font-mono">
              共检索出 {{ filteredModules.length }} 个模块<template v-if="!isVirtualAllMode">（当前第 {{ currentPage }} / {{ totalPages || 1 }} 页）</template><template v-else>（全量虚拟视口已接管）</template>
            </span>
          </div>
        </div>

        <!-- vxe-table 数据网格 -->
        <div class="flex-1 w-full relative min-h-[260px]">
          <VxeVirtualScrollWrapper
            height="100%"
            :gt="20"
            :show-metrics="true"
            :item-count="displayModules.length"
          >
            <vxe-table
              ref="tableRef"
              height="auto"
              border
              stripe
              round
              show-overflow
              class="text-xs"
              :data="displayModules"
              :row-config="{ isHover: true, isCurrent: true, keyField: 'id' }"
              :checkbox-config="{ trigger: 'row', highlight: true }"
              @checkbox-change="onCheckboxChange"
              @checkbox-all="onCheckboxAll"
            >
              <!-- 复选框 -->
              <vxe-column type="checkbox" width="45" align="center" fixed="left" />

              <!-- 序号 -->
              <vxe-column type="seq" title="#" width="50" align="center" fixed="left" />

              <!-- 模块ID (唯一) -->
              <vxe-column field="module_id" title="模块ID (module_id)" width="165" fixed="left">
                <template #default="{ row }">
                  <div class="flex items-center justify-between group">
                    <span class="font-mono font-bold text-[#25548d] text-[11px]">{{ row.module_id }}</span>
                    <button
                      type="button"
                      @click.stop="copyText(row.module_id, '模块ID')"
                      class="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                      title="复制模块ID"
                    >
                      <Copy class="w-3 h-3" />
                    </button>
                  </div>
                </template>
              </vxe-column>

              <!-- 模块名称 (唯一) -->
              <vxe-column field="module_name" title="模块名称 (module_name)" width="170">
                <template #default="{ row }">
                  <div class="flex items-center space-x-1.5 font-medium text-slate-900">
                    <span class="w-1.5 h-1.5 rounded-full" :class="row.flag === 1 ? 'bg-emerald-500' : 'bg-rose-400'"></span>
                    <span class="truncate" :title="row.module_name">{{ row.module_name }}</span>
                  </div>
                </template>
              </vxe-column>

              <!-- 提示信息 (hint) -->
              <vxe-column field="hint" title="提示信息 (hint)" min-width="190">
                <template #default="{ row }">
                  <span class="text-slate-500 text-[11px] truncate block" :title="row.hint">
                    {{ row.hint || '-' }}
                  </span>
                </template>
              </vxe-column>

              <!-- 核心：权限值 (rightvalues) 与位掩码标签徽章 -->
              <vxe-column field="rightvalues" title="权限值 (rightvalues)" width="230">
                <template #default="{ row }">
                  <div class="flex items-center space-x-1.5 py-0.5">
                    <!-- 数值胶囊 -->
                    <span
                      :class="[
                        'px-1.5 py-0.2 rounded font-mono text-[10px] font-bold border shrink-0',
                        row.rightvalues === 2047
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : row.rightvalues > 0
                          ? 'bg-blue-50 text-[#25548d] border-blue-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      ]"
                      :title="`二进制: ${toBinary11(row.rightvalues)} | 十六进制: ${toHex4(row.rightvalues)}`"
                    >
                      {{ row.rightvalues }}
                    </span>

                    <!-- 权限位标签预览 -->
                    <div class="flex items-center space-x-1 overflow-hidden truncate">
                      <template v-if="row.rightvalues === 2047">
                        <span class="px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-medium whitespace-nowrap">
                          全部权限 (11位全开)
                        </span>
                      </template>
                      <template v-else-if="row.rightvalues === 0">
                        <span class="text-slate-400 text-[10px]">无权限</span>
                      </template>
                      <template v-else>
                        <span
                          v-for="b in getActivePermBadges(row.rightvalues).slice(0, 3)"
                          :key="b.value"
                          class="px-1 py-0.2 rounded text-[9px] font-medium border whitespace-nowrap"
                          :style="{ backgroundColor: `${b.badgeColor}15`, color: b.badgeColor, borderColor: `${b.badgeColor}40` }"
                        >
                          {{ b.name }}
                        </span>
                        <span
                          v-if="getActivePermBadges(row.rightvalues).length > 3"
                          class="text-[9px] text-slate-400 font-mono"
                          :title="getActivePermBadges(row.rightvalues).map(b => b.name).join('、')"
                        >
                          +{{ getActivePermBadges(row.rightvalues).length - 3 }}
                        </span>
                      </template>
                    </div>
                  </div>
                </template>
              </vxe-column>

              <!-- 操作地址 (actionurl) -->
              <vxe-column field="actionurl" title="操作地址 (actionurl)" width="160">
                <template #default="{ row }">
                  <span class="font-mono text-[11px] text-indigo-700 bg-indigo-50/50 px-1.5 py-0.5 rounded border border-indigo-100 truncate block" :title="row.actionurl">
                    {{ row.actionurl }}
                  </span>
                </template>
              </vxe-column>

              <!-- 操作类型 (actiontypeid) -->
              <vxe-column field="actiontypeid" title="操作类型" width="130" align="center">
                <template #default="{ row }">
                  <span
                    :class="[
                      'px-1.5 py-0.5 rounded text-[10px] font-medium border font-mono',
                      row.actiontypeid === 'TAB_PAGE'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : row.actiontypeid === 'MENU'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : row.actiontypeid === 'MODAL_DIALOG'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-orange-50 text-orange-700 border-orange-200'
                    ]"
                  >
                    {{ row.actiontypeid }}
                  </span>
                </template>
              </vxe-column>

              <!-- 是否启用 (flag) -->
              <vxe-column field="flag" title="状态 (flag)" width="95" align="center">
                <template #default="{ row }">
                  <a-switch
                    :checked="row.flag === 1"
                    size="small"
                    @change="(checked: boolean) => toggleModuleFlag(row, checked)"
                  />
                  <span class="ml-1.5 text-[11px]" :class="row.flag === 1 ? 'text-emerald-700 font-medium' : 'text-slate-400'">
                    {{ row.flag === 1 ? '启用' : '停用' }}
                  </span>
                </template>
              </vxe-column>

              <!-- 雪花ID -->
              <vxe-column field="id" title="雪花主键 (id)" width="170">
                <template #default="{ row }">
                  <span class="font-mono text-[10px] text-slate-500">{{ row.id }}</span>
                </template>
              </vxe-column>

              <!-- 操作人与时间 -->
              <vxe-column field="modify_time" title="修改人/时间" width="145">
                <template #default="{ row }">
                  <div class="text-[10px] text-slate-500 leading-tight">
                    <div>{{ row.modifyer || row.creater || '-' }}</div>
                    <div class="font-mono text-slate-400">{{ row.modify_time || row.create_time || '-' }}</div>
                  </div>
                </template>
              </vxe-column>

              <!-- 操作列 -->
              <vxe-column title="操作" width="160" fixed="right" align="center">
                <template #default="{ row }">
                  <div class="flex items-center justify-center space-x-2 text-xs">
                    <button
                      type="button"
                      @click="viewDetail(row)"
                      class="text-blue-600 hover:text-blue-800 font-medium transition cursor-pointer"
                    >
                      详情
                    </button>
                    <button
                      type="button"
                      @click="editModule(row)"
                      class="text-[#25548d] hover:text-[#1e4472] font-medium transition cursor-pointer"
                    >
                      编辑
                    </button>
                    <a-dropdown :trigger="['click']">
                      <button
                        type="button"
                        class="text-slate-400 hover:text-slate-700 transition cursor-pointer px-1 py-0.5"
                      >
                        <MoreHorizontal class="w-3.5 h-3.5" />
                      </button>
                      <template #overlay>
                        <a-menu class="text-xs">
                          <a-menu-item @click="copySql(row)">
                            <div class="flex items-center space-x-1.5 py-0.5">
                              <Code class="w-3.5 h-3.5 text-indigo-600" />
                              <span>复制 SQL 插入语句</span>
                            </div>
                          </a-menu-item>
                          <a-menu-item @click="duplicateModule(row)">
                            <div class="flex items-center space-x-1.5 py-0.5">
                              <Copy class="w-3.5 h-3.5 text-blue-600" />
                              <span>以此为模板复制</span>
                            </div>
                          </a-menu-item>
                          <a-menu-divider />
                          <a-menu-item danger @click="deleteSingleModule(row)">
                            <div class="flex items-center space-x-1.5 py-0.5 text-rose-600">
                              <Trash2 class="w-3.5 h-3.5 mr-1" />
                              <span>删除模块</span>
                            </div>
                          </a-menu-item>
                        </a-menu>
                      </template>
                    </a-dropdown>
                  </div>
                </template>
              </vxe-column>
            </vxe-table>
          </VxeVirtualScrollWrapper>
        </div>

        <!-- 2.4 分页器 (双模切换：标准分页 / 全量虚拟视口) -->
        <div class="px-4 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div class="text-slate-500 flex items-center space-x-2">
            <template v-if="!isVirtualAllMode">
              <span>显示第 {{ (currentPage - 1) * pageSize + 1 }} 到 {{ Math.min(currentPage * pageSize, filteredModules.length) }} 条</span>
              <span>/</span>
              <span>共 {{ filteredModules.length }} 个模块</span>
            </template>
            <template v-else>
              <span class="inline-flex items-center text-indigo-700 font-medium space-x-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>全量虚拟视口已接管渲染：共 <strong>{{ filteredModules.length }}</strong> 条数据在高性能滚动池内</span>
              </span>
            </template>
          </div>

          <div v-if="!isVirtualAllMode" class="flex items-center space-x-3">
            <div class="flex items-center space-x-1">
              <span class="text-slate-500">每页:</span>
              <select
                v-model="pageSize"
                @change="currentPage = 1"
                class="border border-slate-300 rounded px-1.5 py-0.5 text-xs bg-white text-slate-700"
              >
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>

            <div class="flex items-center space-x-1">
              <button
                type="button"
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage <= 1"
                class="px-2 py-0.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition cursor-pointer"
              >
                上一页
              </button>
              <span class="px-2 font-mono text-slate-700">
                {{ currentPage }} / {{ totalPages || 1 }}
              </span>
              <button
                type="button"
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage >= totalPages"
                class="px-2 py-0.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition cursor-pointer"
              >
                下一页
              </button>
            </div>
          </div>
          <div v-else class="flex items-center space-x-2">
            <button
              type="button"
              @click="isVirtualAllMode = false"
              class="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs transition cursor-pointer"
            >
              切回标准分页
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗组件：新增 / 编辑模块 (支持 maskClosable=false 防误触) -->
    <ModuleEditModal
      v-model:visible="showEditModal"
      :initial-data="editingModule"
      :existing-modules="modules"
      @submit="onSaveModule"
    />

    <!-- 弹窗组件：模块详情与 SQL 预览 -->
    <ModuleDetailModal
      v-model:visible="showDetailModal"
      :module-data="viewingModule"
    />

    <!-- 弹窗组件：批量模拟测试模块生成 -->
    <ModuleBatchGenerateModal
      v-model:visible="showBatchGenerateModal"
      @generate="onBatchGenerated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Layers,
  Search,
  Plus,
  Copy,
  Trash2,
  MoreHorizontal,
  Sparkles,
  Zap,
  Download,
  Key,
  CheckCircle,
  ShieldAlert,
  Code,
} from 'lucide-vue-next';
import { message, Modal } from 'ant-design-vue';
import { PbsModule, ACTION_TYPE_OPTIONS } from '../../types/module';
import { INITIAL_MODULES } from '../../data/initialModules';
import {
  pageUtils,
  ATOMIC_PERM_OPTIONS,
  getActivePermBadges,
  toBinary11,
  toHex4,
} from '../../utils/pageUtils';
import VxeVirtualScrollWrapper from '../../components/common/VxeVirtualScrollWrapper.vue';
import ModuleEditModal from './ModuleEditModal.vue';
import ModuleDetailModal from './ModuleDetailModal.vue';
import ModuleBatchGenerateModal from './ModuleBatchGenerateModal.vue';

// 核心数据集
const modules = ref<PbsModule[]>([...INITIAL_MODULES]);

// 过滤状态
const searchKeyword = ref('');
const searchActionType = ref('all');
const searchFlag = ref('all');
const searchPermBit = ref<number>(0);
const kpiFilter = ref<'all' | 'active' | 'fullPerm' | 'hasAudit'>('all');

// 分页与全量虚拟模式
const currentPage = ref(1);
const pageSize = ref(10);
const selectedRows = ref<PbsModule[]>([]);
const isVirtualAllMode = ref(false);
const tableRef = ref<any>(null);

// 模态弹窗状态
const showEditModal = ref(false);
const editingModule = ref<PbsModule | null>(null);

const showDetailModal = ref(false);
const viewingModule = ref<PbsModule | null>(null);

const showBatchGenerateModal = ref(false);

// KPI 统计指标
const countActiveModules = computed(() => modules.value.filter(m => m.flag === 1).length);
const countFullPermModules = computed(() => modules.value.filter(m => m.rightvalues === pageUtils.PERM.ALL).length);
const countAuditModules = computed(() => modules.value.filter(m => (m.rightvalues & pageUtils.PERM.AUDIT) === pageUtils.PERM.AUDIT).length);

// 设置 KPI 卡片筛选联动
const setKpiFilter = (type: 'all' | 'active' | 'fullPerm' | 'hasAudit') => {
  kpiFilter.value = type;
  currentPage.value = 1;
};

// 过滤后的数据列表
const filteredModules = computed(() => {
  return modules.value.filter(m => {
    // 1. KPI 快捷过滤
    if (kpiFilter.value === 'active' && m.flag !== 1) return false;
    if (kpiFilter.value === 'fullPerm' && m.rightvalues !== pageUtils.PERM.ALL) return false;
    if (kpiFilter.value === 'hasAudit' && (m.rightvalues & pageUtils.PERM.AUDIT) !== pageUtils.PERM.AUDIT) return false;

    // 2. 状态过滤
    if (searchFlag.value !== 'all' && String(m.flag) !== searchFlag.value) return false;

    // 3. 操作类型过滤
    if (searchActionType.value !== 'all' && m.actiontypeid !== searchActionType.value) return false;

    // 4. 权限位过滤 (按位与判断)
    if (searchPermBit.value > 0) {
      if (searchPermBit.value === pageUtils.PERM.ALL) {
        if (m.rightvalues !== pageUtils.PERM.ALL) return false;
      } else {
        if ((m.rightvalues & searchPermBit.value) !== searchPermBit.value) return false;
      }
    }

    // 5. 关键字过滤
    if (searchKeyword.value.trim()) {
      const kw = searchKeyword.value.trim().toLowerCase();
      const matchId = m.module_id.toLowerCase().includes(kw);
      const matchName = m.module_name.toLowerCase().includes(kw);
      const matchUrl = m.actionurl.toLowerCase().includes(kw);
      const matchHint = (m.hint || '').toLowerCase().includes(kw);
      if (!matchId && !matchName && !matchUrl && !matchHint) return false;
    }

    return true;
  });
});

// 计算分页总页数
const totalPages = computed(() => Math.ceil(filteredModules.value.length / pageSize.value) || 1);

// 标准分页数据
const pagedModules = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredModules.value.slice(start, start + pageSize.value);
});

// 表格实际绑定的展示数据
const displayModules = computed(() => {
  if (isVirtualAllMode.value) {
    return filteredModules.value;
  }
  return pagedModules.value;
});

// 查询操作
const handleSearch = () => {
  currentPage.value = 1;
};

// 重置操作
const handleReset = () => {
  searchKeyword.value = '';
  searchActionType.value = 'all';
  searchFlag.value = 'all';
  searchPermBit.value = 0;
  kpiFilter.value = 'all';
  currentPage.value = 1;
};

// 复选框多选事件
const onCheckboxChange = ({ records }: any) => {
  selectedRows.value = records;
};
const onCheckboxAll = ({ records }: any) => {
  selectedRows.value = records;
};
const clearSelection = () => {
  selectedRows.value = [];
  tableRef.value?.clearCheckboxRow();
};

// 打开新建模块弹窗
const openAddModal = () => {
  editingModule.value = null;
  showEditModal.value = true;
};

// 打开编辑模块弹窗
const editModule = (row: PbsModule) => {
  editingModule.value = { ...row };
  showEditModal.value = true;
};

// 查看详情弹窗
const viewDetail = (row: PbsModule) => {
  viewingModule.value = row;
  showDetailModal.value = true;
};

// 保存模块 (新增/修改)
const onSaveModule = (mod: PbsModule) => {
  const index = modules.value.findIndex(m => m.id === mod.id);
  if (index >= 0) {
    modules.value[index] = mod;
  } else {
    modules.value.unshift(mod);
  }
};

// 切换单条模块启用状态
const toggleModuleFlag = (row: PbsModule, checked: boolean) => {
  const newFlag = checked ? 1 : 0;
  row.flag = newFlag;
  row.modify_time = new Date().toISOString().split('T')[0];
  message.success(`模块 [${row.module_name}] 已成功${newFlag === 1 ? '启用' : '停用'}`);
};

// 批量修改状态
const batchSetFlag = (flag: number) => {
  const ids = selectedRows.value.map(r => r.id);
  const now = new Date().toISOString().split('T')[0];
  modules.value.forEach(m => {
    if (ids.includes(m.id)) {
      m.flag = flag;
      m.modify_time = now;
    }
  });
  message.success(`已批量将选中的 ${ids.length} 个模块切换为：${flag === 1 ? '启用' : '停用'}`);
  clearSelection();
};

// 批量删除
const batchDelete = () => {
  const count = selectedRows.value.length;
  Modal.confirm({
    title: `确认批量删除选中的 ${count} 个系统模块？`,
    content: '删除操作不可逆，将从 pbs_module 表中物理清除该定义。',
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    maskClosable: false,
    onOk: () => {
      const ids = selectedRows.value.map(r => r.id);
      modules.value = modules.value.filter(m => !ids.includes(m.id));
      message.success(`已成功批量删除 ${count} 个模块！`);
      clearSelection();
    },
  });
};

// 单条删除
const deleteSingleModule = (row: PbsModule) => {
  Modal.confirm({
    title: `确认删除模块 [ ${row.module_name} ]？`,
    content: `模块ID: ${row.module_id}，删除后对应系统菜单与权限位绑定将失效。`,
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    maskClosable: false,
    onOk: () => {
      modules.value = modules.value.filter(m => m.id !== row.id);
      message.success(`模块 [ ${row.module_name} ] 已成功删除！`);
    },
  });
};

// 复制模块模板
const duplicateModule = (row: PbsModule) => {
  const baseTime = Date.now();
  const copy: PbsModule = {
    ...row,
    id: `1839${baseTime}${Math.floor(Math.random() * 899 + 100)}`,
    module_id: `${row.module_id}_COPY`,
    module_name: `${row.module_name} (副本)`,
    create_time: new Date().toISOString().split('T')[0],
    modify_time: new Date().toISOString().split('T')[0],
  };
  editingModule.value = copy;
  showEditModal.value = true;
};

// 复制 SQL
const copySql = async (row: PbsModule) => {
  const sql = `INSERT INTO pbs_module (id, module_id, module_name, hint, rightvalues, actionurl, actiontypeid, actionparams, flag, creater, create_time, modifyer, modify_time, remark) VALUES (${row.id}, '${row.module_id}', '${row.module_name}', '${row.hint || ''}', ${row.rightvalues}, '${row.actionurl}', '${row.actiontypeid}', '${row.actionparams || ''}', ${row.flag}, '${row.creater || 'admin'}', '${row.create_time || ''}', '${row.modifyer || 'admin'}', '${row.modify_time || ''}', '${row.remark || ''}');`;
  await navigator.clipboard.writeText(sql);
  message.success(`已复制模块 [${row.module_id}] 的 SQL 语句！`);
};

// 复制文本辅助
const copyText = async (txt: string, label: string) => {
  await navigator.clipboard.writeText(txt);
  message.success(`已复制 ${label}: ${txt}`);
};

// 批量生成后的处理
const onBatchGenerated = (newBatch: PbsModule[]) => {
  modules.value = [...newBatch, ...modules.value];
  message.success(`已成功批量注入 ${newBatch.length} 个系统业务模块！`);
};

// 虚拟滚动极速压测
const loadVirtualStressModules = (count: number = 1000) => {
  const baseTime = Date.now();
  const dateStr = new Date().toISOString().split('T')[0];
  const typePool = ['TAB_PAGE', 'MENU', 'MODAL_DIALOG', 'EXTERNAL_LINK'];
  const newBatch: PbsModule[] = [];

  for (let i = 1; i <= count; i++) {
    const seq = String(i).padStart(5, '0');
    const snowflakeId = `1839${baseTime}${seq}`;
    newBatch.push({
      id: snowflakeId,
      module_id: `STRESS_MOD_${baseTime.toString().slice(-4)}_${seq}`,
      module_name: `压力测试模块 #${seq}`,
      hint: `虚拟滚动压力测试模块 - 序列 #${seq}`,
      rightvalues: i % 10 === 0 ? 2047 : i % 3 === 0 ? 1279 : 15,
      actionurl: `/system/stress/mod_${seq}`,
      actiontypeid: typePool[i % typePool.length],
      actionparams: '{"density":"compact"}',
      flag: i % 20 === 0 ? 0 : 1,
      creater: '刘工 (主控业务员)',
      create_time: dateStr,
      modifyer: '系统管理员',
      modify_time: dateStr,
      remark: '虚拟滚动高并发高数据量压测模块。',
    });
  }

  modules.value = [...newBatch, ...modules.value];
  isVirtualAllMode.value = true;
  message.success({
    content: `已成功加载 ${count} 个合规业务模块！已自动开启【全量虚拟滚动模式】，总数 ${modules.value.length} 个模块丝滑畅滚。`,
    duration: 3.5,
  });
};

// 导出 CSV
const exportCsv = () => {
  const headers = ['主键ID(雪花)', '模块ID', '模块名称', '提示信息', '权限值(rightvalues)', '操作地址', '操作类型', '启用状态', '创建人', '创建时间'];
  const rows = filteredModules.value.map(m => [
    `"${m.id}"`,
    `"${m.module_id}"`,
    `"${m.module_name}"`,
    `"${(m.hint || '').replace(/"/g, '""')}"`,
    m.rightvalues,
    `"${m.actionurl}"`,
    `"${m.actiontypeid}"`,
    m.flag === 1 ? '启用' : '停用',
    `"${m.creater || ''}"`,
    `"${m.create_time || ''}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pbs_module_export_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  message.success(`已成功导出 ${filteredModules.value.length} 条模块数据！`);
};
</script>
