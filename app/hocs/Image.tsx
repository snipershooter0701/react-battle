import React from 'react'
import PropTypes from 'prop-types'
import { renderToString } from 'react-dom/server'
const withContext = require('recompose/withContext').default

const cache = new Map<string, string>()

class SimpleWrapper extends React.Component {
  render() {
    return <g>{this.props.children}</g>
  }
}

export interface ImageProps {
  disabled?: boolean
  imageKey: string
  transform: string
  width: string | number
  height: string | number
  children?: React.ReactNode
  className?: string
}

export default class Image extends React.PureComponent<ImageProps> {
  static contextTypes = {
    store: PropTypes.any,
    underImageComponent: PropTypes.bool,
  }

  render() {
    const { store, underImageComponent } = this.context
    const { disabled = false, imageKey, width, height, transform, children, ...other } = this.props

    if (disabled || underImageComponent) {
      // underImageComponent 不能嵌套，如果已经在一个 ImageComponent 下的话，那么只能使用原始的render方法
      return (
        <g transform={transform} {...other}>
          {children}
        </g>
      )
    } else {
      if (!cache.has(imageKey)) {
        const open = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`
        const enhancer = withContext(
          { underImageComponent: PropTypes.bool, store: PropTypes.any },
          () => ({
            underImageComponent: true,
            store,
          }),
        )
        const element = React.createElement(enhancer(SimpleWrapper), null, children)
        const string = renderToString(element)
        const close = '</svg>'
        const markup = open + string + close
        const blob = new Blob([markup], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        cache.set(imageKey, url)
      }
      return <image transform={transform} href={cache.get(imageKey)} />
    }
  }
}