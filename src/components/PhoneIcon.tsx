import { FC } from "react";
import { StyleSheet, Pressable, StyleProp, ViewStyle } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import colors from "@utils/color";

interface Props {
  onPress?(): void;
}

const ChatIcon: FC<Props> = ({ onPress }) => {
  return (
    <Pressable style={[styles.common, styles.messageBtn]} onPress={onPress}>
      <AntDesign name="phone" size={20} color={colors.white} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  common: {
    width: 50,
    height: 50,
    bottom: 80,
    right: 20,
    position: "absolute",
  },
  messageBtn: {
    borderRadius: 25,
    backgroundColor: colors.lightred,
    justifyContent: "center",
    alignItems: "center",
  },
  flex1: {
    flex: 1,
  },
});

export default ChatIcon;
