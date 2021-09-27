// set to your KV namespace, remember binding it to workers 
const NAMESPACE = SUB

const DEFAULT_SECURITY_HEADERS = {
  /*
  Secure your application with Content-Security-Policy headers.
  Enabling these headers will permit content from a trusted domain and all its subdomains.
  @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
  "Content-Security-Policy": "default-src 'self' example.com *.example.com",
  */
  /*
  You can also set Strict-Transport-Security headers. 
  These are not automatically set because your website might get added to Chrome's HSTS preload list.
  Here's the code if you want to apply it:
  "Strict-Transport-Security" : "max-age=63072000; includeSubDomains; preload",
  */
  /*
  Permissions-Policy header provides the ability to allow or deny the use of browser features, such as opting out of FLoC - which you can use below:
  "Permissions-Policy": "interest-cohort=()",
  */
  /*
  X-XSS-Protection header prevents a page from loading if an XSS attack is detected. 
  @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection
  */
  "X-XSS-Protection": "0; mode=block",
  /*
  X-Frame-Options header prevents click-jacking attacks. 
  @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  */
  "X-Frame-Options": "DENY",
  /*
  X-Content-Type-Options header prevents MIME-sniffing. 
  @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  */
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  'Cross-Origin-Embedder-Policy': 'require-corp; report-to="default";',
  'Cross-Origin-Opener-Policy': 'same-site; report-to="default";',
  "Cross-Origin-Resource-Policy": "same-site",
}

const jHeaders = {
  'Content-Type': 'application/json; charset=utf-8'
}

const optHeaders = {
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
}

addEventListener('fetch', function (event) {
  const { request } = event
  const response = handleApiRequest(request)
  event.respondWith(response)
})

function jString(value, key) {
  let jValue = {}
  if (key) {
    jValue[key] = value
  } else {
    jValue["msg"] = value
  }
  return JSON.stringify(jValue, null, 2)
}

function jCode(code) {
  Object.assign(jHeaders, DEFAULT_SECURITY_HEADERS)
  // console.log(jHeaders)
  let jObj = {
    status: code,
    headers: jHeaders
  }
  return jObj
}

function OptCode(code) {
  Object.assign(optHeaders, DEFAULT_SECURITY_HEADERS)
  // console.log(optHeaders)
  let jObj = {
    status: code,
    headers: optHeaders
  }
  return jObj
}

async function getMethod(key) {
  const value = await NAMESPACE.get(key)
  if (value === null) {
    return new Response(jString('This is a null value', key), jCode(200))
  }

  return new Response(jString(value, key), jCode(200))
}


async function postMethod(key, value) {
  status = await NAMESPACE.put(key, value)
  console.log(status)
}

async function deleteMethod(key) {
  status = await NAMESPACE.delete(key)
  console.log(status)
}

async function RESTfulRequest(method, key, { value }) {
  switch (method) {
    case 'GET':
      const _value = await NAMESPACE.get(key)
      if (_value === null) {
        return new Response(jString('This is a null value', key), jCode(200))
      }
      return new Response(jString(_value, key), jCode(200))
    case 'POST':
      await postMethod(key, value)
      return new Response(jString(value, key), jCode(201))
    case 'PUT':
      exist = await NAMESPACE.get(key)
      if (exist) {
        await postMethod(key, value)
        return new Response(jString(value, key), jCode(200))
      } else {
        return new Response(jString('key not exist to update'), jCode(404))
      }
    case 'DELETE':
      await deleteMethod(key)
      return new Response(jString(`${key} has been deleted`), jCode(200))
    default:
      return new Response(jString('wrong request method'), jCode(500))
  }
}

async function handleApiRequest(request) {

  const reqMethod = request.method
  const reqURL = new URL(request.url)
  const path = reqURL.pathname
  // console.log(path)

  const pathArgs = path.split('/')
  console.log(pathArgs)

  const queryKey = pathArgs[3]
  console.log(queryKey)

  let postValue = new String()

  const reqObj = {}

  if (request.body) {
    data = await request.json()
    Object.assign(reqObj, data)
  }

  console.log(reqObj)
  if (reqObj) {
    postValue = reqObj['value']
  }

  if (reqMethod === 'OPTIONS') {
    return new Response(null, OptCode(204))
  } else {
    if (pathArgs[1] === 'v1') {

      if (pathArgs[2] === 'db') {

        if (queryKey !== undefined && queryKey !== null && queryKey !== "") {
          switch (reqMethod) {
            case 'GET':
              const _value = await NAMESPACE.get(queryKey)
              if (_value === null) {
                return new Response(jString(null, queryKey), jCode(404))
              }
              return new Response(jString(_value, queryKey), jCode(200))
            case 'POST':
              await NAMESPACE.put(queryKey, postValue)
              return new Response(jString(postValue, queryKey), jCode(201))
            case 'PUT':
              const exist = await NAMESPACE.get(queryKey)
              if (exist) {
                await NAMESPACE.put(queryKey, postValue)
                return new Response(jString(postValue, queryKey), jCode(200))
              } else {
                return new Response(jString('key not exist to update'), jCode(404))
              }
            case 'DELETE':
              await NAMESPACE.delete(queryKey)
              return new Response(jString(`${queryKey} has been deleted`), jCode(200))
            default:
              return new Response(jString('wrong request method'), jCode(500))
          }
        }
        return new Response(jString('key not valid'), jCode(404))
      }
      return new Response(jString('no api service select'), jCode(500))
    }
    return new Response(jString('wrong api version'), jCode(500))
  }
}
