// 客户端代码是在路由解析完成的时候将 app 挂载到 #app 标签下
import {
  createApp,
} from './main';

const {
  app,
  router,
  store,
} = createApp();

router.onReady(() => {
  app.$mount('#app');
});
