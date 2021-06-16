import "./home.css"
import { push } from '@/utils/cl-router'

export default {
    template: () => import('./home.zml'),

    setup: function () {
        const back: HTMLElement = document.getElementById("home-back")
        const go: HTMLElement = document.getElementById("home-go")
        const test1: HTMLElement = document.getElementById("home-test1")
        const test2: HTMLElement = document.getElementById("home-test2")

        back.addEventListener("click", function () {
            console.log("back")
            window.history.back()
            console.log(history)
        })

        go.addEventListener("click", function () {
            console.log("go")
            window.history.forward()
            console.log(history)
        })

        test1.addEventListener("click", function () {
            window.history.pushState(null, null, "");
            // window.history.replaceState(null, null, "hello");
            console.log(history)
        })
        test2.addEventListener("click", function () {
            push({
                path: '/apply'
            })
        })

        return {
            test: 1111
        }
    }
}
