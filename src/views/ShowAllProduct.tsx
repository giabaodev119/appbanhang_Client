import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useDispatch } from "react-redux";
import { runAxiosAsync } from "@api/runAxiosAsync";
import useClient from "@hooks/useClient";
import ShowAdminProduct from "@conponents/ShowAdminProduct";
import colors from "@utils/color";
import EmptyView from "./EmptyView";
import LoadingSpinner from "@Ui/LoadingSpinner";

export type ProductAdmin = {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  price: number;
  address: string;
  isActive: boolean;
};

const ShowAllProduct = () => {
  const [listings, setListings] = useState<ProductAdmin[]>([]);
  const [loading, setLoading] = useState(false); // Trạng thái tải
  const { authClient } = useClient();
  const dispatch = useDispatch();

  // Fetch danh sách sản phẩm
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await runAxiosAsync<{ data: ProductAdmin[] }>(
        authClient.get("/admin/listings")
      );
      if (res?.data) {
        setListings(res.data);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi nhấn giữ
  const handleLongPress = (product: ProductAdmin) => {
    const newStatus = !product.isActive; // Đảo trạng thái hiện tại
    const statusText = newStatus ? "mở khóa" : "khóa"; // Thông báo dựa trên trạng thái

    Alert.alert(
      "Xác nhận",
      `Bạn có muốn ${statusText} sản phẩm "${product.name}" không?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Có",
          onPress: async () => {
            try {
              // Gọi API cập nhật trạng thái sản phẩm
              const res = await runAxiosAsync(
                authClient.patch(`/admin/check-active/${product.id}`, {
                  isActive: newStatus,
                })
              );
              if (res) {
                // Cập nhật lại danh sách sản phẩm
                setListings((prev) =>
                  prev.map((item) =>
                    item.id === product.id
                      ? { ...item, isActive: newStatus }
                      : item
                  )
                );
              }
            } catch (error) {
              Alert.alert("Lỗi", "Không thể thay đổi trạng thái sản phẩm");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Nếu đang tải, hiển thị ActivityIndicator
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Danh sách sản phẩm</Text>
      </View>
      {listings.length > 0 ? (
        <ScrollView style={styles.container}>
          <ShowAdminProduct
            data={listings}
            onPress={(product) =>
              console.log(`Product selected: ${product.id}`)
            }
            onLongPress={handleLongPress} // Truyền hàm xử lý nhấn giữ
          />
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyView title="Không có sản phẩm để hiển thị" />
        </View>
      )}
      <LoadingSpinner visible={loading} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  headerContainer: {
    flexDirection: "row",
    paddingTop: 15,
    paddingHorizontal: 16,
    marginBottom: 5,
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontWeight: "600",
    color: colors.primary,
    fontSize: 20,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ShowAllProduct;
