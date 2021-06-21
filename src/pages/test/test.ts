import "./apply.css"
import $http from '@/assets/js/http'
import { push } from '@/utils/cl-router'

interface Person {
    firstName: string;
    lastName: string;
}
export default {
    template: () => import('./apply.zml'),

    setup: function () {
        const params = {
            name: '',
            sex: '',
            auth_id: '',
            cell_phone: '',
            company_address: '',
        }

        const toastDom: HTMLElement = document.querySelector("#toast")
        const textMoreToastDom: HTMLElement = document.querySelector("#textMoreToast")

        document.querySelector("#showPicker").addEventListener("click", function () {
            let t = this
            weui.picker([{
                label: '男',
                value: '男'
            }, {
                label: '女',
                value: '女'
            }], {
                onChange: function (result: any) {
                    console.log(result);
                },
                onConfirm: function (result: any) {
                    let sex = result[0].value
                    t.innerText = sex
                    params.sex = sex
                },
                title: '性别'
            });
        }, false);

        document.querySelector("#complete").addEventListener("click", () => {
            const name_dom: HTMLInputElement = document.querySelector('#apply-name')
            const name: string = name_dom.value

            const id_dom: HTMLInputElement = document.querySelector('#apply-id')
            const id: string = id_dom.value

            const phone_dom: HTMLInputElement = document.querySelector('#apply-phone')
            let phone: string = phone_dom.value

            const address_dom: HTMLInputElement = document.querySelector('#apply-address')
            let address = address_dom.value

            params.name = name
            params.auth_id = id
            params.cell_phone = phone
            params.company_address = address

            console.log(params)

            $http.request({
                method: "POST",
                path: "/add_new_owner",
                params: {
                    owner: { ...params }
                }
            }).then((res: any) => {
                console.log(res)
                console.log(res)
                toastDom.style.display = "block"
                setTimeout(function () {
                    toastDom.style.display = "none"
                }, 2000);
            }).catch((err: any) => {
                console.log(err)
                textMoreToastDom.style.display = "block"
                setTimeout(function () {
                    textMoreToastDom.style.display = "none"
                }, 2000);
            })

        }, false);
    }
}

function aaa() {
    function onLoade() {
        console.log()
    }

    return {
        aaa: 234
    }
}
