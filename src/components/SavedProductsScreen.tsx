import React from "react";
import { useSelector } from "react-redux";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { RootState } from "../store"; // Đường dẫn đến tệp store.ts
import ProductDetail from "./ProductDetail";
import AppHeader from "./AppHeader";
import BackButton from "@Ui/BackBotton";

const SavedProductsScreen = () => {
  // Định nghĩa kiểu dữ liệu cho state
  const savedProducts = useSelector(
    (state: RootState) => state.savedProductsSlice
  );

  return (
    <>
      <AppHeader backButton={<BackButton />} />
      <View style={styles.container}>
        {savedProducts.length === 0 ? (
          <Text style={styles.emptyText}>Bạn chưa lưu sản phẩm nào.</Text>
        ) : (
          <FlatList
            data={savedProducts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <ProductDetail product={item} />}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "gray",
  },
});

export default SavedProductsScreen;
