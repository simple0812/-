import React from 'react';
import PropTypes from 'prop-types';
import fse from 'fs-extra';
import fs from 'fs';
import path from 'path';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { List, Form, Checkbox } from 'antd';
import Mustache from 'mustache';
import './less/async.less';
import { remote, ipcRenderer } from 'electron';

const CheckboxGroup = Checkbox.Group;

class ComponentList extends React.Component {
  static propTypes = {
  }

  static defaultProps = {

  }

  componentWillMount() {
  }

  getSubComponents(component) {
    return this.getFuncFiles(component);
  }

  handleTest = () => {
    console.log(remote.getGlobal('process'))
    ipcRenderer.send('test', {x:1})
  }

  getFuncFiles = (component) => {
    const xRoot = `./src/components/${component}`;
    const x = fs.readdirSync(path.resolve(xRoot));

    // 获取首字母大写的文件
    const t = x.filter(each => each[0] >= 'A' && each[0] <= 'Z' && fs.statSync(path.resolve(xRoot, each)).isFile());

    return t.map(each => each.replace(/\.jsx?$/ig, '')).filter(each => each !== component);
  }

  handleIgnoreChange = (currentComponent, allValues, checkedValue) => {
    const ignoreComs = fse.readJsonSync(path.resolve('./ignorecom.json'));
    const xIgnoreComs = _.without(allValues, ...checkedValue);

    if (xIgnoreComs && xIgnoreComs.length) {
      ignoreComs[currentComponent] = xIgnoreComs;
    } else {
      ignoreComs[currentComponent] = undefined;
    }

    const p = fse.readFileSync(path.resolve('./index.mustache'), 'utf-8');
    const xIndex = Mustache.render(p, { subComponents: checkedValue, component: currentComponent });
    fse.writeFileSync(path.resolve(`./src/components/${currentComponent}/index.js`), xIndex);
    fse.writeFileSync(path.resolve('./ignorecom.json'), JSON.stringify(ignoreComs, null, 2));
  }

  renderSubComponent(item) {
    const subComs = this.getSubComponents(item);
    const ignoreComs = fse.readJsonSync(path.resolve('./ignorecom.json'));

    const currIgnoreSubComs = ignoreComs[item] || [];

    const p = _.without(subComs, ...currIgnoreSubComs);

    return (
      <CheckboxGroup
        onChange={this.handleIgnoreChange.bind(this, item, subComs)}
        defaultValue={p}
        options={subComs} />
    );
  }

  render() {
    const xRoot = './src/components';
    const x = fs.readdirSync(path.resolve(xRoot));
    let components = [];

    if (x) {
      components = x.filter(each => each !== 'EditComponent' && each[0] >= 'A' && each[0] <= 'Z' && fs.statSync(path.resolve(xRoot, each)).isDirectory());
    }

    return (
      <div>
        <div className="left">
          <List
            bordered
            dataSource={components}
            renderItem={item => (
              <List.Item>
                <Link to={`/edit/${item}`}>
                  {item}
                </Link>
                {this.renderSubComponent(item)}
              </List.Item>
            )}
          />
        </div>
        <div className="right">
            <button onClick={this.handleTest}>test</button>
        </div>
      </div>
    );
  }
}

export default Form.create()(ComponentList);
