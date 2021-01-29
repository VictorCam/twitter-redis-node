import { createRouter, createWebHistory } from 'vue-router'
import store from '../store/index'

//lazy loading views
const Test = () => import('@/views/Test.vue')
const About = () => import('@/views/About.vue')
const NotFound = () => import('@/views/NotFound.vue')
const Posts = () => import('@/views/Posts.vue')
const Login = () => import('@/views/Login.vue')

const routes = [
  {
    path: "/:catchAll(.*)", name: "404", component: NotFound,
    meta: { require_auth: false}
  },
  {
    path: '/', name: 'Test', component: Test,
    meta: { require_auth: false}
  },
  {
    path: '/about', name: 'About', component: About,
    meta: { require_auth: false}
  },
  {
    path: '/posts', name: 'Posts', component: Posts,
    meta: { require_auth: true}
  },
  {
    path: '/Login', name: 'Login', component: Login,
    meta: { require_auth: false}
  }
]
4
const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to,from,next) => {
  return ((to.meta.require_auth && !store.state.auth.login) ? next({ name: 'Test' }) : next() )
})


export default router
