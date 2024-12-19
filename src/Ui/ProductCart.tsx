import { FC } from "react";
import { View, StyleSheet, Text, Pressable, Image } from "react-native";
import { formatPrice, splitAddress } from "@utils/helper";
import colors from "@utils/color";
import { MaterialIcons } from "@expo/vector-icons";
import { LatestProduct } from "@conponents/LatesProductList";

interface Props {
  product: LatestProduct;
  onPress?(item: LatestProduct): void;
}

const ProductCart: FC<Props> = ({ product, onPress }) => {
  return (
    <Pressable
      onPress={() => onPress!(product)}
      style={styles.productContainer}
    >
      {product.thumbnail ? (
        <Image source={{ uri: product.thumbnail }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, styles.noImageView]}>
          <MaterialIcons
            name="image-not-supported"
            size={25}
            color={colors.primary}
          />
        </View>
      )}
      <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
        {product.name}
      </Text>
      <Text style={styles.price}>{formatPrice(product.price)}</Text>
      {product.address && (
        <Text style={styles.address}>{splitAddress(product.address)}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  productContainer: {
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
    marginBottom: 20,
    marginHorizontal: 5,
    shadowColor: colors.backDropDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderColor: colors.lightred, // Viền làm nổi bật sản phẩm
    borderWidth: 1,
  },
  thumbnail: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    backgroundColor: colors.deActive,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginVertical: 5,
  },
  address: {
    fontSize: 12,
    color: colors.textMessage,
    marginVertical: 5,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.lightred,
  },
  noImageView: {
    backgroundColor: colors.deActive,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    height: 150,
  },
});

export default ProductCart;
