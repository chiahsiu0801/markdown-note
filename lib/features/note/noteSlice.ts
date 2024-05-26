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
};

export const fetchNotes = createAsyncThunk('notes/fetchNotes', async (_, thunkAPI) => {
  try {
    console.log('fetchNotes called');
    let notes: NoteDocument[] = await getNotes();

    console.log('notes: ', notes);

    return notes;
  } catch (error) {
    console.log(error);
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
    // renameNotes: (state, action: PayloadAction<RenamePayload>) => {
    //   state.notes.forEach(note => {
    //     if(note._id === action.payload._id) {
    //       note.title = action.payload.newName;
    //     }
    //   });
    // },
    // setNewName: (state, action: PayloadAction<NewNamePayload>) => {
    //   if(action.payload.renamingNoteId != state.renamingNoteId) {
    //     state.renamingNoteId = action.payload.renamingNoteId;
    //   }
    //   state.newName = action.payload.newName;
    // },
    renameNotes: (state, action: PayloadAction<RenamePayload>) => {
      if(action.payload.renamingNoteId != state.renamingNoteId) {
        state.renamingNoteId = action.payload.renamingNoteId;
      }
      state.newName = action.payload.newName;

      if(action.payload.renamingFinish) {
        state.notes.forEach(note => {
          if(note._id === action.payload.renamingNoteId) {
            console.log('note.title: ',note.title);
            console.log('action.payload.newName: ', action.payload.newName);
            note.title = action.payload.newName;
          }
        }); 
      }
    },
    updateNote: (state, action: PayloadAction<UpdatePayload>) => {
      state.notes.forEach(note => {
        if(note._id === action.payload.updatingNoteId) {
          note.content = action.payload.newContent;
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
