/// <reference path="../custom-tyings.d.ts" />
// 使用 core-js 作为一些高版本 ES 的函数的 polyfill
import 'core-js/fn/array/includes'
import 'core-js/fn/object/entries'
import 'core-js/fn/string/pad-end'
import 'core-js/fn/string/pad-start'
import 'normalize.css'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './App'
import './battle-city.css'
import store from './utils/store'

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('container'),
)
