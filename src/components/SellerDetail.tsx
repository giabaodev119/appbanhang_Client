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

  // Lọc sản phẩm theo trạng thái isSold
  const availableProducts = products.filter((product) => product.isSold === false); // Sản phẩm chưa bán
  const soldProducts = products.filter((product) => product.isSold === true); // Sản phẩm đã bán
  
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
            {/* Sản phẩm chưa bán */}
            <View style={styles.productSection}>
              <ShowProduct data={availableProducts} title="Sản phẩm của người bán" />
            </View>

            {/* Sản phẩm đã bán */}
            <View style={styles.soldProductSection}>
              <Text style={styles.productTitle}>Sản phẩm đã bán:</Text>
              <View style={styles.productList}>
                {soldProducts.map((product, index) => (
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
    backgroundColor: "#f4f4f4",
  },
  sellerHeader: {
    backgroundColor: "#4a90e2",
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
  },
  profileContainer: {
    alignItems: "flex-start",
    padding: 20,
  },
  profileInfo: {
    marginTop: 15,
    width: "100%",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "left",
  },
  email: {
    fontSize: 16,
    color: "#e1e1e1",
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
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: size.padding,
  },
  productSection: {
    flexDirection: "column",
    width: "100%",
  },
  soldProductSection: {
    width: "60%",
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
});

export default SellerDetail;
