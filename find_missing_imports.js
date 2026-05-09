const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('c:\\Users\\aflah\\Downloads\\com\\frontend\\src', function(filePath) {
  if (filePath.endsWith('.jsx')) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('useState') && !content.includes('import { useState }') && !content.includes('import React, { useState') && !content.includes('import {useState}')) {
      console.log('Missing useState import in:', filePath);
    }
  }
});
