#!/usr/bin/env node

const { serveHTTP, publishToCentral } = require("stremio-addon-sdk")
const addonInterface = require("./src/addon")
serveHTTP(addonInterface, { port: process.env.PORT || 55321 })

publishToCentral("https://stremio-c2e.herokuapp.com/manifest.json")
