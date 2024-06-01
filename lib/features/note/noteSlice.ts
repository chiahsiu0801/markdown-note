import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getNotes } from '@/lib/data';
import { NoteDocument } from '@/lib/models';

type NoteState = {
  notes: NoteDocument[];
  loading: boolean;
  error: string | null;
  isDeleting: boolean;
  renamingNoteId: string;
  newName: string;
  lastUpdatedNoteId: string;
}

type RenamePayload = {
  renamingFinish: boolean;
  renamingNoteId: string;
  newName: string;
}

type UpdatePayload = {
  updatingNoteId: string;
  newContent: string;
}

const initialState: NoteState = {
  notes: [],
  loading: false,
  error: null,
  isDeleting: false,
  renamingNoteId: '',
  newName: '',
  lastUpdatedNoteId: '',
};

export const fetchNotes = createAsyncThunk('notes/fetchNotes', async (userId: string, thunkAPI) => {
  try {
    let notes: NoteDocument[] = await getNotes(userId);

    return notes;
  } catch (error) {
    return thunkAPI.rejectWithValue('Failed to fetch notes');
  }
});

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    toggleIsDeleting: (state) => {
      state.isDeleting = !state.isDeleting;
    },
    renameNotes: (state, action: PayloadAction<RenamePayload>) => {
      if(action.payload.renamingNoteId != state.renamingNoteId) {
        state.renamingNoteId = action.payload.renamingNoteId;
      }
      state.newName = action.payload.newName;

      if(action.payload.renamingFinish) {
        state.notes.forEach(note => {
          if(note._id === action.payload.renamingNoteId) {
            note.title = action.payload.newName;
          }
        }); 
      }
    },
    updateNote: (state, action: PayloadAction<UpdatePayload>) => {
      state.notes.forEach(note => {
        if(note._id === action.payload.updatingNoteId) {
          note.content = action.payload.newContent;
          state.lastUpdatedNoteId = action.payload.updatingNoteId;
        }
      })
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.notes = action.payload;
        state.loading = false;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { toggleIsDeleting, renameNotes, updateNote } = noteSlice.actions;
export default noteSlice.reducer;
