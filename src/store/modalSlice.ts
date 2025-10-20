import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Team = string[]; // до 2 игроков
type EditingTeam = 'A' | 'B' | null;

type ModalState = {
  show: boolean;
  teamA: Team;
  teamB: Team;
  editingTeam: EditingTeam; // какую команду редактируем в модалке
};

const initialState: ModalState = {
  show: false,
  teamA: [],
  teamB: [],
  editingTeam: null,
};

const MAX_PER_TEAM = 2;

const modalSlice = createSlice({
  name: 'playerModal',
  initialState,
  reducers: {
    openForTeam(state, action: PayloadAction<EditingTeam>) {
      state.show = true;
      state.editingTeam = action.payload;
    },
    close(state) {
      state.show = false;
      state.editingTeam = null;
    },
    addPlayerToEditing(state, action: PayloadAction<string>) {
      const name = action.payload;
      const target = state.editingTeam === 'A' ? state.teamA : state.teamB;
      const other  = state.editingTeam === 'A' ? state.teamB : state.teamA;

      if (!state.editingTeam) return;
      if (other.includes(name)) return;               // запрет: игрок уже в другой команде
      if (target.includes(name)) return;              // уже добавлен
      if (target.length >= MAX_PER_TEAM) return;      // лимит 2

      target.push(name);
    },
    removePlayerFromEditing(state, action: PayloadAction<string>) {
      const name = action.payload;
      const target = state.editingTeam === 'A' ? state.teamA : state.teamB;
      if (!state.editingTeam) return;
      const idx = target.indexOf(name);
      if (idx >= 0) target.splice(idx, 1);
    },
    // На случай сброса/замены команды извне
    setTeam(state, action: PayloadAction<{ team: 'A' | 'B'; players: string[] }>) {
      const { team, players } = action.payload;
      if (team === 'A') state.teamA = players.slice(0, MAX_PER_TEAM);
      else state.teamB = players.slice(0, MAX_PER_TEAM);
    },
  },
});

export const {
  openForTeam, close,
  addPlayerToEditing, removePlayerFromEditing,
  setTeam,
} = modalSlice.actions;

export default modalSlice.reducer;
