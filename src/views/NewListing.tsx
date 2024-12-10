import { FC, useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Text, StatusBar } from "react-native";
import FormInput from "@Ui/FormInput";
import { FontAwesome5 } from "@expo/vector-icons";
import colors from "@utils/color";
import DatePicker from "@Ui/DatePicker";
import OptionModal from "@conponents/OptionModal";
import AppButton from "@Ui/AppButton";
import CustomKeyAvoidingView from "@Ui/CustomKeyAvoidingView";
import { showMessage } from "react-native-flash-message";
import HorizontalImageList from "@conponents/HorizontailImageList";
import { newProductSchema, yupValidate } from "@utils/validator";
import mime from "mime";
import useClient from "@hooks/useClient";
import { runAxiosAsync } from "@api/runAxiosAsync";
import LoadingSpinner from "@Ui/LoadingSpinner";
import { selectImages } from "@utils/helper";
import CategoryOptions from "@conponents/CategoryOptions";
import ProvinceOptions from "@conponents/ProvinceOptions";
import DistrictOptions from "@conponents/DistrictOptions";

interface Props {}

type tinh = {
  name: string;
  code?: number;
};
const defaultInfo = {
  name: "",
  description: "",
  category: "",
  price: "",
  purchasingDate: new Date(),
  provinceName: "",
  districtName: "",
};

const imageOptions = [{ value: "Remove Image", id: "remove" }];

const NewListing: FC<Props> = (props) => {
  const [productInfo, setProductInfo] = useState({ ...defaultInfo });
  const [tinhInfo, setTinhInfo] = useState<tinh | undefined>(undefined);

  const [showImageOptions, setShowImageOptions] = useState(false);
  const [busy, setBusy] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const { authClient } = useClient();

  const {
    category,
    name,
    description,
    price,
    purchasingDate,
    provinceName,
    districtName,
  } = productInfo;

  const [provinceCode, setProvinceCode] = useState<number | null>();

  const handleChange = (name: string) => (text: string) =>
    setProductInfo({ ...productInfo, [name]: text });

  const handleSubmit = async () => {
    const { error } = await yupValidate(newProductSchema, productInfo);
    if (error) return showMessage({ message: error, type: "danger" });

    setBusy(true);
    const formData = new FormData();
    type productInfoKeys = keyof typeof productInfo;

    for (let key in productInfo) {
      const value = productInfo[key as productInfoKeys];

      if (value instanceof Date) formData.append(key, value.toISOString());
      else formData.append(key, value);
    }
    const newImages = images.map((img, index) => ({
      name: "image_" + index,
      type: mime.getType(img),
      uri: img,
    }));
    for (let img of newImages) {
      formData.append("images", img as any);
    }
    const res = await runAxiosAsync<{ message: string }>(
      authClient.post("/product/list", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    );

    setBusy(false);

    if (res) {
      showMessage({ message: res.message, type: "success" });
      setProductInfo({ ...defaultInfo });
      setImages([]);
    }
  };

  const handleOnImageSelection = async () => {
    const newImages = await selectImages();
    setImages([...images, ...newImages]);
  };
  useEffect(() => {
    if (provinceCode !== undefined) {
      console.log(provinceCode); // Logs the updated value
    }
  }, [provinceCode]);
  return (
    <CustomKeyAvoidingView>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.imagesContainer}>
          <Pressable
            onPress={handleOnImageSelection}
            style={styles.fileSelector}
          >
            <View style={styles.iconContainer}>
              <FontAwesome5 name="images" size={24} color="black" />
            </View>
            <Text style={styles.btnTitle}>Thêm ảnh</Text>
          </Pressable>
          <HorizontalImageList
            images={images}
            onLongPress={(img) => {
              setSelectedImage(img);
              setShowImageOptions(true);
            }}
          />
        </View>
        <FormInput
          value={name}
          placeholder="Tên sản phẩm"
          onChangeText={handleChange("name")}
        />
        <FormInput
          value={price}
          placeholder="Giá"
          onChangeText={handleChange("price")}
          keyboardType="numeric"
        />
        <DatePicker
          title="Ngày mua sản phẩm: "
          value={purchasingDate}
          onChange={(purchasingDate) =>
            setProductInfo({ ...productInfo, purchasingDate })
          }
        />
        <CategoryOptions
          onSelect={handleChange("category")}
          title={category || "Category"}
        />
        <ProvinceOptions
          onSelect={(province: tinh) => {
            setProvinceCode(province.code);
            setTinhInfo(province);
            setProductInfo({ ...productInfo, provinceName: province.name });
          }}
          title={provinceName || "Chọn tỉnh/thành phố bạn muốn bán hàng"}
        />

        <DistrictOptions
          onSelect={handleChange("districtName")}
          title={districtName || "Chọn quận/huyện bạn muốn bán hàng"}
          provinceCode={provinceCode}
        />

        <FormInput
          value={description}
          placeholder="Mô tả"
          multiline
          numberOfLines={4}
          onChangeText={handleChange("description")}
        />
        <AppButton title="Thêm sản phẩm" onPress={handleSubmit} />
        <OptionModal
          visible={showImageOptions}
          onRequestClose={setShowImageOptions}
          options={imageOptions}
          renderItem={(item) => {
            return <Text style={styles.imageOption}>{item.value}</Text>;
          }}
          onPress={(option) => {
            if (option.id === "remove") {
              const newImages = images.filter((img) => img !== selectedImage);
              setImages([...newImages]);
            }
          }}
        />
      </View>
      <LoadingSpinner visible={busy} />
    </CustomKeyAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  imagesContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  btnTitle: {
    color: colors.active,
    marginTop: 8,
    fontWeight: "600",
    fontSize: 14,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
    borderWidth: 1.5,
    borderColor: colors.active,
    borderRadius: 10,
    backgroundColor: colors.white, // Nền trắng cho nổi bật
    shadowColor: colors.backDropDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // Hiệu ứng nổi trên Android
  },
  fileSelector: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  selectedImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginLeft: 5,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  imageOption: {
    fontWeight: "500",
    fontSize: 16,
    color: colors.textMessage,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderColor,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: colors.textMessage,
    marginBottom: 15,
  },
  button: {
    backgroundColor: colors.active,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default NewListing;
