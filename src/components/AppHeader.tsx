import { useNavigation } from "@react-navigation/native";
import colors from "@utils/color";
import size from "@utils/size";
import { FC } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  ViewStyle,
  StyleProp,
} from "react-native";

interface Props {
  backButton?: JSX.Element | null;
  center?: JSX.Element | null;
  right?: JSX.Element | null;
  style?: StyleProp<ViewStyle>;
}

const AppHeader: FC<Props> = ({ backButton, center, right }) => {
  const { goBack, canGoBack } = useNavigation();
  return (
    <View style={styles.container}>
      {canGoBack() && <Pressable onPress={goBack}>{backButton}</Pressable>}
      {center}
      {right}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: size.padding,
  },
});

export default AppHeader;
