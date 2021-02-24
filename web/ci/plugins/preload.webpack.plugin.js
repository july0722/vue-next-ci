const preload = content => {
  let preloadIndex = content.lastIndexOf('as=style><link')
  const prefix = process.env.VUE_APP_GZ_SYSTEM_PREFIX
  const mode = process.env.VUE_APP_MODE
  if (preloadIndex) {
    preloadIndex += 9
    content = `${content.slice(
      0,
      preloadIndex
    )}<link href=${prefix}/common/${mode}.umd.min.js rel=preload as=script>${content.slice(preloadIndex)}`
  }
  if (content.includes('</title>')) {
    content = content.replace('</title>', `</title><link href=${prefix}/common/${mode}.css rel=preload as=style>`)
  }
  return content
}

class PreloadWebpackPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('PreloadWebpackPlugin', compilation => {
      const content = preload(compilation.assets['index.html'].source())
      compilation.assets['index.html'] = {
        source: () => content,
        size: () => content.length
      }
    })
  }
}

module.exports = PreloadWebpackPlugin
