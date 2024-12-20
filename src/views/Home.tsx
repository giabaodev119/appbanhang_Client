import React, { FC, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  Button,
  ActivityIndicator,
  Text,
} from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { getUnreadChatsCount } from "@store/chats";
import ChatNotification from "@Ui/ChatNotification";
import socket, { handleSocketConnection } from "src/socket";
import { runAxiosAsync } from "@api/runAxiosAsync";
import CategoryList from "@conponents/CategoryList";
import LatesProductList, { LatestProduct } from "@conponents/LatesProductList";
import SearchBar from "@conponents/SearchBar";
import SearchAddressButton from "@conponents/SearchAddressButton";
import SearchModal from "@conponents/SearchModal";
import ShowProduct from "@conponents/SearchProduct";
import Swiper from "react-native-swiper";
import useAuth from "@hooks/useAuth";
import useClient from "@hooks/useClient";
import { AppStackParamList } from "@navigator/AppNavigator";
import size from "@utils/size";
import colors from "@utils/color";


const Home: FC = () => {
  const [products, setProducts] = useState<LatestProduct[]>([]);
  const [productsByAddress, setProductsByAddress] = useState<LatestProduct[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<LatestProduct[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const { navigate } = useNavigation<NavigationProp<AppStackParamList>>();
  const { authClient } = useClient();
  const { authState } = useAuth();
  const dispatch = useDispatch();
  const totalUnreadMessages = useSelector(getUnreadChatsCount);

  const banners = [
    { id: 1, image: require("../../assets/images (5).png") },
    { id: 2, image: require("../../assets/images (6).png") },
    { id: 3, image: require("../../assets/images (7).png") },
    { id: 4, image: require("../../assets/images (8).png") },
    { id: 5, image: require("../../assets/images (9).png") },
  ];

  const fetchLatestProduct = async (page = 1) => {
    if (isLoading) return;
  
    setIsLoading(true);
    const res = await runAxiosAsync<{
      products: LatestProduct[];
      pagination: { totalPages: number };
    }>(authClient.get(`/product/latest?page=${page}&limit=10`)); // Giới hạn ở đây là 10 sản phẩm mỗi lần gọi API
  
    if (res?.products) {
      setProducts((prev) => [...prev, ...res.products.filter((p) => p.isActive && !p.isSold)]);
      if (page >= res.pagination.totalPages) setHasMore(false);
    }
    setIsLoading(false);
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
    const res = await runAxiosAsync<{ products: LatestProduct[] }>(
      authClient.get("/product/premium-products")
    );
    if (res?.products) {
      setFeaturedProducts(res.products.filter((p) => p.isActive && !p.isSold));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMore(true);
    setProducts([]);
    await Promise.all([fetchLatestProduct(1), fetchProductByAddress(), fetchFeaturedProducts()]);
    setRefreshing(false);
  };

  useEffect(() => {
    handleRefresh();
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

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Swiper style={styles.swiper} autoplay autoplayTimeout={5} showsPagination>
          {banners.map((banner) => (
            <Image key={banner.id} source={banner.image} style={styles.bannerImage} />
          ))}
        </Swiper>

        <View style={styles.sectionContainer}>
          <CategoryList onPress={(category) => navigate("ProductList", { category })} />
        </View>

        {authState.profile?.premiumStatus && featuredProducts.length > 0 && (
          <View style={styles.sectionContainer}>
            <ShowProduct
              title="Sản phẩm nổi bật"
              data={featuredProducts.slice(0, 4)}
              onPress={({ id }) => navigate("SingleProduct", { id })}
            />
          </View>
        )}

        {productsByAddress && productsByAddress.length > 0 && (
          <View style={styles.sectionContainer}>
            <ShowProduct
              title="Sản phẩm gần bạn"
              data={productsByAddress.slice(0, 4)}
              onPress={({ id }) => navigate("SingleProduct", { id })}
            />
          </View>
        )}

        <View style={styles.sectionContainer}>
          <LatesProductList
             data={products.slice(0, 10)}
            onPress={({ id }) => navigate("SingleProduct", { id })}
          />
          {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
          {!hasMore && <Text style={styles.noMoreText}>Không còn sản phẩm nào</Text>}
          {hasMore && !isLoading && (
  <View style={styles.loadMoreContainer}>
    <View style={styles.buttonWrapper}>
      <Button
        title="Xem thêm"
        onPress={() => {
          setCurrentPage((prev) => prev + 1);
          fetchLatestProduct(currentPage + 1);
        }}
        color={colors.primary}
      />
    </View>
  </View>
)}

        </View>
      </ScrollView>

      <SearchModal visible={showSearchModal} onClose={() => setShowSearchModal(false)} />
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
    backgroundColor: colors.white,
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
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  sectionContainer: {
    marginBottom: 25,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  loadMoreContainer: {
    marginTop: 50,
    alignItems: "center",
    color: colors.primary,
  },
  noMoreText: {
    textAlign: "center",
    color: colors.primary,
    marginTop: 10,
  },
  buttonWrapper: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 10, // Điều chỉnh padding để chữ lên trên
    paddingHorizontal: 20,
    marginTop: -50, // Đưa nút lên trên
  },
});

export default Home;
