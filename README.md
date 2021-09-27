# Workers-KV-api

> api implementation to manage Cloudflare Workers KV

## Notice

The Workers includes limited KV Usage. When adding KV records from the offical website, it's doing read function for lots times, it's expensive to do such behavior.

## Deploy

1. create a worker

2. paste the code from `api.js`

3. set KV database binding

4. create records in KV database

5. set route for `*.example.com`

6. create DNS record for `*.example.com`

## Reference

[Workers KV API reference](https://developers.cloudflare.com/workers/runtime-apis/kv)

## Powered by

[Cloudflare Workers](https://workers.dev/)

## License

MIT
