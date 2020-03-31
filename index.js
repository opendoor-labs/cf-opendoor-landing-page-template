import { createInstance } from "@optimizely/optimizely-sdk";
import cookie from "cookie";
import { v4 } from "uuid";
// If you want to use your own optimizely account, remove this line
// and follow the instructions below for the datafile variable
import datafile from "./optimizelyDatafile.json";

addEventListener("fetch", event => {
  event.respondWith(handleLandingPageRequest(event.request));
});

// Remove this if you want to make requests to your own upstream.
const htmlResponseTemplate = (header, bodyText) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Hello!</title>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        font-family: helvetica, arial, sans-serif;
        margin: 2em;
      }

      h1 {
        font-style: italic;
        color: #373fff;
      }
    </style>
  </head>
  <body>
    <h1>${header}</h1>

    <script>
    function deleteUserCookie() {
      document.cookie = "anonymous_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      window.location.reload();
    }
    </script>
    <p>
    ${bodyText}
    </p>
    <p>Refreshing should keep the same variation, click the button to get a new userId and assign to an experiment again.</p>
    <button onclick="deleteUserCookie()">Delete userId and reload</button>
  </body>
</html>
`;

const initialBackend = "https://heroku.opendoor.com/";
const newBackend = "https://k8s.opendoor.com/";

async function handleLandingPageRequest(request) {
  if (request.method !== "GET") {
    return new Response(`Unsupported method ${request.method}`, {
      status: 400
    });
  }
  const cookies = cookie.parse(request.headers.get("Cookie")) || {};
  const userId = cookies["anonymous_id"] || `${v4()}`;
  // If you want to use your own optimizely file, uncomment this
  // and replace OPTIMIZELY_CDN_FILE with your project key.
  // const datafile = await fetch(
  //   "https://cdn.optimizely.com/datafiles/OPTIMIZELY_CDN_FILE.json"
  // ).then(res => res.json());
  const optimizelyInstance = createInstance({ datafile: datafile });

  const requestUrl = new URL(request.url);
  let response;
  let upstreamUrl;
  let variation;
  switch (requestUrl.pathname) {
    case "/infra":
      variation = optimizelyInstance.activate(
        "landing_page_infra_test",
        userId
      );
      if (variation === "control") {
        upstreamUrl = new URL(initialBackend);
        upstreamUrl.pathname = "/design-a";
      } else {
        upstreamUrl = new URL(newBackend);
        upstreamUrl.pathname = "/design-a";
      }
      // If you want this to make an upstream request, uncomment the
      // following line, and remove the `new Response` line after it
      // response = await fetch(new Request(upstreamUrl.toString()), request);
      response = new Response(
        htmlResponseTemplate(
          `Infra: upstream request for ${upstreamUrl.toString()}`,
          `This is a test for userId: ${userId}`
        ),
        { headers: { "Content-Type": "text/html" } }
      );
      break;
    case "/design":
      upstreamUrl = new URL(newBackend);
      variation = optimizelyInstance.activate(
        "landing_page_design_test",
        userId
      );
      if (variation === "control") {
        upstreamUrl.pathname = "/design-a";
      } else {
        upstreamUrl.pathname = "/design-b";
      }
      // If you want this to make an upstream request, uncomment the
      // following line, and remove the `new Response` line after it
      // response = await fetch(new Request(upstreamUrl.toString()), request);
      response = new Response(
        htmlResponseTemplate(
          `Design: Upstream request for ${upstreamUrl.toString()}`,
          `This is a test for userId: ${userId}`
        ),
        { headers: { "Content-Type": "text/html" } }
      );
      break;
    case "/variation":
      upstreamUrl = new URL(newBackend);
      upstreamUrl.pathname = "/design-b";
      variation = optimizelyInstance.activate(
        "landing_page_variation_test",
        userId
      );
      if (variation === "control") {
        upstreamUrl.search = "?headline=My+original+headline";
      } else {
        upstreamUrl.search = "?headline=My+new+headline";
      }
      // If you want this to make an upstream request, uncomment the
      // following line, and remove the `new Response` line after it
      // response = await fetch(new Request(upstreamUrl.toString()), request);
      response = new Response(
        htmlResponseTemplate(
          `Variation: Upstream request for ${upstreamUrl.toString()}`,
          `This is a test for userId: ${userId}`
        ),
        { headers: { "Content-Type": "text/html" } }
      );
      break;
    default:
      return new Response(`Not found: ${requestUrl.pathname}`, { status: 404 });
  }
  // make headers mutable
  response = new Response(response.body, response);
  response.headers.set("Set-Cookie", cookie.serialize("anonymous_id", userId));
  return response;
}
