<template>
  <div class="flex-1 flex flex-col min-h-0 bg-slate-100 overflow-hidden relative">
    <!-- 1. 用户管理页签头 (与单据模块统一的 TabBar 风格) -->
    <div class="bg-slate-200/90 border-b border-slate-300/80 px-2 pt-1 flex items-center justify-between select-none text-xs gap-2 shrink-0">
      <div class="flex items-center space-x-1 py-0.5">
        <div class="relative flex items-center h-8 px-3 rounded-t-md bg-white text-slate-900 font-semibold border-t border-l border-r border-slate-300 shadow-2xs z-10">
          <span class="absolute top-0 left-0 right-0 h-0.5 bg-[#25548d] rounded-t"></span>
          <Users class="w-3.5 h-3.5 mr-1 text-[#25548d]" />
          <span>用户账号中心 (pbs_user)</span>
          <span class="ml-2 px-1.5 py-0.2 bg-[#f0f5fa] border border-[#cbdff2] text-[#25548d] rounded-full text-[10px] font-mono">
            {{ users.length }}
          </span>
        </div>
      </div>

      <div class="flex items-center space-x-2 text-slate-500 text-[11px] pr-2">
        <span class="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <ShieldCheck class="w-3 h-3 mr-1 text-emerald-600" />
          SaaS多租户 (tenant_id) 与雪花ID规范
        </span>
      </div>
    </div>

    <!-- 2. 主体内容区 (KPI指标卡 + 筛选区 + vxe-table数据列表 + 分页) -->
    <div class="flex-1 flex flex-col p-3 md:p-4 space-y-3 overflow-y-auto min-h-0">
      <!-- 2.1 统计卡片区 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0 select-none">
        <div
          @click="filterStatus = 'all'"
          :class="[
            'p-3.5 rounded-lg border shadow-2xs flex items-center justify-between transition cursor-pointer',
            filterStatus === 'all' ? 'ring-2 ring-[#25548d] bg-[#f0f5fa] border-[#cbdff2]' : 'bg-white border-slate-200 hover:border-[#25548d]/60'
          ]"
        >
          <div>
            <span class="text-xs font-medium text-slate-600">全部系统用户</span>
            <div class="text-xl font-bold font-mono mt-1 text-slate-900">
              {{ users.length }} <span class="text-xs font-normal text-slate-400">人</span>
            </div>
            <div class="text-[11px] text-slate-400 mt-0.5">租户 tenant_id = 1 全部账号</div>
          </div>
          <div class="p-2.5 rounded-full bg-slate-100 text-slate-600">
            <Users class="w-5 h-5" />
          </div>
        </div>

        <div
          @click="filterStatus = 'active'"
          :class="[
            'p-3.5 rounded-lg border shadow-2xs flex items-center justify-between transition cursor-pointer',
            filterStatus === 'active' ? 'ring-2 ring-[#25548d] bg-[#f0f5fa] border-[#cbdff2]' : 'bg-white border-slate-200 hover:border-[#25548d]/60'
          ]"
        >
          <div>
            <div class="flex items-center space-x-1.5">
              <span class="text-xs font-medium text-emerald-700">正常启用用户</span>
              <span v-if="filterStatus === 'active'" class="text-[10px] px-1 bg-[#25548d] text-white rounded scale-90">已筛选</span>
            </div>
            <div class="text-xl font-bold font-mono mt-1 text-emerald-700">
              {{ countActiveUsers }} <span class="text-xs font-normal text-slate-400">人</span>
            </div>
            <div class="text-[11px] text-slate-400 mt-0.5">flag=1 正常授权登录</div>
          </div>
          <div class="p-2.5 rounded-full bg-emerald-50 text-emerald-600">
            <UserCheck class="w-5 h-5" />
          </div>
        </div>

        <div
          @click="filterStatus = 'manager'"
          :class="[
            'p-3.5 rounded-lg border shadow-2xs flex items-center justify-between transition cursor-pointer',
            filterStatus === 'manager' ? 'ring-2 ring-[#25548d] bg-[#f0f5fa] border-[#cbdff2]' : 'bg-white border-slate-200 hover:border-[#25548d]/60'
          ]"
        >
          <div>
            <div class="flex items-center space-x-1.5">
              <span class="text-xs font-medium text-blue-700">管理用户 (审核员)</span>
              <span v-if="filterStatus === 'manager'" class="text-[10px] px-1 bg-[#25548d] text-white rounded scale-90">已筛选</span>
            </div>
            <div class="text-xl font-bold font-mono mt-1 text-[#25548d]">
              {{ countManagerUsers }} <span class="text-xs font-normal text-slate-400">人</span>
            </div>
            <div class="text-[11px] text-slate-400 mt-0.5">user_type=1 管理/核准权限</div>
          </div>
          <div class="p-2.5 rounded-full bg-blue-50 text-[#25548d]">
            <Shield class="w-5 h-5" />
          </div>
        </div>

        <div
          @click="filterStatus = 'disabled'"
          :class="[
            'p-3.5 rounded-lg border shadow-2xs flex items-center justify-between transition cursor-pointer',
            filterStatus === 'disabled' ? 'ring-2 ring-[#25548d] bg-[#f0f5fa] border-[#cbdff2]' : 'bg-white border-slate-200 hover:border-[#25548d]/60'
          ]"
        >
          <div>
            <div class="flex items-center space-x-1.5">
              <span class="text-xs font-medium text-rose-700">禁用 / 离职封存</span>
              <span v-if="filterStatus === 'disabled'" class="text-[10px] px-1 bg-[#25548d] text-white rounded scale-90">已筛选</span>
            </div>
            <div class="text-xl font-bold font-mono mt-1 text-rose-600">
              {{ countDisabledUsers }} <span class="text-xs font-normal text-slate-400">人</span>
            </div>
            <div class="text-[11px] text-slate-400 mt-0.5">flag=0 或 user_status=0</div>
          </div>
          <div class="p-2.5 rounded-full bg-rose-50 text-rose-600">
            <UserX class="w-5 h-5" />
          </div>
        </div>
      </div>

      <!-- 2.2 筛选查询栏与操作区 -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col flex-1 min-h-[380px]">
        <div class="p-3 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <!-- 查询项 -->
          <div class="flex flex-wrap items-center gap-2.5">
            <div class="flex items-center space-x-1">
              <span class="text-slate-500 font-medium">账号/姓名:</span>
              <a-input
                v-model:value="searchKeyword"
                placeholder="搜索账号或姓名"
                allow-clear
                size="middle"
                class="w-40"
                @pressEnter="handleSearch"
              />
            </div>

            <div class="flex items-center space-x-1">
              <span class="text-slate-500 font-medium">所属组织:</span>
              <a-select
                v-model:value="searchOrgId"
                placeholder="全部组织"
                allow-clear
                size="middle"
                class="w-44"
              >
                <a-select-option value="">全部组织架构</a-select-option>
                <a-select-option v-for="org in orgs" :key="org.id" :value="org.id">
                  {{ org.org_name }}
                </a-select-option>
              </a-select>
            </div>

            <div class="flex items-center space-x-1">
              <span class="text-slate-500 font-medium">用户类型:</span>
              <a-select
                v-model:value="searchUserType"
                placeholder="全部类型"
                size="middle"
                class="w-28"
              >
                <a-select-option value="all">全部类型</a-select-option>
                <a-select-option :value="0">普通用户</a-select-option>
                <a-select-option :value="1">管理用户</a-select-option>
              </a-select>
            </div>

            <div class="flex items-center space-x-1">
              <span class="text-slate-500 font-medium">状态:</span>
              <a-select
                v-model:value="searchFlag"
                placeholder="启用状态"
                size="middle"
                class="w-24"
              >
                <a-select-option value="all">全部状态</a-select-option>
                <a-select-option :value="1">启用</a-select-option>
                <a-select-option :value="0">禁用</a-select-option>
              </a-select>
            </div>

            <div class="flex items-center space-x-1.5 ml-1">
              <button
                type="button"
                @click="handleSearch"
                class="inline-flex items-center px-3 py-1.5 rounded-md bg-[#25548d] hover:bg-[#1e4676] active:bg-[#183860] text-white font-medium antialiased tracking-wide text-xs transition shadow-2xs cursor-pointer select-none"
              >
                <Search class="w-3.5 h-3.5 mr-1" />
                <span>查询</span>
              </button>

              <button
                type="button"
                @click="handleReset"
                class="inline-flex items-center px-2.5 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition shadow-2xs cursor-pointer select-none"
              >
                <RotateCcw class="w-3.5 h-3.5 text-slate-400 mr-1" />
                <span>重置</span>
              </button>
            </div>
          </div>

          <!-- 右侧动作按钮区 -->
          <div class="flex items-center space-x-2">
            <button
              v-if="selectedRows.length > 0"
              type="button"
              @click="showBatchResetPassModal = true"
              class="inline-flex items-center px-2.5 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition shadow-2xs cursor-pointer"
            >
              <KeyRound class="w-3.5 h-3.5 mr-1" />
              <span>重置密码 ({{ selectedRows.length }})</span>
            </button>

            <button
              type="button"
              @click="showBatchGenerateModal = true"
              class="inline-flex items-center px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition cursor-pointer"
              title="根据 pbs_user 规则批量模拟生成多行雪花ID测试用户"
            >
              <Sparkles class="w-3.5 h-3.5 text-indigo-600 mr-1" />
              <span>批量模拟生成</span>
            </button>

            <!-- 虚拟滚动压测快速注入 2000 行 -->
            <button
              type="button"
              @click="loadVirtualStressData(2000)"
              class="inline-flex items-center px-2.5 py-1.5 rounded border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs transition cursor-pointer"
              title="一键加载2,000行用户数据并切换至全量虚拟化滚动模式验证极速渲染"
            >
              <Zap class="w-3.5 h-3.5 mr-1 text-indigo-600" />
              <span>压测 2,000 行</span>
            </button>

            <button
              type="button"
              @click="exportCsv"
              class="inline-flex items-center px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition cursor-pointer"
            >
              <Download class="w-3.5 h-3.5 mr-1 text-slate-500" />
              <span>导出 CSV</span>
            </button>

            <button
              type="button"
              @click="openCreateModal"
              class="inline-flex items-center px-3.5 py-1.5 rounded-md bg-[#25548d] hover:bg-[#1e4676] active:bg-[#183860] text-white font-medium antialiased tracking-wide text-xs transition shadow-xs cursor-pointer select-none"
            >
              <Plus class="w-3.5 h-3.5 mr-1" />
              <span>新增用户</span>
            </button>
          </div>
        </div>

        <!-- 表格快捷操作提示与记录统计 -->
        <div class="px-4 py-1.5 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 flex items-center justify-between shrink-0">
          <div class="flex items-center space-x-2">
            <span class="w-1.5 h-1.5 rounded-full bg-[#25548d]"></span>
            <span>基于 <strong>pbs_user</strong> 表结构构建，支持雪花ID、租户唯一索引 (tenant_id, user_code)、密码策略与在职状态全生命周期管理。</span>
            <span class="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] border border-blue-200">
              ⚡ 虚拟滚动引擎激活
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
              检索共 {{ filteredUsers.length }} 位用户<template v-if="!isVirtualAllMode">（当前第 {{ currentPage }} / {{ totalPages || 1 }} 页）</template><template v-else>（全量虚拟视口已接管）</template>
            </span>
          </div>
        </div>

        <!-- 2.3 vxe-table 高性能虚拟滚动数据网格封装 -->
        <div class="flex-1 w-full relative min-h-[260px]">
          <VxeVirtualScrollWrapper
            ref="virtualWrapperRef"
            height="100%"
            :gt="20"
            :show-metrics="true"
            :item-count="displayUsers.length"
          >
            <vxe-table
              ref="tableRef"
              height="auto"
              border
              stripe
              round
              show-overflow
              class="text-xs"
              :data="displayUsers"
              :row-config="{ isHover: true, isCurrent: true, keyField: 'id' }"
              :checkbox-config="{ trigger: 'row', highlight: true }"
              @checkbox-change="onCheckboxChange"
              @checkbox-all="onCheckboxAll"
            >
            <!-- 复选框 -->
            <vxe-column type="checkbox" width="45" align="center" fixed="left" />

            <!-- 序号 -->
            <vxe-column type="seq" width="50" align="center" title="#" fixed="left" />

            <!-- 用户账号 (user_code) -->
            <vxe-column field="user_code" title="用户账号 (user_code)" width="140" fixed="left">
              <template #default="{ row }">
                <div
                  class="font-mono font-semibold text-[#25548d] hover:underline cursor-pointer flex items-center space-x-1"
                  @click="openDetailModal(row)"
                  title="点击查看全字段档案明细"
                >
                  <span>{{ row.user_code }}</span>
                </div>
              </template>
            </vxe-column>

            <!-- 用户姓名 (user_name) -->
            <vxe-column field="user_name" title="用户姓名 (user_name)" width="160" fixed="left">
              <template #default="{ row }">
                <div class="flex items-center space-x-1.5">
                  <div class="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                    {{ row.user_name.slice(0, 1) }}
                  </div>
                  <span class="font-medium text-slate-800">{{ row.user_name }}</span>
                </div>
              </template>
            </vxe-column>

            <!-- 所属组织 (org_id) -->
            <vxe-column field="org_name" title="所属组织 (org_id)" width="150">
              <template #default="{ row }">
                <span class="text-slate-700">{{ row.org_name || row.org_id }}</span>
              </template>
            </vxe-column>

            <!-- 用户类型 (user_type) -->
            <vxe-column field="user_type" title="类型 (user_type)" width="110" align="center">
              <template #default="{ row }">
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-[11px] font-medium inline-flex items-center space-x-1',
                    row.user_type === 1
                      ? 'bg-blue-50 text-[#25548d] border border-[#cbdff2]'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  ]"
                >
                  <span>{{ row.user_type === 1 ? '👑 管理用户' : '👤 普通用户' }}</span>
                </span>
              </template>
            </vxe-column>

            <!-- 性别 (gender) -->
            <vxe-column field="gender" title="性别" width="70" align="center">
              <template #default="{ row }">
                <span class="text-slate-600">
                  {{ row.gender === 1 ? '男' : row.gender === 2 ? '女' : '保密' }}
                </span>
              </template>
            </vxe-column>

            <!-- 是否启用 (flag) -->
            <vxe-column field="flag" title="启用状态 (flag)" width="110" align="center">
              <template #default="{ row }">
                <a-switch
                  :checked="row.flag === 1"
                  size="small"
                  checked-children="启用"
                  un-checked-children="禁用"
                  @change="(val: any) => toggleUserFlag(row, val ? 1 : 0)"
                />
              </template>
            </vxe-column>

            <!-- 在职状态 (user_status) -->
            <vxe-column field="user_status" title="在职状态" width="90" align="center">
              <template #default="{ row }">
                <span
                  :class="[
                    'px-1.5 py-0.5 rounded text-[10px] font-medium',
                    row.user_status === 1 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                  ]"
                >
                  {{ row.user_status === 1 ? '在职' : '离职' }}
                </span>
              </template>
            </vxe-column>

            <!-- 手机号 (mobile) -->
            <vxe-column field="mobile" title="手机号码" width="120">
              <template #default="{ row }">
                <span class="font-mono text-slate-700">{{ row.mobile || '-' }}</span>
              </template>
            </vxe-column>

            <!-- 邮箱 (email) -->
            <vxe-column field="email" title="电子邮箱" min-width="170">
              <template #default="{ row }">
                <span class="font-mono text-slate-600">{{ row.email || '-' }}</span>
              </template>
            </vxe-column>

            <!-- 账号生效与失效日期 (begindate / enddate) -->
            <vxe-column title="账号有效期" width="180" align="center">
              <template #default="{ row }">
                <span class="font-mono text-[11px] text-slate-600">
                  {{ row.begindate || '起始' }} ~ {{ row.enddate || '长期' }}
                </span>
              </template>
            </vxe-column>

            <!-- 密码策略 (pass_type) -->
            <vxe-column field="pass_type" title="密码策略" width="95" align="center">
              <template #default="{ row }">
                <span class="text-xs text-slate-600">
                  {{ row.pass_type === 1 ? '🔒 加强' : '🔓 普通' }}
                </span>
              </template>
            </vxe-column>

            <!-- 语言 (language_id) -->
            <vxe-column field="language_id" title="语言" width="80" align="center">
              <template #default="{ row }">
                <span class="text-xs text-slate-600">{{ row.language_id === 1 ? '中文' : '英文' }}</span>
              </template>
            </vxe-column>

            <!-- 入职日期 (entrydate) -->
            <vxe-column field="entrydate" title="入职日期" width="105" align="center">
              <template #default="{ row }">
                <span class="font-mono text-slate-600">{{ row.entrydate || '-' }}</span>
              </template>
            </vxe-column>

            <!-- 主键雪花ID (id) -->
            <vxe-column field="id" title="雪花主键 (id)" width="180">
              <template #default="{ row }">
                <span class="font-mono text-slate-500 text-[11px]" :title="row.id">{{ row.id }}</span>
              </template>
            </vxe-column>

            <!-- 操作列 -->
            <vxe-column title="操作" width="150" fixed="right" align="center">
              <template #default="{ row }">
                <div class="flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    @click="openEditModal(row)"
                    class="text-[#25548d] hover:text-[#183a62] font-medium text-xs cursor-pointer"
                  >
                    编辑
                  </button>

                  <button
                    type="button"
                    @click="openResetPassModal(row)"
                    class="text-amber-600 hover:text-amber-700 font-medium text-xs cursor-pointer"
                  >
                    重置密码
                  </button>

                  <a-popconfirm
                    title="确定要注销删除此用户记录吗？"
                    ok-text="确认删除"
                    cancel-text="取消"
                    @confirm="deleteUser(row.id)"
                  >
                    <button
                      type="button"
                      class="text-rose-600 hover:text-rose-700 font-medium text-xs cursor-pointer"
                    >
                      删除
                    </button>
                  </a-popconfirm>
                </div>
              </template>
            </vxe-column>
          </vxe-table>
        </VxeVirtualScrollWrapper>
      </div>

        <!-- 2.4 分页器 (全量虚拟滚动模式下展示视口状态，普通模式展示常规分页) -->
        <div class="px-4 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div class="text-slate-500 flex items-center space-x-2">
            <template v-if="!isVirtualAllMode">
              <span>显示第 {{ (currentPage - 1) * pageSize + 1 }} 到 {{ Math.min(currentPage * pageSize, filteredUsers.length) }} 条</span>
              <span>/</span>
              <span>共 {{ filteredUsers.length }} 条记录</span>
            </template>
            <template v-else>
              <span class="inline-flex items-center text-indigo-700 font-medium space-x-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>全量虚拟视口已接管渲染：共 <strong>{{ filteredUsers.length }}</strong> 条数据在极速虚拟滚动池内</span>
              </span>
            </template>
          </div>

          <div v-if="!isVirtualAllMode" class="flex items-center space-x-3">
            <div class="flex items-center space-x-1">
              <span class="text-slate-500">每页:</span>
              <select
                v-model="pageSize"
                class="border border-slate-300 rounded px-1.5 py-0.5 text-xs bg-white text-slate-700"
              >
                <option :value="10">10 条/页</option>
                <option :value="20">20 条/页</option>
                <option :value="50">50 条/页</option>
                <option :value="100">100 条/页</option>
              </select>
            </div>

            <div class="flex items-center space-x-1">
              <button
                type="button"
                :disabled="currentPage <= 1"
                @click="currentPage--"
                class="px-2 py-0.5 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                上一页
              </button>
              <span class="px-2 font-mono text-slate-700">{{ currentPage }} / {{ totalPages || 1 }}</span>
              <button
                type="button"
                :disabled="currentPage >= totalPages"
                @click="currentPage++"
                class="px-2 py-0.5 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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

    <!-- 3. 用户编辑 / 新增弹窗 -->
    <UserEditModal
      v-model:visible="showEditModal"
      :user="editingUser"
      :orgs="orgs"
      @save="onSaveUser"
    />

    <!-- 4. 重置密码弹窗 -->
    <UserResetPasswordModal
      v-model:visible="showBatchResetPassModal"
      :users="targetResetUsers"
      @confirm="onConfirmResetPassword"
    />

    <!-- 5. 模拟数据批量生成弹窗 -->
    <UserBatchGenerateModal
      v-model:visible="showBatchGenerateModal"
      :orgs="orgs"
      @generate="onBatchGenerated"
    />

    <!-- 6. 用户全字段详情明细弹窗 -->
    <UserDetailModal
      v-model:visible="showDetailModal"
      :user="selectedDetailUser"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import {
  Users,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Search,
  RotateCcw,
  Plus,
  KeyRound,
  Sparkles,
  Download,
  Zap,
} from 'lucide-vue-next';
import { PbsUser, PbsOrg } from '../../types/user';
import { INITIAL_USERS, INITIAL_ORGS } from '../../data/initialUsers';
import VxeVirtualScrollWrapper from '../../components/common/VxeVirtualScrollWrapper.vue';
import UserEditModal from './UserEditModal.vue';
import UserResetPasswordModal from './UserResetPasswordModal.vue';
import UserBatchGenerateModal from './UserBatchGenerateModal.vue';
import UserDetailModal from './UserDetailModal.vue';

// 组织架构与用户列表数据源
const orgs = ref<PbsOrg[]>([...INITIAL_ORGS]);
const users = ref<PbsUser[]>([...INITIAL_USERS]);

// 快速过滤 KPI 状态
const filterStatus = ref<'all' | 'active' | 'manager' | 'disabled'>('all');

// 搜索条件
const searchKeyword = ref('');
const searchOrgId = ref<string>('');
const searchUserType = ref<any>('all');
const searchFlag = ref<any>('all');

// 分页与虚拟滚动模式
const currentPage = ref(1);
const pageSize = ref(10);
const selectedRows = ref<PbsUser[]>([]);
const isVirtualAllMode = ref(false);
const virtualWrapperRef = ref<any>(null);

// 弹窗状态
const showEditModal = ref(false);
const editingUser = ref<PbsUser | null>(null);

const showBatchResetPassModal = ref(false);
const singleResetUser = ref<PbsUser | null>(null);

const showBatchGenerateModal = ref(false);
const showDetailModal = ref(false);
const selectedDetailUser = ref<PbsUser | null>(null);

// KPI 指标计算
const countActiveUsers = computed(() => users.value.filter((u) => u.flag === 1 && u.user_status === 1).length);
const countManagerUsers = computed(() => users.value.filter((u) => u.user_type === 1).length);
const countDisabledUsers = computed(() => users.value.filter((u) => u.flag === 0 || u.user_status === 0).length);

// 综合筛选数据
const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    // 顶部卡片快速筛选
    if (filterStatus.value === 'active' && (u.flag !== 1 || u.user_status !== 1)) return false;
    if (filterStatus.value === 'manager' && u.user_type !== 1) return false;
    if (filterStatus.value === 'disabled' && (u.flag !== 0 && u.user_status !== 0)) return false;

    // 关键词筛选 (账号或姓名)
    if (searchKeyword.value.trim()) {
      const kw = searchKeyword.value.trim().toLowerCase();
      const codeMatch = u.user_code.toLowerCase().includes(kw);
      const nameMatch = u.user_name.toLowerCase().includes(kw);
      const mobileMatch = u.mobile?.includes(kw);
      if (!codeMatch && !nameMatch && !mobileMatch) return false;
    }

    // 组织筛选
    if (searchOrgId.value && u.org_id !== searchOrgId.value) return false;

    // 用户类型筛选
    if (searchUserType.value !== 'all' && u.user_type !== Number(searchUserType.value)) return false;

    // 状态筛选
    if (searchFlag.value !== 'all' && u.flag !== Number(searchFlag.value)) return false;

    return true;
  });
});

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / pageSize.value) || 1);

const pagedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredUsers.value.slice(start, start + pageSize.value);
});

// 表格实际绑定的数据：全量虚拟滚动模式下直连 filteredUsers，普通模式下使用分页切片
const displayUsers = computed(() => {
  if (isVirtualAllMode.value) {
    return filteredUsers.value;
  }
  return pagedUsers.value;
});

// 查询操作
const handleSearch = () => {
  currentPage.value = 1;
};

const handleReset = () => {
  searchKeyword.value = '';
  searchOrgId.value = '';
  searchUserType.value = 'all';
  searchFlag.value = 'all';
  filterStatus.value = 'all';
  currentPage.value = 1;
};

// 复选框事件
const onCheckboxChange = ({ records }: any) => {
  selectedRows.value = records;
};

const onCheckboxAll = ({ records }: any) => {
  selectedRows.value = records;
};

// 状态快速开关
const toggleUserFlag = (row: PbsUser, newFlag: number) => {
  row.flag = newFlag;
  row.modify_time = new Date().toLocaleString();
  message.success(`用户 [${row.user_code}] 已${newFlag === 1 ? '启用' : '禁用'}`);
};

// 新增与编辑
const openCreateModal = () => {
  editingUser.value = null;
  showEditModal.value = true;
};

const openEditModal = (row: PbsUser) => {
  editingUser.value = { ...row };
  showEditModal.value = true;
};

const openDetailModal = (row: PbsUser) => {
  selectedDetailUser.value = row;
  showDetailModal.value = true;
};

const onSaveUser = (savedUser: PbsUser) => {
  const idx = users.value.findIndex((u) => u.id === savedUser.id);
  if (idx >= 0) {
    users.value[idx] = savedUser;
    message.success(`已更新用户 [${savedUser.user_code}] 资料！`);
  } else {
    // 校验唯一联合索引 (tenant_id, user_code)
    const exists = users.value.some(
      (u) => u.tenant_id === savedUser.tenant_id && u.user_code.toLowerCase() === savedUser.user_code.toLowerCase()
    );
    if (exists) {
      message.error(`该租户下账号 [${savedUser.user_code}] 已存在，无法重复创建！`);
      return;
    }
    users.value.unshift(savedUser);
    message.success(`成功新建用户 [${savedUser.user_code}]！`);
  }
};

// 删除用户
const deleteUser = (id: string) => {
  const target = users.value.find((u) => u.id === id);
  users.value = users.value.filter((u) => u.id !== id);
  selectedRows.value = selectedRows.value.filter((u) => u.id !== id);
  message.success(`用户 [${target?.user_code || id}] 已成功注销删除！`);
};

// 重置密码
const targetResetUsers = computed(() => {
  if (singleResetUser.value) return [singleResetUser.value];
  return selectedRows.value;
});

const openResetPassModal = (row: PbsUser) => {
  singleResetUser.value = row;
  showBatchResetPassModal.value = true;
};

const onConfirmResetPassword = ({ userIds, passType }: { userIds: string[]; passType: number }) => {
  users.value.forEach((u) => {
    if (userIds.includes(u.id)) {
      u.pass_type = passType;
      u.modify_time = new Date().toLocaleString();
    }
  });
  message.success(`已为选中的 ${userIds.length} 位用户重置密码与安全策略！`);
  singleResetUser.value = null;
};

// 批量生成
const onBatchGenerated = (newUsers: PbsUser[]) => {
  users.value = [...newUsers, ...users.value];
  message.success(`已成功批量追加 ${newUsers.length} 位合规测试用户！`);
};

// 虚拟滚动极速压测加载
const loadVirtualStressData = (count: number = 2000) => {
  const SURNAMES = ['张', '王', '李', '赵', '陈', '刘', '杨', '黄', '吴', '周', '徐', '孙', '马', '朱', '胡', '林', '郭', '何'];
  const GIVENS = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀英', '浩', '欣'];
  const orgList = orgs.value.length > 0 ? orgs.value : INITIAL_ORGS;
  const newBatch: PbsUser[] = [];
  const baseTime = Date.now();

  for (let i = 0; i < count; i++) {
    const s = SURNAMES[i % SURNAMES.length];
    const g = GIVENS[(i * 3 + 7) % GIVENS.length];
    const org = orgList[i % orgList.length];
    const seqNum = String(10000 + (users.value.length + i)).padStart(6, '0');
    const snowflakeId = `1839${baseTime}${String(i + 1).padStart(5, '0')}`;

    newBatch.push({
      id: snowflakeId,
      tenant_id: 'default_tenant',
      user_code: `stress_${seqNum}`,
      user_name: `${s}${g}`,
      org_id: org.id,
      org_name: org.org_name,
      user_type: i % 25 === 0 ? 1 : 2,
      gender: (i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 0) as 0 | 1 | 2,
      user_status: i % 30 === 0 ? 0 : 1,
      flag: i % 20 === 0 ? 0 : 1,
      mobile: `138${String(10000000 + (i % 90000000))}`,
      email: `stress_${seqNum}@enterprise.com`,
      begindate: '2024-01-01',
      enddate: '2099-12-31',
      entrydate: '2024-03-15',
      create_time: new Date(baseTime - i * 60000).toLocaleString(),
      modify_time: new Date().toLocaleString(),
      pass_type: 1,
    });
  }

  users.value = [...newBatch, ...users.value];
  isVirtualAllMode.value = true;
  message.success({
    content: `已成功注入 ${count} 条合规企业用户！已自动开启【全量虚拟滚动模式】，总数 ${users.value.length} 条数据即刻流畅丝滑滚动。`,
    duration: 3.5,
  });
};

// 导出 CSV
const exportCsv = () => {
  const headers = ['主键ID(雪花)', '租户ID', '用户账号', '用户姓名', '组织架构', '用户类型', '性别', '启用状态', '在职状态', '手机号码', '邮箱', '入职日期'];
  const rows = filteredUsers.value.map((u) => [
    `"${u.id}"`,
    u.tenant_id,
    `"${u.user_code}"`,
    `"${u.user_name}"`,
    `"${u.org_name || u.org_id}"`,
    u.user_type === 1 ? '管理用户' : '普通用户',
    u.gender === 1 ? '男' : u.gender === 2 ? '女' : '保密',
    u.flag === 1 ? '启用' : '禁用',
    u.user_status === 1 ? '在职' : '离职',
    `"${u.mobile || ''}"`,
    `"${u.email || ''}"`,
    `"${u.entrydate || ''}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `pbs_user_export_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  message.success('已导出当前筛选用户列表 CSV 文件！');
};
</script>
