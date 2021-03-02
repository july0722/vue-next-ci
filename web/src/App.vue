<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script>
import Default from './layouts/default'
import Admin from './layouts/admin'
import { computed, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'

export default {
  setup() {
    const route = useRoute()
    const internalInstance = getCurrentInstance()
    internalInstance.appContext.app.component('admin', Admin)
    const layout = computed(() => route.meta.layout || Default)
    return { layout }
  }
}
</script>

<style lang="scss">
@import '~normalize.css';
html,
body,
#app {
  height: 100%;
  width: 100%;
}

#app {
  background: #fafbfd;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
