import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import { create } from 'mobx-persist';
import App from './App';
import { Store } from './App/store';
import './index.css';

const store = new Store();
const hydrate = create()

hydrate('bk', store).then (() => {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root'),
  );
})

