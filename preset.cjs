'use strict';
const path = require('path');

const managerEntries = (entry = []) => {
  return [...entry, path.resolve(__dirname, 'dist/register.js')];
};

module.exports = { managerEntries };
