import colors from "@utils/color";
import { AdminUser } from "@views/ShowAllUser";
import { FC } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import AvatarView from "./AvatarView";
import { replacedAddress, splitAddress } from "@utils/helper";

interface Props {
  user: AdminUser;
  onPress(item: AdminUser): void;
  onLongPress(item: AdminUser): void; // Thêm sự kiện nhấn giữ
}

const UserCartAdmin: FC<Props> = ({ user, onPress, onLongPress }) => {
  return (
    <Pressable
      onPress={() => onPress(user)}
      onLongPress={() => onLongPress(user)} // Xử lý nhấn giữ
      style={styles.userContainer}
    >
      <AvatarView
        uri={user.avatar}
        size={80}
        onPress={() => {
          console.log(user.avatar);
        }}
      />

      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{user.name}</Text>
          <View
            style={[
              styles.statusContainer,
              user.isActive ? styles.activeStatus : styles.inactiveStatus,
            ]}
          >
            <Text style={styles.statusText}>
              {user.isActive ? "Bình thường" : "Không hoạt động"}
            </Text>
          </View>
        </View>
        <Text style={styles.address}>
          {user.address ? splitAddress(user.address) : "Không có địa chỉ"}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  userContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
    marginBottom: 20,
    marginHorizontal: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
    marginLeft: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  address: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.primary,
    marginTop: 5,
  },
  noImageView: {
    backgroundColor: colors.deActive,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    height: 100,
    width: 100,
  },
  statusContainer: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  activeStatus: {
    backgroundColor: "#d4edda",
  },
  inactiveStatus: {
    backgroundColor: "#f8d7da",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#155724",
  },
});

export default UserCartAdmin;
