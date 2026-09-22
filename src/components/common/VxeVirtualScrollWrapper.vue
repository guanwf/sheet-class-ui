<template>
  <div
    ref="containerRef"
    class="vxe-virtual-wrapper flex-1 w-full h-full relative overflow-hidden flex flex-col min-h-0"
    :class="[autoHeight ? 'h-full' : '']"
    :style="computedStyle"
  >
    <!-- 性能与虚拟滚动状态条 (可选显示) -->
    <div
      v-if="showMetrics"
      class="px-2.5 py-1 bg-slate-100 border-b border-slate-200 text-[11px] text-slate-500 flex items-center justify-between shrink-0 select-none font-mono"
    >
      <div class="flex items-center space-x-2">
        <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          虚拟滚动核心已启用
        </span>
        <span class="text-slate-400">|</span>
        <span>当前加载: <strong class="text-slate-800">{{ rowCount }}</strong> 行</span>
        <span class="text-slate-400">|</span>
        <span>缓冲区 (oSize): {{ oSize }} 行</span>
      </div>

      <div class="flex items-center space-x-2 text-[10px]">
        <span class="text-emerald-600 flex items-center space-x-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>DOM 节点裁剪保护活跃</span>
        </span>
        <button
          v-if="allowQuickStressTest"
          type="button"
          @click="$emit('quick-stress-test', 2000)"
          class="px-2 py-0.5 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer text-[10px]"
          title="快速生成 2000 行测试虚拟滚动"
        >
          压测 2000 行
        </button>
      </div>
    </div>

    <!-- 主插槽：透传外部 vxe-table，或者由 wrapper 直接配置虚拟滚动参数 -->
    <div class="flex-1 w-full h-full relative min-h-0 overflow-hidden">
      <slot
        :scroll-y="scrollYConfig"
        :scroll-x="scrollXConfig"
        :virtual-props="virtualProps"
        :container-height="containerHeight"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = withDefaults(
  defineProps<{
    /** 数据总行数，用于性能指标及动态调整缓冲区 */
    rowCount?: number;
    /** 触发纵向虚拟滚动的行数阈值 (默认 0 即无条件开启纵向虚拟化) */
    gtY?: number;
    /** 触发横向虚拟滚动的列数阈值 (默认 20) */
    gtX?: number;
    /** 行预估高度 (px)，紧凑模式默认 32，标准模式 40 */
    rowHeight?: number;
    /** 每次渲染缓冲行数 (默认 15) */
    oSize?: number;
    /** 是否自适应父容器高度 */
    autoHeight?: boolean;
    /** 固定高度值 (如 '500px' 或 500) */
    height?: string | number;
    /** 是否展示虚拟滚动实时性能统计指示条 */
    showMetrics?: boolean;
    /** 是否提供一键压测快捷按钮 */
    allowQuickStressTest?: boolean;
  }>(),
  {
    rowCount: 0,
    gtY: 0,
    gtX: 25,
    rowHeight: 34,
    oSize: 15,
    autoHeight: true,
    showMetrics: false,
    allowQuickStressTest: false,
  }
);

defineEmits<{
  (e: 'quick-stress-test', count: number): void;
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const containerHeight = ref<number>(400);

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (containerRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.height > 0) {
          containerHeight.value = entry.contentRect.height;
        }
      }
    });
    resizeObserver.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});

const computedStyle = computed(() => {
  if (props.height) {
    return {
      height: typeof props.height === 'number' ? `${props.height}px` : props.height,
    };
  }
  return {};
});

// vxe-table 标准 scroll-y 虚拟滚动配置项
const scrollYConfig = computed(() => ({
  enabled: true,
  gt: props.gtY,
  oSize: props.oSize,
  rHeight: props.rowHeight,
}));

// vxe-table 标准 scroll-x 虚拟滚动配置项
const scrollXConfig = computed(() => ({
  enabled: true,
  gt: props.gtX,
}));

// 组合虚拟化 props 便于通过 v-bind="virtualProps" 一键注入
const virtualProps = computed(() => ({
  height: 'auto',
  scrollY: scrollYConfig.value,
  scrollX: scrollXConfig.value,
}));

defineExpose({
  containerRef,
  scrollYConfig,
  scrollXConfig,
  virtualProps,
});
</script>
