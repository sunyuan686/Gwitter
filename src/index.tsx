import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AuthWindow from './AuthWindow';
import './i18n';
import { parseUrl } from './utils';

const urlParams = parseUrl();

let component = App;
if (urlParams.code) {
  component = AuthWindow;
}

const root = ReactDOM.createRoot(document.getElementById('gwitter')!);

root.render(<>{React.createElement(component)}</>);
