import { FC } from "react";
import { Text, View, StyleSheet } from "react-native";
import AvatarView from "./AvatarView";
import colors from "@utils/color";

interface Props {
  name: string;
  avatar?: string;
}

const PeerProfile: FC<Props> = ({ name, avatar }) => {
  return (
    <View style={styles.container}>
      <AvatarView size={40} uri={avatar} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    flexDirection: "column",
    paddingLeft: 10,
  },
  name: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  phoneNumber: {
    color: colors.primary, // Add a secondary color for contrast
    fontSize: 14,
    fontWeight: "400",
    marginTop: 2,
  },
});

export default PeerProfile;
