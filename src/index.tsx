import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import './assets/css/custom.css';
// import './assets/css/bootstrap.min.css';
import 'remixicon/fonts/remixicon.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
