import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import App from './App';
import Store from './App/store';
import { AnalyticsProvider } from './App/components/Analytics';
import './index.css';

const store = new Store();

store.init().then (() => {
  ReactDOM.render(
    <Provider {...store}>
      <AnalyticsProvider settings={store.settings}>
        <App />
      </AnalyticsProvider>
    </Provider>,
    document.getElementById('root'),
  );
})

