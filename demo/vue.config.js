module.exports = {
  devServer: {
    port: 7082,
    proxy: {
      '/api': {
        target: 'https://www.fastmock.site/mock/2437e5242d2ce1135b19d91821762be9',
      },
    },
  },
}
