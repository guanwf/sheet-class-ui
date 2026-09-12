<template>
  <a-config-provider
    :locale="zhCN"
    :theme="{
      token: {
        colorPrimary: '#25548d',
        colorInfo: '#25548d',
        borderRadius: 4,
        fontSize: 12,
        controlHeight: 28,
        fontFamily: 'inherit',
      },
    }"
  >
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');
</script>
