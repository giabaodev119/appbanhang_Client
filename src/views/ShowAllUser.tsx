import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { runAxiosAsync } from "@api/runAxiosAsync";
import useClient from "@hooks/useClient";
import colors from "@utils/color";
import ShowUser from "@conponents/ShowUser";
import EmptyView from "./EmptyView";
import useAuth from "@hooks/useAuth";
import SignOutButton from "@conponents/SignOutButton";

export type AdminUser = {
  id: string;
  avatar?: string;
  name: string;
  email: string;
  address: string;
  isActive: boolean;
  isAdmin: boolean;
};

const ShowAllUser = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const { authState, signOut } = useAuth();
  const [loading, setLoading] = useState(false); // Thêm trạng thái tải
  const { authClient } = useClient();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await runAxiosAsync<{ data: AdminUser[] }>(
        authClient.get("/admin/user-listing")
      );
      if (res?.data) {
        setUsers(res.data.filter((user) => !user.isAdmin));
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleLongPress = (user: AdminUser) => {
    const newStatus = !user.isActive;
    const statusText = newStatus ? "mở khóa" : "khóa";

    Alert.alert(
      "Xác nhận",
      `Bạn có muốn ${statusText} tài khoản "${user.name}" không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Có",
          onPress: async () => {
            try {
              const res = await runAxiosAsync(
                authClient.patch(`/admin/check-user-active/${user.id}`, {
                  isActive: newStatus,
                })
              );
              if (res) {
                setUsers((prev) =>
                  prev.map((item) =>
                    item.id === user.id
                      ? { ...item, isActive: newStatus }
                      : item
                  )
                );
              }
            } catch (error) {
              Alert.alert("Lỗi", "Không thể thay đổi trạng thái tài khoản");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} />;
  }

  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Danh sách tài khoản</Text>
        <SignOutButton onPress={signOut} />
      </View>
      {users.length > 0 ? (
        <ScrollView style={styles.container}>
          <ShowUser
            data={users}
            onPress={() => {}}
            onLongPress={handleLongPress}
          />
        </ScrollView>
      ) : (
        <EmptyView title="Không có người dùng" />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Thêm thuộc tính này để căn hai đầu
    paddingTop: 15,
    paddingHorizontal: 16, // Thêm padding ngang để căn đều
    marginBottom: 5,
  },
  title: {
    fontWeight: "600",
    color: colors.primary,
    fontSize: 20,
    letterSpacing: 0.5,
  },
});

export default ShowAllUser;
