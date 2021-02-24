import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css'

const app = createApp(App)
  .use(store)
  .use(router)
  .use(ElementPlus)
const ctx = require.context('@', false, /\main.js$/)
ctx.keys().forEach(main => ctx(main).default(app))

const layoutCtx = require.context('@/layouts', false, /\.vue$/)
layoutCtx.keys().forEach(layout => {
  app.component(
    layout
      .split('/')
      .pop()
      .replace(/\.\w+$/, ''),
    layoutCtx(layout).default
  )
})

app.mount('#app')
