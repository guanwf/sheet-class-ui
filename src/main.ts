import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import { store } from './store';

import VxeTable, { VxeUI } from 'vxe-table';
import 'vxe-table/lib/style.css';

import VxePCUI from 'vxe-pc-ui';
import 'vxe-pc-ui/lib/style.css';

import VXETablePluginShortcutKey from 'vxe-table-plugin-shortcut-key';

import './index.css';

// 注册 vxe-table 快捷键插件
VxeUI.use(VXETablePluginShortcutKey as any);

const app = createApp(App);
app.use(store);
app.use(router);
app.use(VxePCUI);
app.use(VxeTable);

app.mount('#app');
