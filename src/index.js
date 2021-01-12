import React    from 'react';
import ReactDOM from 'react-dom';

import './polyfill';
import './index.scss';

import App from './components/App';

function render(Component) {
  ReactDOM.render(
    <React.StrictMode>
      <Component/>
    </React.StrictMode>,
    document.getElementById('root')
  );
}

render(App);

if (module.hot) {
  module.hot.accept('./components/App', () => {
    const NextApp = require('./components/App').default;
    render(NextApp);
  });
}
