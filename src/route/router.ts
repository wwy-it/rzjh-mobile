//此文件封装成路由
import { Tree } from '../lib/model/clear'
import { createRouter } from '../lib/clear'

const routes: Tree[] = [
    {
        path: '/',
        component: () => import('@/pages/home/home')
    },
    {
        path: '/onboard',
        component: () => import('@/pages/apply/apply')
    },
    {
        path: '/amount',
        component: () => import('@/pages/amount/amount')
    },
    {
        path: '/mycredit',
        component: () => import('@/pages/mycredit/mycredit')
    },

]

function init() {
    createRouter({
        routers: routes
    })
}

export default {
    init,
}