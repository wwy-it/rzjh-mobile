import "./home.css"
import { push, onLoad, onShow, useState } from '../../lib/clear'

export default {
    template: () => import('./home.zml'),

    setup: function () {
        const state = useState({
            hello: "HELLO ",
            world: 'WORLD!',
            testObject: {
                k: 999
            },
            t: 0,
            testClass: true,
            items: [{ aaa: 1111 }, { aaa: 2222 }, { aaa: 3333 }]
        })

        setTimeout(() => {
            state.t = 100
        }, 1000);

        onShow(() => {
            // homeInit()
        })

        function btnClick() {
            state.t++
            state.testClass = !state.testClass
        }

        function toApply() {
            push({
                path: '/apply'
            })
        }

        function toAmount() {
            push({
                path: '/amount'
            })
        }

        return {
            toApply,
            toAmount,
            btnClick
        }
    },

}

function homeInit() {
    const back: HTMLElement = document.getElementById("home-back")
    const go: HTMLElement = document.getElementById("home-go")

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

}