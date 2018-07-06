
import { shell } from 'electron';
import { exec, fork, spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import uuidV4 from 'uuid/v4';
import log from 'electron-log';
import serve from 'serve';
import taskLog from '../taskLog';
import mainWin from '../windowManager';
import env from '../env';

// 批量更新包多了以后可能会存在问题
export const install = ({ dir, pkgs, isDev }) => {
  return new Promise((resolve) => {
    try {
      const str = `yarn add ${pkgs.join(' ')}${isDev ? ' --dev' : ''}`;
      const term = exec(str, { cwd: dir, env });
      console.log(dir);
      console.log(str);
      term.on('exit', (code) => {
        console.log('yarn add exit code', code);
        resolve({ err: code !== 0 });
      });
    } catch (e) {
      log.error(e.message);
      resolve({ err: true });
    }
  });
};

export const uninstall = ({ dir, pkg }) => {
  return new Promise((resolve) => {
    try {
      const str = `yarn remove ${pkg}`;
      const term = exec(str, { cwd: dir, env });
      term.on('exit', (code) => {
        console.log('yarn remove exit code', code);
        resolve({ err: code !== 0 });
      });
    } catch (e) {
      log.error(e.message);
      resolve({ err: true });
    }
  });
};


// 执行命令
export const execCmd = ({ command, projPath }) => {
  const uid = uuidV4();

  let cmdStr = `npm run ${command} --scripts-prepend-node-path=auto`;
  if (command === 'publish') {
    cmdStr = 'npm publish';
  }
  const term = exec(cmdStr, {
    cwd: projPath,
    stdio: 'pipe',
    env: { ...env, VD_UID: uid },
    detached: true
  });

  // 保存该命令的状态到taskLog
  taskLog.setTask(command, projPath, {
    term,
    uid
  });
  const senderData = (data) => taskLog.writeLog(command, projPath, data);

  term.stdout.on('data', senderData);
  term.stderr.on('data', senderData);

  term.on('exit', (code) => {
    // 清理命令
    taskLog.clearTerm(command, projPath);
    log.error('exit', command, code);

    if (code === 0 && command === 'release') {
      const cfg = fs.readJSONSync(path.join(projPath, '.vd', 'project.json'));
      const server = serve(path.join(projPath, 'dist'), {
        port: cfg.preview.port,
        open: true
      });
      taskLog.setTask(command, projPath, {
        term,
        uid,
        serve: server
      });
      shell.openExternal(`http://localhost:${cfg.preview.port}`);
    }

    if (mainWin.getWin()) {
      // 通知 renderer 命令停止
      mainWin.send('task-end', {
        command,
        projPath,
        finished: code === 0
      });
    }
  });
};

// 停止命令
export const stopCmd = ({ command, projPath = '' }) => {
  console.log('stop', command, projPath);
  const task = taskLog.getTask(command, projPath);
  if (task.term) {
    killer.killByPid(task.term.pid)
      .then(() => console.log('done'))
      .catch(e => console.log(e.message));
  }
  if (task.serve) {
    task.serve.stop();
  }
  let port = 0;
  const cfg = fs.readJSONSync(path.join(projPath, '.vd', 'project.json'));
  if (command === 'start') {
    port = cfg.debug.port;
  } else if(command === 'styleguide') {
    port = 6060;
  } else {
    port = cfg.preview.port;
  }
  kill(port)
    .then(pids => console.log(pids))
    .catch(e => console.log(e.message));
};

export const git = async ({ args, pathToRepository }) => {
  const result = await GitProcess.exec(args, pathToRepository);
  // console.log(result);
  // if (result.exitCode === 0) {
  //   const output = result.stdout
  //   console.log(output);
  //   // do some things with the output
  // } else {
  //   const error = result.stderr
  //   // error handling
  //   console.log(error);
  // }
  return result;
};
