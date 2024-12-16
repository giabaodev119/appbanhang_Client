import React, { FC, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
} from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import {
  ActiveChat,
  addNewActiveChats,
  getUnreadChatsCount,
} from "@store/chats";
import { useDispatch, useSelector } from "react-redux";
import size from "@utils/size";
import ChatNotification from "@Ui/ChatNotification";
import socket, { handleSocketConnection } from "src/socket";
import { runAxiosAsync } from "@api/runAxiosAsync";
import CategoryList from "@conponents/CategoryList";
import LatesProductList, { LatestProduct } from "@conponents/LatesProductList";
import SearchBar from "@conponents/SearchBar";
import SearchAddressButton from "@conponents/SearchAddressButton";
import SearchModal from "@conponents/SearchModal";
import useAuth from "@hooks/useAuth";
import useClient from "@hooks/useClient";
import { AppStackParamList } from "@navigator/AppNavigator";
import ShowProduct from "@conponents/SearchProduct";
import Swiper from "react-native-swiper"; // Import Swiper
import colors from "@utils/color";

interface Props {}
const Home: FC<Props> = () => {
  const [products, setProducts] = useState<LatestProduct[]>([]);
  const [productsByAddress, setProductsByAddress] = useState<LatestProduct[]>();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { navigate } = useNavigation<NavigationProp<AppStackParamList>>();
  const { authClient } = useClient();
  const { authState } = useAuth();
  const dispatch = useDispatch();
  const totalUnreadMessages = useSelector(getUnreadChatsCount);
  const banners = [
    { id: 1, image: require("../../assets/images (2).png") },
    { id: 2, image: require("../../assets/images (3).png") },
    { id: 3, image: require("../../assets/images (4).png") },
  ];

  const fetchLatestProduct = async () => {
    const res = await runAxiosAsync<{ products: LatestProduct[] }>(
      authClient.get("/product/latest")
    );
    if (res?.products) {
      const availableProducts = res.products.filter((p) => !p.isSold); // Lọc sản phẩm chưa bán
      setProducts(availableProducts);
    }
  };
  
  const fetchProductByAddress = async () => {
    const res = await runAxiosAsync<{ results: LatestProduct[] }>(
      authClient.get("/product/get-byaddress")
    );
    if (res?.results) {
      const availableProducts = res.results.filter((p) => !p.isSold); // Lọc sản phẩm chưa bán
      setProductsByAddress(availableProducts);
    }
  };
  

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProductByAddress();
    await fetchLatestProduct();
    setRefreshing(false);
  };

  useEffect(() => {
    const handleApiRequest = async () => {
      await handleRefresh();
    };
    handleApiRequest();
  }, []);

  useEffect(() => {
    if (authState.profile) handleSocketConnection(authState.profile, dispatch);
    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    console.log("Products from API:", products);
    console.log("Filtered products (not sold):", products.filter((p) => !p.isSold));
  }, [products]);
  
  return (
    <>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.searchBarContainer}>
          <SearchBar asButton onPress={() => setShowSearchModal(true)} />
        </View>
        <View style={styles.searchAddressButtonContainer}>
          <SearchAddressButton
            onPress={() => {
              navigate("SearchAddress");
            }}
          />
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
        <Swiper
          style={styles.swiper}
          autoplay
          autoplayTimeout={3}
          showsPagination
        >
          {banners.map((banner) => (
            <Image
              key={banner.id}
              source={banner.image}
              style={styles.bannerImage}
            />
          ))}
        </Swiper>

        {/* Categories */}
        <View style={styles.sectionContainer}>
          <CategoryList
            onPress={(category) => navigate("ProductList", { category })}
          />
        </View>

        {/* Nearby Products */}
        {productsByAddress && productsByAddress.length > 0 && (
          <View style={styles.sectionContainer}>
            <ShowProduct
             title="Sản phẩm gần bạn"
             data={productsByAddress.filter((p) => !p.isSold)} // Lọc thêm một lần nữa nếu cần
             onPress={({ id }) => navigate("SingleProduct", { id })}
            />
          </View>
        )}

        {/* Latest Products */}
        {products && products.length > 0 && (
          <View style={styles.sectionContainer}>
            <LatesProductList
               data={products.filter((p) => !p.isSold)} // Lọc thêm một lần nữa nếu cần
               onPress={({ id }) => navigate("SingleProduct", { id })}
            />
          </View>
        )}
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
    backgroundColor: colors.lightGrey, // Background màu nhẹ nhàng
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
    overflow: "hidden", // Ẩn viền của ảnh bo tròn
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
