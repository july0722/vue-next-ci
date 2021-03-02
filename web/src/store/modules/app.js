export default {
  namespaced: true,
  state: () => ({
    collapse: false
  }),
  mutations: {
    collapse: state => {
      state.collapse = !state.collapse
    }
  }
}
