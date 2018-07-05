var path = require('path');
var Sequelize = require('sequelize');
var config = require('../config');
import { Document, Api, db, Language, Tag, TagUnionApi, TagUnionDocument } from '../models'


function getPathByCWD() {
  return path.join(process.cwd(), ...arguments)
}

function connectDb(pathName) {
  return new Sequelize(config.database, config.user, config.password, {
    host: config.host,
    dialect: 'sqlite',
    logging: process.env.NODE_ENV === 'development' ,
    pool: {
      max: 50,
      min: 0
    },
    storage: pathName,
  });
}

export {getPathByCWD, connectDb};