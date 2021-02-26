import Vue from 'vue'
import VueRouter from 'vue-router'
import NProgress from 'nprogress'

const Login = () => import('@/views/login')
const Home = () => import('@/views/home')
const Layout = () => import('@/views/layout')
const Article = () => import('@/views/article')
const Publish = () => import('@/views/publish')
const Image = () => import('@/views/image')
const Comment = () => import('@/views/comment')
const Settings = () => import('@/views/settings')

Vue.use(VueRouter)

// 路由配置表
const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: 'home',
        component: Home
      },
      {
        path: '/article',
        name: 'article',
        component: Article
      },
      {
        path: '/publish',
        name: 'publish',
        component: Publish
      },
      {
        path: '/image',
        name: 'image',
        component: Image
      },
      {
        path: '/comment',
        name: 'comment',
        component: Comment
      },
      {
        path: '/settings',
        name: 'settings',
        component: Settings
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// beforeEach 全局前置守卫，任何页面的访问都要经过这里
router.beforeEach((to, from, next) => {
  // 开启顶部导航进度条特效
  NProgress.start()

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

router.afterEach((to, from) => {
  // 结束顶部的导航进度条
  NProgress.done()
})

// 组件中使用的 this.$router 就是这个模块中的 router
export default router
