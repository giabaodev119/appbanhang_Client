import colors from "@utils/color";
import React, { FC } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Text,
  StyleProp,
  ViewStyle,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

interface Props {
  asButton?: boolean;
  onPress?(): void;
  onChange?(text: string): void;
  onSubmit?(): void;
  style?: StyleProp<ViewStyle>;
  value?: string;
}

const SearchBar: FC<Props> = ({ asButton, onChange, value, onPress, onSubmit }) => {
  return (
    <View style={styles.container}>
      <Pressable onPress={onPress} style={styles.textInputContainer}>
        {asButton ? (
          <View style={styles.textInput}>
            <Text style={styles.fakePlaceholder}>Tìm kiếm...</Text>
          </View>
        ) : (
          <TextInput
            placeholder="Tìm kiếm..."
            style={[styles.textInput, styles.textInputFont]}
            autoFocus
            onChangeText={onChange}
            value={value}
          />
        )}
      </Pressable>
      <Pressable onPress={onSubmit} style={styles.searchButton}>
        <AntDesign name="search1" size={24} color={colors.primary} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 5,
    borderColor: colors.primary,
    padding: 10,
    alignItems: "center",
  },
  textInputContainer: {
    flex: 1,
    flexDirection: "row",
  },
  textInput: {
    paddingLeft: 10,
    flex: 1,
  },
  textInputFont: {
    color: colors.primary,
    fontSize: 18,
  },
  fakePlaceholder: {
    color: colors.primary,
    fontSize: 18,
    opacity: 0.5,
    fontWeight: "200",
  },
  searchButton: {
    marginLeft: 10,
  },
});

export default SearchBar;