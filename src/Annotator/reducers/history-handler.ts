// @flow

import { Action, MainLayoutState } from "../../MainLayout/types";
import Immutable, { ImmutableObject } from "seamless-immutable";
import moment from "moment";

const typesToSaveWithHistory = {
  BEGIN_BOX_TRANSFORM: "Transform/Move Box",
  BEGIN_MOVE_POINT: "Move Point",
  DELETE_REGION: "Delete Region",
};

export const saveToHistory = (
  state: ImmutableObject<MainLayoutState>,
  name: string
) =>
  Immutable(state).updateIn(["history"], (h) => {
    const newValue = {
      time: moment().toDate(),
      state: Immutable(state).without("history"),
      name,
    };
    const prevItems = (h || []).slice(0, 9);

    return [newValue, ...prevItems];
  });

export default (reducer) => {
  return (state: MainLayoutState, action: Action) => {
    const prevState = state;
    const nextState = reducer(state, action);

    if (action.type === "RESTORE_HISTORY") {
      if (state.history.length > 0) {
        return Immutable(nextState.history[0].state).setIn(
          ["history"],
          nextState.history.slice(1)
        );
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
              name: typesToSaveWithHistory[action.type] || action.type,
            },
          ]
            .concat(nextState.history || [])
            .slice(0, 9)
        );
      }
    }

    return nextState;
  };
};
