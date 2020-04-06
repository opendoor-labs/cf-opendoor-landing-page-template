# Optimizely Cloudflare Worker Testing

Code related to: https://medium.com/opendoor-labs/cloudflare-workers-opendoor-landing-page-infrastructure-824853a34551

## Quickstart

```
npm i @cloudflare/wrangler -g
wrangler generate optimizely-example-app https://github.com/opendoor-labs/cf-opendoor-landing-page-template
cd optimizely-example-app
npm install && npm start
```

## Background

A template for an Optimizely experimentation implementation with
cloudflare workers.

It provides three separate optimizely experiments, available at
the following routes (following the blog post: https://TODOHERE.COM):

It also provides code to read+set the anonymous_id cookie, so the
experiment assigning is sticky.

An example optimizely datafile is provided with three experiments
set to 50/50 based on user id.

`/infra`
Varies the upstream host at a 50/50 split between:

- https://k8s.opendoor.com/design-a
- https://heroku.opendoor.com/design-a

`/design`
Varies the upstream path at a 50/50 split between:

- https://k8s.opendoor.com/design-a
- https://k8s.opendoor.com/design-b

`/variation`
Varies the upstream query parameter `headline` at a 50/50 split between:

- https://k8s.opendoor.com/design-b?headline=My+original+headline
- https://k8s.opendoor.com/design-b?headline=My+new+headline

## How do I use with my own optimizely account?

1. Set-up an optimizely full-stack project (or use a current one), and set-up experiments called `landing_page_{infra,design,variation}_test`
2. Follow the comments in `index.js` for how to get the optimizely datafile from the optimizely cdn.

## Questions, problems, clarifications?

Open up an issue and we'll try to help you out.

## Get started

`npm install`
`npm start`
Visit `localhost:8787/{infra,design,variation}`
