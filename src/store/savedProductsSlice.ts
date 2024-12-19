import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Định nghĩa kiểu dữ liệu cho sản phẩm
export interface Product1 {
    id: string;
    name: string;
    thumbnail?: string;
    category: string;
    price: number;
    image?: string[];
    date: string;
    description: string;
    provinceName?: string;
    districtName?: string;
    address?: string;
    isActive: boolean;
    isSold:boolean;
    isFavorite:boolean;
    seller: {
      id: string;
      name: string;
      avatar?: string;
      phoneNumber: string;
    };
}

// Định nghĩa kiểu dữ liệu cho state
type SavedProductsState = Product1[];

// Khởi tạo state ban đầu
const initialState: SavedProductsState = [];

// Tạo slice với kiểu dữ liệu được chỉ định
const savedProductsSlice = createSlice({
  name: "savedProducts",
  initialState,
  reducers: {
    addSavedProduct(state, action: PayloadAction<Product1>) {
      state.push(action.payload); // Thêm sản phẩm vào danh sách đã lưu
    },
  },
});

export const { addSavedProduct } = savedProductsSlice.actions;
export default savedProductsSlice.reducer;
