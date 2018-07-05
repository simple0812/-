var path = require('path');
var fs = require('fs');
const fse = require('fs-extra')
const uuidv1 = require('uuid/v1');
var path = require('path');
var Promise = require('bluebird');
var _ = require('lodash');
var zipper = require('zip-local');
import {getPathByCWD, connectDb} from './common';
import { Document, Api, db, Language, Tag, TagUnionApi, TagUnionDocument, DocumentGroup } from '../models'

/*同步策略 根据id判断数据是否已存在 如果存在则根据updatetime判断是否需要更新
  1.同步language
  2.同步tag
  3.同步api
  4.同步document
  5.同步tag_union_api
  6.同步tag_union_document
*/
async function handleImportData(tempInDir) {
  var pathname = path.join(tempInDir, 'database.sqlite');
  console.log('handleImportData', pathname);

  await Promise.delay(100);
  var importDb = connectDb(pathname);
  await importDb.sync({force:true}).then(() => {
    console.log('sync db success');
  }).catch(err => {
    console.log('sync db failed ' + err.message)
  });

  await syncLanguages(importDb);
  await syncTags(importDb);
  await syncDocumentGroups(importDb);
  await syncApis(importDb);
  await syncDocuments(importDb, tempInDir);
  await syncTagUnionApis(importDb);
  await syncTagUnionDocuments(importDb);

  var conn = await importDb.connectionManager.getConnection();
  conn.close();
  await Promise.delay(100);

  fse.emptyDirSync(getPathByCWD('tempdir'));
}

//同步languages
async function syncLanguages(importDb) {
  var sql = 'SELECT * FROM language';
  var xLanguages = await importDb.query(sql, {type:'SELECT'});
  if(!xLanguages || !xLanguages.length) return; 

  await Promise.map(xLanguages, syncLanguage.bind(null))
} 

async function syncLanguage(language) {
  if(!language || !language.id) {
    return Promise.reject(new Error('language is emtpy'));
  }

  var sql = `SELECT * FROM language WHERE id='${language.id}'`;
  var xLanguages = await db.query(sql, {type:'SELECT'});

  if(xLanguages && xLanguages.length) {
    var xLanguage = xLanguages[0];

    //如果导入数据的最后更新时间小于或等于当前数据的时间 则不更新
    if(language.updated_at <= xLanguage.updated_at) {
      return Promise.resolve('ok');
    }

    await Language.update(language, {where:{id: language.id}});
    return Promise.resolve('ok');
  }

  language.name = await getUniqeName(Language, language.name);
  await Language.create(language);
}

//同步document_group
async function syncDocumentGroups(importDb) {
  var sql = 'SELECT * FROM document_group';
  var xGroups = await importDb.query(sql, {type:'SELECT'});
  if(!xGroups || !xGroups.length) return; 

  await Promise.map(xGroups, syncDocumentGroup.bind(null))
} 

async function syncDocumentGroup(group) {
  if(!group || !group.id) {
    return Promise.reject(new Error('group is emtpy'));
  }

  var sql = `SELECT * FROM document_group WHERE id='${group.id}'`;
  var xGroups = await db.query(sql, {type:'SELECT'});

  if(xGroups && xGroups.length) {
    var xGroup = xGroups[0];

    //如果导入数据的最后更新时间小于或等于当前数据的时间 则不更新
    if(group.updated_at <= xGroup.updated_at) {
      return Promise.resolve('ok');
    }

    await DocumentGroup.update(group, {where:{id: group.id}});
    return Promise.resolve('ok');
  }

  group.name = await getUniqeName(DocumentGroup, group.name);
  await DocumentGroup.create(group);
}

//同步Tags
async function syncTags(importDb) {
  var sql = 'SELECT * FROM tag';
  var xTags = await importDb.query(sql, {type:'SELECT'});
  if(!xTags || !xTags.length) return; 

  await Promise.map(xTags, syncTag.bind(null))
} 

async function syncTag(tag) {
  if(!tag || !tag.id) {
    return Promise.reject(new Error('tag is emtpy'));
  }

  var sql = `SELECT * FROM tag WHERE id='${tag.id}'`;
  var xTags = await db.query(sql, {type:'SELECT'});

  if(xTags && xTags.length) {
    var xTag = xTags[0];

    //如果导入数据的最后更新时间小于或等于当前数据的时间 则不更新
    if(tag.updated_at <= xTag.updated_at) {
      return Promise.resolve('ok');
    }

    await Tag.update(tag, {where:{id: tag.id}});
    return Promise.resolve('ok');
  }

  tag.name = await getUniqeName(Tag, tag.name);
  await Tag.create(tag);
}

//同步Apis
async function syncApis(importDb) {
  var sql = 'SELECT * FROM api';
  var xApis = await importDb.query(sql, {type:'SELECT'});
  if(!xApis || !xApis.length) return; 

  await Promise.map(xApis, syncApi.bind(null))
} 

async function syncApi(api) {
  if(!api || !api.id) {
    return Promise.reject(new Error('api is emtpy'));
  }

  var sql = `SELECT * FROM api WHERE id='${api.id}'`;
  var xApis = await db.query(sql, {type:'SELECT'});

  if(xApis && xApis.length) {
    var xApi = xApis[0];

    //如果导入数据的最后更新时间小于或等于当前数据的时间 则不更新
    if(api.updated_at <= xApi.updated_at) {
      return Promise.resolve('ok');
    }

    await Api.update(api, {where:{id: api.id}});
    return Promise.resolve('ok');
  }

  api.name = await getUniqeName(Api, api.name);
  await Api.create(api);
}

async function getUniqeName(model, name) {
  var doc = await model.findOne({where:{name}, raw:true});
  if(!doc) return Promise.resolve(name);

  return getUniqeName(model, name + '_re');
}

//同步Documents
async function syncDocuments(importDb, tempInDir) {
  var sql = 'SELECT * FROM document';
  var xDocs = await importDb.query(sql, {type:'SELECT'});
  if(!xDocs || !xDocs.length) return;

  await Promise.map(xDocs, syncDocument.bind(null, tempInDir))
} 

async function syncDocument(tempInDir, doc) {
  if(!doc || !doc.id) {
    return Promise.reject(new Error('doc is emtpy'));
  }

  var sql = `SELECT * FROM document WHERE id='${doc.id}'`;
  var xDocs = await db.query(sql, {type:'SELECT'});

  if(xDocs && xDocs.length) {
    var xDoc = xDocs[0];

    //如果导入数据的最后更新时间小于或等于当前数据的时间 则不更新
    if(doc.updated_at <= xDoc.updated_at) {
      return Promise.resolve('ok');
    }
    
    await Document.update(doc, {where:{id: doc.id}});

    var currIcon = getPathByCWD('assets', xDoc.icon || '');

    if(xDoc.icon && fs.existsSync(currIcon)) {
      fse.removeSync(currIcon);
    }
    
    var iconUrl = path.join(tempInDir, 'assets', doc.icon || '');
    if(doc.icon && fs.existsSync(iconUrl)) {
      fse.copySync(iconUrl, getPathByCWD('assets', doc.icon));
    }

    return Promise.resolve('ok');
  }

  doc.name = await getUniqeName(Document, doc.name);
  await Document.create(doc);
  var iconUrl = path.join(tempInDir, 'assets', doc.icon);
  if(doc.icon && fs.existsSync(iconUrl)) {
    fse.copySync(iconUrl, getPathByCWD('assets', doc.icon));
  }
}

//同步tag_union_api
async function syncTagUnionApis(importDb) {
  var sql = 'SELECT * FROM tag_union_api';
  var xTuas = await importDb.query(sql, {type:'SELECT'});
  if(!xTuas || !xTuas.length) return; 

  await Promise.map(xTuas, syncTagUnionApi.bind(null))
} 

async function syncTagUnionApi(tua) {
  if(!tua || !tua.id) {
    return Promise.reject(new Error('tag_union_api is emtpy'));
  }

  var sql = `SELECT * FROM tag_union_api 
    WHERE tag_id='${tua.tag_id}' AND api_id='${tua.api_id}'
  `;

  var xTuas = await db.query(sql, {type:'SELECT'});

  //中间关系表不需要更新
  if(xTuas && xTuas.length) {
    // var xTua = xTuas[0];

    // //如果导入数据的最后更新时间小于或等于当前数据的时间 则不更新
    // if(tua.updated_at <= xTua.updated_at) {
    //   return Promise.resolve('ok');
    // }

    // await TagUnionApi.update(tua, {
    //   where:{
    //     tag_id: tua.tag_id, 
    //     api_id: tua.api_id
    //   }
    // });

    return Promise.resolve('ok');
  }

  await TagUnionApi.create(tua);
}

//同步tag_union_document
async function syncTagUnionDocuments(importDb) {
  var sql = 'SELECT * FROM tag_union_document';
  var xTuds = await importDb.query(sql, {type:'SELECT'});
  if(!xTuds || !xTuds.length) return; 

  await Promise.map(xTuds, syncTagUnionDocument.bind(null))
} 

async function syncTagUnionDocument(tud) {
  if(!tud || !tud.id) {
    return Promise.reject(new Error('tag_union_document is emtpy'));
  }

  var sql = `SELECT * FROM tag_union_document 
    WHERE tag_id='${tud.tag_id}' AND document_id='${tud.document_id}'
  `;

  var xTuds = await db.query(sql, {type:'SELECT'});

  //中间关系表不需要更新
  if(xTuds && xTuds.length) {
    // var xTud = xTuds[0];

    // //如果导入数据的最后更新时间小于或等于当前数据的时间 则不更新
    // if(tud.updated_at <= xTud.updated_at) {
    //   return Promise.resolve('ok');
    // }

    // await TagUnionDocument.update(tud, {
    //   where:{
    //     tag_id: tud.tag_id, 
    //     document_id: tud.document_id
    //   }
    // });

    return Promise.resolve('ok');
  }

  await TagUnionDocument.create(tud);
}


async function importData(src) {
  if(!src || src.length == 0) return;
  src = src[0];
  console.log('import data path', src)
  var tempInDir = getPathByCWD('tempdir', uuidv1()) ;
  await fse.ensureDir(tempInDir);

  zipper.sync.unzip(src).save(tempInDir);
  await fse.ensureDir(path.join(tempInDir, 'assets'));

  await handleImportData(tempInDir);
}

export {importData};
