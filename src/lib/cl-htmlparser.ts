/**
 * 判断内容标签
 * script、style、textarea标签 
 * @param {string} tag 
 */
function isPlainTextElement(tag: string): boolean {
    let tags: any = {
        script: true,
        style: true,
        textarea: true
    }
    return tags[tag]
}

/**
 * 判断脚本标签
 * script、style标签 
 * @param {string} tag 
 */
function isForbiddenTag(tag: string): boolean {
    let tags: any = {
        script: true,
        style: true
    }
    return tags[tag]
}

/**
 * 标签string转map 
 * @param {string} strs 
 */
function makeMap(strs: string) {
    let tags = strs.split(',')
    let o: any = {}
    for (let i = 0; i < tags.length; i++) {
        o[tags[i]] = true
    }
    return o
}

/**
 * 单标签
 * input br hr 
 * @param {string} tag 
 */
function isUnaryTag(tag: string): boolean {
    let strs = `area,base,br,col,embed,frame,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr`
    let tags: any = makeMap(strs)
    return tags[tag]
}

/**
 * 可以省略斜杠的标签
 * <li><li> => <li></li>,
 * @param {string} tag 
 */
function canBeLeftOpenTag(tag: string): boolean {
    let strs = `colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source`
    let tags: any = makeMap(strs)
    return tags[tag]
}

/**
 * 段落标签
 * <div></div>
 * @param {string} tag 
 */
function isNonPhrasingTag(tag: string): boolean {
    let strs = `address,article,aside,base,blockquote,body,caption,col,colgroup,dd,details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,title,tr,track`
    let tags = makeMap(strs)
    return tags[tag]
}

/**
 * 匹配属性
 */
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

/**
 * 匹配标签名
 */
const ncname = '[a-zA-Z_][\\w\\-\\.]*'

/**
 * XML另类标签
 * <a:book></a:book>
 * （?:只匹配不提取）（[a-zA-Z_] 只允许这些字符开头）（\\: 存在xml语法，带冒号例如<a:boot>）
 */
const qnameCapture = `((?:${ncname}\\:)?${ncname})`

/**
 * 声明开始标签开始正则  
 * /^<((?:[a-zA-Z_][\w\-\.]*\:)?[a-zA-Z_][\w\-\.]*)/
 */
const startTagOpen = new RegExp(`^<${qnameCapture}`)

/**
 * 声明开始标签结束正则 
 */
const startTagClose = /^\s*(\/?)>/

/**
 * 声明标签结束部分正则 
 */
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

/**
 * 匹配注释 
 */
const comment = /^<!\--/

/**
 * 匹配默认的分隔符 "{{}}"
 */
var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

/**
 * 匹配自定义分隔符
 */
var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g


export function parse(template, options) {
    // 最终返回的AST
    let root
    // 设置当前标签的父节点
    let currentParent
    // 维护一个栈，保存解析过程中的开始标签，用于匹配结束标签
    let stack = []

    // 解析模板的具体实现
    parseHTML(template, {
        expectHTML: true,
        shouldKeepComment: options.comments, // 是否保存注释
        delimiters: options.delimiters, // 自定义的分隔符
        // 处理开始标签，解析的开始标签入栈，设置children以及parent等
        start(tag, attrs, unary) {
            let element: any = createASTElement(tag, attrs, currentParent);

            // 如果tag为script/style标签，设置属性，返回的AST中不含该标签元素结构
            if (isForbiddenTag(tag)) {
                element.forbidden = true;
                console.error('Templates should only be responsible for mapping the state to the ' +
                    'UI. Avoid placing tags with side-effects in your templates, such as ' +
                    "<" + tag + ">" + ', as they will not be parsed.')
            }

            // 设置根元素节点
            if (!root) {
                root = element;
            }

            // 设置元素的父节点，将当前元素的添加到父节点的children中
            if (currentParent && !element.forbidden) {
                currentParent.children.push(element);
                element.parent = currentParent;
            }

            // 如果不是自闭和标签（没有对应的结束标签），则需要将当前tag入栈，用于匹配结束标签时，调用end方法匹配最近的标签，同时设置父节点为当前元素
            if (!unary) {
                currentParent = element;
                stack.push(element);
            }
        },
        // 将匹配结束的标签出栈，修改父节点为之前上一个元素
        end() {
            let element = stack.pop();
            currentParent = stack[stack.length - 1];
        },
        // 保存文本
        chars(text) {
            if (!currentParent) {
                console.error('Component template requires a root element, rather than just text.');
            } else {
                const children = currentParent.children;
                if (text) {
                    let res;
                    // 如果文本节点包含表达式
                    if (res = parseText(text, opt.delimiters)) {
                        children.push({
                            type: 2,
                            expression: res.expression,
                            tokens: res.tokens,
                            text
                        })
                    } else {
                        children.push({
                            type: 3,
                            text
                        })
                    }
                }
            }
        },
        // 保存注释
        comment(text: string) {
            if (currentParent) {
                currentParent.children.push({
                    type: 3,
                    text,
                    isComment: true
                })
            }
        }
    })
    return root
}

// 定义几个全局变量
let stack = [] // 保存开始标签tag，和上面类似
let lastTag // 保存前一个标签，类似于currentParent
let index = 0 // template开始解析索引
let html // 剩余的template模板  
let opt // 保存对options的引用，方便调用start、end、chars、comment方法
function parseHTML(template, options) {
    html = template
    opt = options
    // 不断循环解析html，直到为""
    while (html) {
        console.log(html, 333)
        // 如果标签tag不是script/style/textarea
        if (!lastTag || !isPlainTextElement(lastTag)) {
            // 刚开始或tag不为script/style/textarea
            let textEnd = html.indexOf('<');
            if (textEnd === 0) {
                // 处理html注释
                if (html.match(comment)) {
                    let commentEnd = html.indexOf('-->');
                    if (commentEnd >= 0) {
                        if (opt.shouldKeepComment && opt.comment) {
                            opt.comment(html.substring(4, commentEnd))
                        }
                        advance(commentEnd + 3);
                        continue;
                    }
                }
                // 处理 html条件注释, 如<![if !IE]>

                // 处理html声明Doctype

                // 处理开始标签startTaga
                const startTagMatch = parseStartTag();
                if (startTagMatch) {
                    handleStartTag(startTagMatch);
                    continue;
                }

                // 匹配结束标签endTag
                const endTagMatch = html.match(endTag);
                if (endTagMatch) {
                    // 调整index以及html
                    advance(endTagMatch[0].length);
                    // 处理结束标签
                    parseEndTag(endTagMatch[1]);
                    continue;
                }
            }
            let text;
            if (textEnd > 0) {
                // html为纯文本，需要考虑文本中含有"<"的情况，此处省略，请自行查看源码
                text = html.slice(0, textEnd);
                // 调整index以及html
                advance(textEnd);
            }
            if (textEnd < 0) {
                // html以文本开始
                text = html;
                html = '';
            }
            // 保存文本内容
            if (opt.chars) {
                opt.chars(text);
            }
        } else {
            // tag为script/style/textarea
            let stackedTag = lastTag.toLowerCase();//转小写 
            let tagReg = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i');

            // 简单处理下，详情请查看源码
            let match = html.match(tagReg);
            if (match) {
                let text = match[1];
                if (opt.chars) {
                    // 保存script/style/textarea中的内容
                    opt.chars(text);
                }
                // 调整index以及html
                advance(text.length + match[2].length);
                // 处理结束标签</script>/</style>/</textarea>
                parseEndTag(stackedTag);
            }
        }
    }
}


function createASTElement(tag, attrs, parent) {
    let attrsMap = {}
    for (let i = 0, len = attrs.length; i < len; i++) {
        attrsMap[attrs[i].name] = attrs[i].value;
    }
    return {
        type: 1,
        tag,
        attrsList: attrs,
        attrsMap: attrsMap,
        parent,
        children: []
    }
}

/**
 * 处理开始的标签以及里面的属性
 */
function parseStartTag() {
    console.log(startTagOpen, 666)
    // 提取开始标签 startTagOpen
    let start = html.match(startTagOpen);
    if (start) {
        // 结构：["<div", "div", index: 0, groups: undefined, input: "..."]
        let match: any = {
            tagName: start[1],
            attrs: [],
            start: index
        }

        // 调整index以及html
        advance(start[0].length);

        // 循环匹配属性
        let end, attr;
        while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            // 结构：["id="app"", "id", "=", "app", undefined, undefined, groups: undefined, index: 0, input: "..."]
            advance(attr[0].length);
            console.log(attr, 55666)
            match.attrs.push(attr);
        }
        // 匹配到开始标签的结束位置
        if (end) {
            match.unarySlash = end[1]; // end[1]匹配的是"/",如<br/>
            // 调整index以及html
            advance(end[0].length)
            match.end = index;
            return match;
        }
    }
}

function handleStartTag(match) {
    const tagName = match.tagName;
    const unarySlash = match.unarySlash;

    if (opt.expectHTML) {

        if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
            // 如果p标签包含了段落标签，如div、h1、h2等
            // 形如: <p><h1></h1></p>
            // 与parseEndTag中tagName为p时相对应，处理</p>，添加<p>
            // 处理结果: <p></p><h1></h1><p></p>
            parseEndTag(lastTag);
        }
        if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
            // 如果标签闭合标签可以省略"/"
            // 形如：<li><li>
            // 处理结果: <li></li>
            parseEndTag(tagName);
        }
    }

    // 处理属性结构（name和vulue形式）
    let attrs = [];
    attrs.length = match.attrs.length;
    for (let i = 0, len = match.attrs.length; i < len; i++) {
        attrs[i] = {
            name: match.attrs[i][1],
            value: match.attrs[i][3]
        }
    }
    // 判断是不是自闭和标签，如<br>
    let unary = isUnaryTag(tagName) || !!unarySlash;

    // 如果不是自闭合标签，保存到stack中，用于endTag匹配，
    if (!unary) {
        stack.push({
            tag: tagName,
            lowerCasedTag: tagName.toLowerCase(),
            attrs: attrs
        })
        // 重新设置上一个标签
        lastTag = tagName;
    }

    if (opt.start) {
        opt.start(tagName, attrs, unary)
    }
}

function parseEndTag(tagName) {
    let pos = 0;

    // 匹配stack中开始标签中，最近的匹配标签位置
    if (tagName) {
        tagName = tagName.toLowerCase();
        for (pos = stack.length - 1; pos >= 0; pos--) {
            if (stack[pos].lowerCasedTag === tagName) {
                break;
            }
        }
    }

    // 如果可以匹配成功
    if (pos >= 0) {
        let i = stack.length - 1;
        if (i > pos || !tagName) {
            console.error(`tag <${stack[i - 1].tag}> has no matching end tag.`)
        }
        // 如果匹配正确: pos === i
        if (opt.end) {
            opt.end();
        }
        // 将匹配成功的开始标签出栈，并修改lastTag为之前的标签
        stack.length = pos;
        lastTag = pos && stack[stack.length - 1].tagName;
    } else if (tagName === 'br') {
        // 处理: </br>
        if (opt.start) {
            opt.start(tagName, [], true)
        }
    } else if (tagName === 'p') {
        // 处理上面说的情况：<p><h1></h1></p>
        if (opt.start) {
            opt.start(tagName, [], false);
        }
        if (opt.end) {
            opt.end();
        }
    }
}

function parseText(text, delimiters) {
    let open;
    let close;
    let resDelimiters;
    // 处理自定义的分隔符
    if (delimiters) {
        open = delimiters[0].replace(regexEscapeRE, '\\$&');
        close = delimiters[1].replace(regexEscapeRE, '\\$&');
        resDelimiters = new RegExp(open + '((?:.|\\n)+?)' + close, 'g');
    }
    const tagRE = delimiters ? resDelimiters : defaultTagRE;
    // 没有匹配，文本中不含表达式，返回
    if (!tagRE.test(text)) {
        return;
    }
    const tokens = []
    const rawTokens = [];

    let lastIndex = tagRE.lastIndex = 0;
    let index;
    let match;
    // 循环匹配本文中的表达式
    while (match = tagRE.exec(text)) {
        index = match.index;

        if (index > lastIndex) {
            let value = text.slice(lastIndex, index);
            tokens.push(JSON.stringify(value));
            rawTokens.push(value)
        }
        // 此处需要处理过滤器，暂不处理，请查看源码
        let exp = match[1].trim();
        tokens.push(`_s(${exp})`);
        rawTokens.push({ '@binding': exp })
        lastIndex = index + match[0].length;
    }
    if (lastIndex < text.length) {
        let value = text.slice(lastIndex);
        tokens.push(JSON.stringify(value));
        rawTokens.push(value);
    }
    return {
        expression: tokens.join('+'),
        tokens: rawTokens
    }
}

/**
 * 减去处理过的片段
 * @param {Number} n 
 */
function advance(n: number): void {
    index += n;
    html = html.substring(n)
}

export default {
    parse,
}