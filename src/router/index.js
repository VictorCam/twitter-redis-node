import { createRouter, createWebHistory } from 'vue-router'
// import store from '../store/index'

//lazy loading views
const Test = () => import('../views/Test.vue')
const About = () => import('../views/About.vue')
const NotFound = () => import('../views/NotFound.vue')

const routes = [
  {
    path: "/:catchAll(.*)",
    name: "404",
    component: NotFound,
    meta: { require_auth: false}
  },
  {
    path: '/',
    name: 'Test',
    component: Test,
    meta: { require_auth: false}
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: { require_auth: false}
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to,from,next) => {
  if (to.meta.require_auth && true) {
    return next({ name: 'Test' }) //redirect if not authorized
  }
  else {
    return next()
  }
})


export default router
