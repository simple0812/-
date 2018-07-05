import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button';
import Group from '../Group';

class Demo extends React.Component {

  static propTypes = {
  }

  static defaultProps = {
  }


  componentWillMount() {
  }

  render() {
    return (
      <Group>
        <Button>xx</Button>
        <Button>yy</Button>
      </Group>
    );
  }
}

export default Demo;
