import { FC } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "@utils/color";

interface Props {}

const BackButton: FC<Props> = (props) => {
  return (
    <View style={styles.container}>
      <Ionicons name="chevron-back" size={18} color={colors.lightred} />
      <Text style={styles.title}>Quay lại</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: colors.lightred,
  },
});

export default BackButton;
