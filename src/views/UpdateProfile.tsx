import AppHeader from "@conponents/AppHeader";
import { ProfileNavigatorParamList } from "@navigator/ProfileNavigator";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import BackButton from "@Ui/BackBotton";
import colors from "@utils/color";
import size from "@utils/size";
import React, { useState } from "react";
import { FC } from "react";
import { View, StyleSheet, ScrollView, Text, Pressable } from "react-native";
import FormInput from "@Ui/FormInput";
import useClient from "@hooks/useClient";
import { runAxiosAsync } from "@api/runAxiosAsync";
import { selectImages } from "@utils/helper";
import AppButton from "@Ui/AppButton";
import { profileSchema, yupValidate } from "@utils/validator";
import * as yup from "yup";
import { showMessage } from "react-native-flash-message";
import mime from "mime";
import LoadingSpinner from "@Ui/LoadingSpinner";
import AvatarView from "@Ui/AvatarView";
import useAuth from "@hooks/useAuth";
import { updateAuthState } from "@store/auth";
import { useDispatch } from "react-redux";
import ProvinceOptions from "@conponents/ProvinceOptions";
import DistrictOptions from "@conponents/DistrictOptions";

type Props = NativeStackScreenProps<ProfileNavigatorParamList, "UpdateProfile">;

type tinh = {
  name: string;
  code?: number;
};
const defaultInfo = {
  name: "",
  provinceName: "",
  districtName: "",
};

const UpdateProfile: FC<Props> = ({ navigation }) => {
  const { authState } = useAuth();
  const { profile } = authState;
  const [userName, setUserName] = useState(profile?.name || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [avatar, setAvatar] = useState(profile?.avatar || "");
  const [address, setAddress] = useState(profile?.address || ""); // New state variable for address
  const [busy, setBusy] = useState(false);
  const { authClient } = useClient();
  const dispatch = useDispatch();
  const [city, setCity] = useState(profile?.address?.split("_")[0] || "");
  const [district, setDistrict] = useState(
    profile?.address?.split("_")[1] || ""
  );
  const [provinceCode, setProvinceCode] = useState<number>(); // For filtering districts

  const handleProfileImageSelection = async () => {
    const [image] = await selectImages({
      allowsMultipleSelection: false,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (image) {
      setAvatar(image);
    }
  };
  

  const handleProfileInformation = async () => {
    const dataToUpdate = { name: userName, provinceName: city, districtName: district };
    
    
    const { error } = await yupValidate(profileSchema, dataToUpdate);
    if (error) return showMessage({ message: error, type: "danger" });

    const formData = new FormData();
    formData.append("name", userName);
    formData.append("provinceName", city);
    formData.append("districtName", district);

    setBusy(true);
    const res = await runAxiosAsync<{ profile: typeof profile }>(
      authClient.patch("/auth/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    );
    setBusy(false);
    if (res) {
      showMessage({ message: "Profile updated successfully", type: "success" });
      dispatch(updateAuthState({ profile: res.profile, pending: false }));
      navigation.goBack();
    }
  };

  const handleAvatarUpdate = async () => {
    if (avatar) {

      const formData = new FormData();
      formData.append("avatar", {
        name: "Avatar",
        uri: avatar,
        type: mime.getType(avatar),
      } as any);

      setBusy(true);
      const res = await runAxiosAsync<{ profile: typeof profile }>(
        authClient.patch("/auth/update-avatar", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      );
      setBusy(false);
      if (res) {
        showMessage({ message: "Avatar updated successfully", type: "success" });
        dispatch(updateAuthState({ profile: res.profile, pending: false }));
      }
    }
  };
  //combine handle handleProfileInformation  and handle avatar update
  const handleOnSubmit = async () => {
    await handleProfileInformation();
    if (avatar !== profile?.avatar){

      await handleAvatarUpdate();
    }
  };

  

  return (
    <>
      <AppHeader backButton={<BackButton />} />
      <View style={styles.container}>
        <ScrollView >
          <Text style={styles.title}>Update Profile</Text>
          <AvatarView
            uri={avatar}
            size={80}
            onPress={handleProfileImageSelection}
          />
          <FormInput
            placeholder="Name"
            value={userName}
            onChangeText={(name) => setUserName(name)}
          />
          <FormInput         
            placeholder="Email"
            value={email}
            // Disable email input
            editable={false}
          />
          
          <ProvinceOptions
            onSelect={(province: tinh) => {
              setProvinceCode(province.code);
              setCity(province.name);
              setDistrict(""); // Reset district when the city changes
            }}
            title={city || "Chọn tỉnh/thành phố"}
          />
          <DistrictOptions
            onSelect={(selectedDistrict) => {
              setDistrict(selectedDistrict);
            }}
            title={district || "Chọn quận/huyện"}
            provinceCode={provinceCode} // Filter districts by selected province
          />
          <AppButton title="Update Profile" onPress={handleOnSubmit} />
        </ScrollView>
      </View>
      <LoadingSpinner visible={busy} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: size.padding,
  },
  title: {
    fontWeight: "600",
    textAlign: "center",
    fontSize: 24,
    color: colors.primary,
    marginBottom: 10,
  },
  input: {
    marginVertical: 10, // Vertical spacing between inputs
  },
  button: {
    marginTop: 20, // Space above the button
  },
  avatar: {
    marginBottom: 20, // Space below the avatar
  },
});

export default UpdateProfile;
