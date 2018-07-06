import fixPath from 'fix-path';
import npmRunPath from 'npm-run-path';
import is from 'electron-is';
import { delimiter } from 'path';

import { isWin } from '../../shared';
// import { BIN_PATH, NODE_PATH, NPM_BIN_PATH } from './paths';

// 修复electron的process.env.PATH 缺失路径的文静
fixPath();

const npmEnv = npmRunPath.env();
const pathEnv = [process.env.Path, npmEnv.PATH]
  .filter(p => !!p)
  .join(delimiter);
const env = { ...npmEnv, FORCE_COLOR: 1 };

if (is.windows()) {
  env.Path = pathEnv;
} else {
  env.PATH = `${pathEnv}:/usr/local/bin`;
}


export default env;
