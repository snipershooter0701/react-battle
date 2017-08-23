import { List } from 'immutable'
import { asBox, isInField, iterRowsAndCols, testCollide } from 'utils/common'
import { BLOCK_SIZE, ITEM_SIZE_MAP, N_MAP } from 'utils/constants'
import * as selectors from 'utils/selectors'
import { TankRecord, State, EagleRecord, TanksMap } from 'types'

function isTankCollidedWithEagle(eagle: EagleRecord, tankTarget: Box, threshhold: number) {
  const eagleBox = {
    x: eagle.x,
    y: eagle.y,
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
  }
  return testCollide(eagleBox, tankTarget, threshhold)
}

function isTankCollidedWithBricks(bricks: List<boolean>, tankTarget: Box, threshhold: number) {
  const itemSize = ITEM_SIZE_MAP.BRICK
  for (const [row, col] of iterRowsAndCols(itemSize, tankTarget)) {
    const t = row * N_MAP.BRICK + col
    if (bricks.get(t)) {
      const subject = {
        x: col * itemSize,
        y: row * itemSize,
        width: itemSize,
        height: itemSize,
      }
      // 因为要考虑threshhold, 所以仍然要调用testCollide来判断是否相撞
      if (testCollide(subject, tankTarget, threshhold)) {
        return true
      }
    }
  }
  return false
}

function isTankCollidedWithSteels(steels: List<boolean>, tankTarget: Box, threshhold: number) {
  const itemSize = ITEM_SIZE_MAP.STEEL
  for (const [row, col] of iterRowsAndCols(itemSize, tankTarget)) {
    const t = row * N_MAP.STEEL + col
    if (steels.get(t)) {
      const subject = {
        x: col * itemSize,
        y: row * itemSize,
        width: itemSize,
        height: itemSize,
      }
      // 因为要考虑threshhold, 所以仍然要调用testCollide来判断是否相撞
      if (testCollide(subject, tankTarget, threshhold)) {
        return true
      }
    }
  }
  return false
}

function isTankCollidedWithRivers(rivers: List<boolean>, tankTarget: Box, threshhold: number) {
  const itemSize = ITEM_SIZE_MAP.RIVER
  for (const [row, col] of iterRowsAndCols(itemSize, tankTarget)) {
    const t = row * N_MAP.RIVER + col
    if (rivers.get(t)) {
      const subject = {
        x: col * itemSize,
        y: row * itemSize,
        width: itemSize,
        height: itemSize,
      }
      // 因为要考虑threshhold, 所以仍然要调用testCollide来判断是否相撞
      if (testCollide(subject, tankTarget, threshhold)) {
        return true
      }
    }
  }
  return false
}

function isTankCollidedWithOtherTanks(activeTanks: TanksMap, tank: TankRecord, tankTarget: Box, threshhold: number) {
  // 判断坦克与其他坦克是否相撞
  for (const otherTank of activeTanks.values()) {
    if (tank.tankId === otherTank.tankId) {
      continue
    }
    const subject = asBox(otherTank)
    if (testCollide(subject, tankTarget, threshhold)) {
      return true
    }
  }
  return false
}

export default function canTankMove({ tanks, map: { bricks, steels, rivers, eagle } }: State, tank: TankRecord, threshhold = -0.01) {
  const tankBox = asBox(tank)

  // 判断是否位于战场内
  if (!isInField(tankBox)) {
    return false
  }

  // 判断是否与地形相碰撞
  if (isTankCollidedWithEagle(eagle, tankBox, threshhold)) {
    return false
  }
  if (isTankCollidedWithBricks(bricks, tankBox, threshhold)) {
    return false
  }
  if (isTankCollidedWithSteels(steels, tankBox, threshhold)) {
    return false
  }
  if (isTankCollidedWithRivers(rivers, tankBox, threshhold)) {
    return false
  }

  // 判断是否与其他坦克相碰撞
  const activeTanks = tanks.filter(t => t.active)
  if (isTankCollidedWithOtherTanks(activeTanks, tank, tankBox, threshhold)) {
    return false
  }

  // 与其他物品都没有相撞, 则表示可以进行移动
  return true
}
