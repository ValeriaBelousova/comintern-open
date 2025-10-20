// src/store/matchSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SetResult = { a: number; b: number; tbA?: number; tbB?: number; tiebreak?: boolean };

type MatchState = {
  inProgress: boolean;
  teamA: string[];
  teamB: string[];
  gamesA: number;     // текущий счёт геймов в активном сете
  gamesB: number;
  sets: SetResult[];  // завершённые сеты
  tiebreakActive: boolean;
  tbA: number;        // очки тай-брейка A (если активен)
  tbB: number;        // очки тай-брейка B
};

const initialState: MatchState = {
  inProgress: false,
  teamA: [],
  teamB: [],
  gamesA: 0,
  gamesB: 0,
  sets: [],
  tiebreakActive: false,
  tbA: 0,
  tbB: 0,
};

function setOverNoTB(a: number, b: number) {
  // Сет без TB окончен, если кто-то набрал ≥6 и имеет разницу ≥2
  return (a >= 6 || b >= 6) && Math.abs(a - b) >= 2;
}

function tiebreakWon(a: number, b: number) {
  // TB до 7, разница ≥2 (7–0..∞), может продолжаться 8–6, 9–7 и т.д.
  return (a >= 7 || b >= 7) && Math.abs(a - b) >= 2;
}

const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    startMatch(
      state,
      action: PayloadAction<{ teamA: string[]; teamB: string[] }>
    ) {
      state.inProgress = true;
      state.teamA = action.payload.teamA;
      state.teamB = action.payload.teamB;
      state.gamesA = 0;
      state.gamesB = 0;
      state.sets = [];
      state.tiebreakActive = false;
      state.tbA = 0;
      state.tbB = 0;
    },

    endMatch(state) {
      Object.assign(state, initialState);
    },

    // +1 ГЕЙМ одной из команд (работает только когда НЕ идёт тай-брейк)
    gameTo(state, action: PayloadAction<'A' | 'B'>) {
      if (!state.inProgress || state.tiebreakActive) return;

      if (action.payload === 'A') state.gamesA += 1;
      else state.gamesB += 1;

      // Проверяем завершение сета без TB
      if (setOverNoTB(state.gamesA, state.gamesB)) {
        state.sets.push({ a: state.gamesA, b: state.gamesB });
        state.gamesA = 0;
        state.gamesB = 0;
        return;
      }

      // Переход в тай-брейк при 6–6
      if (state.gamesA === 6 && state.gamesB === 6) {
        state.tiebreakActive = true;
        state.tbA = 0;
        state.tbB = 0;
      }
    },

    // +1 ОЧКО тай-брейка (работает только когда TB активен)
    pointTB(state, action: PayloadAction<'A' | 'B'>) {
      if (!state.inProgress || !state.tiebreakActive) return;

      if (action.payload === 'A') state.tbA += 1;
      else state.tbB += 1;

      if (tiebreakWon(state.tbA, state.tbB)) {
        // Победитель TB получает сет 7–6
        if (state.tbA > state.tbB) {
          state.sets.push({ a: 7, b: 6, tbA: state.tbA, tbB: state.tbB, tiebreak: true });
        } else {
          state.sets.push({ a: 6, b: 7, tbA: state.tbA, tbB: state.tbB, tiebreak: true });
        }
        // Сброс к новому сету
        state.gamesA = 0;
        state.gamesB = 0;
        state.tiebreakActive = false;
        state.tbA = 0;
        state.tbB = 0;
      }
    },

    // Минус гейм (для исправления ошибок), не работает в TB
    undoGame(state, action: PayloadAction<'A' | 'B'>) {
      if (!state.inProgress || state.tiebreakActive) return;
      if (action.payload === 'A') state.gamesA = Math.max(0, state.gamesA - 1);
      else state.gamesB = Math.max(0, state.gamesB - 1);
    },

    // Минус очко TB (опционально, удобно для исправления)
    undoPointTB(state, action: PayloadAction<'A' | 'B'>) {
      if (!state.inProgress || !state.tiebreakActive) return;
      if (action.payload === 'A') state.tbA = Math.max(0, state.tbA - 1);
      else state.tbB = Math.max(0, state.tbB - 1);
    },

    resetCurrentSet(state) {
        if (!state.inProgress) return;
        state.gamesA = 0;
        state.gamesB = 0;
        state.tiebreakActive = false;
        state.tbA = 0;
        state.tbB = 0;
        },
  },
});

export const {
  startMatch, endMatch,
  gameTo, undoGame,
  pointTB, undoPointTB,
  resetCurrentSet
} = matchSlice.actions;

export default matchSlice.reducer;
