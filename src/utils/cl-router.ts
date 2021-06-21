import { Tree, PushQuery, CreateRouterQuery, StateContainer } from './model/cl-router'

const app: HTMLElement = document.querySelector("#app")

/**
 * 路由数据
 */
let routerTree: Tree[] = []


/**
 * 创建路由
 * @param {CreateRouterQuery} createRouterQuery 创建路由参数
 */
export function createRouter(createRouterQuery: CreateRouterQuery): void {
    routerTree = createRouterQuery.routers
    popstate()
    push({
        path: location.pathname
    })
}


/**
 * 获取路由
 * @return {TreeItem[]} 返回路由对象
 */
export function getRouter(): Tree[] {
    return routerTree
}


/**
 * 监听路由前进后退
 * @private
 */
function popstate(): void {
    window.addEventListener('popstate', function (event) {
        installRoute({
            path: location.pathname
        })
    })
}


/**
 * 路由跳转
 * @param {PushQuery} item 前往路由 
 */
export function push(item: PushQuery): void {
    window.history.pushState(null, null, item.path)
    installRoute(item)
}


/**
 * 装载路由
 * @param {PushQuery} item 前往路由项目 
 * @private
 */
async function installRoute(item: PushQuery): Promise<void> {
    //查找路由结点
    const treeNode = routerTree.find((r) => {
        if (r.path == item.path) {
            return r
        }
    })
    //没有查找路由结点
    if (!treeNode) {
        console.error('路由没有定义')
        return
    }

    //获取当权路由对应的ts
    const elementDefault = await treeNode.component()
    const element = elementDefault.default

    //组件获取完毕，开始获取组件内部的dom
    let templateDefault = await element.template()
    const template = templateDefault.default

    // template模板转换
    let pageElement = templateTran(template)

    //清空历史dom数据
    app.innerHTML = ""

    //载入当前组件dom
    app.appendChild(pageElement)

    //载入之后脚本初始化
    element.setup()
}


/**
 * template模板转换
 * @param {string} template dom模板 
 * @private
 */
function templateTran(template: string): HTMLElement {
    template = template || '<template></template>'

    console.log(template, 'template')

    //为了用正则提取template内部html片段需要，暂时不用,后期扩展
    // let h = template.match(/(?<=<template.*?>)([\s\S]+?)(?=<\/template>)/img)
    // console.log(h[0], 'hhhh')

    //创建承载template标签的容器，获取内部dom结构需要。
    var createNode: HTMLElement = document.createElement("div")
    createNode.innerHTML = template

    //获取组件包含 template的html片段
    const templateElement: any = createNode.firstElementChild

    //提取template内部的html片段，
    let pageElement: HTMLElement = templateElement.content.firstElementChild

    return pageElement
}



/**
 *  组件周期状态容器
 */
const stateContainer: StateContainer = {
    onInit: undefined,
    onLoad: undefined,
    onHide: undefined,
}



/**
 * 组件周期：dom元素没有载入之前
 * @param {()=>void} cb 生命周期回调函数
 */
function onInit(cb: () => void) {
    stateContainer.onInit = cb
}


/**
 * 组件周期：dom元素载入完成
 * @param {()=>void} cb 生命周期回调函数
 */
function onLoad(cb: () => void) {
    stateContainer.onLoad = cb
}


/**
 * 组件周期：dom元素卸载之前
 * @param {()=>void} cb 生命周期回调函数
 */
function onHide(cb: () => void) {
    stateContainer.onHide = cb
}



if (stateContainer.onHide) {
    stateContainer.onHide()
}


export default {
    push,
    createRouter,
    onInit,
    onLoad,
    onHide,
}