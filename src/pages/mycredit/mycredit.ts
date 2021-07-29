import "./mycredit.css"
import { onShow } from '../../lib/clear'
import $http from '@/assets/js/http'

export default {
    template: () => import('./mycredit.zml'),

    setup: function () {
        console.log(23434)
        onShow(() => {
            homeInit()
        })
    }
}
function homeInit() {
    const phone: HTMLElement = document.getElementById("mycredit-phone")
    const btn: HTMLElement = document.getElementById("mycredit-complete")

    btn.addEventListener("click", function () {
        console.log(phone)
    })

}