const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', '@expo', 'cli', 'build', 'src', 'start', 'server', 'metro', 'externals.js');
if (fs.existsSync(target)) {
  let content = fs.readFileSync(target, 'utf8');
  let changed = false;

  if (!content.includes("!x.includes(':')")) {
    content = content.replace(
      /(\.filter\(\(x\)=>)/,
      "$1!x.includes(':') && "
    );
    changed = true;
  }

  if (!content.includes("if (moduleId.includes(':')) continue;")) {
    content = content.replace(
      /(for \(const moduleId of NODE_STDLIB_MODULES\){\s*)/,
      "$1if (moduleId.includes(':')) continue;\n        "
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(target, content, 'utf8');
    console.log('[patch-expo] Applied Windows node:sea path fix successfully.');
  }
}

const treeFsTarget = path.join(__dirname, '..', 'node_modules', '@expo', 'metro-file-map', 'build', 'lib', 'TreeFS.js');
if (fs.existsSync(treeFsTarget)) {
  let content = fs.readFileSync(treeFsTarget, 'utf8');
  if (content.includes("throw new Error(`TreeFS: Failed to make parent directory entry for")) {
    content = content.replace(
      /const parentDirNode = this\.#walkAndMakeDirectories\(this\.#rootNode, 0, 0, dirname, true, onSegment\);\s*if \(!parentDirNode\.exists\) \{\s*throw new Error\([^)]*\);\s*\}\s*if \(!isDirectory\(parentDirNode\.node\)\) \{\s*throw new Error\([^)]*\);\s*\}/g,
      "const parentDirNode = this.#walkAndMakeDirectories(this.#rootNode, 0, 0, dirname, true, onSegment);\n        if (!parentDirNode.exists || !isDirectory(parentDirNode.node)) {\n            return;\n        }"
    );
    fs.writeFileSync(treeFsTarget, content, 'utf8');
    console.log('[patch-expo] Applied Windows TreeFS parent directory safety patch.');
  }
}
