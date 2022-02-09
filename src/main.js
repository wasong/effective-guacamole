import React from 'react'
import { render } from 'react-dom'

import App from './App'

console.log(`🤖 Version: ${process.env.VERSION}`)
const mount = document.getElementById('root')

render(() => <div>Webpack issue app</div>, mount)
