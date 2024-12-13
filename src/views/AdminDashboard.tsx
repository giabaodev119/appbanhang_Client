import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { runAxiosAsync } from "@api/runAxiosAsync";
import useClient from "@hooks/useClient";
import useAuth from "@hooks/useAuth";
import SignOutButton from "@conponents/SignOutButton";
import colors from "@utils/color";
import { BarChart } from "react-native-chart-kit"; // Import BarChart

export type AdminUser = {
  id: string;
  isAdmin: boolean;
  isActive: boolean;
};

export type ProductAdmin = {
  id: string;
  isActive: boolean;
};

const AdminDashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [activeUser, setActiveUser] = useState(0);
  const [inactiveUser, setInactiveUser] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [activeProducts, setActiveProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { authClient } = useClient();
  const { signOut } = useAuth();

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // Fetch số lượng người dùng
      const userRes = await runAxiosAsync<{ data: AdminUser[] }>(
        authClient.get("/admin/user-listing")
      );
      if (userRes?.data) {
        const users = userRes.data.filter((user) => !user.isAdmin); // Loại bỏ admin
        const activeUsers = users.filter((user) => user.isActive).length; // Đếm tài khoản hoạt động
        const inactiveUsers = users.length - activeUsers; // Tính tài khoản không hoạt động
        setUserCount(users.length);
        setActiveUser(activeUsers);
        setInactiveUser(inactiveUsers);
      }

      // Fetch thống kê sản phẩm
      const productRes = await runAxiosAsync<{ data: ProductAdmin[] }>(
        authClient.get("/admin/listings")
      );
      if (productRes?.data) {
        setTotalProducts(productRes.data.length);
        setActiveProducts(
          productRes.data.filter((product) => product.isActive).length
        );
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStatistics();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const inactiveProducts = totalProducts - activeProducts;

  // Cấu hình biểu đồ
  const chartConfig = {
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Bảng điều khiển quản trị</Text>
        <SignOutButton onPress={signOut} />
      </View>

      {/* Thống kê tài khoản */}
      <View style={styles.statisticsContainer}>
        <Text style={styles.statisticsText}>
          Tổng số tài khoản đã đăng ký: {userCount}
        </Text>
        <Text style={styles.statisticsText}>
          Tài khoản đang hoạt động: {activeUser}
        </Text>
        <Text style={styles.statisticsText}>
          Tài khoản không hoạt động: {inactiveUser}
        </Text>
      </View>

      {/* Biểu đồ tài khoản */}
      <View style={styles.chartContainer}>
        <BarChart
          data={{
            labels: ["Hoạt động", "Không hoạt động"],
            datasets: [
              {
                data: [activeUser, inactiveUser],
                color: (opacity = 1) => `rgba(34, 193, 195, ${opacity})`,
                strokeWidth: 2,
              },
            ],
          }}
          width={320}
          height={220}
          chartConfig={chartConfig}
          yAxisLabel={"Tài khoản: "}
          yAxisSuffix={" người"}
        />
      </View>

      {/* Thống kê sản phẩm */}
      <View style={styles.statisticsContainer}>
        <Text style={styles.statisticsText}>
          Tổng số sản phẩm: {totalProducts}
        </Text>
        <Text style={styles.statisticsText}>
          Sản phẩm đang hoạt động: {activeProducts}
        </Text>
        <Text style={styles.statisticsText}>
          Sản phẩm đã bị khóa: {inactiveProducts}
        </Text>
      </View>

      {/* Biểu đồ sản phẩm */}
      <View style={styles.chartContainer}>
        <BarChart
          data={{
            labels: ["Hoạt động", "Không hoạt động"],
            datasets: [
              {
                data: [activeProducts, inactiveProducts],
                color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                strokeWidth: 2,
              },
            ],
          }}
          width={320}
          height={220}
          chartConfig={chartConfig}
          yAxisLabel={"Sản phẩm: "}
          yAxisSuffix={" cái"}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.white },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontWeight: "600", color: colors.primary, fontSize: 20 },
  statisticsContainer: {
    marginVertical: 10,
    padding: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  statisticsText: { fontSize: 16, fontWeight: "500", color: colors.white },
  chartContainer: {
    marginVertical: 10,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 1,
  },
});

export default AdminDashboard;
