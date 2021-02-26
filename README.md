## Vue.js PC端项目--IT头条内容发布管理系统

### 1. 项目简介

> 一个类似于[今日头条自媒体头条号](http://mp.toutiao.com/profile_v3/index)的内容发布管理系统。
>
> 本项目采用前后端分离的开发模式，使用 Vue.js 技术栈和 Element组件库构建的PC端单页面应用程序

项目已经完成功能如下：

- 登录/退出

- 内容管理

  + 文章筛选
  + 编辑/删除文章

- 素材管理

  + 收藏/删除素材

- 发布文章

  + 支持MarkDown

  + 文章封面
  + 发表/存入草稿

- 评论管理

  + 关闭/打开文章评论

- 个人设置

  + 更换个人信息
  + 更换头像





### 2.技术栈

1. 基于 `Vue.js` 的前端框架

1. 基于 `webpack` 工程化开发解决方案

1. 基于 `Element` 的前端 `UI` 组件库，开发效率更高

1. 基于 `axios` 的请求库

1. 基于 `RESTful` 风格的数据 `API` 解决方案

1. 基于 `Vue Router` 的路由管理方案

1. 基于 `Vuex` 的状态共享方案

1. 基于 `Vue CLI` 的脚手架工具，快速创建项目快速开发




### 3. 项目概览

- 对文章内容的删除和编辑
- 素材管理的收藏、删除和上传
- 发布文章
- 评论的管理
- 个人资料的修改





### 4. 项目运行

clone项目：

```
git clone https://github.com/feng-yu-jian/IT-toutiao.git
```

安装项目依赖：

```shell
npm install    |   yarn install
```

项目运行：

``` shell
npm run serve  |   yarn serve
```

项目打包

```sehll
npm run build  |   yarn build
```





### 解决方案详解

#### 1.使用请求拦截器统一设置用户 Token

> axios 拦截器官方示例：https://github.com/axios/axios#interceptors

在 request 请求模块中添加如下代码：

```js
// 请求拦截器
request.interceptors.request.use(
  // 任何所有请求会经过这里
  // config 是当前请求相关的配置信息对象,是可以修改的
  function (config) {
    const user = JSON.parse(window.localStorage.getItem('user'))

    // 如果有登录用户信息，则统一设置 token
    if (user) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
    // 当这里 return config 之后请求才会真正的发出去
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)
```



#### 2.控制页面访问权限

除了登录页面，其它所有页面都需要具有登录状态才能访问。

这里使用[路由的导航守卫]([https://router.vuejs.org/zh/guide/advanced/navigation-guards.html)来统一处理。

在 `src/router/index.js` 中：

```js
// beforeEach 是全局前置守卫，任何页面的访问都要经过这里
router.beforeEach((to, from, next) => {
  const user = JSON.parse(window.localStorage.getItem('user'))
  // 校验非登录页面的登录状态
  if (to.path !== '/login') {
    if (user) {
      // 已登录，允许通过
      next()
    } else {
      // 没有登录，跳转到登录页面
      next('/login')
    }
  } else {
    // 登录页面，正常允许通过
    next()
  }
})
```

> 关于路由导航守卫更详细的用户请参考官方文档：[https://router.vuejs.org/zh/guide/advanced/navigation-guards.html



#### 3.结合导航守卫实现页面切换顶部进度条

- [nprogress](https://github.com/rstacruz/nprogress)
- 路由前置钩子
- 路由后置钩子

1、安装 nprogress

```bash
npm i nprogress
```

2、在 `main.js` 中引入 `nprogress.css` 样式文件

```js
// 加载 nprogress 中的指定的样式文件
import 'nprogress/nprogress.css'
```

3、在路由的全局前置守卫中，开启进度条

在 `src/router/index.js` 中：

```js
+ import NProgress from 'nprogress'
router.beforeEach((to, from, next) => {
  // 开启顶部导航进度条特效
+ NProgress.start()

  const user = JSON.parse(window.localStorage.getItem('user'))
  if (to.path !== '/login') {
    if (user) {
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
})
```

4、在路由的全局后置钩子中，关闭进度条特效

```js
router.afterEach((to, from) => {
  // 结束顶部的导航进度条
  NProgress.done();
});
```



#### 4.解决后端返回数据中的大数字问题

JavaScript 能够准确表示的整数范围在`-2^53`到`2^53`之间（不含两个端点），超过这个范围，无法精确表示这个值，这使得 JavaScript 不适合进行科学和金融方面的精确计算。

[json-bigint](https://github.com/sidorares/json-bigint) 是一个第三方包，它可以帮我们很好的处理这个问题。

> 解决思路：
>
> Axios 会在内部使用 JSON.parse 把后端返回的数据转为 JavaScript 数据对象。
>
> 所以解决思路就是：不要让 axios 使用 JSON.parse 来转换这个数据，而是使用 json-biginit 来做转换处理。
>
> axios 提供了一个 API：transformResponse。

首先把它安装到你的项目中。

```shell
npm i json-bigint
```

下面是使用它的一个简单示例。

```javascript
import JSONbig from 'json-bigint'

const str = '{ "id": 1253585734669959168 }'

console.log(JSON.parse(str)) // 1253585734669959200

// 它会把超出 JS 安全整数范围的数字转为一种类型为 BigNumber 的对象
// 我们在使用的时候需要把这个 BigNumber.toString() 就能得到原来正确的数据
console.log(JSONbig.parse(str))
console.log(JSONbig.parse(str).id.toString()) // 1253585734669959168
```

所以我们在 `src/utils/request.js` 请求模块中添加处理代码：

```js
import axios from 'axios'
import JSONbig from 'json-bigint'

const request = axios.create({
  baseURL: 'http://api-toutiao-web.itheima.net',

  // 参数 data 就是后端返回的原始数据（未经处理的 JSON 格式字符串）
  transformResponse: [function (data) {
    try {
      return JSONbig.parse(data)
    } catch (err) {
      console.log('转换失败', err)
      return data
    }
  }]
})
export default request
```



#### 5.富文本编辑器

该项目使用的是基于 Vue 和 element 的富文本编辑器element-tiptap。

- GitHub 仓库：https://github.com/Leecason/element-tiptap
- 在线示例：https://leecason.github.io/element-tiptap
- 中文文档：https://github.com/Leecason/element-tiptap/blob/master/README_ZH.md

安装

```shell
npm i element-tiptap
```



#### 6.禁用路由缓存

发现一个小问题，从编辑文章导航到发布文章，表单内容并没有被清空，这是因为两个路由共用的同一个组件，两者之间相互跳转的时候，原来的组件实例会被复用。 因为两个路由都渲染同个组件，比起销毁再创建，复用则显得更加高效。**不过，这也意味着组件的生命周期钩子不会再被调用**。

路由默认提供的这个功能的用意是好的，但是有时候却会带来问题，解决方案就是：**禁用缓存**。

在路由出口 `router-view` 上添加一个唯一的 `key` 即可。

> 详细内容请查阅官方文档：[响应路由参数的变化](<[https://router.vuejs.org/zh/guide/essentials/dynamic-matching.html#%E5%93%8D%E5%BA%94%E8%B7%AF%E7%94%B1%E5%8F%82%E6%95%B0%E7%9A%84%E5%8F%98%E5%8C%96](https://router.vuejs.org/zh/guide/essentials/dynamic-matching.html#响应路由参数的变化)>)。



#### 7.非父子组件通信

通过事件总线Events Bus让非父子组件通信

1、创建 `src/utils/global-bus.js` 并写入

```js
import Vue from "vue";

// 直接导出一个空的 Vue 实例
export default new Vue();
```

2、使用 `global-bus` 通信

在通信的 a 端初始化 `created` 的时候注册监听一个自定义事件：

```js
import eventBus from '@/utils/event-bus'

export default {
  ...
  created () {
  	// 参数1：一个字符串，自定义事件名称
  	// 参数2：一个函数，事件发布以后就会调用
  	eventBus.$on('自定义事件名称', () => {
      // 业务逻辑代码
    })

    // 如果有参数的话，就声明接收
    eventBus.$on('自定义事件名称', (arg) => {
      // 业务逻辑代码
    })
	}
}
```

在通信的 b 端发布调用自定义事件

```js
import eventBus from '@/utils/event-bus'

export default {
  ...
  methods: {
    // 在某个业务方法中
    test () {
      // 参数1：自定义事件名称，必须是订阅的名字一致
      eventBus.$emit('自定义事件名称')

      // 如果需要传递额外的数据参数，就从第2个参数开始传
      eventBus.$emit('自定义事件名称', 123)
    }
  }
}
```



#### 8.本地预览测试打包结果

```bash
# yarn global add serve
# 注意：这是在安装全局包，在任何目录执行都可以
npm install -g serve
```

然后在项目目录下执行：

```bash
# dist 是运行 Web 服务根目录
serve -s dist
```

如果启动成功，你将看到如下提示：

```
   ┌────────────────────────────────────────────────────┐
   │                                                    │
   │   Serving!                                         │
   │                                                    │
   │   - Local:            http://localhost:5000        │
   │   - On Your Network:  http://192.168.156.90:5000   │
   │                                                    │
   │   Copied local address to clipboard!               │
   │                                                    │
   └────────────────────────────────────────────────────┘
```

> 
























