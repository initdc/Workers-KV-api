const NS = SUB;

const apiMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];
const apiVersion = ["v1", "v2"];
const apiService = ["db", "search"];

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
  "Cross-Origin-Embedder-Policy": 'require-corp; report-to="default";',
  "Cross-Origin-Opener-Policy": 'same-site; report-to="default";',
  "Cross-Origin-Resource-Policy": "same-site",
};

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
};

const OPTIONS_HEADERS = {
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

Object.assign(JSON_HEADERS, DEFAULT_SECURITY_HEADERS);
Object.assign(OPTIONS_HEADERS, DEFAULT_SECURITY_HEADERS);

addEventListener("fetch", (event) =>
  event.respondWith(handleRequest(event.request))
);

function JsonBody(value, key) {
  const obj = {};
  if (key) {
    obj[key] = value;
  } else {
    obj["msg"] = value;
  }
  return JSON.stringify(obj, null, 2);
}

const initHeader = (code) => {
  return { status: code, headers: JSON_HEADERS };
};

async function handleRequest(request) {
  const method = request.method;

  if (apiMethods.indexOf(method) !== -1) {
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: OPTIONS_HEADERS });
    }

    // path will be: /v1/db/:key
    const url = new URL(request.url)
    const { pathname } = url
    const args = pathname.split("/");

    const ver = args[1];
    if (apiVersion.indexOf(ver) !== -1) {

      const service = args[2];
      if (apiService.indexOf(service) !== -1) {

        const key = args[3];
        switch (service) {
          case "db":
            if (key) {
              const postBody = request.body
              const example = `msg: POST/PUT object example {"value": "https://example.com"}`
              const value = await NS.get(key)
              switch (method) {
                case "GET":
                  if (value) return new Response(JsonBody(value, key), initHeader(200))
                  return new Response(JsonBody("Value not found"), initHeader(404))
                case "POST":
                  if (value) return new Response(JsonBody(`${key} already exists`), initHeader(409))

                  let postObj
                  try {
                    postObj = await request.json()
                  } catch (e) {
                    return new Response(example, initHeader(400))
                  }

                  if (postBody) {
                    if (postObj) {
                      const postVal = postObj["value"];
                      if (postVal) {
                        await NS.put(key, postVal)
                        return new Response(JsonBody(postVal, key), initHeader(201))
                      }
                      return new Response(JsonBody("value in POST object not found"), initHeader(404))
                    }
                  }
                  return new Response(example, initHeader(400))
                default:
                  return new Response(JsonBody(`Method ${method} not allowed.`), { status: 405, headers: { Allow: "GET,POST" } });
              }
            }
            return new Response(JsonBody("Query key not valid"), initHeader(403));
          case "search":
            if (method !== "GET") return new Response(JsonBody(`Method ${method} not allowed.`), { status: 405, headers: { Allow: "GET" } });

            if (key) {
              const list = await NS.list({ prefix: key })
              const listKeys = list.keys
              if (listKeys) return new Response(JSON.stringify(listKeys, null, 2), { status: 200 });
              return new Response(JsonBody("List is empty"), { status: 404 });
            }
            return new Response(JsonBody("Query key not valid"), initHeader(403));
        }
      }
      return new Response(JsonBody("Service mismatched"), initHeader(500));
    }
    return new Response(JsonBody("API version mismatched"), initHeader(500));
  }
  return new Response(JsonBody(`Method ${method} not allowed.`), { status: 405, headers: OPTIONS_HEADERS });
}
