// @flow

import { Action, MainLayoutState, MainLayoutStateBase } from "../../MainLayout/types"
import Immutable from "seamless-immutable"
import moment from "moment"

const typesToSaveWithHistory = {
  BEGIN_BOX_TRANSFORM: "Transform/Move Box",
  BEGIN_MOVE_POINT: "Move Point",
  DELETE_REGION: "Delete Region"
}

export const saveToHistory = (state: MainLayoutState, name: string) =>
  Immutable<MainLayoutStateBase>(state).updateIn(
    ["history"],
    (h) => [
      {
        time: moment().toDate(),
        state: Immutable<MainLayoutStateBase>(state).without("history"),
        name
      }
    ].concat((h || []).slice(0, 9))
  )

export default (reducer) => {
  return (state: MainLayoutState, action: Action) => {
    const prevState = state
    const nextState = reducer(state, action)

    if (action.type === "RESTORE_HISTORY") {
      if (state.history.length > 0) {
        return Immutable(nextState.history[0].state).setIn(
          ["history"],
          nextState.history.slice(1)
        )
      }
    } else {
      if (
        prevState !== nextState &&
        Object.keys(typesToSaveWithHistory).includes(action.type)
      ) {
        return Immutable(nextState).setIn(
          ["history"],
          [
            {
              time: moment().toDate(),
              state: Immutable(prevState).without("history"),
              name: typesToSaveWithHistory[action.type] || action.type
            }
          ]
            .concat(nextState.history || [])
            .slice(0, 9)
        )
      }
    }

    return nextState
  }
}
