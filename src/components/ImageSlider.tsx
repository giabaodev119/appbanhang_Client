import ProductImage from "@Ui/ProductImage";
import colors from "@utils/color";
import { FC, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  ViewToken,
  Dimensions,
} from "react-native";

interface Props {
  images?: string[];
}

const ImageSlider: FC<Props> = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const viewableConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const screenWidth = Dimensions.get("window").width; // Lấy chiều rộng màn hình
  const imageHeight = screenWidth * 0.5625; // Đảm bảo tỷ lệ 16:9 (hoặc tuỳ chỉnh theo nhu cầu)

  const onViewableItemsChanged = useRef(
    (info: {
      viewableItems: ViewToken<string>[];
      changed: ViewToken<string>[];
    }) => {
      setActiveIndex(info.viewableItems[0]?.index || 0);
    }
  );

  if (!images?.length) {
    return (
      <View
        style={[
          styles.noImageContainer,
          { width: screenWidth, height: imageHeight }, // Đặt kích thước vùng thông báo
        ]}
      >
        <Text style={styles.noImageText}>Sản phẩm chưa cập nhật hình ảnh</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.flatlist}
        data={images}
        renderItem={({ item }) => <ProductImage uri={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        viewabilityConfig={viewableConfig.current}
        onViewableItemsChanged={onViewableItemsChanged.current}
      />
      <View style={styles.indicator}>
        <Text style={styles.indicatorText}>
          {activeIndex + 1}/{images?.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  flatlist: {
    position: "relative",
  },
  indicator: {
    position: "absolute",
    width: 35,
    height: 25,
    backgroundColor: colors.backDropDark,
    bottom: 10,
    right: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  indicatorText: {
    color: colors.white,
    fontWeight: "600",
  },
  noImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightGrey,
    borderRadius: 10,
    paddingRight: 10,
  },
  noImageText: {
    fontSize: 16,
    color: colors.primary,
    fontStyle: "italic",
  },
});

export default ImageSlider;
