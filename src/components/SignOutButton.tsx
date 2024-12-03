import React, { FC } from "react";
import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { AntDesign } from "@expo/vector-icons";

interface Props {
  onPress?(): void; // Hàm xử lý khi bấm vào nút
  style?: StyleProp<ViewStyle>;
}

const SignOutButton: FC<Props> = ({ onPress, style }) => {
  return (
    <Pressable onPress={onPress} style={[styles.button]}>
      <AntDesign name="logout" size={20} color="#000" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row", // Đặt icon và text nằm ngang
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#FFFFFF", // Màu nền trắng
    borderWidth: 1, // Viền
    borderColor: "#CCCCCC", // Màu viền
    shadowColor: "#000", // Hiệu ứng bóng
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default SignOutButton;
