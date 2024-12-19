import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AntDesign } from "@expo/vector-icons";
import AppNavigator from "./AppNavigator";
import NewListing from "@views/NewListing";
import ProfileNavigator from "./ProfileNavigator";
import colors from "@utils/color";

const Tab = createBottomTabNavigator();

// Định nghĩa lại kiểu `onPress` để nhận event
interface CustomTabButtonProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
}

// Custom Button cho tab giữa
// Custom Button cho tab giữa
const CustomTabButton: React.FC<CustomTabButtonProps> = ({
  children,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.customButton}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.buttonContainer}>{children}</View>
  </TouchableOpacity>
);

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBarStyle,
        tabBarLabelStyle: styles.tabBarLabelStyle,
      }}
    >
      {/* Tab Home */}
      <Tab.Screen
        name="HomeNavigator"
        component={AppNavigator}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                color: focused ? colors.lightred : colors.primary,
                fontWeight: "bold",
                fontSize: 12,
                marginBottom: 5,
              }}
            >
              Trang chủ
            </Text>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <AntDesign
              name="home"
              size={size}
              color={focused ? colors.lightred : colors.primary}
            />
          ),
        }}
      />

      {/* Tab Đăng Tin */}
      <Tab.Screen
        name="NewListing"
        component={NewListing}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                color: colors.white,
                fontWeight: "bold",
                fontSize: 12,
                marginBottom: 5,
              }}
            >
              Đăng tin
            </Text>
          ),
          tabBarIcon: ({ size }) => (
            <AntDesign name="edit" size={size} color="white" />
          ),
          tabBarButton: (props) => <CustomTabButton {...props} />,
          tabBarLabelStyle: {
            color: colors.lightred,
            fontWeight: "bold",
          },
        }}
      />

      {/* Tab Profile */}
      <Tab.Screen
        name="ProfileNavigator"
        component={ProfileNavigator}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                color: focused ? colors.lightred : colors.primary,
                fontWeight: "bold",
                fontSize: 12,
                marginBottom: 5,
              }}
            >
              Hồ sơ
            </Text>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <AntDesign
              name="user"
              size={size}
              color={focused ? colors.lightred : colors.primary}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Styles
const styles = StyleSheet.create({
  tabBarStyle: {
    height: 60,
    position: "absolute",
    borderTopWidth: 0,
    backgroundColor: "white",
    elevation: 5,
  },
  tabBarLabelStyle: {
    fontSize: 12, // Kích thước chữ
    marginBottom: 5, // Khoảng cách giữa chữ và icon
    fontWeight: "bold",
  },
  customButton: {
    top: -10, // Giảm độ nâng nút xuống
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.lightred,
    shadowColor: colors.lightred,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lightred,
  },
});

export default TabNavigator;
