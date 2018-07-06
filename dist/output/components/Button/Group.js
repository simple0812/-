import React from 'react';
import PropTypes from 'prop-types';
import './less/group.less';

class Group extends React.Component {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.array])
  }

  static defaultProps = {
  }

  componentWillMount() {
  }

  render() {
    const { children } = this.props;

    return (
      <span className="btn-group">
        { children }
      </span>
    );
  }
}

export default Group;
