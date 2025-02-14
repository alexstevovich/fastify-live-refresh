
# fastify-live-refresh

  
This package is a quick and easy way to refresh the browser from the server so you can see live updates whenever you save your files.

### Tech Summary
Auto-injecting WebSocket client for Fastify that enables live reloading of the browser.

## Usage

``` node.js
import  fastifyWebsocket  from  '@fastify/websocket';
import { FastifyLiveRefresh } from  'fastify-live-refresh'

app.register(fastifyWebsocket);
const  liveRefresh  =  new  FastifyLiveRefresh(app);

```
You must trigger the live refresh yourself, this lets the package be unopinionated. You choose when to run the `refresh()` method and the client will be updated. I tend to just run a file watcher with chokidar.

## Suggested Usage

``` node.js
if(isDev)
{

	app.register(fastifyWebsocket);

	const  liveRefresh  =  new  FastifyLiveRefresh(app);

	chokidar.watch(publicDir, { ignoreInitial:  true }).on("all", (event, filePath) => {

	liveRefresh.refresh()

	});
}
```


  

## Overview

  

This will set up a WebSocket for you with zero configuration and it will automatically inject and serve the needed client-side JS so it just works like magic.

  

- Zero Configuration: Just create an instance and pass it your Fastify app.

- Self-Contained: No need for extra setup—just install and use.



## Installation

  
```sh

npm  install  fastify-live-refresh

```

  

  

## Features

  
- Auto-injects the WebSocket client into HTML pages

- Serves the client-side script automatically

- Works out-of-the-box with Fastify

- No dependencies beyond Fastify itself

- Minimalist API, no complex configuration needed

  

## Configuration (Optional)

  

By default, the WebSocket server runs at:
 

- Route: `/ws-FASTIFY-LIVE-REFRESH-RESERVED-ROUTE`

- Script URL: `/AUTO-INJECTED-BY-FASTIFY-LIVE-REFRESH.js`

  

You can override the route in the constructors options

 
```js

new  HotClientFastify(fastify, { route:  '/my-custom-ws-route' });

```


## Minimal Package
This package is intended to save a few hours of research and experimentation to rebuild this functionality in each web app I make. Its scope is small enough that it is currently complete outside of being battle-tested and will most likely not receive any further updates unless major infrastructure changes occur to Fastify.
  