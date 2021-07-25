import "./amount.css"
import { onShow } from '../../lib/clear'
import $http from '@/assets/js/http'

export default {
    template: () => import('./amount.zml'),

    setup: function () {
        console.log(23434)
        onShow(() => {
            console.log(334)
        })
    }
}
