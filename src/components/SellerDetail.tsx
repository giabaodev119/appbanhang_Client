import React, { FC, useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
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
  const [activeTab, setActiveTab] = useState("products");
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
              <AvatarView
                uri={seller.avatar}
                size={100}
                isVip={seller.premiumStatus?.isAvailable}
              />
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
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "products" && styles.activeTab]}
            onPress={() => setActiveTab("products")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "products" && styles.activeTabText,
              ]}
            >
              Sản phẩm
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "soldProducts" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("soldProducts")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "soldProducts" && styles.activeTabText,
              ]}
            >
              Đã bán
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.container}>
          {activeTab === "products" ? (
            <ShowProduct data={products} title="Sản phẩm của người bán" />
          ) : (
            <View style={styles.soldProductSection}>
              <Text style={styles.productTitle}>Sản phẩm đã bán:</Text>
              {products.filter((product) => product.isSold).length > 0 ? (
                products
                  .filter((product) => product.isSold)
                  .map((product, index) => (
                    <View key={index} style={styles.productRow}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {index + 1}. {product.name}
                      </Text>
                    </View>
                  ))
              ) : (
                <Text style={styles.noProductText}>Không có sản phẩm nào.</Text>
              )}
            </View>
          )}
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
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: "#555555",
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  soldProductSection: {
    padding: size.padding,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 5,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  productRow: {
    padding: 15, // Tăng khoảng cách để nội dung thoáng hơn
    marginVertical: 8, // Tạo khoảng cách giữa các dòng
    borderWidth: 1, // Thêm viền để nổi bật hơn
    borderColor: "#dddddd",
    borderRadius: 10, // Bo góc viền
    backgroundColor: "#f9f9f9", // Màu nền nhẹ
    shadowColor: "#000", // Thêm bóng cho hiệu ứng nổi
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Bóng trên Android
  },

  productName: {
    fontSize: 16,
    color: "#333333",
  },
  noProductText: {
    fontSize: 16,
    color: "#999999",
    textAlign: "center",
    marginTop: 20,
  },
  container: {
    padding: size.padding,
  },
});

export default SellerDetail;
