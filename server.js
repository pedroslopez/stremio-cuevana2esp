#!/usr/bin/env node

const { serveHTTP, publishToCentral } = require("stremio-addon-sdk")
const addonInterface = require("./src/addon")
const { PORT } = require('./src/constants');
serveHTTP(addonInterface, { port: PORT })

publishToCentral("https://stremio-c2e.herokuapp.com/manifest.json")
