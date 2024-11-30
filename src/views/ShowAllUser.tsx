import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useDispatch } from "react-redux"; // Nếu cần
import { runAxiosAsync } from "@api/runAxiosAsync";
import useClient from "@hooks/useClient";
import colors from "@utils/color";
import ShowUser from "@conponents/ShowUser";

export type AdminUser = {
  id: string;
  avatar?: string;
  name: string;
  email: string;
  address: string;
  isActive: boolean;
};

const ShowAllUser = () => {
  const [users, setUsers] = useState<AdminUser[]>([]); // Danh sách tài khoản
  const { authClient } = useClient();
  const dispatch = useDispatch(); // Nếu có kế hoạch sử dụng Redux

  // Hàm fetch danh sách tài khoản
  const fetchUsers = async () => {
    const res = await runAxiosAsync<{ data: AdminUser[] }>(
      authClient.get("/admin/user-listing")
    );
    if (res?.data) {
      setUsers(res.data);
    }
  };

  // Hàm xử lý nhấn giữ để thay đổi trạng thái
  const handleLongPress = (user: AdminUser) => {
    const newStatus = !user.isActive;
    const statusText = newStatus ? "mở khóa" : "khóa";

    Alert.alert(
      "Xác nhận",
      `Bạn có muốn ${statusText} tài khoản "${user.name}" không?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Có",
          onPress: async () => {
            const res = await runAxiosAsync(
              authClient.patch(`/admin/check-user-active/${user.id}`, {
                isActive: newStatus,
              })
            );
            if (res) {
              // Cập nhật trạng thái mới vào danh sách tài khoản
              setUsers((prev) =>
                prev.map((item) =>
                  item.id === user.id ? { ...item, isActive: newStatus } : item
                )
              );
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Danh sách tài khoản</Text>
      </View>
      <ScrollView style={styles.container}>
        <ShowUser
          data={users}
          onPress={(user) => console.log("Nhấn vào:", user.name)}
          onLongPress={handleLongPress}
        />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    paddingTop: 15,
    marginLeft: 12,
    marginBottom: 5,
  },
  title: {
    fontWeight: "600",
    color: colors.primary,
    fontSize: 20,
    marginBottom: 15,
    letterSpacing: 0.5,
  },
});

export default ShowAllUser;
