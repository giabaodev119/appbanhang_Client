import AppHeader from "@conponents/AppHeader";
import OptionModal from "@conponents/OptionModal";
import ProductDetail from "@conponents/ProductDetail";
import useAuth from "@hooks/useAuth";
import { ProfileNavigatorParamList } from "@navigator/ProfileNavigator";
import BackButton from "@Ui/BackBotton";
import OptionButton from "@Ui/OptionButton";
import React, { useEffect, useState } from "react";
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
import { addSavedProduct } from "@store/savedProductsSlice";
import { Linking } from "react-native";

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
  const [saved, setSaved] = useState(false);

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

  useEffect(() => {
    if (id) fectchProductInfo(id);
    if (product) setProductInfo(product);
  }, [id, product]);
  const handleSaveProduct = () => {
    if (!productInfo) return;

    setSaved(true);
    dispatch(addSavedProduct(productInfo)); // Lưu sản phẩm vào Redux store
    showMessage({ message: "Sản phẩm đã được lưu.", type: "success" });
  };

  const onCallSeller = () => {
    if (productInfo?.seller.phoneNumber) {
      Linking.openURL(`tel:${productInfo.seller.phoneNumber}`).catch(() => {
        showMessage({
          message: "Không thể thực hiện cuộc gọi.",
          type: "danger",
        });
      });
    } else {
      showMessage({
        message: "Số điện thoại không khả dụng.",
        type: "warning",
      });
    }
  };
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
          
        {productInfo?.isSold && (
        <View style={styles.soldNotification}>
          <Text style={styles.soldNotificationText}>Sản phẩm đã bán</Text>
        </View>
      )}

{!isAdmin && productInfo?.seller.phoneNumber && (
      <TouchableOpacity style={styles.callButton} onPress={onCallSeller}>
        <Feather name="phone" size={20} color={colors.white} />
        <Text style={styles.callButtonText}>Gọi người bán</Text>
      </TouchableOpacity>
    )}
        {!isAdmin && (
          <ChatIcon onPress={onChatBtnPress} busy={fetchingChatID} />
        )}
         {/* Nút gọi điện chỉ hiển thị cho người mua */}

            {/* Nút lưu sản phẩm, chỉ hiển thị cho người mua */}
      {!isAdmin && (
        <TouchableOpacity
          style={[
            styles.saveButton,
            saved && { backgroundColor: colors.active }, // Đổi màu nếu đã lưu
          ]}
          onPress={handleSaveProduct}
          disabled={saved} // Vô hiệu hóa nếu đã lưu
        >
          <Feather name={saved ? "check-circle" : "bookmark"} size={20} color={colors.white} />
          <Text style={styles.saveButtonText}>
            {saved ? "Đã lưu" : "Lưu sản phẩm"}
          </Text>
        </TouchableOpacity>
      )}
        {/* Nút đánh dấu đã bán, chỉ hiển thị cho người bán */}
        {isAdmin && !productInfo?.isSold &&(
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
        renderItem={({ icon, name, }) => (
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
  soldNotification: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: colors.deActive, // Màu nổi bật để báo sản phẩm đã bán
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  soldNotificationText: {
    color: colors.white,
    fontWeight: "bold",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: "bold",
    marginLeft: 10,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  callButtonText: {
    color: colors.white,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default SingleProduct;
