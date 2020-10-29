import React    from 'react';
import ReactDOM from 'react-dom';
import 'core-js/stable/url';
import 'core-js/stable/promise';
import 'core-js/stable/array/fill';
import 'core-js/stable/object/assign';
import 'isomorphic-fetch';
import './index.scss';
import App from './components/App';

function render(Component) {
  ReactDOM.render(
    <React.StrictMode>
      <App />
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
