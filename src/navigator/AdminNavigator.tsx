import useAuth from "@hooks/useAuth";
import { FC } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

interface Props {}

const AdminNavigator: FC<Props> = (props) => {
  const { authState, signOut } = useAuth();
  return (
    <View style={styles.container}>
      <Pressable onPress={signOut}>
        <AntDesign name="logout" size={24} color="black" />

        <Text>Admin Logout</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
    flex: 1,
  },
});

export default AdminNavigator;
