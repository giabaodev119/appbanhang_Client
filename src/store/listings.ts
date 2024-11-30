import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from ".";
import { Product } from "@views/EditProduct";


const initialState: Product[] = [];

const slice = createSlice({
  name: "listing",
  initialState,
  reducers: {
    updateListings(_, { payload }: PayloadAction<Product[]>) {
      return payload;
    },
    deleteItem(oldListings, { payload }: PayloadAction<string>) {
      return oldListings.filter((item) => item.id !== payload);
    },
  },
});

export const { updateListings, deleteItem } = slice.actions;

export const getListings = createSelector(
  (state: RootState) => state,
  (state) => state.listing
);

export default slice.reducer;
