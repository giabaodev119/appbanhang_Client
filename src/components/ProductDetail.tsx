import AvatarView from "@Ui/AvatarView";
import colors from "@utils/color";
import { formatDate } from "@utils/date";
import { formatPrice, replacedAddress } from "@utils/helper";
import size from "@utils/size";
import { FC } from "react";
import { View, StyleSheet, Text, ScrollView, Pressable } from "react-native";
import ImageSlider from "./ImageSlider";
import FormDivider from "@Ui/FormDivider";
import { Product } from "@views/EditProduct";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "@navigator/AppNavigator";

interface Props {
  product: Product;
}

const ProductDetail: FC<Props> = ({ product }) => {
  const { navigate } = useNavigation<NavigationProp<AppStackParamList>>();
  // Hàm để log id của người bán
  const handleSellerPress = () => {
    if (product.seller?.id) {
      navigate("SellerDetail", { id: product.seller.id });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Slider hiển thị hình ảnh */}
      <ImageSlider images={product.image} />

      {/* Thông tin cơ bản */}
      <View style={styles.infoContainer}>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.category}>{product.category}</Text>
        {product.date && (
          <Text style={styles.date}>
            Mua ngày: {formatDate(product.date, "dd, LLL, yyyy")}
          </Text>
        )}
      </View>

      {/* Địa chỉ và mô tả */}
      <View style={styles.section}>
        {product.address && (
          <Text style={styles.address}>{replacedAddress(product.address)}</Text>
        )}
        {product.description && (
          <Text style={styles.description}>{product.description}</Text>
        )}
      </View>

      <FormDivider />

      {/* Thông tin người bán */}
      <Pressable style={styles.profileContainer} onPress={handleSellerPress}>
        <AvatarView uri={product.seller.avatar} size={60} />
        <View style={styles.profileTextContainer}>
          <Text style={styles.profileName}>{product.seller.name}</Text>
          <Text style={styles.profileLabel}>Hotline:{product.seller.phoneNumber}</Text>
          <Text style={styles.profileLabel}>Người bán</Text>
        </View>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: size.padding,
  },
  infoContainer: {
    marginVertical: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: colors.white, // Nền trắng
    borderRadius: 8,
    borderColor: colors.borderColor,
    borderWidth: 1,
  },
  price: {
    color: colors.lightred,
    fontWeight: "700",
    fontSize: 28,
    marginTop: 10,
    textAlign: "left", // Căn lề trái
  },
  name: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 18,
    marginTop: 10,
    textAlign: "left", // Căn lề trái
  },
  category: {
    color: colors.primary,
    fontSize: 14,
    marginTop: 5,
    textAlign: "left", // Căn lề trái
  },
  date: {
    color: colors.textMessage,
    fontSize: 12,
    marginTop: 5,
    textAlign: "left", // Căn lề trái
  },
  section: {
    marginTop: 20,
    padding: size.padding,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderColor: colors.borderColor,
    borderWidth: 1,
  },
  address: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
    textAlign: "left", // Căn lề trái
  },
  description: {
    color: colors.textMessage,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "left", // Căn lề trái
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 8,
    borderColor: colors.borderColor,
    borderWidth: 1,
  },
  profileTextContainer: {
    paddingLeft: 15,
  },
  profileName: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  profileLabel: {
    color: colors.primary,
    fontSize: 14,
  },
});

export default ProductDetail;
