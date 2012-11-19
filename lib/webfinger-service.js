#!/usr/bin/env node
// -*- mode:js; js-indent-level:2 -*-

/**
 * node-webfinger-service
 *
 * Copyright 2012 Nick Jennings <nick@silverbucket.net>
 */

module.exports = (function(undefined) {
  var config = require('../config.js');
  var walk = require('walk');
  var pub = {};
  var _ = {};


  pub.hostMeta = function(req, res) {
    //var resource = querystring(url.parse(req.url).query)["resource"];
    console.log(req.query);
    console.log(config);

    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.query === undefined) {
      res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
      res.send('<XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">' +
               '  <Link rel="lrdd"' +
               '    type="application/xrd+xml"' +
               '    template="' +
               config.protocol + '://' +
               config.domain + '/webfinger/xrd/{uri}" />' +
               '</XRD>');
      return;
    }

    res.setHeader('Content-Type', 'application/json; charset=UTF-8');

    var resource = req.query['resource'];
    if (resource === undefined) {
      // no resource parameter specified
      res.send('{}');
      return;
    }

    var resourceTypePattern = /^[A-Za-z]+\:/;
    if (!resourceTypePattern.test(resource)) {
      // resource type (ie. acct:) not specified
      res.send('{}');
      return;
    }

    var parts = resource.replace(/ /g,'').split(':');
    if (parts[0] === 'acct') { // currently the only resource type supported
      var address = parts[1].replace(/ /g,'').split('@');
      console.log(address);
      if ((address[1] === undefined) || (address[1] !== config.domain)) {
        // domain portion of address must match this domain
        res.send('{"error": "invalid user address"}');
        return;
      } else {
        // get user response object
        var cwd    = process.cwd();
        var walker = walk.walk(cwd+'/resource/acct', { followLinks: false });
        console.log('directory:'+cwd+'/resource/acct');
        walker.on("file", function(root, stat, next) {
          // foreach file in directory, check for a matching username
          console.log('filename:'+stat.name);
          if (stat.name === address[0]) {
            // found userObj, send as response, and finish.
            var userObj = require('../resource/acct/'+address[0]);
            res.send(userObj);
            return;
          }
          next();
        });
        walker.on("end", function() {
          // user data not found
          res.send('{"error": "no data found for that user"}');
          return;
        });
      }
    } else {
      // resource type not supported
      res.send('{}');
      return;
    }
  };

  return pub;
})();