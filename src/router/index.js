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
    meta: { require_auth: false}
  },
  {
    path: '/', name: 'Test', component: Test,
    meta: { require_auth: true}
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
    path: '/login', name: 'Login', component: Login,
    meta: { require_auth: false}
  },
  {
    path: '/signup', name: 'Signup', component: Signup,
    meta: { require_auth: false}
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to,from,next) => {
  try{
    var auth = jscookie.get('auth').toLowerCase() === 'true'
  }
  catch {
    jscookie.set('auth', 'false', { sameSite: 'Lax' })
    auth = jscookie.get('auth').toLowerCase() === 'true'
    store.dispatch("reset")
  }

  console.log(auth)

  if(to.meta.require_auth && !auth){  
    next({ name: 'Login' })
    store.dispatch("reset")
  }
  else {
    next() 
  }
})


export default router
