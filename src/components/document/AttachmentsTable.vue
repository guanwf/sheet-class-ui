<template>
  <div class="flex-1 flex flex-col min-h-0 bg-white">
    <!-- 工具条 -->
    <div class="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
      <div class="flex items-center space-x-2">
        <label
          v-if="!isReadOnly"
          class="inline-flex items-center px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-2xs transition cursor-pointer"
        >
          <UploadCloud class="w-3.5 h-3.5 mr-1" />
          上传单据附件
          <input type="file" multiple class="hidden" @change="onFileSelected" />
        </label>
        <span class="text-slate-400 text-[11px]">
          支持技术规格书、买卖双方签署采购合同扫描件、检验出厂证明、原厂质保卡等 PDF / Word / Excel 附件
        </span>
      </div>

      <div class="text-slate-500 text-xs">
        已归档附件: <strong class="text-indigo-700 font-bold font-mono">{{ attachments.length }}</strong> 份
      </div>
    </div>

    <!-- vxe-table 表格 -->
    <div class="flex-1 w-full relative min-h-0">
      <vxe-table
        border
        stripe
        round
        height="auto"
        class="text-xs w-full h-full"
        :data="attachments"
        :row-config="{ isHover: true, isCurrent: true, keyField: 'id' }"
      >
        <vxe-column type="seq" width="55" title="序号" align="center" />

        <vxe-column field="fileName" title="附件文件名称" min-width="240">
          <template #default="{ row }">
            <div class="flex items-center space-x-2">
              <FileText class="w-4 h-4 text-indigo-500 shrink-0" />
              <span class="font-medium text-slate-800">{{ row.fileName }}</span>
            </div>
          </template>
        </vxe-column>

        <vxe-column field="fileType" title="文件类型" width="100" align="center">
          <template #default="{ row }">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-100 text-slate-700 font-semibold">
              {{ row.fileType }}
            </span>
          </template>
        </vxe-column>

        <vxe-column field="fileSize" title="文件大小" width="110" align="right">
          <template #default="{ row }">
            <span class="font-mono text-slate-600">{{ formatFileSize(row.fileSize) }}</span>
          </template>
        </vxe-column>

        <vxe-column field="uploader" title="上传归档人" width="120">
          <template #default="{ row }">
            <span class="text-slate-700">{{ row.uploader }}</span>
          </template>
        </vxe-column>

        <vxe-column field="uploadTime" title="上传归档时间" width="160">
          <template #default="{ row }">
            <span class="font-mono text-slate-500">{{ row.uploadTime }}</span>
          </template>
        </vxe-column>

        <vxe-column title="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center justify-center space-x-2">
              <button
                type="button"
                @click="onPreview(row)"
                class="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
                title="查看/下载附件"
              >
                <Download class="w-3.5 h-3.5" />
              </button>
              <button
                v-if="!isReadOnly"
                type="button"
                @click="onDelete(row.id)"
                class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
                title="移除附件"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AttachmentItem } from '../../types/document';
import { UploadCloud, FileText, Download, Trash2 } from 'lucide-vue-next';

const props = defineProps<{
  attachments: AttachmentItem[];
  isReadOnly: boolean;
}>();

const emit = defineEmits<{
  (e: 'update-attachments', attachments: AttachmentItem[]): void;
}>();

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const onFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const newFiles: AttachmentItem[] = Array.from(input.files).map((file) => {
    const ext = file.name.split('.').pop() || 'FILE';
    return {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fileName: file.name,
      fileSize: file.size,
      fileType: ext.toUpperCase(),
      uploadTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      uploader: '当前登录人',
      url: '#',
    };
  });

  emit('update-attachments', [...props.attachments, ...newFiles]);
  input.value = '';
};

const onDelete = (id: string) => {
  emit(
    'update-attachments',
    props.attachments.filter((a) => a.id !== id)
  );
};

const onPreview = (item: AttachmentItem) => {
  alert(`模拟下载/预览文件：${item.fileName} (${formatFileSize(item.fileSize)})`);
};
</script>
