import React from 'react'
import { render } from 'react-dom'

console.log(`🤖 Version: ${process.env.VERSION}`)
const mount = document.getElementById('root')

render(() => <div>Webpack issue app</div>, mount)
