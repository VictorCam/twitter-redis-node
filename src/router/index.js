import { createRouter, createWebHistory } from 'vue-router'
import jscookie from 'js-cookie'
import store from '../store/index'

//lazy loading views
const Test = () => import('@/views/Test.vue')
const About = () => import('@/views/About.vue')
const NotFound = () => import('@/views/NotFound.vue')
const Posts = () => import('@/views/Posts.vue')
const Login = () => import('@/views/Login.vue')
const Signup = () => import('@/views/Signup.vue')

const routes = [
  {
    path: "/:catchAll(.*)", name: "404", component: NotFound,
    meta: { require_auth: false, prevent_auth: false}
  },
  {
    path: '/', name: 'Test', component: Test,
    meta: { require_auth: true, prevent_auth: false}
  },
  {
    path: '/about', name: 'About', component: About,
    meta: { require_auth: false, prevent_auth: false}
  },
  {
    path: '/posts', name: 'Posts', component: Posts,
    meta: { require_auth: true, prevent_auth: false}
  },
  {
    path: '/login', name: 'Login', component: Login,
    meta: { require_auth: false, prevent_auth: true}
  },
  {
    path: '/signup', name: 'Signup', component: Signup,
    meta: { require_auth: false, prevent_auth: true}
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to,from,next) => {
  //find cookie
  try{ var auth = jscookie.get('auth').toLowerCase() === 'true' }
  catch {
    console.log("error with auth")
    jscookie.set('auth', 'false', { sameSite: 'Lax' })
    auth = jscookie.get('auth').toLowerCase() === 'true'
    store.dispatch("logout")
  }

  //check if we can access this route
  if(to.meta.require_auth && !auth) {
    console.log("require_auth triggered (messed with auth)")
    store.dispatch("logout")
    next({ name: 'Login' })
  }
  else if(to.meta.prevent_auth && auth) {
    console.log("prevent_auth triggered")
    next({ name: 'Posts' })
  }
  else {
    next() 
  }

})


export default router
