// Cập nhật import
import React, { FC, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
} from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
  ActiveChat,
  addNewActiveChats,
  getUnreadChatsCount,
} from "@store/chats";
import ChatNotification from "@Ui/ChatNotification";
import socket, { handleSocketConnection } from "src/socket";
import { runAxiosAsync } from "@api/runAxiosAsync";
import CategoryList from "@conponents/CategoryList";
import LatesProductList, { LatestProduct } from "@conponents/LatesProductList";

import SearchBar from "@conponents/SearchBar";
import SearchAddressButton from "@conponents/SearchAddressButton";
import SearchModal from "@conponents/SearchModal";
import ShowProduct from "@conponents/SearchProduct";
import Swiper from "react-native-swiper"; // Import Swiper
import useAuth from "@hooks/useAuth";
import useClient from "@hooks/useClient";
import { AppStackParamList } from "@navigator/AppNavigator";
import size from "@utils/size";
import colors from "@utils/color";

interface Props {}

const Home: FC<Props> = () => {
  const [products, setProducts] = useState<LatestProduct[]>([]);
  const [productsByAddress, setProductsByAddress] = useState<LatestProduct[]>();
  const [featuredProducts, setFeaturedProducts] = useState<LatestProduct[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { navigate } = useNavigation<NavigationProp<AppStackParamList>>();
  const { authClient } = useClient();
  const { authState } = useAuth();
  const dispatch = useDispatch();
  const totalUnreadMessages = useSelector(getUnreadChatsCount);

  const banners = [
    { id: 1, image: require("../../assets/images (5).png") },
    { id: 2, image: require("../../assets/images (6).png") },
    { id: 3, image: require("../../assets/images (7).png") },
  ];

  // Fetch dữ liệu sản phẩm
  const fetchLatestProduct = async () => {
    const res = await runAxiosAsync<{ products: LatestProduct[] }>(
      authClient.get("/product/latest")
    );
    if (res?.products) {
      setProducts(res.products.filter((p) => p.isActive && !p.isSold));
    }
  };

  const fetchProductByAddress = async () => {
    const res = await runAxiosAsync<{ results: LatestProduct[] }>(
      authClient.get("/product/get-byaddress")
    );
    if (res?.results) {
      setProductsByAddress(res.results.filter((p) => p.isActive && !p.isSold));
    }
  };

  const fetchFeaturedProducts = async () => {
    if (!authState.profile?.premiumStatus) return; // Chỉ gọi API nếu là Premium
    const res = await runAxiosAsync<{ products: LatestProduct[] }>(
      authClient.get("/product/latest")
    );
    if (res?.products) {
      setFeaturedProducts(res.products.filter((p) => p.isActive && !p.isSold));
    }
  };

  // Làm mới dữ liệu
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchLatestProduct(), fetchProductByAddress(), fetchFeaturedProducts()]);
    setRefreshing(false);
  };

  useEffect(() => {
    handleRefresh(); // Gọi khi khởi tạo component
  }, []);

  useEffect(() => {
    if (authState.profile) {
      handleSocketConnection(authState.profile, dispatch);
    }
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.searchBarContainer}>
          <SearchBar asButton onPress={() => setShowSearchModal(true)} />
        </View>
        <View style={styles.searchAddressButtonContainer}>
          <SearchAddressButton onPress={() => navigate("SearchAddress")} />
        </View>
        <ChatNotification
          onPress={() => navigate("Chats")}
          indicate={totalUnreadMessages > 0}
        />
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Banner Swiper */}
        <Swiper style={styles.swiper} autoplay autoplayTimeout={3} showsPagination>
          {banners.map((banner) => (
            <Image key={banner.id} source={banner.image} style={styles.bannerImage} />
          ))}
        </Swiper>

        {/* Categories */}
        <View style={styles.sectionContainer}>
          <CategoryList
            onPress={(category) => navigate("ProductList", { category })}
          />
        </View>

        {/* Featured Products */}
        {authState.profile?.premiumStatus && featuredProducts.length > 0 && (
          <View style={styles.sectionContainer}>
            <ShowProduct
              title="Sản phẩm nổi bật"
              data={featuredProducts.slice(0, 4)}
             // Hiển thị tối đa 4 sản phẩm
              onPress={({ id }) => navigate("SingleProduct", { id })}
            />
          </View>
        )}

        {/* Nearby Products */}
        {productsByAddress && productsByAddress.length > 0 && (
          <View style={styles.sectionContainer}>
            <ShowProduct
              title="Sản phẩm gần bạn"
              data={productsByAddress.slice(0, 4)}
              onPress={({ id }) => navigate("SingleProduct", { id })}
            />
          </View>
        )}

        {/* Latest Products */}
        <View style={styles.sectionContainer}>
          <LatesProductList
            data={products}
            onPress={({ id }) => navigate("SingleProduct", { id })}
          />
        </View>
      </ScrollView>

      {/* Search Modal */}
      <SearchModal visible={showSearchModal} onClose={setShowSearchModal} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: size.padding,
    flex: 1,
    backgroundColor: colors.lightGrey,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 15,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  searchBarContainer: {
    flex: 6,
    marginRight: 10,
    marginLeft: 10,
  },
  searchAddressButtonContainer: {
    flex: 1,
  },
  swiper: {
    height: 160,
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: colors.backDropDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  sectionContainer: {
    marginBottom: 25,
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: colors.white,
    borderRadius: 10,
    shadowColor: colors.backDropDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
});

export default Home;
