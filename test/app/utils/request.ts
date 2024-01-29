import { app } from 'egg-mock/bootstrap';

export const factory = (api, method, headers: Array<any>) => {
  const handle = app.httpRequest()[method](api);
  headers.forEach(([key, value]) => {
    handle.set(key, value);
  });
  return handle;
}

export const method = (api, method, headers = []) => 
  factory(api, method, [
    ['x-lowcode-mode', 'develop'],
    ['x-lowcode-org', '1'],
    ...headers
  ])

export const post = (api) => method(api, 'post');
export const get = (api, headers?) => method(api, 'get', headers);
export const put = (api) => method(api, 'put');
export const doDelete = (api) => method(api, 'delete');
