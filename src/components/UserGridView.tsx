import UserCartAdmin from "@Ui/UserCartAdmin";
import GridViewAdmin from "@views/GridViewAdmin";
import { AdminUser } from "@views/ShowAllUser";
import { FC } from "react";
import { Text, View, StyleSheet } from "react-native";

interface Props {
  data: AdminUser[];
  onPress(item: AdminUser): void;
  onLongPress(item: AdminUser): void; // Thêm sự kiện nhấn giữ
}

const UserGridView: FC<Props> = ({ data, onPress, onLongPress }) => {
  return (
    <GridViewAdmin
      data={data}
      renderItem={(item) => (
        <UserCartAdmin
          user={item}
          onPress={onPress}
          onLongPress={onLongPress} // Truyền hàm nhấn giữ
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {},
});

export default UserGridView;
