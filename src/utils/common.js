import React from 'react';
import { Select } from 'antd';
import configs from '../configs';
const Option = Select.Option;

//权限控制
function hasPermission(opt) {
  return configs.permission > 0;
}

function cutWord (len, text, record, index) {
  text = text || '';
  return <span title={text}>
      {text.length > len ? text.slice(0,len) + '...' : text}
    </span>
}

function convertEnum (enumObj, text, record, index) {
  text = text;
  if(enumObj && enumObj[text + '']) {
    text = enumObj[text + '']
  }
 
  return <span title={text}>
      {text}
  </span>
}

function enumRenderWithSelect(enumObj) {
  var xopts = [];

  if(!enumObj) return;

  for(var key in enumObj) {
    xopts.push(
      <Option key={key} title={enumObj[key]} value={key}>{enumObj[key]}</Option>
    )
  }

  return xopts;
}

//select的数据源是一个字符串数据
function arrayRenderWithSelect(arr) {
  var xopts = [];

  if(!arr) return;

  return arr.map(each => {
    return <Option key={each} title={each} value={key}>{each}</Option>
  })
}

function getName(api, parent) {
  parent = parent || {};
  if(api.object_type === 0) return `${api.name}`;
  if (api.object_type === 1) return `${api.name}()`;
  if (api.object_type === 2) {
    if(parent.group_type !=='class' && api.class_name) {
      return `${api.class_name}.${api.name}()`
    }

    return `${parent.name}.${api.name}()`;
  }
  if (api.object_type === 4) {
    if(parent.group_type !=='class' && api.class_name) {
      return `${api.class_name}.${api.name}`;
    }

    return `${parent.name}.${api.name}`;
  }
  if (api.object_type === 5) return `${api.name}{}`;
  return api.name;
}

function sortApis(data, isFilterApi) {
  data.map(each => {
    each.typeSort = each.type == 'group' ? 0 :1;
    return each;
  })
  var p = data.filter(each => each.parent_id == 0);
  p = _.sortBy(p, ['typeSort', 'sort']);
  var retData = [...p];
  p.forEach(each => {
    each.lv = 0;
    sortApisRecursion(each, data, retData, 1);
  });
  if(isFilterApi) {
    retData = retData.filter(each => each.type === 'api');
  }
  return retData
}

function sortApisRecursion (parent, rawData, retData, lv) {
  lv = lv || 0;
  var p = rawData.filter(each => each.parent_id == parent.id);
  if(!p || !p.length) {
    return;
  };
  p = _.sortBy(p, ['typeSort', 'sort']);

  var index = _.indexOf(retData, parent);
  p.map(each => {
    each.lv = lv;
    return each;
  })

  retData.splice(index + 1, 0, ...p);
  p.forEach(each => {
    sortApisRecursion(each, rawData, retData, lv + 1);
  })
}


export {
  cutWord,
  convertEnum,
  enumRenderWithSelect,
  arrayRenderWithSelect,
  getName,
  hasPermission,
  sortApis,
}