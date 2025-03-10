#!/usr/bin/env node

'use strict';

const { createIndexFiles } = require('./index-components');

function runVersion() {
  createIndexFiles();
}

runVersion();
