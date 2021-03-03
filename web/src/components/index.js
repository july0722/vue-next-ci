import BaseGrid from './base-grid'

export default app => {
  ;[BaseGrid].forEach(component => {
    app.component(component.name, component)
  })
}
