/**
 * 路由跳转参数
 */
export interface PushQuery {
    path: string
    query?: any
}

interface Component {
    (): Promise<any>
}

/**
 * 路由
 */
export interface Tree {
    path: string
    component: Component
    name?: string
    asyn?: boolean
    children?: Tree[]
    meta?: any
}

/**
 * 路由创建参数 
 */
export interface CreateRouterQuery {
    routers: Tree[]
}


interface StateCallback {
    (): void
}
/**
 * 组件周期状态容器 
 */
export interface StateContainer {
    onInit?: () => void
    onLoad?: () => void
    onHide?: () => void
}