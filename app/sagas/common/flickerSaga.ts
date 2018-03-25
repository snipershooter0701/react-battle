import { put } from 'redux-saga/effects'
import { getNextId, frame as f } from 'utils/common'
import Timing from 'utils/Timing'
import { FlickerRecord } from 'types'

const flickerShapeTiming = new Timing<FlickerShape>([
  { v: 3, t: f(3) },
  { v: 2, t: f(3) },
  { v: 1, t: f(3) },
  { v: 0, t: f(3) },
  { v: 1, t: f(3) },
  { v: 2, t: f(3) },
  { v: 3, t: f(3) },
  { v: 2, t: f(3) },
  { v: 1, t: f(3) },
  { v: 0, t: f(3) },
  { v: 1, t: f(3) },
  { v: 2, t: f(3) },
  { v: 3, t: f(1) },
])

export default function* flickerSaga(x: number, y: number, spawnSpeed: number) {
  const flickerId = getNextId('flicker')

  try {
    yield* flickerShapeTiming.accelerate(spawnSpeed).iter(function*(shape) {
      yield put<Action.AddOrUpdateFlickerAction>({
        type: 'ADD_OR_UPDATE_FLICKER',
        flicker: new FlickerRecord({ flickerId, x, y, shape }),
      })
    })
  } finally {
    yield put<Action.RemoveFlickerAction>({
      type: 'REMOVE_FLICKER',
      flickerId,
    })
  }
}
