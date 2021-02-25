import routes from '@/router/routes'

export default (app, router) => {
  routes.forEach((route) => router.addRoute(route))
}
