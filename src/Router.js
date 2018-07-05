import React from 'react';
import PropTypes from 'prop-types';
import {
  Switch,
  Route,
  routerRedux,
} from 'dva/router';
import dynamic from 'dva/dynamic';


const { ConnectedRouter } = routerRedux;

const RouterWrapper = ({ history, app }) => {
  const EditComponent = dynamic({
    app,
    component: () => import('./components/EditComponent'),
  });

  const ComponentList = dynamic({
    app,
    component: () => import('./components/EditComponent/ComponentList'),
  });

  const PageForbidden = dynamic({
    app,
    component: () => import('./components/PageForbidden'),
  });

  const PageServerError = dynamic({
    app,
    component: () => import('./components/PageServerError'),
  });

  const PageNetworkError = dynamic({
    app,
    component: () => import('./components/PageNetworkError'),
  });

  const PageNotFound = dynamic({
    app,
    component: () => import('./components/PageNotFound'),
  });


  return (
    <ConnectedRouter history={history}>
      <Switch>
        <Route exact path="/" component={ComponentList} />
        <Route exact path="/edit/:com" component={EditComponent} />
        {/* 403 */}
        <Route exact path="/403" component={PageForbidden} />
        {/* 500 */}
        <Route exact path="/500" component={PageServerError} />
        {/* 网络错误 */}
        <Route exact path="/error" component={PageNetworkError} />
        {/* 404 */}
        <Route component={PageNotFound} />
      </Switch>
    </ConnectedRouter>
  );
};

RouterWrapper.propTypes = {
  history: PropTypes.object,
  app: PropTypes.object,
};

RouterWrapper.defaultProps = {};

export default RouterWrapper;
