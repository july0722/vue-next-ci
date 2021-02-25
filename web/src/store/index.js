import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

export default createStore({
  plugins: [createPersistedState()],
  state() {
    return {
      env: Object.freeze(process.env)
    }
  },
  mutations: {},
  actions: {},
  modules: {}
})
