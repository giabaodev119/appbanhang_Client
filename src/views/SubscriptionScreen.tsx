import { runAxiosAsync } from "@api/runAxiosAsync";
import AppHeader from "@conponents/AppHeader";
import useAuth from "@hooks/useAuth";
import useClient from "@hooks/useClient";
import { Dimensions, ScrollView, Linking, Alert } from "react-native";
import BackButton from "@Ui/BackBotton";
import React, { FC, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileNavigatorParamList } from "@navigator/ProfileNavigator";
import { useDispatch } from "react-redux";
import { updateAuthState } from "@store/auth";
const plans = [
  {
    name: "HV_1M",
    price: 50000,
    priceInfo:
      "50000/1 tháng. Được nhận ưu đãi hàng tháng nhiều hơn và thời gian đăng bán dài lâu.",
  },
  {
    name: "HV_3M",
    price: 150000,
    priceInfo:
      "150000/3 tháng. Được nhận ưu đãi hàng tháng nhiều hơn và thời gian đăng bán dài lâu.",
  },
  {
    name: "HV_6M",
    price: 280000,
    priceInfo:
      "280000/6 tháng. Được nhận ưu đãi hàng tháng nhiều hơn và thời gian đăng bán dài lâu.",
  },
  {
    name: "HV_12M",
    price: 550000,
    priceInfo:
      "550000/năm. Được nhận ưu đãi hàng tháng nhiều hơn và thời gian đăng bán dài lâu.",
  },
];

type hv = {
  name: string;
  price: number;
  priceInfo: string;
};
type Props = NativeStackScreenProps<
  ProfileNavigatorParamList,
  "SubscriptionScreen"
>;

const SubscriptionScreen: FC<Props> = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState<hv>(plans[0]);
  const [htmlContent, setHtmlContent] = useState<string | any>(null);
  const { authState } = useAuth();
  const dispatch = useDispatch();
  const { authClient } = useClient();
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState({
    amount: plans[0].price,
    bankCode: "VNBANK",
    language: "vn",
    planName: plans[0].name,
    userId: authState.profile?.id,
  });

  const isVip = authState.profile?.premiumStatus?.isAvailable;

  const onSelectedPlan = (plan: hv) => {
    setSelectedPlan(plan);
    setInput({ ...input, amount: plan.price, planName: plan.name });
  };

  const onSubmit = async () => {
    const res = await runAxiosAsync(
      authClient.post("/order/create_payment_url", input)
    );

    if (res && res.url) {
      console.log("Redirecting to:", res.url);

      // Open the URL in the browser
      try {
        await Linking.openURL(res.url);
        // Navigate back to profile view and refresh
        navigation.navigate("Profile");
        navigation.reset({
          index: 0,
          routes: [{ name: "Profile" }],
        });
      } catch (err) {
        console.error("Failed to open URL:", err);
      }
    } else {
      console.error("Invalid URL in response");
    }
  };
  const onCancel = async () => {
    Alert.alert(
      "Confirm Cancellation",
      "Are you sure you want to cancel your subscription?",
      [
        {
          text: "No",
          onPress: () => console.log("Cancellation aborted"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            // Call API to cancel subscription
            const res = await runAxiosAsync(
              authClient.patch("/auth/cancelprenium")
            );

            if (res && res.success) {
              console.log("Subscription canceled");
              dispatch(
                updateAuthState({ profile: res.profile, pending: false })
              );
              navigation.navigate("Profile");
            } else {
              console.error("Failed to cancel subscription");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    if (isVip && authState.profile?.premiumStatus?.subscription) {
      const vipPlan = plans.find(
        (plan) => plan.name === authState.profile?.premiumStatus?.subscription
      );
      if (vipPlan) {
        setSelectedPlan(vipPlan);
      }
    } else {
      setSelectedPlan(plans[0]); // Default to first plan if not VIP
    }
  }, [isVip, authState.profile]);

  return (
    <>
      <AppHeader backButton={<BackButton />} />
      <View style={styles.container}>
        <Text style={styles.header}>Hãy lựa chọn gói hội viên cho bạn</Text>
        <Text style={styles.subHeader}>
          Được ưu tiên đề xuất trên trang chính{"\n"}Thời gian đăng bán lâu hơn gấp 3 lần{"\n"}Không giới hạn bài đăng
          Được ưu tiên đề xuất trên trang chính{"\n"}Thời gian đăng bán lâu hơn
          gấp 3 lần
        </Text>

        {/* Plans */}
        <View style={styles.planContainer}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.name}
              style={[
                styles.planBox,
                selectedPlan.name === plan.name && styles.planBoxSelected,
              ]}
              onPress={() => onSelectedPlan(plan)}
              disabled={isVip}
            >
              <Text
                style={[
                  styles.planTitle,
                  selectedPlan.name === plan.name && styles.planTitleSelected,
                ]}
              >
                {plan.name}
              </Text>
              <Text style={styles.planPrice}>{plan.priceInfo}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          Không tự động gia hạn. Hủy bất cứ lúc nào.
        </Text>
        {isVip ? (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.startTrialButton} onPress={onSubmit}>
            <Text style={styles.startTrialText}>Đăng ký</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.privacyText}>Tìm hiểu thêm chính sách</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
  },
  subHeader: {
    fontSize: 14,
    textAlign: "center",
    color: "#888",
    marginBottom: 20,
  },
  planContainer: {
    marginTop: 15,
    width: "100%",
  },
  planBox: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  planBoxSelected: {
    backgroundColor: "#ffe8f0",
    borderColor: "#ff2d55",
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  planTitleSelected: {
    color: "#ff2d55",
  },
  planPrice: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
    textAlign: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
  startTrialButton: {
    marginTop: 15,
    backgroundColor: "#ff2d55",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  startTrialText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 15,
    backgroundColor: "#ccc",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  cancelText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 16,
  },
  privacyText: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
    marginTop: 15,
    textDecorationLine: "underline",
  },
});

export default SubscriptionScreen;
