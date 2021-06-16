//临时用，fetch稳定之后移除
import axios from 'axios'
//fetch封装
import $http from './assets/js/http'

//样式导入
import 'weui/dist/style/weui.css'
import "./assets/style/main.css"
import "./assets/style/weui.css"
import "./assets/style/index.css"

//引入路由
import router from '@/route/router'

//axios拦截器
axios.defaults.baseURL = "http://8.140.50.228:5000/"
// 请求拦截
axios.interceptors.request.use(config => {
    // config.headers.Authorization = localStorage.getItem('token')
    return config
}, function (error) {
    return Promise.reject(error)
})
// 响应拦截
axios.interceptors.response.use(res => {
    return res.data || {}
}, function (err) {
    return Promise.resolve(err)
})

//测试fetch
let params = {
    'shop_id': 6, 'reports': ['inventory_report']
}
$http.request({
    path: "/view_reports",
    method: "POST",
    params: params,
}).then((res: any) => {
    console.log(res)
}).catch((err: any) => {
    console.log(err)
})

router.init()


