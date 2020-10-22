import React from 'react';
import ReactDOM from 'react-dom';
import 'core-js/stable/url';
import 'core-js/stable/promise';
import 'core-js/stable/array/fill';
import 'core-js/stable/object/assign';
import 'isomorphic-fetch';
import './index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';

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
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    render(NextApp);
  });
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
