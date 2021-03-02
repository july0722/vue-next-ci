import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import app from './modules/app'

export default createStore({
  plugins: [createPersistedState()],
  state: () => ({
    env: Object.freeze(process.env)
  }),
  mutations: {},
  actions: {},
  modules: {
    app
  }
})
