import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import './assets/css/custom.css';
// import './assets/css/bootstrap.min.css';
import 'remixicon/fonts/remixicon.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
