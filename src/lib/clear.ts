import { Tree, PushQuery, CreateRouterQuery, ComponentElement } from './model/clear'
import { templateTran, commandParsing } from './cl-tool'

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
    window.addEventListener('popstate', () => {
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
    installComponent(element)
}


/**
 * 组件对象，临时缓存
 */
interface ComponentCache {
    data?: any,
    onLoad?: () => void
    onShow?: () => void
    onHide?: () => void
}

const componentCache: ComponentCache = {
    data: {},
    onLoad: undefined,
    onShow: undefined,
    onHide: undefined,
}

/**
 * proxy钩子对象，临时缓存，为了组件装载过程上下文需要 
 */
let proxyHandlerCache;


/**
 * 组件装载函数
 * @param element 组件数据
 * @private
 */
async function installComponent(element: any): Promise<void> {
    //第一步清空组件缓存
    cleanComponentCache()
    let componentElement: ComponentElement = {}

    //组件获取完毕，开始获取组件内部的dom
    let templateDefault = await element.template()
    //模版字符串
    const template = templateDefault.default
    // template转dom
    let pageElement = templateTran(template)
    // componentElement.template = template
    componentElement.dom = pageElement


    proxyHandlerCache = {
        get(target, key) {
            let result = target[key]
            return result;
        },
        set(target, key, value) {
            let statue = Reflect.set(target, key, value);
            //清空历史dom数据
            app.innerHTML = ""

            componentElement.dom = templateTran(template)
            //原始dom指令解析
            let dom = templateParsing(componentElement.dom, componentElement)
            // 载入当前组件dom
            app.appendChild(dom)
            return statue
        }
    }

    //清空历史dom数据
    app.innerHTML = ""

    //载入之前脚本初始化
    const bindData = element.setup()

    componentElement = {
        dom: pageElement,
        data: componentCache.data,
        onLoad: componentCache.onLoad,
        onShow: componentCache.onShow,
        onHide: componentCache.onHide,
        ...bindData
    }


    console.log(bindData, 234)

    //载入之前
    if (componentElement.onLoad) componentElement.onLoad()


    //清空历史dom数据
    app.innerHTML = ""

    componentElement.dom = templateTran(template)
    //原始dom指令解析
    let dom = templateParsing(componentElement.dom, componentElement)
    // 载入当前组件dom
    app.appendChild(dom)

    //载入之后
    if (componentElement.onShow) componentElement.onShow()

}


/**
 * 匹配默认的分隔符 "{{}}"
 */
var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
let contentRE = /(?<=\{\{)([\s\S]+?)(?=\}\})/mg

// function templateParsing(node: HTMLElement, e?: ComponentElement) {
//     console.log(node, e)
//     //对node的处理
//     if (node && node.nodeType === 1) {
//     }
//     var i = 0, childNodes = node.childNodes, item;
//     for (; i < childNodes.length; i++) {
//         item = childNodes[i];
//         console.log(item.nodeType, 2343434)
//         // console.log(item, item.nodeType, "item")
//         if (item.nodeType === 1) {
//             //递归先序遍历子节点
//             templateParsing(item, e);
//         } else if (item.nodeType === 3) {
//             let content = item.textContent.trim()

//             if (content && content.match(contentRE)) {
//                 console.log(content, "content")
//                 let re = content.match(contentRE)
//                 console.log(re, 're')

//                 let t = ''
//                 for (let i = 0; i < re.length; i++) {
//                     let variable = re[i]
//                     let v = e.data[variable]
//                     t = t + v
//                     console.log(t, 5555)
//                 }
//                 item.textContent = t
//             }
//         }
//     }
// }

/**
 * 指令dom解析成原生dom
 * 写了一堆乱七八糟的代码
 * @param node 
 * @param e 
 * @returns 
 */
function templateParsing(node: any, e?: ComponentElement): HTMLElement {
    var treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_ALL, null)
    var currentNode: any = treeWalker.currentNode
    while (currentNode) {
        if (currentNode.nodeType === 1) {
            let attrLenth = currentNode.attributes.length
            //如果有属性
            if (attrLenth) {

                //for实现循环处理，先于其他属性执行，重点先与if
                let attrFor = currentNode.getAttribute('c:for')
                if (attrFor) {
                    //获取带{{}}表达式
                    let variables = attrFor.match(contentRE)
                    //表达式变量
                    let variable = variables[0]
                    let v = commandParsing(e.data, variable)
                    console.log(v, 8898889)

                    if (v.length) {
                        const node: any = document.createElement("div")
                        for (let i = 0; i < v.length; i++) {
                            let childNode = currentNode.cloneNode(true);
                            node.appendChild(childNode)
                            console.log(node, 'node')
                        }
                    }
                }

                //统一处理其余属性
                for (let i = 0; i < attrLenth; i++) {
                    //获取属性节点
                    let attr = currentNode.attributes[i]
                    //属性节点的内容
                    let content = attr.value.trim()

                    //如果属性节点里面存在表达式
                    if (content && content.match(contentRE)) {

                        if (attr.name == 'c:if') { //if实现
                            let variables = content.match(contentRE)
                            let variable = variables[0]
                            let v = commandParsing(e.data, variable)
                            currentNode.style.display = v ? 'block' : 'none'
                        } else if (attr.name == 'c:for') {//for 不再处理
                            continue
                        } else {
                            //表达式解析负值
                            let t = nodeExpression(content, e)
                            attr.value = t
                        }

                    }
                }

            }

            //递归先序遍历子节点
            let tabBool = currentNode.getAttribute("bindtap")
            if (tabBool) {
                currentNode.addEventListener("click", e[tabBool])
            }

        } else if (currentNode.nodeType === 3) {
            let content = currentNode.textContent.trim()

            if (content && content.match(contentRE)) {
                //提取表达式并且返回表达式解析之后的文本
                let t = content.replace(/\{\{([\s\S]+?)\}\}/mg, (word) => {
                    let variables = word.match(contentRE)
                    if (variables) {
                        let variable = variables[0]
                        let v = commandParsing(e.data, variable)
                        return v
                    } else {
                        return word
                    }
                })
                currentNode.textContent = t
            }
        }

        currentNode = treeWalker.nextNode()
        // currentNode = treeWalker.nextSibling();
    }
    return node
}

/**
 * for循环，通过clone标签处理
 */
function cloneElement(dom) {
    console.log(dom)



}


/**
 * 
 * @param expression 带{{}}表达式
 * @param e 组建对象
 * @returns 返回解析之后结果
 */
function nodeExpression(expression: string, e: ComponentElement) {
    let t = expression.replace(/\{\{([\s\S]+?)\}\}/mg, (word) => {
        let variables = word.match(contentRE)
        if (variables) {
            let variable = variables[0]
            let v = commandParsing(e.data, variable)
            return v
        } else {
            return word
        }
    })
    return t
}


/**
 * 清空组件缓存
 */
function cleanComponentCache(): void {
    componentCache.onLoad = undefined
    componentCache.onShow = undefined
    componentCache.onHide = undefined
}


/**
 * 组件周期：dom元素没有载入之前
 * @param {()=>void} cb 生命周期回调函数
 */
export function onLoad(cb: () => void) {
    componentCache.onLoad = cb
}


/**
 * 组件周期：dom元素载入完成
 * @param {()=>void} cb 生命周期回调函数
 */
export function onShow(cb: () => void) {
    componentCache.onShow = cb
}


/**
 * 组件周期：dom元素卸载之前
 * @param {()=>void} cb 生命周期回调函数
 */
export function onHide(cb: () => void) {
    componentCache.onHide = cb
}


/**
 * 组件数据：页面响应数据注册
 * @param {any} data 数据
 */
export function useState(data: any) {
    const proxyData = new Proxy(data, proxyHandlerCache);
    componentCache.data = proxyData
    return proxyData
}


export default {
    push,
    createRouter,
    onLoad,
    onShow,
    onHide,
    useState
}