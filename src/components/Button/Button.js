import React from 'react';
import PropTypes from 'prop-types';
import './less/button.less';

class Button extends React.Component {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.string])
  }

  static defaultProps = {
  }


  componentWillMount() {
  }

  render() {
    const { children } = this.props;
    return (
      <button className="anole-button" type="button">
        { children }
      </button>
    );
  }
}

export default Button;
