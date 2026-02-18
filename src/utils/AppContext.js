import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  contacts: [],
  chats: [],
  currentChat: null,
  socket: null,
  keys: null
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'SET_CONTACTS':
      return { ...state, contacts: action.payload };
    case 'SET_CHATS':
      return { ...state, chats: action.payload };
    case 'ADD_CHAT':
      return { ...state, chats: [...state.chats, action.payload] };
    case 'SET_CURRENT_CHAT':
      return { ...state, currentChat: action.payload };
    case 'SET_SOCKET':
      return { ...state, socket: action.payload };
    case 'SET_KEYS':
      return { ...state, keys: action.payload };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}