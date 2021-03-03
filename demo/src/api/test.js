import { ajax } from '@web/api'

export const login = (data) => ajax('/commonlogin/toLogin', data, 'POST', 'JSON')
export const list = (data) => ajax('/list', data, 'POST', 'JSON')
