import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { sync } from 'vuex-router-sync'
import ElementPlus from 'element-plus'
import locale from 'element-plus/lib/locale/lang/zh-cn'
import 'element-plus/lib/theme-chalk/index.css'

const app = createApp(App)
require('@/main').default(app, router)
require('@web/components').default(app)

try {
  const layoutCtx = require.context('@/layouts', false, /\.vue$/)
  layoutCtx.keys().forEach(layout =>
    app.component(
      layout
        .split('/')
        .pop()
        .replace(/\.\w+$/, ''),
      layoutCtx(layout).default
    )
  )
} catch (e) {
  console.log(e)
}

try {
  const apiCtx = require.context('@/api', false, /\.js$/)
  const $api = {}
  apiCtx.keys().forEach(
    file =>
      ($api[
        file
          .split('/')
          .pop()
          .replace(/\.\w+$/, '')
          .replace(/-(\w)/g, (a, c) => c.toUpperCase())
      ] = apiCtx(file))
  )
  app.config.globalProperties.$api = $api
} catch (e) {
  console.log(e)
}

app
  .use(store)
  .use(router)
  .use(ElementPlus, { locale })
  .mount('#app')
sync(store, router)
