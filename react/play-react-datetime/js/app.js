import Datetime from 'react-datetime';
import React from 'react';
import ReactDom from 'react-dom';
import domready from 'detect-dom-ready';

require('react-datetime/css/react-datetime.css');

domready(() => {
    ReactDom.render(<Datetime/>, document.getElementById('playground'));
});

