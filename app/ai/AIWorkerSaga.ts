import AITankCtx from 'ai/AITankCtx'
import { getEnv } from 'ai/env-utils'
import { calculateFireEstimateMap, FireEstimate, getFireResist } from 'ai/fire-utils'
import followPath from 'ai/followPath'
import getAllSpots from 'ai/getAllSpots'
import { logAI } from 'ai/logger'
import { around, getTankSpot } from 'ai/spot-utils'
import Spot from 'ai/Spot'
import { findPath } from 'ai/shortest-path'
import simpleFireLoop from 'ai/simpleFireLoop'
import EventEmitter from 'events'
import { State } from 'reducers'
import { Task } from 'redux-saga'
import { call, fork, select, take } from 'redux-saga/effects'
import { nonPauseDelay } from 'sagas/common'
import directionController from 'sagas/directionController'
import fireController from 'sagas/fireController'
import { TankFireInfo, TankRecord } from 'types'
import { randint, waitFor } from 'utils/common'
import * as selectors from 'utils/selectors'

function getRandomPassablePos(posInfoArray: Spot[]) {
  while (true) {
    const t = randint(0, 26 ** 2)
    if (posInfoArray[t].canPass) {
      return t
    }
  }
}

function* wanderMode(ctx: AITankCtx) {
  DEV && logAI('enter wander-mode')
  const simpleFireLoopTask: Task = yield fork(simpleFireLoop, ctx)
  const tank: TankRecord = yield select(selectors.playerTank, ctx.playerName)
  DEV && console.assert(tank != null)
  const { map }: State = yield select()
  const allSpots = getAllSpots(map)
  const path = findPath(allSpots, getTankSpot(tank), getRandomPassablePos(allSpots))
  DEV && console.assert(path != null)
  yield call(followPath, ctx, path)
  simpleFireLoopTask.cancel()
}

function* attackEagleMode(ctx: AITankCtx) {
  DEV && logAI('enter attack-eagle-mode')
  const simpleFireLoopTask: Task = yield fork(simpleFireLoop, ctx)
  const { map }: State = yield select()
  const tank: TankRecord = yield select(selectors.playerTank, ctx.playerName)
  DEV && console.assert(tank != null)
  const eagleSpots = around(getTankSpot(map.eagle))
  const allSpots = getAllSpots(map)
  const estMap = calculateFireEstimateMap(eagleSpots, allSpots, map)
  const candidates = Array.from(estMap.keys()).filter(
    t => allSpots[t].canPass && getFireResist(estMap.get(t)) <= 8,
  )
  const target = candidates[randint(0, candidates.length)]
  const path = findPath(allSpots, getTankSpot(tank), target)
  DEV && console.assert(path != null)
  yield call(followPath, ctx, path)
  simpleFireLoopTask.cancel()
  yield call(attackEagle, ctx, estMap.get(target))
}

function* attackEagle(ctx: AITankCtx, fireEstimate: FireEstimate) {
  DEV && logAI('start attack eagle')
  const { map, tanks }: State = yield select()
  const tank: TankRecord = yield select(selectors.playerTank, ctx.playerName)
  DEV && console.assert(tank != null)
  const env = getEnv(map, tanks, tank)
  ctx.turn(env.tankPosition.eagle.getPrimaryDirection())
  yield take('TICK') // 等待一个 tick, 确保转向已经完成
  let fireCount = Math.min(2, fireEstimate.brickCount + 1)
  while (fireCount > 0) {
    const fireInfo: TankFireInfo = yield select(selectors.fireInfo, ctx.playerName)
    if (fireInfo.canFire) {
      ctx.fire()
      yield waitFor(ctx.noteEmitter, 'bullet-complete')
      fireCount--
    } else {
      yield nonPauseDelay(fireInfo.cooldown)
    }
  }
}

function* generateBulletCompleteNote(ctx: AITankCtx) {
  while (true) {
    const { bulletId }: Action.BeforeRemoveBulletAction = yield take('BEFORE_REMOVE_BULLET')
    const { bullets }: State = yield select()
    const bullet = bullets.get(bulletId)
    if (bullet.playerName === ctx.playerName) {
      ctx.noteEmitter.emit('bullet-complete', bullet)
    }
  }
}

/**
 * AIWorkerSaga对应一个正在游戏中的AI玩家.
 * 当一个AI玩家坦克创建/激活时, 一个AIWorkerSaga实例将被创建
 * 当AI玩家的坦克被击毁时, saga实例将停止运行
 * 一个AIWorkerSaga实例总是对应一个正在游戏中的AI玩家坦克
 *
 * 在创建AiWorkerSaga的过程中, 将创建worker对象,
 * 并将创建noteChannel和commandChannel
 * 游戏逻辑和AI逻辑使用这两个channel来进行数据交换
 */
export default function* AIWorkerSaga(playerName: string) {
  const ctx = new AITankCtx(playerName, new EventEmitter())

  yield fork(directionController, playerName, ctx.directionControllerCallback)
  yield fork(fireController, playerName, ctx.fireControllerCallback)
  yield fork(generateBulletCompleteNote, ctx)

  yield take(
    (action: Action) => action.type === 'ACTIVATE_PLAYER' && action.playerName === ctx.playerName,
  )
  // TODO dodge attack from player.
  let continuousWanderModeCount = 0
  while (true) {
    if (Math.random() < 0.7 - continuousWanderModeCount * 0.1) {
      continuousWanderModeCount++
      yield call(wanderMode, ctx)
    } else {
      continuousWanderModeCount = 0
      yield call(attackEagleMode, ctx)
    }
  }
}
