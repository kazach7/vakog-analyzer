import { configureStore, createSlice } from "@reduxjs/toolkit";

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    autoAnalysis: true,
    isAnalysing: false,
    actionDone: null,
  },
  reducers: {
    toggleAutoAnalysis: (state) => {
      state.autoAnalysis = !state.autoAnalysis;
    },
    setIsAnalysing: (state, action) => {
      state.isAnalysing = action.payload;
    },
    setActionDone: (state, action) => {
      state.actionDone = action.payload;
    },
  },
});

const documentSlice = createSlice({
  name: "document",
  initialState: {
    id: null,
    name: null,
    content: "",
    ignoredMappings: [],
    ignoredExpressions: [],
    ignoredSuggestions: [],
  },
  reducers: {
    setDocument: (state, action) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.content = action.payload.content;
      state.ignoredMappings = action.payload.ignoredMappings ?? [];
      state.ignoredExpressions = action.payload.ignoredExpressions ?? [];
      state.ignoredSuggestions = action.payload.ignoreSuggestions ?? [];
      console.log("Document has been set: " + JSON.stringify(state));
    },
    setDocumentContent: (state, action) => {
      state.content = action.payload;
      console.log("Document content has been set: " + state.content);
    },
    addIgnoredMapping: (state, action) => {
      state.ignoredMappings.push(action.payload);
      console.log(
        "Added ignored mapping. Ignored mappings: " +
          JSON.stringify(state.ignoredMappings)
      );
    },
    addIgnoredExpression: (state, action) => {
      state.ignoredExpressions.push(action.payload);
    },
    addIgnoredSuggestion: (state, action) => {
      state.ignoredSuggestions.push(action.payload);
    },
  },
});

const mappingsSlice = createSlice({
  name: "mappings",
  initialState: {
    mappings: [],
    counts: {
      visual: 0,
      auditory: 0,
      kinesthetic: 0,
      "olfactory and gustatory": 0,
    },
  },
  reducers: {
    setMappings: (state, action) => {
      state.mappings = action.payload;

      state.counts = {
        visual: 0,
        auditory: 0,
        kinesthetic: 0,
        "olfactory and gustatory": 0,
      };
      for (let m of action.payload) {
        state.counts[m.vakog]++;
      }
    },
    deleteMapping: (state, action) => {
      const mapping = action.payload;
      state.mappings = state.mappings.filter(
        (m) => JSON.stringify(m) != JSON.stringify(mapping)
      );
      state.counts[mapping.vakog]--;
    },
    deleteMappingsOfExpression: (state, action) => {
      const expression = action.payload;
      const mappings = state.mappings.filter(
        (m) => m.matched_lemma == expression
      );
      for (let m of mappings) {
        state.counts[m.vakog]--;
      }
      state.mappings = state.mappings.filter((m) => !mappings.includes(m));
    },
  },
});

const suggestionsSlice = createSlice({
  name: "suggestions",
  initialState: {
    suggestions: [],
    suggestionsToApply: [],
  },
  reducers: {
    setSuggestions: (state, action) => {
      state.suggestions = action.payload;
    },
    applySuggestion: (state, action) => {
      const { suggestion, i } = action.payload;
      state.suggestionsToApply = [suggestion];
      state.suggestions.splice(i, 1);
    },
    applyAllSuggestions: (state) => {
      state.suggestionsToApply = state.suggestions;
      state.suggestions = [];
    },
    ignoreSuggestion: (state, action) => {
      const index = action.payload;
      state.suggestions.splice(index, 1);
    },
  },
});

export const store = configureStore({
  reducer: {
    settings: settingsSlice.reducer,
    document: documentSlice.reducer,
    mappings: mappingsSlice.reducer,
    suggestions: suggestionsSlice.reducer,
  },
});

export const { toggleAutoAnalysis, setIsAnalysing } = settingsSlice.actions;
export const {
  setDocument,
  setDocumentContent,
  addIgnoredMapping,
  addIgnoredExpression,
  addIgnoredSuggestion,
} = documentSlice.actions;
export const { setMappings, deleteMapping, deleteMappingsOfExpression } =
  mappingsSlice.actions;
export const {
  setSuggestions,
  applySuggestion,
  applyAllSuggestions,
  ignoreSuggestion,
} = suggestionsSlice.actions;
