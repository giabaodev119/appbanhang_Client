import { AdminUser } from "@views/ShowAllUser";
import { FC } from "react";
import { Text, View, StyleSheet } from "react-native";
import UserGridView from "./UserGridView";

interface Props {
  data: AdminUser[];
  onPress(product: AdminUser): void;
  onLongPress(product: AdminUser): void; // Thêm sự kiện nhấn giữ
}

const ShowUser: FC<Props> = ({ data, onPress, onLongPress }) => {
  return (
    <View style={styles.container}>
      <UserGridView
        data={data}
        onPress={onPress}
        onLongPress={onLongPress} // Truyền hàm nhấn giữ
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
});

export default ShowUser;
