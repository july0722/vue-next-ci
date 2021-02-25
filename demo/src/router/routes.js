import about from '@/views/about'
import home from '@/views/home'
export default [
  {
    name: 'about',
    path: '/about',
    component: about
  },
  {
    name: 'home',
    path: '/home',
    component: home,
    meta: {
      layout: 'demo-layout'
    }
  }
]
