import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '@/components/Home'
import Welcome from '../components/Welcome'
import Users from '../components/users/Users'
import Rights from '@/components/power/Rights'
import Roles from '@/components/power/Roles'
import Cate from '@/components/goods/Cate'
import Params from '@/components/goods/Params'
import GoodList from '@/components/goods/GoodList'
import AddGood from '@/components/goods/AddGood'
import Order from '@/components/order/Order'

Vue.use(VueRouter)
const routes = [
  {
    path: '/',
    component: Login
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Cate
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: GoodList
      },
      {
        path: '/add',
        component: AddGood
      },
      {
        path: '/orders',
        component: Order
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  // next() 放行
  // next('/login')  强制跳转
  // 如果访问的是login页面，直接放行
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 如果token不存在，则跳转至login页面
  if (!tokenStr) return next('/login')
  // token存在，则放行
  next()
})

export default router
