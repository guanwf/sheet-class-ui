<template>
  <a-modal
    :open="visible"
    :title="isEdit ? `编辑菜单目录 [ ${formData.caption} ]` : '新建菜单目录文件夹 (pbs_menufolder)'"
    :width="560"
    :mask-closable="false"
    :keyboard="false"
    destroy-on-close
    @cancel="handleCancel"
    @ok="handleSubmit"
    ok-text="确认保存"
    cancel-text="取消"
  >
    <div class="space-y-4 text-xs select-none max-h-[70vh] overflow-y-auto px-1 py-1">
      <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[11px] leading-relaxed">
        <strong>pbs_menufolder 规则提示：</strong><br />
        受唯一约束 <code>pbs_menufolder_UQ01 (parentid, caption)</code> 约束，在同一个父级目录下不可出现同名文件夹。
      </div>

      <a-form layout="vertical" class="space-y-3">
        <!-- 目录名称 -->
        <a-form-item label="目录标题 (caption)" required class="!mb-0">
          <a-input
            v-model:value="formData.caption"
            placeholder="如：供应链管理、采购单据中心"
            allow-clear
          />
        </a-form-item>

        <!-- 上级目录 (parentid) -->
        <a-form-item label="父级目录 (parentid)" required class="!mb-0">
          <template #tooltip>
            0 表示系统顶级根目录，支持多层级无限嵌套
          </template>
          <a-tree-select
            v-model:value="formData.parentid"
            :tree-data="treeSelectData"
            placeholder="请选择上级目录（留空为顶级）"
            tree-default-expand-all
            class="w-full text-xs"
            :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
          />
        </a-form-item>

        <!-- 目录图标 (icon) -->
        <a-form-item label="目录图标 (icon)" class="!mb-0">
          <template #tooltip>
            Ant Design 图标组件名，例如 AppstoreOutlined, ShoppingOutlined
          </template>
          <a-select
            v-model:value="formData.icon"
            placeholder="选择常用 Ant Design 图标"
            class="w-full text-xs"
            allow-clear
          >
            <a-select-option
              v-for="ico in ANTD_ICON_OPTIONS"
              :key="ico.name"
              :value="ico.name"
            >
              <div class="flex items-center justify-between text-xs py-0.5">
                <span class="font-medium text-slate-800">{{ ico.label }}</span>
                <span class="text-[10px] text-slate-400 font-mono">{{ ico.name }}</span>
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- 排序号 (orderno) 与 状态 (flag) -->
        <div class="grid grid-cols-2 gap-4">
          <a-form-item label="显示排序号 (orderno)" required class="!mb-0">
            <a-input-number
              v-model:value="formData.orderno"
              :min="0"
              :max="9999"
              class="w-full"
            />
          </a-form-item>

          <a-form-item label="状态 (flag)" required class="!mb-0">
            <div class="flex items-center space-x-3 h-8 px-2 bg-slate-50 border border-slate-200 rounded">
              <a-switch
                v-model:checked="isFlagActive"
                checked-children="启用 (1)"
                un-checked-children="停用 (0)"
              />
              <span class="text-[11px]" :class="isFlagActive ? 'text-emerald-700 font-medium' : 'text-slate-400'">
                {{ isFlagActive ? '正常展示' : '已隐藏停用' }}
              </span>
            </div>
          </a-form-item>
        </div>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { message } from 'ant-design-vue';
import { PbsMenuFolder, ANTD_ICON_OPTIONS } from '../../types/menu';

const props = defineProps<{
  visible: boolean;
  initialData?: PbsMenuFolder | null;
  defaultParentId?: string;
  allFolders: PbsMenuFolder[];
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'submit', folder: PbsMenuFolder): void;
}>();

const isEdit = computed(() => !!props.initialData?.id);

const formData = ref<Partial<PbsMenuFolder>>({
  caption: '',
  parentid: '0',
  orderno: 10,
  icon: 'FolderOutlined',
  flag: 1,
});

const isFlagActive = computed({
  get: () => formData.value.flag === 1,
  set: (val: boolean) => {
    formData.value.flag = val ? 1 : 0;
  },
});

watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.initialData) {
        formData.value = { ...props.initialData };
      } else {
        formData.value = {
          caption: '',
          parentid: props.defaultParentId || '0',
          orderno: 10,
          icon: 'FolderOutlined',
          flag: 1,
        };
      }
    }
  }
);

// 构架树选择数据
const treeSelectData = computed(() => {
  const rootNode = {
    title: '📁 顶级目录 (parentid = 0)',
    value: '0',
    key: '0',
    children: [] as any[],
  };

  const map = new Map<string, any>();
  props.allFolders.forEach(f => {
    // 编辑时不能选自己作为父节点，防止循环嵌套
    if (props.initialData && f.id === props.initialData.id) return;
    map.set(f.id, {
      title: `📁 ${f.caption}`,
      value: f.id,
      key: f.id,
      children: [],
    });
  });

  props.allFolders.forEach(f => {
    if (props.initialData && f.id === props.initialData.id) return;
    const node = map.get(f.id);
    if (node) {
      if (f.parentid === '0' || !map.has(f.parentid)) {
        rootNode.children.push(node);
      } else {
        map.get(f.parentid)?.children.push(node);
      }
    }
  });

  return [rootNode];
});

const handleCancel = () => {
  emit('update:visible', false);
};

const handleSubmit = () => {
  if (!formData.value.caption || !formData.value.caption.trim()) {
    message.error('请填写目录标题 (caption)');
    return;
  }

  const cleanCaption = formData.value.caption.trim();
  const parentid = formData.value.parentid || '0';
  const currentId = props.initialData?.id;

  // 校验唯一约束 pbs_menufolder_UQ01 (parentid, caption)
  const conflict = props.allFolders.some(
    f => f.id !== currentId && f.parentid === parentid && f.caption === cleanCaption
  );

  if (conflict) {
    message.error(`违反唯一约束 pbs_menufolder_UQ01：在同级目录下已存在名为 [ ${cleanCaption} ] 的目录！`);
    return;
  }

  const result: PbsMenuFolder = {
    id: currentId || `1839${Date.now()}${Math.floor(Math.random() * 899 + 100)}`,
    caption: cleanCaption,
    parentid,
    orderno: formData.value.orderno ?? 10,
    icon: formData.value.icon || 'FolderOutlined',
    flag: formData.value.flag ?? 1,
    creator: formData.value.creator || '刘工 (主控业务员)',
    create_time: formData.value.create_time || new Date().toISOString().replace('T', ' ').split('.')[0],
    modifier: '刘工 (主控业务员)',
    modify_time: new Date().toISOString().replace('T', ' ').split('.')[0],
  };

  emit('submit', result);
  emit('update:visible', false);
  message.success(isEdit.value ? '菜单目录已更新！' : '新菜单目录创建成功！');
};
</script>
