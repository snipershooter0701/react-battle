import { take, put, select } from 'redux-saga/effects'
import { calculateBulletStartPosition, getNextId } from 'utils/common'
import * as selectors from 'utils/selectors'
import { State, TankRecord } from 'types'

export default function* fireController(playerName: string, shouldFire: () => boolean) {
  // tank.cooldown用来记录player距离下一次可以发射子弹的时间
  // tank.cooldown大于0的时候玩家不能发射子弹
  // 每个TICK时, cooldown都会相应减少. 坦克发射子弹的时候, cooldown重置为坦克的发射间隔
  // tank.cooldown和tank.bulletLimit共同影响坦克能否发射子弹
  while (true) {
    const { delta }: Action.TickAction = yield take('TICK')
    const { bullets: allBullets }: State = yield select()
    const tank: TankRecord = yield select(selectors.playerTank, playerName)
    if (tank == null) {
      continue
    }
    let nextCooldown = tank.cooldown <= 0 ? 0 : tank.cooldown - delta

    if (tank.cooldown <= 0 && shouldFire()) {
      const bullets = allBullets.filter(bullet => (bullet.tankId === tank.tankId))
      if (bullets.count() < tank.bulletLimit) {
        const { x, y } = calculateBulletStartPosition(tank)
        yield put({
          type: 'ADD_BULLET',
          bulletId: getNextId('bullet'),
          direction: tank.direction,
          x,
          y,
          speed: tank.bulletSpeed,
          tankId: tank.tankId,
        })
        // 一旦发射子弹, 则重置cooldown计数器
        nextCooldown = tank.bulletInterval
      } // else 如果坦克发射的子弹已经到达上限, 则坦克不能继续发射子弹
    }

    if (tank.cooldown !== nextCooldown) {
      yield put<Action>({
        type: 'SET_COOLDOWN',
        tankId: tank.tankId,
        cooldown: nextCooldown,
      })
    }
  }
}
