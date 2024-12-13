import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FC } from "react";
import Profile from "@views/Profile";
import Chats from "@views/Chats";
import Listings from "@views/Listings";
import SingleProduct from "@views/SingleProduct";
import ChatWindow from "@views/ChatWindow";
import EditProduct, { Product } from "@views/EditProduct";
import UpdateProfile from "@views/UpdateProfile";
import SubscriptionScreen from "@views/SubscriptionScreen";

export type ProfileNavigatorParamList = {
  Profile: undefined;
  Chats: undefined;
  Listings: undefined;
  UpdateProfile: undefined;
  SingleProduct: { product?: Product; id?: string };
  EditProduct: { product: Product };
  ChatWindow: {
    conversationId: string;
    peerProfile: { id: string; name: string; avatar?: string };
  };
  SubscriptionScreen:undefined;
};
const Stack = createNativeStackNavigator<ProfileNavigatorParamList>();

interface Props {}

const ProfileNavigator: FC<Props> = (props) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Chats" component={Chats} />
      <Stack.Screen name="Listings" component={Listings} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
      <Stack.Screen name="SingleProduct" component={SingleProduct} />
      <Stack.Screen name="ChatWindow" component={ChatWindow} />
      <Stack.Screen name="EditProduct" component={EditProduct} />
      <Stack.Screen name="SubscriptionScreen" component={SubscriptionScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {},
});

export default ProfileNavigator;
