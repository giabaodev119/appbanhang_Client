import { FC } from "react";
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";
import { AntDesign, FontAwesome6 } from "@expo/vector-icons";
import colors from "@utils/color";

interface Props {
  uri?: string;
  size?: number;
  onPress?(): void;
  style?: StyleProp<ViewStyle>;
  isVip?: boolean; // Thêm thuộc tính isVip
}
const iconContainerFactor = 0.8;
const iconSizeFactor = 0.8;

const AvatarView: FC<Props> = ({ size = 50, uri, onPress, style, isVip }) => {
  const iconContainerSize = size * iconContainerFactor;
  const iconSize = size * iconSizeFactor;

  return (
    <Pressable
      onPress={onPress}
      style={[
        { width: size, height: size, borderRadius: size / 2 },
        styles.container,
        isVip && styles.vipBorder, // Áp dụng viền đặc biệt nếu là VIP
        !uri && styles.profileIcon,
        style,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.flex1} />
      ) : (
        <View
          style={[
            {
              width: iconContainerSize,
              height: iconContainerSize,
              borderRadius: iconContainerSize / 2,
            },
            styles.iconContainer,
          ]}
        >
          <AntDesign name="user" size={iconSize} color={colors.white} />
        </View>
      )}
      {isVip && (
        <View style={styles.crownContainer}>
          <FontAwesome6 name="crown" size={size * 0.25} color={colors.gold} />
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    position: "relative",
  },
  flex1: {
    flex: 1,
  },
  profileIcon: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  vipBorder: {
    borderWidth: 2,
    borderColor: colors.gold,
  },
  crownContainer: {
    position: "absolute",
    top: -5,
    left: "50%",
    transform: [{ translateX: -12.5 }], // Giữa hình
    zIndex: 1,
  },
});

export default AvatarView;
