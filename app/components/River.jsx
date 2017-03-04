import React from 'react'
import { Pixel } from 'components/elements'

const coordinates = [[
  [5, 0], [0, 2], [1, 3], [4, 3],
  [3, 4], [5, 4], [1, 6], [2, 7], [6, 7],
], [
  [7, 0], [1, 1], [2, 2], [3, 3], [6, 3],
  [7, 4], [3, 5], [2, 6], [4, 6], [0, 7],
]]

const riverPart = (shape, dx, dy) => (
  <g transform={`translate(${dx},${dy})`}>
    <rect width={8} height={8} fill="#4242FF" />
    {coordinates[shape % 2].map(([x, y], i) =>
      <Pixel key={i} x={x} y={y} fill="#B5EFEF" />
    )}
  </g>
)

export default class River extends React.PureComponent {
  static propTypes = {
    x: React.PropTypes.number.isRequired,
    y: React.PropTypes.number.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      shape: 0,
    }
    this.handle = null
  }

  componentDidMount() {
    this.handle = setInterval(() => {
      this.setState({ shape: this.state.shape + 1 })
    }, 600)
  }

  componentWillUnmount() {
    clearInterval(this.handle)
  }

  render() {
    const { x, y } = this.props
    const { shape } = this.state
    return (
      <g transform={`translate(${x},${y})`}>
        {riverPart(shape, 0, 0)}
        {riverPart(shape, 8, 0)}
        {riverPart(shape, 8, 8)}
        {riverPart(shape, 0, 8)}
      </g>
    )
  }
}
