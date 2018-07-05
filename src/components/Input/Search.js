import React from 'react';
import PropTypes from 'prop-types';
import './less/search.less';

class Search extends React.Component {
  static propTypes = {
  }

  static defaultProps = {
  }


  componentWillMount() {
  }

  render() {
    return (
      <span>
        <input />
        <button type="button">
          search
        </button>
      </span>
    );
  }
}

export default Search;
