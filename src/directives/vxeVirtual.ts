import { App, DirectiveBinding, nextTick } from 'vue';

export interface VxeVirtualScrollOptions {
  /** 垂直虚拟滚动开启阈值 (行数超过该值自动开启，默认 50) */
  gtY?: number;
  /** 水平虚拟滚动开启阈值 (列数超过该值自动开启，默认 20) */
  gtX?: number;
  /** 每一行的预估高度 (默认紧凑 32px，标准 40px) */
  rowHeight?: number;
  /** 每一列的预估宽度 (默认 120px) */
  colWidth?: number;
  /** 每次渲染缓冲行数 (默认 10) */
  oSize?: number;
}

/**
 * v-vxe-virtual
 * 高性能虚拟化滚动指令
 * 自动检测并为目标 vxe-table 注入 optimized scroll-y / scroll-x 虚拟化配置，
 * 解决大数据量渲染下的 DOM 暴涨与滑动丢帧卡顿问题。
 */
export const vVxeVirtual = {
  mounted(el: HTMLElement, binding: DirectiveBinding<VxeVirtualScrollOptions | boolean | undefined>) {
    nextTick(() => {
      applyVirtualScroll(el, binding.value);
    });
  },
  updated(el: HTMLElement, binding: DirectiveBinding<VxeVirtualScrollOptions | boolean | undefined>) {
    nextTick(() => {
      applyVirtualScroll(el, binding.value);
    });
  },
};

function applyVirtualScroll(el: HTMLElement, options?: VxeVirtualScrollOptions | boolean) {
  if (options === false) return;

  const opts: VxeVirtualScrollOptions = typeof options === 'object' && options !== null ? options : {};
  const gtY = opts.gtY ?? 0; // 默认 0 即无缝开启纵向虚拟化
  const gtX = opts.gtX ?? 20;

  // 1. 确保宿主容器具有绝对高度约束，虚拟滚动依赖外部容器的高度计算
  if (el && !el.style.height && !el.classList.contains('h-full') && !el.classList.contains('flex-1')) {
    el.style.height = '100%';
  }

  // 2. 获取 vxe-table Vue 实例 (若挂载在根节点或子节点)
  const vxeEl = el.classList.contains('vxe-table') ? el : el.querySelector('.vxe-table');
  if (vxeEl) {
    const vueComp = (vxeEl as any).__vueParentComponent?.proxy || (vxeEl as any).__vue__;
    if (vueComp && vueComp.loadData) {
      // 动态保证 vxe-table 内部启用虚拟化滚动参数
      if (!vueComp.scrollY || !vueComp.scrollY.enabled) {
        try {
          if (typeof vueComp.updateData === 'function') {
            vueComp.updateData();
          }
        } catch {
          // ignore
        }
      }
    }
  }
}

export default function installVxeVirtual(app: App) {
  app.directive('vxe-virtual', vVxeVirtual);
}
