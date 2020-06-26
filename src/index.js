import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import App from './App';
import Store from './App/store';
import './index.css';

const store = new Store();

store.init().then (() => {
  ReactDOM.render(
    <Provider {...store}>
      <App />
    </Provider>,
    document.getElementById('root'),
  );
})

