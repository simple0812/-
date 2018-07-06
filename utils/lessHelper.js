import fs from 'fs';
import fse from 'fs-extra';

function resolveVariable(filePath) {
  let rawCssVar = '';
  if (fs.existsSync(filePath)) {
    rawCssVar = fse.readFileSync(filePath, 'utf-8');
  }

  const cssVar = rawCssVar.split(/\r?\n/ig);
  const ret = {};
  let currTag = 'common';

  while (cssVar.length > 0) {
    const line = cssVar.shift().trim();

    if (!line) {
      continue;
    }

    // 处理 '// ~tag'格式
    const tagLine = line.match(/^\/\/\s*~(\w+)/);
    if (tagLine) {
      currTag = tagLine[1]; // eslint-disable-line

      if (!ret[currTag]) {
        ret[currTag] = [];
      }
      continue;
    }

    // 处理 '// comment'格式
    const commentLine = line.match(/^\/\/\s*(\w+)/);
    if (commentLine) {
      continue;
    }

    // 处理 '@key: val;'格式
    const cssLine = line.match(/^@(\w+)\s*:\s*(\w+);/);
    if (cssLine) {
      if (!ret[currTag]) {
        ret[currTag] = [];
      }

      ret[currTag].push({ key: cssLine[1], val: cssLine[2] });
    }
  }


  return ret;
}

export {
  resolveVariable
};
