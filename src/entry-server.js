// 服务器的入口文件 = >返回了一个 promise
import {
  createApp,
} from './main';

export default context => {
  return new Promise((resolve, reject) => {
    const {
      app,
      router,
    } = createApp();
    router.push(context.url);
    router.onReady(() => {
      // 返回目标位置或是当前路由匹配的组件数组
      let matchedComponents = router.getMatchedComponents();
      // 判断是否存在
      if (!matchedComponents || matchedComponents.length <= 0) {
        return reject({
          code: 404
        })
      };
      resolve(app);
    }, reject)
  })
}
