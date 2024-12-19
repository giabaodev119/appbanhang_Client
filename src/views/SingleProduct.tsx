import AppHeader from "@conponents/AppHeader";
import OptionModal from "@conponents/OptionModal";
import ProductDetail from "@conponents/ProductDetail";
import useAuth from "@hooks/useAuth";
import { ProfileNavigatorParamList } from "@navigator/ProfileNavigator";
import BackButton from "@Ui/BackBotton";
import OptionButton from "@Ui/OptionButton";
import React, { useCallback, useEffect, useState } from "react";
import { FC } from "react";
import { View, StyleSheet, Text, Alert, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import colors from "@utils/color";
import useClient from "@hooks/useClient";
import { runAxiosAsync } from "@api/runAxiosAsync";
import { showMessage } from "react-native-flash-message";
import LoadingSpinner from "@Ui/LoadingSpinner";
import { useDispatch } from "react-redux";
import { deleteItem } from "@store/listings";
import ChatIcon from "@conponents/ChatIcon";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Product } from "./EditProduct";
import { useFocusEffect } from "@react-navigation/native";

type Props = NativeStackScreenProps<ProfileNavigatorParamList, "SingleProduct">;

const menuOption = [
  {
    name: "Edit",
    icon: <Feather name="edit" size={20} color={colors.primary} />,
  },
  {
    name: "Delete",
    icon: <Feather name="trash-2" size={20} color={colors.primary} />,
  },
];

const SingleProduct: FC<Props> = ({ route, navigation }) => {
  const { authState } = useAuth();
  const { authClient } = useClient();
  const [busy, setBusy] = useState(false);
  const [fetchingChatID, setFetchingChatID] = useState(false);
  const [productInfo, setProductInfo] = useState<Product>();
  const dispatch = useDispatch();
  const { product, id } = route.params;
  const [showMenu, setShowMenu] = useState(false);

  const isAdmin = authState.profile?.id === productInfo?.seller.id;

  const confirmDelete = async () => {
    const id = product?.id;
    if (!id) return;
    setBusy(true);
    const res = await runAxiosAsync<{ message: string }>(
      authClient.delete("/product/" + id)
    );
    setBusy(false);
    if (res?.message) {
      dispatch(deleteItem(id));
      showMessage({ message: res.message, type: "success" });
      navigation.navigate("Listings");
    }
  };

  const onDeletePress = () => {
    Alert.alert(
      "Bạn có chắc muốn xóa sản phẩm không?",
      "Hành động này sẽ xóa vĩnh viễn sản phẩm của bạn mà không thể khôi phục được.",
      [
        { text: "Delete", style: "destructive", onPress: confirmDelete },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const onChatBtnPress = async () => {
    if (!productInfo) return;
    setFetchingChatID(true);
    const res = await runAxiosAsync<{ conversationId: string }>(
      authClient.get("/conversation/with/" + productInfo.seller.id)
    );
    setFetchingChatID(false);
    if (res) {
      navigation.navigate("ChatWindow", {
        conversationId: res.conversationId,
        peerProfile: productInfo.seller,
      });
    }
  };

  const fectchProductInfo = async (id: string) => {
    const res = await runAxiosAsync<{ product: Product }>(
      authClient.get("/product/detail/" + id)
    );
    if (res) {
      setProductInfo(res.product);
    }
  };

  const handleMarkAsSold = async () => {
    if (!productInfo || productInfo.isSold) return; // Không làm gì nếu sản phẩm đã bán

    setBusy(true);

    try {
      const res = await runAxiosAsync<{ message: string }>(
        authClient.patch(`/product/${productInfo.id}/sold`, { isSold: true })
      );

      if (res) {
        showMessage({ message: res.message, type: "success" });
        setProductInfo({ ...productInfo, isSold: true }); // Cập nhật trạng thái sản phẩm
      }
    } catch (error) {
      showMessage({
        message: "Không thể đánh dấu sản phẩm. Vui lòng thử lại.",
        type: "danger",
      });
    } finally {
      setBusy(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });

      return () => {
        navigation.getParent()?.setOptions({
          tabBarStyle: {
            height: 60,
            position: "absolute",
            borderTopWidth: 0,
            backgroundColor: "white",
            elevation: 5,
          },
        });
      };
    }, [navigation])
  );
  useEffect(() => {
    if (id) fectchProductInfo(id);
    if (product) setProductInfo(product);
  }, [id, product]);

  return (
    <>
      <AppHeader
        backButton={<BackButton />}
        right={
          <OptionButton onPress={() => setShowMenu(true)} visible={isAdmin} />
        }
      />
      <View style={styles.container}>
        {productInfo ? <ProductDetail product={productInfo} /> : <></>}

        {!isAdmin && (
          <ChatIcon onPress={onChatBtnPress} busy={fetchingChatID} />
        )}

        {/* Nút đánh dấu đã bán, chỉ hiển thị cho người bán */}
        {isAdmin && !productInfo?.isSold && (
          <TouchableOpacity
            style={styles.soldButton}
            onPress={handleMarkAsSold}
          >
            <Text style={styles.soldButtonText}>Đánh dấu đã bán</Text>
          </TouchableOpacity>
        )}
      </View>

      <OptionModal
        options={menuOption}
        renderItem={({ icon, name }) => (
          <View style={styles.option}>
            {icon}
            <Text style={styles.optionTitle}>{name}</Text>
          </View>
        )}
        visible={showMenu}
        onRequestClose={setShowMenu}
        onPress={(option) => {
          if (option.name === "Delete") {
            onDeletePress();
          }
          if (option.name === "Edit") {
            navigation.navigate("EditProduct", { product: product! });
          }
        }}
      />
      <LoadingSpinner visible={busy} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGrey, // Nền sáng nhẹ
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  optionTitle: {
    paddingLeft: 5,
    color: colors.primary,
  },
  soldButton: {
    marginTop: 20,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.textMessage,
    borderRadius: 5,
  },
  soldButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
});

export default SingleProduct;
