import { parse } from './cl-htmlparser'

/**
* template模板转换
* @param {string} template dom模板 
* @public
*/
export function templateTran(template: string): HTMLElement {
    template = template || '<template></template>'
    //parse(template, {})

    //为了用正则提取template内部html片段需要，暂时不用,后期扩展
    // let h = template.match(/(?<=<template.*?>)([\s\S]+?)(?=<\/template>)/img)

    //创建承载template标签的容器，获取内部dom结构需要。
    var createNode: HTMLElement = document.createElement("div")
    createNode.innerHTML = template

    //获取组件包含 template的html片段
    const templateElement: any = createNode.firstElementChild

    //提取template内部的html片段，
    let pageElement: HTMLElement = templateElement.content.firstElementChild
    return pageElement
}


var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
let contentRE = /(?<=\{\{)([\s\S]+?)(?=\}\})/mg
/**
 * 递归实现dom结构解析，
 * 匹配默认的分隔符 "{{}}"
 * @param node 
 * @param data 
 */
export function templateParsing(node: HTMLElement, data?: any): void {
    //对node的处理
    if (node && node.nodeType === 1) {
    }
    var i = 0, childNodes = node.childNodes, item;
    for (; i < childNodes.length; i++) {
        item = childNodes[i];
        // console.log(item, item.nodeType, "item")
        if (item.nodeType === 1) {
            //递归先序遍历子节点
            templateParsing(item,);
        } else if (item.nodeType === 3) {
            let content = item.textContent.trim()

            if (content && content.match(contentRE)) {
                console.log(content, "content")
                let re = content.match(contentRE)
                for (let i = 0; i < re.length; i++) {

                }
            }
        }
    }
}


/**
 * 表达式的解析
 * @param data 该组件对象
 * @param variable {{}}中的表达式
 * @return {string} 指令解析的结果
 */
export function commandParsing(data, variable): string {
    let funVar: string = ''
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            funVar = funVar + `let ${key}=data.${key};`
        }
    }
    let fun: string = `\"use strict\"; return (function(data){${funVar} return (${variable});}(data))`
    // console.log(fun, 'fun')
    return new Function('data', fun)(data)
}


