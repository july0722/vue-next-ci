import routes from '@/router/routes'

export default (app, router) => {
  routes.forEach((route) => {
    route.meta || (route.meta = {})
    route.meta.layout || (route.meta.layout = 'admin')
    router.addRoute(route)
  })
}
