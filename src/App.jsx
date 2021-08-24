import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

const App = () => {
    return <h1>Hello World</h1>;
};

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('app')
);
