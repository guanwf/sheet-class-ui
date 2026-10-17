<template>
  <div class="flex-1 flex flex-col min-h-0 bg-[#F4F6F9] text-slate-800 font-sans antialiased overflow-hidden">
    <!-- 1. 顶栏：面包屑导航与全局操作 (仅查看与修改，不设新增与删除) -->
    <header class="bg-white border-b border-[#DDE3EA] px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-2xs">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-lg bg-[#1F4FD8]/10 text-[#1F4FD8] flex items-center justify-center font-bold text-lg shadow-2xs">
          ⚙️
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-base font-bold text-slate-900 m-0">系统参数配置管理</h1>
            <span class="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600 font-mono border border-slate-300">
              pbs_config
            </span>
            <span class="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] bg-blue-50 text-[#1F4FD8] font-mono border border-blue-200">
              UNIQUE KEY uk_name (tenant_id, name)
            </span>
          </div>
          <p class="text-xs text-slate-500 m-0 mt-0.5">
            系统参数由后台统一初始化预置，仅支持在线查看与修改运行数值，不允许新增或删除物理参数键
          </p>
        </div>
      </div>

      <!-- 右侧全局操作 (不提供新增与重置为初始值) -->
      <div class="flex items-center space-x-2.5">
        <!-- 导出备份 -->
        <button
          type="button"
          @click="store.exportModalVisible = true"
          title="导出当前生效配置为 JSON 备份清单"
          class="h-9 px-3 bg-white hover:bg-slate-50 text-slate-700 rounded-md border border-slate-300 text-xs font-medium flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors"
        >
          <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span>导出配置</span>
        </button>

        <!-- 刷新 -->
        <button
          type="button"
          @click="store.fetchConfigs()"
          title="重新从后台拉取参数配置"
          class="h-9 px-3 bg-white hover:bg-slate-50 text-[#1F4FD8] font-semibold rounded-md border border-blue-200 text-xs flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors"
        >
          <svg
            :class="['w-3.5 h-3.5 text-[#1F4FD8]', store.loading ? 'animate-spin' : '']"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>刷新</span>
        </button>
      </div>
    </header>

    <!-- 2. 主体内容区 (单表架构) -->
    <main class="flex-1 flex flex-col min-h-0 p-4 space-y-3 overflow-y-auto" aria-label="配置中心工作区">
      <!-- 2.1 统计指标卡片 (可点击快速筛选对应生效模式) -->
      <section class="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0" aria-label="参数统计指标">
        <div
          @click="store.resetFilters()"
          title="点击展示当前全部参数"
          class="bg-white border border-[#DDE3EA] rounded-lg p-3 shadow-2xs hover:border-[#1F4FD8]/60 cursor-pointer transition-all"
        >
          <div class="flex items-center justify-between text-slate-500 text-xs">
            <span>参数总数 (Total)</span>
            <span class="text-slate-400 font-mono text-[10px]">ALL</span>
          </div>
          <div class="text-xl font-bold text-slate-900 font-mono mt-1">
            {{ store.stats.total }}
            <span class="text-xs font-normal text-slate-400">项</span>
          </div>
        </div>

        <div
          @click="store.filterNeedRestart = 0"
          title="点击筛选无需重启、热重载即时生效的参数"
          :class="[
            'bg-white border rounded-lg p-3 shadow-2xs cursor-pointer transition-all',
            store.filterNeedRestart === 0 ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20' : 'border-[#DDE3EA] hover:border-emerald-500/60'
          ]"
        >
          <div class="flex items-center justify-between text-slate-500 text-xs">
            <span class="text-emerald-700 font-medium">⚡ 热重载即时生效</span>
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div class="text-xl font-bold text-emerald-600 font-mono mt-1">
            {{ store.stats.hotReload }}
            <span class="text-xs font-normal text-slate-400">项</span>
          </div>
        </div>

        <div
          @click="store.filterNeedRestart = 1"
          title="点击筛选需重启微服务容器方可生效的底层参数"
          :class="[
            'bg-white border rounded-lg p-3 shadow-2xs cursor-pointer transition-all',
            store.filterNeedRestart === 1 ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20' : 'border-[#DDE3EA] hover:border-amber-500/60'
          ]"
        >
          <div class="flex items-center justify-between text-slate-500 text-xs">
            <span class="text-amber-700 font-medium">⚠️ 需重启微服务生效</span>
            <span class="text-amber-500 text-xs">●</span>
          </div>
          <div class="text-xl font-bold text-amber-600 font-mono mt-1">
            {{ store.stats.restartReq }}
            <span class="text-xs font-normal text-slate-400">项</span>
          </div>
        </div>

        <div
          @click="store.filterEditable = 0"
          title="点击筛选系统内置只读保护参数"
          :class="[
            'bg-white border rounded-lg p-3 shadow-2xs cursor-pointer transition-all',
            store.filterEditable === 0 ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20' : 'border-[#DDE3EA] hover:border-red-500/60'
          ]"
        >
          <div class="flex items-center justify-between text-slate-500 text-xs">
            <span class="text-red-700 font-medium">🔒 内置只读保护</span>
            <span class="text-[10px] font-mono bg-red-50 text-red-600 px-1 rounded">Read-Only</span>
          </div>
          <div class="text-xl font-bold text-slate-800 font-mono mt-1">
            {{ store.stats.readOnly }}
            <span class="text-xs font-normal text-slate-400">项</span>
          </div>
        </div>
      </section>

      <!-- 2.2 业务域分类标签栏 (通过读取 tag 字段动态聚合展示) -->
      <section class="bg-white border border-[#DDE3EA] rounded-lg px-4 py-2.5 shadow-2xs flex items-center space-x-2 overflow-x-auto shrink-0 text-xs">
        <div class="flex items-center space-x-1.5 font-semibold text-slate-700 shrink-0 mr-2">
          <svg class="w-4 h-4 text-[#1F4FD8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span>业务域分类 (tag):</span>
        </div>

        <!-- 全部业务域按钮 -->
        <button
          type="button"
          @click="store.selectedTag = 'ALL'"
          :class="[
            'px-3 py-1.5 rounded-md text-xs transition-colors shrink-0 cursor-pointer flex items-center space-x-1.5',
            store.selectedTag === 'ALL'
              ? 'bg-[#1F4FD8] text-white font-bold shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          ]"
        >
          <span>全部业务域</span>
          <span
            :class="[
              'px-1.5 py-0.2 rounded-full text-[10px] font-mono',
              store.selectedTag === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
            ]"
          >
            {{ store.tagCounts['ALL'] || 0 }}
          </span>
        </button>

        <!-- 各动态读取的 tag 分类按钮 -->
        <button
          v-for="tg in store.tags.filter(t => t !== 'ALL')"
          :key="tg"
          type="button"
          @click="store.selectedTag = tg"
          :class="[
            'px-3 py-1.5 rounded-md text-xs transition-colors shrink-0 cursor-pointer flex items-center space-x-1.5',
            store.selectedTag === tg
              ? 'bg-[#1F4FD8] text-white font-bold shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          ]"
        >
          <span>{{ tg }}</span>
          <span
            :class="[
              'px-1.5 py-0.2 rounded-full text-[10px] font-mono',
              store.selectedTag === tg ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
            ]"
          >
            {{ store.tagCounts[tg] || 0 }}
          </span>
        </button>
      </section>

      <!-- 2.3 组合查询过滤工具栏 (无租户查询、无重置为初始值) -->
      <section class="bg-white border border-[#DDE3EA] rounded-lg p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
        <div class="flex flex-wrap items-center gap-3">
          <!-- 值类型筛选 value_type -->
          <div class="flex items-center space-x-1.5">
            <label for="cfg-type-filter" class="font-medium text-slate-600 shrink-0">值类型:</label>
            <select
              id="cfg-type-filter"
              v-model="store.selectedValueType"
              class="h-8 px-2.5 bg-slate-50 text-slate-800 border border-slate-300 rounded-md focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
            >
              <option value="ALL">全部类型 (ALL)</option>
              <option value="STRING">🔤 STRING 字符串 ({{ store.stats.strType }})</option>
              <option value="JSON">📦 JSON 结构体 ({{ store.stats.jsonType }})</option>
              <option value="NUMBER">🔢 NUMBER 数值 ({{ store.stats.numType }})</option>
              <option value="BOOLEAN">🔘 BOOLEAN 布尔 ({{ store.stats.boolType }})</option>
            </select>
          </div>

          <!-- 重启生效筛选 need_restart -->
          <div class="flex items-center space-x-1.5">
            <label for="cfg-restart-filter" class="font-medium text-slate-600 shrink-0">生效机制:</label>
            <select
              id="cfg-restart-filter"
              v-model="store.filterNeedRestart"
              class="h-8 px-2.5 bg-slate-50 text-slate-800 border border-slate-300 rounded-md focus:border-[#1F4FD8]"
            >
              <option :value="-1">全部机制</option>
              <option :value="0">⚡ 热重载即时生效 (0)</option>
              <option :value="1">⚠️ 需重启生效 (1)</option>
            </select>
          </div>

          <!-- 搜索输入框 -->
          <div class="relative w-64">
            <input
              v-model="store.searchKeyword"
              type="search"
              placeholder="搜索参数名/业务域/描述/参数值..."
              aria-label="搜索系统参数"
              class="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 text-slate-800 border border-slate-300 rounded-md placeholder-slate-400 focus:outline-hidden focus:border-[#1F4FD8] focus:bg-white"
            />
            <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- 包含隐藏项复选框 -->
          <label class="flex items-center space-x-1.5 cursor-pointer text-slate-600 select-none">
            <input
              type="checkbox"
              v-model="store.includeHidden"
              class="w-3.5 h-3.5 text-[#1F4FD8] rounded border-slate-300 focus:ring-[#1F4FD8]"
            />
            <span>包含脱敏隐藏项 (visible=0)</span>
          </label>

          <!-- 清空筛选按钮 -->
          <button
            type="button"
            @click="store.resetFilters()"
            class="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors cursor-pointer"
          >
            清空筛选
          </button>
        </div>

        <div class="text-slate-500 text-xs">
          当前展示 <strong class="text-[#1F4FD8] font-mono">{{ store.filteredConfigs.length }}</strong> / 共 {{ store.configs.length }} 项参数
        </div>
      </section>

      <!-- 2.4 单表核心表格 (包含新增 tag 标签分类字段) -->
      <section class="bg-white border border-[#DDE3EA] rounded-lg overflow-hidden flex-1 flex flex-col min-h-0 shadow-2xs" aria-label="参数配置单表">
        <div class="flex-1 overflow-auto">
          <table class="w-full text-left text-xs border-collapse min-w-[1150px]">
            <thead>
              <tr class="bg-slate-50 text-slate-700 font-semibold border-b border-[#DDE3EA] sticky top-0 z-10 select-none">
                <th scope="col" class="py-3 px-3 w-14 text-center">排序</th>
                <th scope="col" class="py-3 px-3 w-28 text-center">业务域 (tag)</th>
                <th scope="col" class="py-3 px-3.5 w-64">参数名 (name)</th>
                <th scope="col" class="py-3 px-3 w-24 text-center">类型</th>
                <th scope="col" class="py-3 px-3.5 min-w-[260px]">参数值 (value)</th>
                <th scope="col" class="py-3 px-3.5 min-w-[200px]">参数描述 (description)</th>
                <th scope="col" class="py-3 px-3 w-28 text-center">生效机制</th>
                <th scope="col" class="py-3 px-3 w-20 text-center">状态</th>
                <th scope="col" class="py-3 px-3.5 w-36">修改信息</th>
                <th scope="col" class="py-3 px-4 w-36 text-right sticky right-0 bg-slate-50 shadow-xs">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <!-- 空状态 -->
              <tr v-if="store.filteredConfigs.length === 0">
                <td colspan="10" class="py-16 text-center text-slate-400">
                  <div class="flex flex-col items-center justify-center space-y-2">
                    <span class="text-3xl">⚙️</span>
                    <span class="text-sm font-medium text-slate-500">未找到匹配的系统配置参数</span>
                    <p class="text-xs text-slate-400 m-0">请尝试切换业务域分类或清空筛选条件</p>
                    <button
                      type="button"
                      @click="store.resetFilters()"
                      class="mt-2 px-3 py-1.5 text-xs text-[#1F4FD8] bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 cursor-pointer"
                    >
                      清空筛选
                    </button>
                  </div>
                </td>
              </tr>

              <!-- 数据行 -->
              <tr
                v-for="cfg in store.filteredConfigs"
                :key="cfg.id"
                class="hover:bg-slate-50/80 transition-colors group"
              >
                <!-- 1. 排序权重 -->
                <td class="py-3 px-3 text-center font-mono text-slate-400 text-xs">
                  {{ cfg.sortOrder }}
                </td>

                <!-- 2. 业务域标签分类 (tag) -->
                <td class="py-3 px-3 text-center">
                  <button
                    type="button"
                    @click="store.selectedTag = cfg.tag"
                    title="点击按该业务域筛选"
                    class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-[#1F4FD8] text-slate-700 border border-slate-200 transition-colors cursor-pointer inline-block"
                  >
                    {{ cfg.tag }}
                  </button>
                </td>

                <!-- 3. 参数名 (name) -->
                <td class="py-3 px-3.5">
                  <div class="flex items-center space-x-1.5">
                    <span class="font-mono font-bold text-slate-900 break-all select-all">
                      {{ cfg.name }}
                    </span>
                    <button
                      type="button"
                      @click="copyText(cfg.name, '参数名')"
                      title="复制参数名"
                      class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#1F4FD8] transition-opacity cursor-pointer p-0.5"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </td>

                <!-- 4. 类型 (value_type) -->
                <td class="py-3 px-3 text-center">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded font-mono font-bold text-[10px] inline-block border',
                      getTypeBadgeClass(cfg.valueType)
                    ]"
                  >
                    {{ cfg.valueType }}
                  </span>
                </td>

                <!-- 5. 参数值 (value) 针对不同类型智能设计展示 -->
                <td class="py-3 px-3.5 font-mono text-xs">
                  <!-- A. 布尔类型：提供直接快捷 Switch 开关与状态标签 -->
                  <div v-if="cfg.valueType === 'BOOLEAN'" class="flex items-center space-x-2">
                    <button
                      type="button"
                      @click="handleQuickToggle(cfg)"
                      :disabled="cfg.editable === 0"
                      :title="cfg.editable === 0 ? '只读参数不可切换' : '点击快捷切换 true/false'"
                      :class="[
                        'w-8 h-4.5 rounded-full transition-colors relative cursor-pointer inline-block align-middle disabled:cursor-not-allowed disabled:opacity-60',
                        (cfg.value === 'true' || cfg.value === '1') ? 'bg-emerald-600' : 'bg-slate-300'
                      ]"
                    >
                      <span
                        :class="[
                          'w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform shadow-2xs',
                          (cfg.value === 'true' || cfg.value === '1') ? 'right-0.5' : 'left-0.5'
                        ]"
                      ></span>
                    </button>
                    <span
                      :class="[
                        'font-bold text-[11px]',
                        (cfg.value === 'true' || cfg.value === '1') ? 'text-emerald-700' : 'text-slate-500'
                      ]"
                    >
                      {{ cfg.value }}
                    </span>
                    <span v-if="cfg.needRestart === 1" class="text-[10px] text-amber-600" title="切换后需重启生效">
                      (待重启)
                    </span>
                  </div>

                  <!-- B. JSON 类型：折叠摘要 + 格式化预览快捷弹层 -->
                  <div v-else-if="cfg.valueType === 'JSON'" class="flex items-center space-x-2">
                    <div
                      class="max-w-[280px] truncate bg-slate-900 text-emerald-400 px-2 py-1 rounded text-[11px] font-mono border border-slate-700"
                      :title="cfg.value"
                    >
                      {{ getJsonSummary(cfg.value) }}
                    </div>
                    <button
                      type="button"
                      @click="store.openDetailDrawer(cfg)"
                      title="展开完整 JSON 结构树"
                      class="px-1.5 py-0.5 bg-blue-50 text-[#1F4FD8] hover:bg-blue-100 rounded text-[11px] font-sans cursor-pointer shrink-0"
                    >
                      展开
                    </button>
                  </div>

                  <!-- C. NUMBER 类型：高亮数值 + 辅助单位 -->
                  <div v-else-if="cfg.valueType === 'NUMBER'" class="flex items-center space-x-1.5">
                    <span class="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {{ cfg.value }}
                    </span>
                    <span class="text-[10px] text-slate-400">
                      {{ getNumberUnitHint(cfg.name, cfg.value) }}
                    </span>
                  </div>

                  <!-- D. STRING 类型：普通字符串，长文本省略 -->
                  <div v-else class="max-w-[320px] truncate select-all" :title="cfg.value">
                    <span class="text-slate-800">{{ cfg.value }}</span>
                  </div>
                </td>

                <!-- 6. 参数描述 (description) -->
                <td class="py-3 px-3.5 text-slate-600">
                  <div class="line-clamp-2 leading-relaxed" :title="cfg.description || ''">
                    {{ cfg.description || '暂无说明' }}
                  </div>
                </td>

                <!-- 7. 生效机制 (need_restart) -->
                <td class="py-3 px-3 text-center">
                  <span
                    v-if="cfg.needRestart === 1"
                    class="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-300"
                    title="修改后必须重启微服务容器实例生效"
                  >
                    ⚠️ 需重启生效
                  </span>
                  <span
                    v-else
                    class="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                    title="由 Spring Cloud 监听器即时热更新生效"
                  >
                    ⚡ 热重载生效
                  </span>
                </td>

                <!-- 8. 状态 (editable & visible) -->
                <td class="py-3 px-3 text-center">
                  <div class="flex flex-col items-center space-y-1">
                    <span
                      v-if="cfg.editable === 0"
                      class="px-1.5 py-0.2 rounded text-[10px] bg-red-100 text-red-700 font-semibold"
                      title="系统内核只读，禁止修改"
                    >
                      只读
                    </span>
                    <span
                      v-else
                      class="text-[10px] text-emerald-600 font-medium"
                    >
                      可编辑
                    </span>

                    <span
                      v-if="cfg.visible === 0"
                      class="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 text-slate-600 font-mono"
                      title="前端默认隐藏"
                    >
                      脱敏隐藏
                    </span>
                  </div>
                </td>

                <!-- 9. 修改信息 -->
                <td class="py-3 px-3.5 text-[11px] text-slate-500">
                  <div class="font-medium text-slate-700">{{ cfg.modifyer || cfg.creater || '-' }}</div>
                  <div class="font-mono text-slate-400 text-[10px]">{{ cfg.modifyTime || cfg.createTime }}</div>
                </td>

                <!-- 10. 操作列 (固定右侧) - 仅支持查看与修改，不提供删除与新增 -->
                <td class="py-3 px-4 text-right sticky right-0 bg-white group-hover:bg-slate-50/80 transition-colors shadow-xs">
                  <div class="flex items-center justify-end space-x-2 text-xs">
                    <!-- 查看详情 -->
                    <button
                      type="button"
                      @click="store.openDetailDrawer(cfg)"
                      title="查看参数完整元数据与审计"
                      class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 transition-colors cursor-pointer"
                    >
                      详情
                    </button>

                    <!-- 修改参数 -->
                    <button
                      type="button"
                      @click="store.openEditModal(cfg)"
                      :disabled="cfg.editable === 0"
                      :title="cfg.editable === 0 ? '系统内置只读参数，不可修改' : '修改参数业务域分类、运行值与描述'"
                      :class="[
                        'px-2.5 py-1 rounded border transition-colors font-medium',
                        cfg.editable === 1
                          ? 'bg-blue-50 hover:bg-blue-100 text-[#1F4FD8] border-blue-200 cursor-pointer'
                          : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      ]"
                    >
                      {{ cfg.editable === 1 ? '修改' : '只读' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 表格底部状态栏与说明 -->
        <div class="px-4 py-2.5 bg-slate-50 border-t border-[#DDE3EA] flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 shrink-0">
          <div class="flex items-center space-x-3">
            <span class="font-medium text-slate-700">
              当前展示配置参数 <strong class="font-mono text-slate-900">{{ store.filteredConfigs.length }}</strong> 条
            </span>
            <span class="text-slate-300">|</span>
            <span>
              数据由后台统一初始化，支持查看与修改运行数值，与 Spring Cloud / Nacos / Apollo 双向同步
            </span>
          </div>
          <div class="flex items-center space-x-2 text-slate-500 font-mono text-[11px]">
            <span>Cache-Refresh: Auto-Reloading on Save</span>
          </div>
        </div>
      </section>
    </main>

    <!-- 模态框与抽屉 (仅修改与详情) -->
    <ConfigEditModal />
    <ConfigDetailDrawer />
    <ConfigImportExportModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useConfigStore } from './store/configStore';
import { ConfigRecord, ConfigValueType } from './types/config';
import ConfigEditModal from './components/ConfigEditModal.vue';
import ConfigDetailDrawer from './components/ConfigDetailDrawer.vue';
import ConfigImportExportModal from './components/ConfigImportExportModal.vue';
import { message } from 'ant-design-vue';

const store = useConfigStore();

onMounted(async () => {
  await store.fetchConfigs();
});

const getTypeBadgeClass = (type: ConfigValueType) => {
  switch (type) {
    case 'STRING':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    case 'JSON':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'NUMBER':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'BOOLEAN':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const getJsonSummary = (val: string): string => {
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) {
      return `Array [${parsed.length}项]`;
    }
    return `Object {${Object.keys(parsed).length}键}`;
  } catch {
    return val.slice(0, 30);
  }
};

const getNumberUnitHint = (name: string, val: string): string => {
  const n = Number(val);
  if (name.includes('timeout') || name.includes('ms')) {
    if (n >= 1000) return `(${n / 1000}s)`;
    return 'ms';
  }
  if (name.includes('expiration') || name.includes('seconds')) {
    if (n >= 86400) return `(${n / 86400}天)`;
    if (n >= 3600) return `(${n / 3600}h)`;
    return 's';
  }
  if (name.includes('retention') || name.includes('days')) {
    return '天';
  }
  return '';
};

const copyText = (text: string, title: string) => {
  navigator.clipboard.writeText(text);
  message.success(`${title}已复制到剪贴板`);
};

const handleQuickToggle = (cfg: ConfigRecord) => {
  if (cfg.needRestart === 1) {
    if (confirm(`参数【${cfg.name}】设置为需重启生效(need_restart=1)，切换后需重启微服务容器方可应用，确认切换吗？`)) {
      store.quickToggleBoolean(cfg.id);
    }
  } else {
    store.quickToggleBoolean(cfg.id);
  }
};
</script>

<style scoped>
:deep(*) {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
}
</style>
