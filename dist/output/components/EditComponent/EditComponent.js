import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import fse from 'fs-extra';
import fs from 'fs';
import path from 'path';
import { Form, Input, Radio } from 'antd';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import './less/async.less';
import { resolveVariable } from '../../../utils/lessHelper';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

@connect(state => state)
class EditComponent extends React.Component {
  static propTypes = {
    form: PropTypes.object,
    match: PropTypes.object
  }

  static defaultProps = {

  }

  constructor(props) {
    super(props);
    const { match: { params: { com } = {} } = {} } = this.props;
    this.state = {
      component: com, // 组件名称
      subComponent: com // 当前预览的组件的子组件
    };
  }

  componentWillMount() {
  }

  getSubComponents = () => {
    const { component } = this.state;
    const xRoot = `./src/components/${component}`;
    const x = fs.readdirSync(path.resolve(xRoot));

    // 获取首字母大写的文件
    const t = x.filter(each => each[0] >= 'A' && each[0] <= 'Z' && fs.statSync(path.resolve(xRoot, each)).isFile());

    return t.map(each => each.replace(/\.jsx?$/ig, ''));
  }

  getIgnoreComponents = () => {
    const { component } = this.state;
    const ignoreComs = fse.readJsonSync(path.resolve('./ignorecom.json'));
    return ignoreComs[component] || [];
  }

  handleChange = (raw, val, prevValue) => {
    // const { form } = this.props;
    if (val === prevValue) {
      return val;
    }

    // const cssObj = {
    //   ...form.getFieldsValue(),
    //   ...{
    //     [raw.key]: val.replace(/@/ig, '') || 'nil' // 替换特殊字符@，当为空的时候使用nil补充 否则 less解析会报错
    //   }
    // };

    const xVal = val.replace(/@/ig, '') || 'nil';

    // const rawCss = _.keys(cssObj).map(item => `${item}: ${cssObj[item]};`).join('\r\n');
    const rawCss = fse.readFileSync(path.resolve(this.cssVarFile), 'utf-8');
    const retCss = rawCss.replace(new RegExp(`@${raw.key}\\s*:\\s*(\\w+);`, 'ig'), `@${raw.key}: ${xVal};`);
    fse.writeFileSync(path.resolve(this.cssVarFile), retCss);

    return val;
  }

  handleFuncChange = (evt) => {
    const { form } = this.props;
    this.setState({
      subComponent: evt.target.value
    }, () => {
      form.resetFields();
    });
  }

  preview = () => {
    const { component, subComponent } = this.state;
    // 动态加载
    let com = null;
    try {
      com = require(`../${component}/doc/${subComponent}.prev`); // eslint-disable-line
    } catch (e) {
      com = require(`../${component}/${subComponent}`); // eslint-disable-line
    }

    return React.createElement(com.default);
  }

  get cssVarFile() {
    const { component, subComponent } = this.state;
    return path.resolve(`./src/components/${component}/less/${subComponent.toLocaleLowerCase()}.var.less`);
  }

  render() {
    const { subComponent } = this.state;
    const cssVar = resolveVariable(this.cssVarFile);

    const funcFiles = _.without(this.getSubComponents(), ...this.getIgnoreComponents());
    const { form: { getFieldDecorator } } = this.props;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

    return (
      <div>
        <Link to="/" style={{ padding: 10 }}>
          返回
        </Link>
        <div className="left">
          <h1>预览</h1>
          {this.preview()}
        </div>
        <div className="right">
          <div>
            <RadioGroup
              value={subComponent}
              options={funcFiles}
              onChange={this.handleFuncChange} />
          </div>
          {
            _.keys(cssVar).map(item => (
              <span key={item}>
                <span>{item}</span>
                <Form onSubmit={this.handleSubmit}>
                  {
                    cssVar[item].map(each => (
                      <FormItem
                        key={each.key}
                        label={each.key}
                        {...formItemLayout}>
                        {getFieldDecorator(each.key, {
                          initialValue: each.val || '',
                          normalize: this.handleChange.bind(this, each)
                        })(<Input />)}
                      </FormItem>
                    ))
                  }
                </Form>
              </span>
            ))
          }
          
        </div>

      </div>
    );
  }
}

export default Form.create()(EditComponent);
