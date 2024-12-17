import React, { FC, useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { AppStackParamList } from "@navigator/AppNavigator";
import colors from "@utils/color";
import size from "@utils/size";
import { Product } from "@views/EditProduct";
import { runAxiosAsync } from "@api/runAxiosAsync";
import useClient from "@hooks/useClient";
import { AdminUser } from "@views/ShowAllUser";
import ShowProduct from "./SearchProduct";
import { replacedAddress } from "@utils/helper";
import AvatarView from "@Ui/AvatarView";
import { showMessage } from "react-native-flash-message";
import AppHeader from "./AppHeader";
import BackButton from "@Ui/BackBotton";
import { formatDate } from "@utils/date";

const SellerDetail: FC = () => {
  const route = useRoute<RouteProp<AppStackParamList, "SellerDetail">>();
  const { id } = route.params;

  const [seller, setSeller] = useState<AdminUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { authClient } = useClient();

  // Fetch dữ liệu từ backend
  const fetchSellerData = async (id: string) => {
    try {
      setLoading(true);
      const res = await runAxiosAsync<{
        owner: AdminUser;
        products: Product[];
      }>(authClient.get(`/product/get-byseller?id=${id}`));
      if (res) {
        setSeller(res.owner);
        setProducts(res.products);
      } else {
        showMessage({
          message: "Không thể tải dữ liệu người bán.",
          type: "danger",
        });
      }
    } catch (error) {
      showMessage({
        message: "Không thể tải dữ liệu người bán.",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchSellerData(id);
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <AppHeader backButton={<BackButton />} />
      <View style={styles.fullBackground}>
        <View style={styles.sellerHeader}>
          {seller && (
            <View style={styles.profileContainer}>
              <AvatarView uri={seller.avatar} size={100} />
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{seller.name}</Text>
                <Text style={styles.email}>{seller.email}</Text>
                <Text style={styles.address}>
                  Địa chỉ: {replacedAddress(seller.address)}
                </Text>
                <Text style={styles.createdAt}>
                  Tạo tài khoản: {formatDate(seller.createdAt)}
                </Text>
              </View>
            </View>
          )}
        </View>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.rowContainer}>
            <View style={styles.productSection}>
              <ShowProduct data={products} title="Sản phẩm của người bán" />
            </View>
            <View style={styles.soldProductSection}>
              <Text style={styles.productTitle}>Sản phẩm đã bán:</Text>
              <View style={styles.productList}>
                {products.map((product, index) => (
                  <Text key={index} style={styles.productName}>
                    {product.name}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  fullBackground: {
    flex: 1,
    backgroundColor: "#f4f4f4", // Nền toàn màn hình
  },
  sellerHeader: {
    backgroundColor: "#4a90e2", // Màu nền mới (xanh nhạt)
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4", // Nền khi đang tải
  },
  profileContainer: {
    alignItems: "flex-start", // Căn lề trái toàn bộ
    padding: 20,
  },
  profileInfo: {
    marginTop: 15,
    width: "100%",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff", // Màu chữ trắng
    textAlign: "left",
  },
  email: {
    fontSize: 16,
    color: "#e1e1e1", // Màu chữ xám nhạt
    marginTop: 5,
    textAlign: "left",
  },
  address: {
    fontSize: 16,
    color: "#e1e1e1",
    marginTop: 5,
    textAlign: "left",
  },
  createdAt: {
    fontSize: 14,
    color: "#e1e1e1",
    marginTop: 5,
    fontStyle: "italic",
    textAlign: "left",
  },
  rowContainer: {
    flexDirection: "row", // Đặt các phần tử theo hàng ngang
    justifyContent: "space-between",
    paddingHorizontal: size.padding,
  },
  productSection: {
    width: "48%", // Chia màn hình thành 2 cột, mỗi cột 48% chiều rộng
  },
  soldProductSection: {
    width: "48%", // Chia màn hình thành 2 cột, mỗi cột 48% chiều rộng
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginTop: 15,
    marginBottom: 5,
  },
  productList: {
    marginTop: 10,
  },
  productName: {
    fontSize: 16,
    color: "#333333",
    marginTop: 5,
  },
  container: {
    padding: size.padding,
  },
  sectionContainer: {
    marginBottom: 25,
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: "#ffffff", // Nền trắng cho phần nội dung
    borderRadius: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
});

export default SellerDetail;
