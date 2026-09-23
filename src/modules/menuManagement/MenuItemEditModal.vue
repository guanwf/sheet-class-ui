<template>
  <a-modal
    :open="visible"
    :title="isEdit ? `编辑菜单明细项 [ ${formData.caption} ]` : '新建菜单明细项 (pbs_menufolderitem)'"
    :width="600"
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
        <strong>pbs_menufolderitem 约束规则：</strong><br />
        1. <code>pbs_menufolderitem_UQ01 (module_id)</code>：同一个业务模块在全系统只能被挂载一次。<br />
        2. <code>pbs_menufolderitem_UQ02 (caption)</code>：菜单标题在全系统具有唯一性。
      </div>

      <a-form layout="vertical" class="space-y-3">
        <!-- 菜单类型选择 -->
        <a-form-item label="菜单类型 (type)" required class="!mb-0">
          <a-radio-group v-model:value="formData.type" :disabled="isEdit && formData.type === 1">
            <a-radio :value="1">
              <span class="font-medium text-blue-700">1 = 业务模块菜单 (绑定 pbs_module)</span>
            </a-radio>
            <a-radio :value="2">
              <span class="font-medium text-emerald-700">2 = 外部直达外链 (link_url)</span>
            </a-radio>
          </a-radio-group>
        </a-form-item>

        <!-- 所属目录 (folderid) -->
        <a-form-item label="所属菜单目录 (folderid)" required class="!mb-0">
          <a-select
            v-model:value="formData.folderid"
            placeholder="请选择所属目录"
            class="w-full text-xs"
          >
            <a-select-option
              v-for="folder in allFolders"
              :key="folder.id"
              :value="folder.id"
            >
              📁 {{ folder.caption }} (ID: {{ folder.id }})
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- 菜单标题 (caption) -->
        <a-form-item label="菜单标题 (caption)" required class="!mb-0">
          <a-input
            v-model:value="formData.caption"
            placeholder="输入在侧边栏或导航菜单展示的标题"
            allow-clear
          />
        </a-form-item>

        <!-- 模块菜单属性 (type = 1) -->
        <div v-if="formData.type === 1" class="p-3 bg-blue-50/60 border border-blue-200 rounded-lg space-y-2">
          <a-form-item label="绑定业务模块 (module_id)" required class="!mb-0">
            <a-select
              v-model:value="formData.module_id"
              placeholder="请选择绑定的模块"
              class="w-full font-mono text-xs"
              @change="onModuleChange"
              :disabled="isEdit"
            >
              <a-select-option
                v-for="mod in availableModules"
                :key="mod.module_id"
                :value="mod.module_id"
              >
                <span class="font-bold text-[#25548d] mr-2">[{{ mod.module_id }}]</span>
                <span>{{ mod.module_name }}</span>
              </a-select-option>
            </a-select>
          </a-form-item>
        </div>

        <!-- 外链URL (type = 2) -->
        <div v-else class="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-2">
          <a-form-item label="外链URL (link_url)" required class="!mb-0">
            <a-input
              v-model:value="formData.link_url"
              placeholder="https://..."
              class="font-mono text-xs"
              allow-clear
            />
          </a-form-item>
        </div>

        <!-- 排序号 (orderno) -->
        <a-form-item label="菜单排序号 (orderno)" required class="!mb-0">
          <a-input-number
            v-model:value="formData.orderno"
            :min="0"
            :max="9999"
            class="w-full"
          />
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { message } from 'ant-design-vue';
import { PbsMenuFolder, PbsMenuFolderItem } from '../../types/menu';
import { PbsModule } from '../../types/module';
import { INITIAL_MODULES } from '../../data/initialModules';

const props = defineProps<{
  visible: boolean;
  initialData?: PbsMenuFolderItem | null;
  defaultFolderId?: string;
  allFolders: PbsMenuFolder[];
  allItems: PbsMenuFolderItem[];
  allModules?: PbsModule[];
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'submit', item: PbsMenuFolderItem): void;
}>();

const isEdit = computed(() => !!props.initialData?.id);

const moduleList = computed(() => props.allModules || INITIAL_MODULES);

const formData = ref<Partial<PbsMenuFolderItem>>({
  caption: '',
  folderid: '',
  type: 1,
  module_id: undefined,
  link_url: '',
  orderno: 10,
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
          folderid: props.defaultFolderId || (props.allFolders[0]?.id || ''),
          type: 1,
          module_id: undefined,
          link_url: '',
          orderno: 10,
        };
      }
    }
  }
);

// 可选的模块列表（未被其他菜单绑定的模块 + 当前正在编辑绑定的模块）
const availableModules = computed(() => {
  return moduleList.value.filter(m => {
    if (props.initialData && props.initialData.module_id === m.module_id) {
      return true;
    }
    return !props.allItems.some(i => i.module_id === m.module_id);
  });
});

const onModuleChange = (modId: string) => {
  const mod = moduleList.value.find(m => m.module_id === modId);
  if (mod && (!formData.value.caption || !isEdit.value)) {
    formData.value.caption = mod.module_name;
  }
};

const handleCancel = () => {
  emit('update:visible', false);
};

const handleSubmit = () => {
  if (!formData.value.caption || !formData.value.caption.trim()) {
    message.error('请填写菜单标题 (caption)');
    return;
  }
  if (!formData.value.folderid) {
    message.error('请选择所属菜单目录 (folderid)');
    return;
  }

  const cleanCaption = formData.value.caption.trim();
  const currentId = props.initialData?.id;

  // 1. 唯一标题校验 pbs_menufolderitem_UQ02 (caption)
  const captionConflict = props.allItems.some(
    i => i.id !== currentId && i.caption === cleanCaption
  );
  if (captionConflict) {
    message.error(`违反唯一约束 pbs_menufolderitem_UQ02：菜单标题 [ ${cleanCaption} ] 已存在！`);
    return;
  }

  // 2. 模块唯一校验 pbs_menufolderitem_UQ01 (module_id)
  if (formData.value.type === 1) {
    if (!formData.value.module_id) {
      message.error('业务模块菜单必须选择关联的模块ID (module_id)');
      return;
    }
    const moduleConflict = props.allItems.some(
      i => i.id !== currentId && i.module_id === formData.value.module_id
    );
    if (moduleConflict) {
      message.error(`违反唯一约束 pbs_menufolderitem_UQ01：模块 [ ${formData.value.module_id} ] 已被其他菜单挂载！`);
      return;
    }
  } else {
    // 外链校验
    if (!formData.value.link_url || !formData.value.link_url.trim()) {
      message.error('外链类型菜单必须填写外链URL (link_url)');
      return;
    }
  }

  const result: PbsMenuFolderItem = {
    id: currentId || `1839${Date.now()}${Math.floor(Math.random() * 899 + 100)}`,
    folderid: formData.value.folderid,
    caption: cleanCaption,
    type: formData.value.type as 1 | 2,
    module_id: formData.value.type === 1 ? formData.value.module_id : undefined,
    link_url: formData.value.type === 2 ? formData.value.link_url?.trim() : undefined,
    orderno: formData.value.orderno ?? 10,
    creator: formData.value.creator || '刘工 (主控业务员)',
    create_time: formData.value.create_time || new Date().toISOString().replace('T', ' ').split('.')[0],
    modifier: '刘工 (主控业务员)',
    modify_time: new Date().toISOString().replace('T', ' ').split('.')[0],
  };

  emit('submit', result);
  emit('update:visible', false);
  message.success(isEdit.value ? '菜单项已更新！' : '菜单项添加成功！');
};
</script>
