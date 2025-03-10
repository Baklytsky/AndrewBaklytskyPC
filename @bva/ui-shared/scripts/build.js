#!/usr/bin/env node

'use strict';

const { exec } = require('child_process');

exec('cd ../ui-shared && npm run build');