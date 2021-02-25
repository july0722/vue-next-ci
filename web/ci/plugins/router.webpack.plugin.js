const chokidar = require('chokidar')
const fg = require('fast-glob')
const path = require('path')
const fs = require('fs')
const prettier = require('prettier')
require('colors')

const generateRoutesAndFiles = async project => {
  // files.map(f => f.replace(/('|")/g, '\\$1'))
  return createRoutes(
    await fg(`../${project}/src/views/**/*.vue`, {
      ignore: ['**/*.test.*', '**/*.spec.*', '**/#*.*']
    }),
    'views',
    '-'
  )
}

const createRoutes = (files, viewsDir = '', routeNameSplitter = '-') => {
  const routes = []
  const requireComponent = []
  files.forEach(file => {
    const keys = file
      .replace(new RegExp(`^${viewsDir}`), '')
      .replace(new RegExp(`\\.(vue)$`), '')
      .replace(/\/{2,}/g, '/')
      .split('/')
      .slice(4)
    let route = {
      name: '',
      path: '',
      component: keys
        .join('-')
        .replace('_', '')
        .replace(/\-(\w)/g, (all, letter) => letter.toUpperCase())
    }
    let config = fs
      .readFileSync(path.join(process.cwd(), file), 'utf-8')
      .match(/<route-config(([\s\S])*?)<\/route-config>/g)
    if (config && config[0]) {
      config = eval(`(${config[0].replace('<route-config>', '').replace('</route-config>', '')})`)
      route = { ...route, ...config }
    }
    requireComponent.push(
      // todo: 停用懒加载，避免触发多请求
      // `const ${route.component} = () => import(/* webpackChunkName: "${
      //   route.component
      // }" */ '@/views/${keys.join('/')}')`
      `import ${route.component} from '@/views/${keys.join('/')}'`
    )
    let parent = routes
    keys.forEach((key, i) => {
      // remove underscore only, if its the prefix
      const sanitizedKey = key.startsWith('_') ? key.substr(1) : key

      route.name = route.name ? route.name + routeNameSplitter + sanitizedKey : sanitizedKey
      route.name += key === '_' ? 'all' : ''
      // route.chunkName = file.replace(new RegExp(`\\.(${supportedExtensions.join('|')})$`), '')
      const child = parent.find(parentRoute => parentRoute.name === route.name)

      if (child) {
        child.children = child.children || []
        parent = child.children
        route.path = ''
      } else if (key === 'index' && i + 1 === keys.length) {
        route.path += i > 0 ? '' : '/'
      } else {
        route.path += '/' + getRoutePathExtension(key)

        if (key.startsWith('_') && key.length > 1) {
          route.path += '?'
        }
      }
      if (config && config.path) {
        route._path = config.path
      }
      if (config && config.name) {
        route._name = config.name
      }
    })
    parent.push(route)
  })
  sortRoutes(routes)
  return {
    routes: cleanChildrenRoutes(routes),
    requireComponent
  }
}
// const startsWithAlias = aliasArray => str => aliasArray.some(c => str.startsWith(c))
// const startsWithSrcAlias = startsWithAlias(['@', '~'])
// const r = (...args) => {
//   const lastArg = args[args.length - 1]
//   if (startsWithSrcAlias(lastArg)) {
//     return wp(lastArg)
//   }
//   return wp(path.resolve(...args.map(str => str.replace(/\//g, escapeRegExp(path.sep)))))
// }

// const baseToString = value => {
//   if (typeof value === 'string') {
//     return value
//   }
//   if (isArray_1(value)) {
//     return _arrayMap(value, baseToString) + ''
//   }
//   if (isSymbol_1(value)) {
//     return symbolToString ? symbolToString.call(value) : ''
//   }
//   let result = value + ''
//   return result == '0' && 1 / value == -INFINITY ? '-0' : result
// }

// const toString = value => {
//   return value == null ? '' : baseToString(value)
// }

// const escapeRegExp = string => {
//   const reRegExpChar = /[\\^$.*+?()[\]{}|]/g
//   const reHasRegExpChar = RegExp(reRegExpChar.source)
//   string = toString(string)
//   return string && reHasRegExpChar.test(string) ? string.replace(reRegExpChar, '\\$&') : string
// }
// const isWindows = /^win/.test(process.platform)
// const wp = (p = '') => {
//   if (isWindows) {
//     return p.replace(/\\/g, '\\\\')
//   }
//   return p
// }
const getRoutePathExtension = key => {
  if (key === '_') {
    return '*'
  }
  if (key.startsWith('_')) {
    return `:${key.substr(1)}`
  }
  return key
}

const DYNAMIC_ROUTE_REGEX = /^\/(:|\*)/

const sortRoutes = routes => {
  routes.sort((a, b) => {
    if (!a.path.length) {
      return -1
    }
    if (!b.path.length) {
      return 1
    }
    // Order: /static, /index, /:dynamic
    // Match exact route before index: /login before /index/_slug
    if (a.path === '/') {
      return DYNAMIC_ROUTE_REGEX.test(b.path) ? -1 : 1
    }
    if (b.path === '/') {
      return DYNAMIC_ROUTE_REGEX.test(a.path) ? 1 : -1
    }

    let i
    let res = 0
    let y = 0
    let z = 0
    const _a = a.path.split('/')
    const _b = b.path.split('/')
    for (i = 0; i < _a.length; i++) {
      if (res !== 0) {
        break
      }
      y = _a[i] === '*' ? 2 : _a[i].includes(':') ? 1 : 0
      z = _b[i] === '*' ? 2 : _b[i].includes(':') ? 1 : 0
      res = y - z
      // If a.length >= b.length
      if (i === _b.length - 1 && res === 0) {
        // unless * found sort by level, then alphabetically
        res = _a[i] === '*' ? -1 : _a.length === _b.length ? a.path.localeCompare(b.path) : _a.length - _b.length
      }
    }

    if (res === 0) {
      // unless * found sort by level, then alphabetically
      res =
        _a[i - 1] === '*' && _b[i] ? 1 : _a.length === _b.length ? a.path.localeCompare(b.path) : _a.length - _b.length
    }
    return res
  })

  routes.forEach(route => {
    if (route.children) {
      sortRoutes(route.children)
    }
  })

  return routes
}

const cleanChildrenRoutes = (routes, isChild = false, routeNameSplitter = '-') => {
  let start = -1
  const regExpIndex = new RegExp(`${routeNameSplitter}index$`)
  const routesIndex = []
  routes.forEach(route => {
    if (regExpIndex.test(route.name) || route.name === 'index') {
      // Save indexOf 'index' key in name
      const res = route.name.split(routeNameSplitter)
      const s = res.indexOf('index')
      start = start === -1 || s < start ? s : start
      routesIndex.push(res)
    }
  })
  routes.forEach(route => {
    route.path = isChild ? route.path.replace('/', '') : route.path
    if (route.path.includes('?')) {
      const names = route.name.split(routeNameSplitter)
      const paths = route.path.split('/')
      if (!isChild) {
        paths.shift()
      } // clean first / for parents
      routesIndex.forEach(r => {
        const i = r.indexOf('index') - start //  children names
        if (i < paths.length) {
          for (let a = 0; a <= i; a++) {
            if (a === i) {
              paths[a] = paths[a].replace('?', '')
            }
            if (a < i && names[a] !== r[a]) {
              break
            }
          }
        }
      })
      route.path = (isChild ? '' : '/') + paths.join('/')
    }
    if (route._path) {
      route.path = route._path
      delete route._path
    }
    if (route._name) {
      route.name = route._name
      delete route._name
    }
    route.name = route.name.replace(regExpIndex, '')
    if (route.children) {
      if (route.children.find(child => child.path === '')) {
        delete route.name
      }
      route.children = cleanChildrenRoutes(route.children, true, routeNameSplitter)
    }
  })
  return routes
}

const creatRouter = project => {
  generateRoutesAndFiles(project).then(res => {
    let text = ''
    res.requireComponent.forEach(res => {
      text += `${res}\n`
    })
    text += `export default ${JSON.stringify(
      res.routes,
      (key, value) => {
        if (typeof value === 'function') {
          return `##${value.toString()}##`
        } else {
          return value
        }
      },
      2
    )}`
      .replace(/"component": "(\w+?)"/g, `"component": $1`)
      .replace(/"(\w+?)":/g, '$1:')
      .replace(/"##/g, '')
      .replace(/##"/g, '')
      .replace(/\\r\\n/g, '\r\n')
    fs.writeFile(
      path.join(process.cwd(), `../${project}/src/router/routes.js`),
      prettier.format(text, { singleQuote: true, semi: false, parser: 'babel' }),
      () => {
        console.log('\nRouter complete.'.green)
      }
    )
  })
}
class RouterWebpackPlugin {
  constructor({ project }) {
    this.project = project
  }

  apply(compiler) {
    compiler.hooks.environment.tap('RouterWebpackPlugin', () => {
      creatRouter(this.project)
      compiler.options.mode === 'development' &&
        chokidar
          .watch('views', {
            ignoreInitial: true,
            cwd: path.resolve(process.cwd(), `../${this.project}/src`),
            ignore: ['**/*.test.*', '**/*.spec.*', '**/#*.*']
          })
          .on('add', () => creatRouter(this.project))
          .on('unlink', () => creatRouter(this.project))
          .on('unlinkDir', () => creatRouter(this.project))
          .on('change', () => creatRouter(this.project))
    })
  }
}

module.exports = RouterWebpackPlugin
