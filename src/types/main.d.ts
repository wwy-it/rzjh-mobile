declare var weui: any
declare var Vue: any
declare var $fetch: any

declare module "*.zml" {
    const content: string
    export default content
}

// declare module 'axios' {
//     export interface AxiosResponse<T = any> extends Promise<T> { }
// }