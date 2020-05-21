import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';

Vue.use(VueRouter);

// 3.x 版本后  router 返回的promise对象中缺少 catch 不是完整的 ， 在node环境下运行会报错
const originalPush = VueRouter.prototype.push;
// @ts-ignore
VueRouter.prototype.push = function push(location: any, onResolve: any, onReject: any): void {
    if (onResolve || onReject) {
        return originalPush.call(this, location, onResolve, onReject);
    }
    // @ts-ignore
    return originalPush.call(this, location).catch((err: any) => err);
};

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home,
    },
    {
        path: '/about',
        name: 'about',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
    },
];


const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
});

export default router;
