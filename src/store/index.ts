import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth";
import listingsReducer from "./listings";
import conversationReducer from "./conversation";
import chatsReducer from "./chats";
import savedProductsSlice from "./savedProductsSlice";

const reducers = combineReducers({
  auth: authReducer,
  listing: listingsReducer,
  conversation: conversationReducer,
  chats: chatsReducer,
  savedProductsSlice:savedProductsSlice,
});

const store = configureStore({ reducer: reducers });
export type RootState = ReturnType<typeof store.getState>;
export default store;
