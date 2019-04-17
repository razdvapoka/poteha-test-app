import 'react-hot-loader'
import 'defaults.css'
import './index.css'

import React from 'react'
import ReactDOM from 'react-dom'

import App from './app'

// need this in dev mode only
// because webpack inline styles are applied with a small delay
// which makes it impossible to measure an element's height on its mounting
window.setTimeout(
  () => ReactDOM.render(<App />, document.getElementById('app')),
  0
)
