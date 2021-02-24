import { createStore } from 'vuex'

export default createStore({
  state() {
    return {
      env: Object.freeze(process.env)
    }
  },
  mutations: {},
  actions: {},
  modules: {}
})
