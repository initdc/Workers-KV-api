# Workers-KV-api

> api implementation to manage Cloudflare Workers KV

## Notice

The Workers includes limited KV Usage. When adding KV records from the offical website, it's doing read function for lots times, it's expensive to do such behavior.

This api has `GET` `POST` `PUT` `DELETE` `OPTIONS` methods, for public use, you can comment `code block` of some methods to protect your data.

## Design

```js
api.example.com / v1 / db / test

/*
@v1:     api version
@db:     api service
@test:   key
*/
```

## Methods

- `POST` & `PUT` methods example

```js
/*
header 'Content-Type' can be ignored
@value
*/

curl -X "POST" "http://localhost:8787/v1/db/test" -d '{"value": "test"}'

curl -X "PUT" "http://localhost:8787/v1/db/test" -d '{"value": "test-1"}'
```

## Deploy

1. create a worker

2. paste the code from `api.js`

3. set KV database binding

4. create records in KV database

5. set route for `api.example.com`

6. create DNS record for `api.example.com`

## Reference

[Workers KV API reference](https://developers.cloudflare.com/workers/runtime-apis/kv)

## Powered by

[Cloudflare Workers](https://workers.dev/)

## License

MIT
