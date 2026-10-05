import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import { store } from './store';

import VxeTable, { VxeUI } from 'vxe-table';
import 'vxe-table/lib/style.css';

import VxePCUI from 'vxe-pc-ui';
import 'vxe-pc-ui/lib/style.css';

import VXETablePluginShortcutKey from 'vxe-table-plugin-shortcut-key';

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

import './index.css';
import { vVxeVirtual } from './directives/vxeVirtual';
import VxeVirtualScrollWrapper from './components/common/VxeVirtualScrollWrapper.vue';

// 注册 vxe-table 快捷键插件
VxeUI.use(VXETablePluginShortcutKey as any);

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(store);
app.use(router);
app.use(VxePCUI);
app.use(VxeTable);
app.use(Antd);
app.directive('vxe-virtual', vVxeVirtual);
app.component('VxeVirtualScrollWrapper', VxeVirtualScrollWrapper);

app.mount('#app');
