# node-webfinger-service

a webfinger service implementation in node.js

## Introduction

This is a very simple WebFinger service written for node.js. It only supports JSON at the moment, and could very well have bugs. Feedback, contributions and bug reports welcome.


## Install
```
$ git clone git://github.com/silverbucket/node-webfinger-service.git
$ cd node-webfinger-service
$ npm install
```

## Setup

#### 1. Basic config

```
$ cp config.js.example config.js
```

Edit the `config.js` and set your domain name, and the protocol (http or https) that you will receive requests on.

#### 2. User data

All of the user data lives in the `resource/acct/` directory. Each file is treated as a username when webfinger-service does it's lookup (it doesn't actually check for any system accounts). An example user data file is there named `user`, and looks like this:

```javascript
  module.exports = {
    "subject" : "acct:user@example.com",
    "links" : [
      {
        "rel" : "http://webfinger.net/rel/avatar",
        "href" : "http://exmaple.com/images/avatar.jpg"
      },
      {
        "rel" : "http://webfinger.net/rel/profile-page",
	"href" : "http://www.example.com/user/profile"
      },
      {
        "rel" : "http://packetizer.com/rel/blog",
        "href" : "http://exmaple.com/blog"
      }
    ]
  };
```

So, if your filename is `bob` then lookups for `bob@[yourdomain]` will return
that json object.

#### 3. Setup a proxy ( HAProxy )

You can also setup nginx to forward, but I've only tested with HAProxy.

```
frontend public
  bind *:80
  ...
  acl is_webfinger path_beg -i /.well-known
  use_backend webfinger if is_webfinger
  ...
  backend webfinger
    timeout server 30s
    option httpclose
    option forwardfor
    server srv1 127.0.0.1:9110  # or whatever port you chose in config.js
```

**Don't forget to restart HAProxy**

#### 4. Start the webfinger-service

```
$ bin/webfinger-service
```

## Example request/response
A request like this: 
`GET http://localhost:9110/.well-known/webfinger?resource=acct:user@example.com`

Should provide a response like this:
```javascript
{
  "subject":  "acct:user@example.com",
  "links": [
    {
      "rel": "http://webfinger.net/rel/avatar",
      "href": "http://exmaple.com/images/avatar.jpg"
    },
    {
      "rel": "http://webfinger.net/rel/profile-page",
      "href": "http://www.example.com/user/profile"
    },
    {
      "rel": "http://packetizer.com/rel/blog",
      "href": "http://exmaple.com/blog"
    }
  ]
}
```
