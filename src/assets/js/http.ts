interface Options {
    path?: string,
    method?: string,
    params?: any,
    headers?: any,
}

interface Config {
    method: string
    headers?: any
    body?: any
}

// let host: string = "https://aiq.group:5000"
let host: string = "http://8.140.50.228:5000"

function request(options: Options) {
    options.path = options.path || ''
    options.method = options.method || 'GET'
    options.params = options.params || {}
    options.headers = options.headers || {}

    // 请求行url
    let url: string = /^https?:\/\/[0-9a-z]+/.test(options.path) ? options.path : (host + options.path)

    const config: Config = {
        method: options.method || 'GET',
        headers: options.headers || {}
    }

    if (config.method == 'GET') { // 如果是GET请求，拼接url
        const params = new URLSearchParams()
        for (const key in options.params) {
            const element = options.params[key]
            params.append(key, element)
        }
        url = params.toString() ? `${url}?${params.toString()}` : url
    } else if (config.method == 'POST') {
        config.body = JSON.stringify(options.params)
    }

    const headers = new Headers({
        'Accept': 'application/json',
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
        'user-agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.29 Safari/537.36',
    })
    headers.append("Authorization", localStorage.getItem('token'))

    for (const key in config.headers) {
        const element = config.headers[key]
        headers.append(key, element)
    }
    delete config.headers

    return new Promise(function (resolve, reject) {
        fetch(url, {
            //HTTP 行
            method: config.method, // *GET, POST, PUT, DELETE, etc.

            //HTTP 头
            mode: 'cors', // no-cors, cors, *same-origin 默认cors
            credentials: 'include', // include, same-origin, *omit 跨域是否携带cookie
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            redirect: 'follow', // manual, *follow, error  redirect属性指定 HTTP 跳转的处理方法 follow：默认值，fetch()跟随 HTTP 跳转。
            referrer: 'no-referrer', // *client, no-referrer ,HTTP Referer是header的一部分,当浏览器向web服务器发送请求的时候,一般会带上Referer,告诉服务器我是从哪个页面链接过来的,
            headers: headers,

            //HTTP 体
            // body: JSON.stringify(options.params),
            ...config
        }).then(function (response) {
            if (response.ok) {
                let contentTye = response.headers.get('Content-Type');

                if (/json/.test(contentTye)) {
                    response.json().then(jsonBody => {
                        resolve(jsonBody)
                    }).catch(err => {
                        reject(response)
                    })
                } else if (/text/.test(contentTye)) {
                    response.text().then(jsonBody => {
                        resolve(jsonBody)
                    }).catch(err => {
                        reject(response)
                    })
                } else if (/form/.test(contentTye)) {
                    response.formData().then(jsonBody => {
                        resolve(jsonBody)
                    }).catch(err => {
                        reject(response)
                    })
                } else if (/video/.test(contentTye)) {
                    response.blob().then(jsonBody => {
                        resolve(jsonBody)
                    }).catch(err => {
                        reject(response)
                    })
                } else {
                    response.text().then(jsonBody => {
                        resolve(jsonBody)
                    }).catch(err => {
                        reject(response)
                    })
                }

            } else {
                reject(response)
            }
        }).catch(function (err) {
            reject(err)
        })
    })
}

export default {
    request,
}