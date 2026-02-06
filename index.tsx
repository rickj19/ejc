
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const mountNode = () => {
  let rootElement = document.getElementById('root');
  if (!rootElement) {
    rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);
  }
  return rootElement;
};

const root = ReactDOM.createRoot(mountNode());
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
