import React from 'react'
import { connect } from 'react-redux'
import { replace } from 'react-router-redux'
import { Dispatch } from 'redux'
import { State } from '../reducers'
import { GameRecord } from '../reducers/game'
import { BLOCK_SIZE as B, ITEM_SIZE_MAP } from '../utils/constants'
import BrickWall from './BrickWall'
import Screen from './Screen'
import Text from './Text'
import TextButton from './TextButton'

export class GameoverSceneContent extends React.PureComponent<{ onRestart?: () => void }> {
  render() {
    const size = ITEM_SIZE_MAP.BRICK
    const scale = 4
    return (
      <g className="gameover-scene">
        <defs>
          <pattern
            id="pattern-brickwall"
            width={(size * 2) / scale}
            height={(size * 2) / scale}
            patternUnits="userSpaceOnUse"
          >
            <g transform={`scale(${1 / scale})`}>
              <BrickWall x={0} y={0} />
              <BrickWall x={0} y={size} />
              <BrickWall x={size} y={0} />
              <BrickWall x={size} y={size} />
            </g>
          </pattern>
        </defs>
        <rect fill="#000000" x={0} y={0} width={16 * B} height={15 * B} />
        <g transform={`scale(${scale})`}>
          <Text
            content="game"
            x={(4 * B) / scale}
            y={(4 * B) / scale}
            fill="url(#pattern-brickwall)"
          />
          <Text
            content="over"
            x={(4 * B) / scale}
            y={(7 * B) / scale}
            fill="url(#pattern-brickwall)"
          />
        </g>
        <g transform={`translate(${5.75 * B}, ${13 * B}) scale(0.5)`}>
          <TextButton
            content="press R to restart"
            x={0}
            y={0}
            textFill="#9ed046"
            onClick={this.props.onRestart}
          />
        </g>
      </g>
    )
  }
}

// TODO 需要考虑 multi-players 的情况
class GameoverScene extends React.PureComponent<{ dispatch: Dispatch; game: GameRecord }> {
  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown)
    const { game, dispatch } = this.props
    if (game.status === 'idle') {
      dispatch(replace('/'))
    }
    // 这里不考虑这种情况：玩家在游戏过程中手动在地址栏中输入了 /gameover
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown)
  }

  onKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'KeyR') {
      this.onRestart()
    }
  }

  onRestart = () => {
    const { game, dispatch } = this.props
    if (game.lastStageName) {
      dispatch(replace(`/choose/${game.lastStageName}`))
    } else {
      dispatch(replace(`/choose`))
    }
  }

  render() {
    return (
      <Screen>
        <GameoverSceneContent onRestart={this.onRestart} />
      </Screen>
    )
  }
}

export default connect((state: State) => ({ game: state.game }))(GameoverScene)
