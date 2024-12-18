import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import AppNavigator from "./AppNavigator";
import { AntDesign } from "@expo/vector-icons";
import NewListing from "@views/NewListing";
import ProfileNavigator from "./ProfileNavigator";
import { showMessage } from "react-native-flash-message";
import useAuth from "@hooks/useAuth";

const Tab = createBottomTabNavigator();
const getOptions = (iconName: string): BottomTabNavigationOptions => {
  return {
    tabBarIcon({ color, size }) {
      return <AntDesign name={iconName as any} size={size} color={color} />;
    },
    title: "",
  };
};

const TabNavigator = () => {
  const { authState } = useAuth(); // Lấy thông tin xác thực người dùng
  const isVerified = authState.profile?.verified;

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="HomeNavigator"
        component={AppNavigator}
        options={getOptions("home")}
      />
      <Tab.Screen
        name="NewListing"
        component={NewListing}
        options={getOptions("pluscircleo")}
        listeners={{
          tabPress: (e) => {
            if (!isVerified) {
              e.preventDefault(); // Ngăn chặn điều hướng
              showMessage({
                message: "Bạn phải xác thực tài khoản trước khi đăng sản phẩm!",
                type: "warning",
              });
            }
          },
        }}
      />
      <Tab.Screen
        name="ProfileNavigator"
        component={ProfileNavigator}
        options={getOptions("user")}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
