<template>
  <div class="flex-1 flex flex-col min-h-0 bg-[#F4F6F9] text-slate-800 font-sans antialiased overflow-hidden">
    <!-- 1. 顶栏：面包屑导航与操作栏 -->
    <header class="bg-white border-b border-[#DDE3EA] px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-2xs">
      <!-- 模块标题与物理表说明 -->
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-lg bg-[#1F4FD8]/10 text-[#1F4FD8] flex items-center justify-center font-bold text-lg shadow-2xs">
          🖨️
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-base font-bold text-slate-900 m-0">打印套打模板管理</h1>
            <span class="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600 font-mono border border-slate-300">
              pbs_print_template
            </span>
            <span class="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] bg-blue-50 text-[#1F4FD8] font-mono border border-blue-200">
              UNIQUE KEY uk_module_id (module_id, template_id)
            </span>
          </div>
          <p class="text-xs text-slate-500 m-0 mt-0.5">
            JasperReports (*.jrxml) 源文件解析、编译产物 (*.jasper)、动态版本缓存失效 (version) 与套打参数契约
          </p>
        </div>
      </div>

      <!-- 右侧快捷全局操作 -->
      <div class="flex items-center space-x-2.5">
        <!-- 刷新按钮 -->
        <button
          type="button"
          @click="store.fetchTemplates()"
          title="刷新模板数据"
          aria-label="刷新模板数据"
          class="h-9 px-3 bg-white hover:bg-slate-50 text-slate-700 rounded-md border border-slate-300 text-xs font-medium flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors"
        >
          <svg
            :class="['w-3.5 h-3.5 text-slate-500', store.loading ? 'animate-spin text-[#1F4FD8]' : '']"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>刷新</span>
        </button>

        <!-- 上传新模板主按钮 -->
        <button
          type="button"
          @click="store.openUploadModal()"
          aria-label="上传新打印模板"
          class="h-9 px-4 text-xs font-semibold text-white bg-[#1F4FD8] hover:bg-[#183eb0] active:bg-[#12318e] rounded-md transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
        >
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>上传新模板</span>
        </button>
      </div>
    </header>

    <!-- 2. 主体区：单表工作流 (无左侧列表，直接铺满展开) -->
    <main class="flex-1 flex flex-col min-h-0 p-4 space-y-3 overflow-y-auto" aria-label="打印模板单表管理区">
      <!-- 2.1 统计指标概览卡片 (点击可快速筛选对应状态) -->
      <section class="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0" aria-label="数据指标概览">
        <div
          @click="resetKpiFilter"
          title="点击展示全部模板"
          class="bg-white border border-[#DDE3EA] rounded-lg p-3 shadow-2xs hover:border-[#1F4FD8]/60 cursor-pointer transition-all"
        >
          <div class="flex items-center justify-between text-slate-500 text-xs">
            <span>模板总数</span>
            <span class="text-slate-400 font-mono text-[11px]">ALL</span>
          </div>
          <div class="text-xl font-bold text-slate-900 font-mono mt-1">
            {{ store.stats.total }}
            <span class="text-xs font-normal text-slate-400">份</span>
          </div>
        </div>

        <div
          @click="store.filterFlag = 1; store.fetchTemplates()"
          title="点击筛选正常启用模板"
          :class="[
            'bg-white border rounded-lg p-3 shadow-2xs cursor-pointer transition-all',
            store.filterFlag === 1 ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20' : 'border-[#DDE3EA] hover:border-emerald-500/60'
          ]"
        >
          <div class="flex items-center justify-between text-slate-500 text-xs">
            <span class="text-emerald-700 font-medium">正常启用中</span>
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div class="text-xl font-bold text-emerald-600 font-mono mt-1">
            {{ store.stats.active }}
            <span class="text-xs font-normal text-slate-400">份</span>
          </div>
        </div>

        <div
          @click="store.filterDefault = 1; store.fetchTemplates()"
          title="点击筛选业务模块默认模板"
          :class="[
            'bg-white border rounded-lg p-3 shadow-2xs cursor-pointer transition-all',
            store.filterDefault === 1 ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20' : 'border-[#DDE3EA] hover:border-amber-500/60'
          ]"
        >
          <div class="flex items-center justify-between text-slate-500 text-xs">
            <span class="text-amber-700 font-medium">模块默认模板</span>
            <span class="text-amber-500 text-xs">★</span>
          </div>
          <div class="text-xl font-bold text-amber-600 font-mono mt-1">
            {{ store.stats.defaults }}
            <span class="text-xs font-normal text-slate-400">个</span>
          </div>
        </div>

        <div
          class="bg-white border border-[#DDE3EA] rounded-lg p-3 shadow-2xs"
        >
          <div class="flex items-center justify-between text-slate-500 text-xs">
            <span class="text-blue-700 font-medium">编译就绪 (*.jasper)</span>
            <span class="text-[10px] font-mono bg-blue-100 text-[#1F4FD8] px-1.5 py-0.2 rounded">Ready</span>
          </div>
          <div class="text-xl font-bold text-[#1F4FD8] font-mono mt-1">
            {{ store.stats.compiled }}
            <span class="text-xs font-normal text-slate-400">份</span>
          </div>
        </div>
      </section>

      <!-- 2.2 组合搜索与过滤工具栏 (直接在单表上方提供全维度筛选) -->
      <section class="bg-white border border-[#DDE3EA] rounded-lg p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
        <div class="flex flex-wrap items-center gap-3">

          <!-- 启停状态筛选 -->
          <div class="flex items-center space-x-1.5">
            <label for="filter-status" class="font-medium text-slate-600 shrink-0">状态:</label>
            <select
              id="filter-status"
              v-model="store.filterFlag"
              @change="store.fetchTemplates()"
              aria-label="筛选启用状态"
              class="h-8 px-2.5 bg-slate-50 text-slate-800 border border-slate-300 rounded-md focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
            >
              <option :value="-1">全部状态</option>
              <option :value="1">仅启用中 (1)</option>
              <option :value="0">仅已停用 (0)</option>
            </select>
          </div>

          <!-- 默认模板筛选 -->
          <div class="flex items-center space-x-1.5">
            <label for="filter-default" class="font-medium text-slate-600 shrink-0">默认属性:</label>
            <select
              id="filter-default"
              v-model="store.filterDefault"
              @change="store.fetchTemplates()"
              aria-label="筛选默认模板属性"
              class="h-8 px-2.5 bg-slate-50 text-slate-800 border border-slate-300 rounded-md focus:border-[#1F4FD8] focus:ring-1 focus:ring-[#1F4FD8]"
            >
              <option :value="-1">全部模板</option>
              <option :value="1">★ 仅默认模板 (is_default=1)</option>
              <option :value="0">非默认模板 (is_default=0)</option>
            </select>
          </div>

          <!-- 关键字快速搜索输入框 -->
          <div class="relative w-64">
            <input
              v-model="store.searchKeyword"
              @input="onSearch"
              type="search"
              placeholder="搜索模板名称/编码/备注..."
              aria-label="搜索模板名称或编码"
              class="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 text-slate-800 border border-slate-300 rounded-md placeholder-slate-400 focus:outline-hidden focus:border-[#1F4FD8] focus:bg-white"
            />
            <svg
              class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- 重置按钮 -->
          <button
            type="button"
            @click="store.resetFilters()"
            title="清空所有过滤条件"
            class="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors cursor-pointer"
          >
            重置筛选
          </button>
        </div>

        <div class="text-slate-500 text-xs">
          当前符合条件: <span class="font-bold text-[#1F4FD8] font-mono">{{ store.filteredTemplates.length }}</span> / 共 {{ store.templates.length }} 个模板
        </div>
      </section>

      <!-- 2.3 单表核心数据表格 (铺满全屏，可横向/纵向自适应滚动) -->
      <section class="bg-white border border-[#DDE3EA] rounded-lg overflow-hidden flex-1 flex flex-col min-h-0 shadow-2xs" aria-label="打印模板明细单表">
        <div class="flex-1 overflow-auto">
          <table class="w-full text-left text-xs border-collapse min-w-[1050px]">
            <thead>
              <tr class="bg-slate-50 text-slate-700 font-semibold border-b border-[#DDE3EA] sticky top-0 z-10 select-none">
                <th scope="col" class="py-3 px-3.5 w-32">业务模块 (module_id)</th>
                <th scope="col" class="py-3 px-3.5 w-48">模板编码 (template_id)</th>
                <th scope="col" class="py-3 px-3.5 min-w-[200px]">模板名称 / 说明 (template_name)</th>
                <th scope="col" class="py-3 px-3 w-28 text-center">默认模板 (is_default)</th>
                <th scope="col" class="py-3 px-3 w-20 text-center">版本 (version)</th>
                <th scope="col" class="py-3 px-3.5 w-44">编译状态 (*.jasper)</th>
                <th scope="col" class="py-3 px-3 w-28 text-center">参数契约 (schema)</th>
                <th scope="col" class="py-3 px-3 w-20 text-center">启用 (flag)</th>
                <th scope="col" class="py-3 px-3.5 w-40">更新信息 (modify_time)</th>
                <th scope="col" class="py-3 px-4 w-60 text-right sticky right-0 bg-slate-50 shadow-xs">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <!-- 空状态 -->
              <tr v-if="store.filteredTemplates.length === 0">
                <td colspan="10" class="py-16 text-center text-slate-400">
                  <div class="flex flex-col items-center justify-center space-y-2">
                    <span class="text-3xl text-slate-300">📄</span>
                    <span class="text-sm font-medium text-slate-500">未找到匹配的打印模板记录</span>
                    <p class="text-xs text-slate-400 m-0">
                      请尝试重置筛选条件，或点击右上角「上传新模板」录入首套套打模版
                    </p>
                    <button
                      type="button"
                      @click="store.resetFilters()"
                      class="mt-2 px-3 py-1.5 text-xs text-[#1F4FD8] bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 cursor-pointer transition-colors"
                    >
                      清空筛选条件
                    </button>
                  </div>
                </td>
              </tr>

              <!-- 数据行 -->
              <tr
                v-for="tpl in store.filteredTemplates"
                :key="tpl.id"
                class="hover:bg-slate-50/80 transition-colors group"
              >
                <!-- 1. 业务模块 (module_id) -->
                <td class="py-3 px-3.5">
                  <div class="flex items-center space-x-1.5">
                    <span class="text-sm">{{ getModuleIcon(tpl.moduleId) }}</span>
                    <div>
                      <div class="font-medium text-slate-900">{{ getModuleName(tpl.moduleId) }}</div>
                      <div class="font-mono text-[10px] text-slate-500">{{ tpl.moduleId }}</div>
                    </div>
                  </div>
                </td>

                <!-- 2. 模板编码 (template_id) -->
                <td class="py-3 px-3.5 font-mono font-semibold text-slate-900">
                  <div class="flex items-center space-x-1.5">
                    <span class="text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      {{ tpl.templateId }}
                    </span>
                    <button
                      type="button"
                      @click="copyCode(tpl.templateId)"
                      title="复制模板编码"
                      aria-label="复制模板编码"
                      class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#1F4FD8] transition-opacity cursor-pointer p-0.5"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </td>

                <!-- 3. 模板名称与说明 (template_name & remark) -->
                <td class="py-3 px-3.5">
                  <div class="font-medium text-slate-900 flex items-center space-x-1.5">
                    <span>{{ tpl.templateName }}</span>
                    <span v-if="tpl.isDefault === 1" class="text-amber-500 font-bold text-xs" title="模块默认模板">★</span>
                  </div>
                  <div class="text-[11px] text-slate-500 mt-0.5 line-clamp-1" :title="tpl.remark || '无详细备注'">
                    {{ tpl.remark || '暂无详细备注说明' }}
                  </div>
                </td>

                <!-- 4. 默认模板 (is_default) -->
                <td class="py-3 px-3 text-center">
                  <button
                    type="button"
                    @click="store.setDefault(tpl.id)"
                    :disabled="tpl.isDefault === 1"
                    :class="[
                      'px-2.5 py-1 rounded text-xs font-medium transition-colors select-none',
                      tpl.isDefault === 1
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold cursor-default'
                        : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 cursor-pointer'
                    ]"
                  >
                    {{ tpl.isDefault === 1 ? '★ 默认' : '设为默认' }}
                  </button>
                </td>

                <!-- 5. 版本号 (version) -->
                <td class="py-3 px-3 text-center">
                  <span
                    class="font-mono font-bold text-xs px-2 py-0.5 rounded-full bg-blue-50 text-[#1F4FD8] border border-blue-200"
                    title="每次上传新版自动递增，全系统根据 version 动态失效本地与分布式二级缓存"
                  >
                    v{{ tpl.version }}
                  </span>
                </td>

                <!-- 6. 编译状态 (*.jasper & *.jrxml) -->
                <td class="py-3 px-3.5 text-xs font-mono">
                  <div v-if="tpl.jasperPath" class="flex items-center space-x-1.5 text-emerald-700">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span class="font-medium">已编译就绪</span>
                  </div>
                  <div v-else class="flex items-center space-x-1.5 text-amber-600">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>未编译</span>
                    <button
                      type="button"
                      @click="store.recompile(tpl.id)"
                      class="text-[11px] text-[#1F4FD8] hover:underline cursor-pointer ml-1"
                    >
                      [立即编译]
                    </button>
                  </div>
                  <div class="text-[10px] text-slate-400 truncate mt-0.5" :title="tpl.jrxmlPath || ''">
                    {{ tpl.jrxmlPath ? tpl.jrxmlPath.split('/').pop() : '无源文件' }}
                    <span v-if="tpl.fileSizeKb">({{ tpl.fileSizeKb }}KB)</span>
                  </div>
                </td>

                <!-- 7. 参数契约 (param_schema) -->
                <td class="py-3 px-3 text-center">
                  <button
                    type="button"
                    @click="store.openParamSchemaDrawer(tpl)"
                    title="查看与编辑 param_schema JSON 契约"
                    class="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-[#1F4FD8] border border-slate-200 rounded text-[11px] text-slate-700 transition-colors cursor-pointer"
                  >
                    契约配置
                  </button>
                </td>

                <!-- 8. 启停状态 (flag) -->
                <td class="py-3 px-3 text-center">
                  <button
                    type="button"
                    @click="store.toggleFlag(tpl.id)"
                    :aria-label="tpl.flag === 1 ? '点击停用' : '点击启用'"
                    :class="[
                      'w-8 h-4.5 rounded-full transition-colors relative cursor-pointer inline-block align-middle',
                      tpl.flag === 1 ? 'bg-emerald-600' : 'bg-slate-300'
                    ]"
                  >
                    <span
                      :class="[
                        'w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform shadow-2xs',
                        tpl.flag === 1 ? 'right-0.5' : 'left-0.5'
                      ]"
                    ></span>
                  </button>
                </td>

                <!-- 9. 更新信息 (modify_time) -->
                <td class="py-3 px-3.5 text-[11px] text-slate-500">
                  <div class="font-medium text-slate-700">{{ tpl.modifier || tpl.creator || '-' }}</div>
                  <div class="font-mono text-slate-400 text-[10px]">{{ tpl.modifyTime || tpl.createTime }}</div>
                </td>

                <!-- 10. 操作列 (固定在右侧) -->
                <td class="py-3 px-4 text-right sticky right-0 bg-white group-hover:bg-slate-50/80 transition-colors shadow-xs">
                  <div class="flex items-center justify-end space-x-1.5 text-xs">
                    <!-- 在线套打测试 -->
                    <button
                      type="button"
                      @click="store.openTestPrint(tpl)"
                      title="在线套打测试预览 (带模拟业务数据验证)"
                      class="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-[#1F4FD8] rounded border border-blue-200 transition-colors cursor-pointer font-medium"
                    >
                      测试打印
                    </button>

                    <!-- 上传新版本 (version+1) -->
                    <button
                      type="button"
                      @click="store.openUploadModal(tpl.moduleId, tpl)"
                      title="上传新版本文件，version自动+1并编译"
                      class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 transition-colors cursor-pointer"
                    >
                      新版
                    </button>

                    <!-- 编辑基本信息 -->
                    <button
                      type="button"
                      @click="store.openEditModal(tpl)"
                      title="编辑模板名称、备注说明与所属模块"
                      class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 transition-colors cursor-pointer"
                    >
                      编辑
                    </button>

                    <!-- 删除按钮 (非默认模板才可删除) -->
                    <button
                      v-if="tpl.isDefault !== 1"
                      type="button"
                      @click="onDelete(tpl)"
                      title="删除该打印模板"
                      class="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded border border-red-200 transition-colors cursor-pointer"
                    >
                      删除
                    </button>
                    <span v-else class="text-[11px] text-slate-400 px-1 select-none" title="默认模板禁止删除">
                      默认
                    </span>
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
              共计 <strong class="font-mono text-slate-900">{{ store.templates.length }}</strong> 条模板记录
            </span>
            <span class="text-slate-300">|</span>
            <span>
              每个业务模块支持设置一套默认模板（<code>is_default = 1</code>），打印时若未指定模板编码将自动套用默认设计
            </span>
          </div>
          <div class="flex items-center space-x-2 text-slate-500 font-mono text-[11px]">
            <span>Cache-Busting: version + 1</span>
          </div>
        </div>
      </section>
    </main>

    <!-- 模态框与抽屉组 -->
    <TemplateUploadModal />
    <TemplateEditModal />
    <TemplateParamSchemaDrawer />
    <TemplateTestPrintModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { usePrintTemplateStore } from './store/printTemplateStore';
import { PrintTemplateRecord } from './types/printTemplate';
import TemplateUploadModal from './components/TemplateUploadModal.vue';
import TemplateEditModal from './components/TemplateEditModal.vue';
import TemplateParamSchemaDrawer from './components/TemplateParamSchemaDrawer.vue';
import TemplateTestPrintModal from './components/TemplateTestPrintModal.vue';
import { message } from 'ant-design-vue';

const store = usePrintTemplateStore();

onMounted(async () => {
  await store.fetchTemplates();
});

const onSearch = () => {
  store.fetchTemplates();
};

const resetKpiFilter = () => {
  store.resetFilters();
};

const getModuleName = (moduleId: string): string => {
  const map: Record<string, string> = {
    order: '采购订单',
    return_order: '采购退货单',
    invoice: '发票与对账单',
    inventory: '入库与库管单',
    delivery: '发运与物流单',
  };
  return map[moduleId] || moduleId;
};

const getModuleIcon = (moduleId: string): string => {
  const map: Record<string, string> = {
    order: '📦',
    return_order: '🔄',
    invoice: '🧾',
    inventory: '🏢',
    delivery: '🚚',
  };
  return map[moduleId] || '📄';
};

const copyCode = (code: string) => {
  navigator.clipboard.writeText(code);
  message.success(`模板编码【${code}】已复制到剪贴板`);
};

const onDelete = (tpl: PrintTemplateRecord) => {
  if (confirm(`确定要删除打印模板【${tpl.templateName}】(${tpl.templateId}) 吗？`)) {
    store.deleteTemplate(tpl.id);
  }
};
</script>

<style scoped>
:deep(*) {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
}
</style>
