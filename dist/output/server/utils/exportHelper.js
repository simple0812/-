var path = require('path');
var fs = require('fs');
const fse = require('fs-extra')
const uuidv1 = require('uuid/v1');
var path = require('path');
import { getPathByCWD, connectDb } from './common';
var Promise = require('bluebird');
var _ = require('lodash');

import {zip} from './zipHelper';

async function removeFromTagUnionDocument(exportDb) {
  var sql = `
    DELETE FROM tag_union_document WHERE EXISTS (
      SELECT * FROM document WHERE document.id = tag_union_document.document_id AND document.isShow=0
    )
  `;
  await exportDb.query(sql, {type:'BULKDELETE'});
}

async function removeFromTagUnionApi(exportDb) {
  var sql = `
    DELETE FROM tag_union_api WHERE EXISTS (
      SELECT * FROM api LEFT JOIN document ON api.document_id = document.id
      WHERE document.isShow=0
    )
  `;
  await exportDb.query(sql, {type:'BULKDELETE'});
}

async function removeFromApi(exportDb) {
  var sql = `
    DELETE FROM Api WHERE EXISTS (
      SELECT * FROM document WHERE document.id = api.document_id AND document.isShow=0
    )
  `;
  await exportDb.query(sql, {type:'BULKDELETE'});
}

async function removeFromDocument(exportDb) {
  await exportDb.query('DELETE FROM document WHERE isShow=0', {type:'BULKDELETE'});
}

async function exportImagesOfDocument(exportDb, tempOutDir) {
  var docs = await exportDb.query('SELECT * FROM document WHERE isShow=1', {type:'SELECT'});
  if(!docs || !docs.length) {
    return;
  }

  docs = _.filter(docs, doc => {
   var iconUrl = getPathByCWD('assets', doc.icon);
   return doc.icon && fs.existsSync(iconUrl);
  })

  await Promise.map(docs, doc => {
    var iconUrl = getPathByCWD('assets', doc.icon);
    return fse.copy(iconUrl, path.join(tempOutDir, 'assets', doc.icon));
  })
}
/*导出策略 
  1.导出整个表 
  2.删除document.isShow=0对应的tag_union_document表
  3.删除document.isShow=0对应的tag_union_api表
  4.删除document.isShow=0对应的api表
  5.删除document.isShow=0对应的document表
*/
async function handleExportData(destDir) {
  var tempOutDir = getPathByCWD('tempdir', uuidv1()) ;
  fse.ensureDirSync(tempOutDir);
  fse.ensureDirSync(getPathByCWD('assets'));
  var pathname = path.join(tempOutDir, 'database.sqlite');
  await fse.copy(path.join(process.cwd(), 'database.sqlite'), pathname);
  
  await Promise.delay(100);
  var exportDb = connectDb(pathname);
  await exportDb.sync({force:true}).then(() => {
    console.log('sync db success');
  }).catch(err => {
    console.log('sync db failed ' + err.message)
  });

  await removeFromTagUnionDocument(exportDb);
  await removeFromTagUnionApi(exportDb);
  await removeFromApi(exportDb);
  await removeFromDocument(exportDb);
  await exportImagesOfDocument(exportDb, tempOutDir);

  //关闭数据库连接 否则无法删除数据库文件
  var conn = await exportDb.connectionManager.getConnection();
  conn.close();
  await Promise.delay(100);

  await zip(tempOutDir, path.join(destDir, 'apidata.zip')).then(()=> {
    console.log('export success');
  }).catch(err => {
    console.log(err.message);
  })

  fse.emptyDirSync(getPathByCWD('tempdir'));
}

function exportData(path) {
  console.log('export data path', path)
  if(!path || path.length == 0) return;

  return handleExportData(path[0])
}
export {exportData};
