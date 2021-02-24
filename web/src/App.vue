<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script>
import Default from './layouts/default'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  setup() {
    const route = useRoute()
    const layout = computed(() => route.meta.layout || Default)
    return { layout }
  }
}
</script>

<style lang="scss">
@import '~normalize.css';

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
