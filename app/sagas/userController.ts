import { take, fork, select, SelectEffect } from 'redux-saga/effects'
import * as selectors from 'utils/selectors'
import * as _ from 'lodash'
import directionController from 'sagas/directionController'
import fireController from 'sagas/fireController'
import { UserControllerConfig, TankRecord } from 'types'
const Mousetrap = require('mousetrap')

// 一个userController实例对应一个人类玩家(用户)的控制器(键盘或是手柄).
// 参数playerName用来指定人类玩家的玩家名称, config为该玩家的操作配置.
// userController启动后, 会监听ACTIVATE_PLAYER action.
// 如果action与参数playerName相对应, 则该userController将启动
// fireController与directionController, 从而控制人类玩家的坦克
export default function* userController(playerName: string, config: UserControllerConfig) {
  let firePressing = false // 用来记录当前玩家是否按下了fire键
  let firePressed = false // 用来记录上一个tick内 玩家是否按下过fire键
  Mousetrap.bind(config.fire, () => {
    firePressing = true
    firePressed = true
  }, 'keydown')
  Mousetrap.bind(config.fire, () => (firePressing = false), 'keyup')

  // 每次tick时, 都将firePressed重置
  yield fork(function* handleTick() {
    while (true) {
      yield take('TICK')
      firePressed = false
    }
  })

  // 用来记录上一个tick内, 玩家按下过的方向键
  const pressed: Direction[] = []

  // 调用该函数用来获取当前人类玩家的移动操作(控制器级别)
  function getDirectionControlInfo() {
    if (pressed.length > 0) {
      return { direction: _.last(pressed) }
    } else {
      return { direction: null }
    }
  }

  // 调用该函数用来获取当前玩家的开火操作
  function shouldFire() {
    return firePressing || firePressed
  }

  function bindKeyWithDirection(key: string, direction: Direction) {
    Mousetrap.bind(key, () => {
      if (pressed.indexOf(direction) === -1) {
        pressed.push(direction)
      }
    }, 'keydown')
    Mousetrap.bind(key, () => {
      _.pull(pressed, direction)
    }, 'keyup')
  }

  bindKeyWithDirection(config.up, 'up')
  bindKeyWithDirection(config.left, 'left')
  bindKeyWithDirection(config.down, 'down')
  bindKeyWithDirection(config.right, 'right')

  // 调用该函数来获取当前用户的移动操作(坦克级别)
  function* getUserPlayerInput() {
    const tank: TankRecord = yield select(selectors.playerTank, playerName)
    if (tank != null) {
      const { direction } = getDirectionControlInfo()
      if (direction != null) {
        if (direction !== tank.direction) {
          return { type: 'turn', direction }
        } else {
          return { type: 'forward' }
        }
      }
    }
    return null
  }

  while (true) {
    const action: Action.ActivatePlayerAction = yield take('ACTIVATE_PLAYER')
    if (action.playerName === playerName) {
      yield [
        directionController(playerName, getUserPlayerInput),
        fireController(playerName, shouldFire),
      ]
    }
    // todo 玩家tank炸了
  }
}
