import React, { FC, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  RefreshControl,
} from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { AntDesign } from "@expo/vector-icons";
import { showMessage } from "react-native-flash-message";
import mime from "mime";
import useAuth from "@hooks/useAuth";
import useClient from "@hooks/useClient";
import { runAxiosAsync } from "@api/runAxiosAsync";
import { updateAuthState } from "@store/auth";
import {
  getUnreadChatsCount,
  addNewActiveChats,
  ActiveChat,
} from "@store/chats";
import { ProfileNavigatorParamList } from "@navigator/ProfileNavigator";
import AvatarView from "@Ui/AvatarView";
import FormDivider from "@Ui/FormDivider";
import ProfileOptionListItem from "@conponents/ProfileOptionListItem";
import colors from "@utils/color";
import size from "@utils/size";
import { selectImages } from "@utils/helper";
import LoadingModal from "@Ui/LoadingSpinner";
import { ProfileRes } from "@navigator/index";

interface Props {}
const Profile: FC<Props> = (props) => {
  const { navigate } =
    useNavigation<NavigationProp<ProfileNavigatorParamList>>();
  const { authState, signOut } = useAuth();
  const { profile } = authState;
  const [busy, setBusy] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { authClient } = useClient();
  const dispatch = useDispatch();
  const totalUnreadMessages = useSelector(getUnreadChatsCount);

  const onMessagePress = () => {
    navigate("Chats");
  };
  const onListingPress = () => {
    navigate("Listings");
  };
  const onUpdateProfilePress = () => {
    navigate("UpdateProfile");
  };
  const fetchProfile = async () => {
    setRefreshing(true);
    const res = await runAxiosAsync<{ profile: ProfileRes }>(
      authClient.get("/auth/profile")
    );
    setRefreshing(false);
    if (res) {
      dispatch(
        updateAuthState({
          profile: { ...profile!, ...res.profile },
          pending: false,
        })
      );
    }
  };
  const fetchLastChats = async () => {
    const res = await runAxiosAsync<{ chats: ActiveChat[] }>(
      authClient("/conversation/last-chats")
    );

    if (res) {
      dispatch(addNewActiveChats(res.chats));
    }
  };

  const getVerificationLink = async () => {
    setBusy(true);
    const res = await runAxiosAsync<{ message: string }>(
      authClient.get("/auth/verify-token")
    );
    setBusy(false);
    if (res) {
      showMessage({ message: res.message, type: "success" });
    }
  };
  const handleProfileImageSelection = async () => {
    const [image] = await selectImages({
      allowsMultipleSelection: false,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (image) {
      const formData = new FormData();
      formData.append("avatar", {
        name: "Avatar",
        uri: image,
        type: mime.getType(image),
      } as any);
      setUpdatingAvatar(true);
      const res = await runAxiosAsync<ProfileRes>(
        authClient.patch("/auth/update-avatar", formData)
      );
      setUpdatingAvatar(false);
      if (res) {
        dispatch(
          updateAuthState({
            profile: { ...profile!, ...res.profile },
            pending: false,
          })
        );
      }
    }
  };

  useEffect(() => {
    const handleApiRequest = async () => {
      await fetchLastChats();
    };
    handleApiRequest();
  }, []);
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchProfile} />
      }
      contentContainerStyle={styles.container}
    >
      {!profile?.verified && (
        <View style={styles.verificationLinkContainer}>
          <Text style={styles.verificationTitle}>
            Tài khoản của bạn có vẻ như chưa được xác thực
          </Text>
          {busy ? (
            <Text style={styles.verificationLink}>Hãy đợi...</Text>
          ) : (
            <Text onPress={getVerificationLink} style={styles.verificationLink}>
              Bấm vào đây để xác thực
            </Text>
          )}
        </View>
      )}
      <View style={styles.profileContainer}>
        <AvatarView
          uri={authState.profile?.avatar}
          size={80}
          onPress={handleProfileImageSelection}
        />
        <View style={styles.profileInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{profile?.name}</Text>
            <Pressable onPress={onUpdateProfilePress}>
              <AntDesign name="edit" size={24} color={colors.primary} />
            </Pressable>
          </View>
          <Text style={styles.email}>{profile?.email}</Text>
        </View>
      </View>
      <FormDivider />
      <ProfileOptionListItem
        style={styles.marginBottom}
        antIconName="message1"
        title="Tin nhắn"
        onPress={onMessagePress}
        active={totalUnreadMessages > 0}
      />
      <ProfileOptionListItem
        style={styles.marginBottom}
        antIconName="appstore-o"
        title="Sản phẩm của bạn"
        onPress={onListingPress}
      />
      <ProfileOptionListItem
        antIconName="logout"
        title="Đăng xuất"
        onPress={signOut}
      />
      <LoadingModal visible={updatingAvatar} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  verificationLinkContainer: {
    padding: 15,
    backgroundColor: colors.deActive,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: colors.backDropDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  verificationTitle: {
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
    fontSize: 16,
  },
  verificationLink: {
    fontWeight: "700",
    color: colors.active,
    textAlign: "center",
    paddingTop: 8,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  container: {
    padding: size.padding,
    flex: 1,
    backgroundColor: colors.lightGrey,
  },
  marginBottom: {
    marginBottom: 20,
  },
  name: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "bold",
  },
  email: {
    color: colors.textMessage,
    paddingTop: 4,
    fontSize: 14,
    fontStyle: "italic",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 10,
    shadowColor: colors.backDropDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  profileInfo: {
    flex: 1,
    paddingLeft: size.padding,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 12,
    shadowColor: colors.backDropDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  optionIcon: {
    marginRight: 10,
    color: colors.primary,
  },
});

export default Profile;
