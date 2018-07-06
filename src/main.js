import {app, BrowserWindow} from 'electron';
import path from 'path';
import url from 'url';

import logger from './utils/logger';

app.logger = logger;
app.rootDir = process.cwd();

let win;


function createWindow () {
  win = new BrowserWindow({
    width: 1024,
    height: 768
  });


  win.loadURL('http://localhost:3000/');
  if (process.env.electronMode === 'dev') {
    win.webContents.openDevTools();
  }

  win.setMenu(null);

  win.on('closed', () => {
    win = null;
  });
}

function createWindowX () {
  win = new BrowserWindow({
    width: 1024,
    height: 768
  });

  if (process.env.electronMode === 'dev') {
    // 开发模式
    win.loadURL('http://localhost:3000/');
    win.webContents.openDevTools();
  } else if (process.env.electronMode === 'preview') {
    // 预览模式，打包前确认
    win.loadURL(url.format({
      pathname: path.join(process.cwd(), 'dist', 'index.html'),
      protocol: 'file:',
      slashes: true
    }));
    // win.webContents.openDevTools();
    win.setMenu(null);
  } else {
    // 打包模式
    win.loadURL(url.format({
      pathname: path.join(process.resourcesPath, 'app', 'dist', 'index.html'),
      protocol: 'file:',
      slashes: true
    }));
    // win.webContents.openDevTools();
    win.setMenu(null);
  }

  win.on('closed', () => {
    win = null;
  });

}

app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  app.quit();
  // }
});

app.on('ready', createWindow);
