import 'react-hot-loader'
import 'defaults.css'
import './index.css'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'

const Root = () => (
  <Router>
    <Route path='/:page?' component={App} />
  </Router>
)

// need this hack in dev mode only
// because webpack-inlined styles are applied with a small delay
// which makes it impossible to measure an element's relative height on its mounting
window.setTimeout(
  () => ReactDOM.render(<Root />, document.getElementById('app')),
  0
)
