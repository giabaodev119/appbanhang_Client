import { FC } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import colors from "@utils/color";

interface Props {
  antIconName: string;
  title: string;
  style?: StyleProp<ViewStyle>;
  active?: boolean;
  onPress?(): void;
}

const ProfileOptionListItem: FC<Props> = ({
  style,
  antIconName,
  title,
  onPress,
  active,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        style,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.buttonContainer}>
        <AntDesign
          name={antIconName as any}
          size={24}
          color={active ? colors.active : colors.primary}
        />
        <Text
          style={[
            styles.title,
            { color: active ? colors.active : colors.primary },
          ]}
        >
          {title}
        </Text>
      </View>
      {active && <View style={styles.indicator} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: colors.backDropDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginVertical: 8,
  },
  pressed: {
    backgroundColor: colors.lightGrey,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.active,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    paddingLeft: 15,
    fontWeight: "500",
  },
});

export default ProfileOptionListItem;
