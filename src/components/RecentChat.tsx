import AvatarView from "@Ui/AvatarView";
import colors from "@utils/color";
import { formatDate } from "@utils/date";
import size from "@utils/size";
import { FC } from "react";
import { Text, View, StyleSheet, Dimensions } from "react-native";

interface Props {
  avatar?: string;
  name: string;
  timestamp: string;
  lastMessage: string;
  unreadMessageCount: number;
}

const { width } = Dimensions.get("window");

const profileImageSize = 50;
const itemWidth = width - size.padding * 2;
const separatorWidth = width - profileImageSize - size.padding * 3;

const RecentChat: FC<Props> = ({
  avatar,
  name,
  timestamp,
  lastMessage,
  unreadMessageCount,
}) => {
  const showNotification = unreadMessageCount > 0;
  return (
    <View style={styles.container}>
      <AvatarView uri={avatar} size={profileImageSize} />
      <View style={styles.chatInfo}>
        <View style={styles.flexJustifyBetween}>
          <View style={styles.flex1}>
            <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
              {name}
            </Text>
          </View>
          <Text
            style={showNotification ? styles.activeText : styles.inActiveText}
          >
            {formatDate(timestamp)}
          </Text>
        </View>
        <View style={styles.flexJustifyBetween}>
          <View style={styles.flex1}>
            <Text
              style={styles.commonText}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {lastMessage}
            </Text>
          </View>
          {showNotification ? (
            <View style={styles.msgIndicator}>
              <Text style={styles.msgIndicatorCount}>{unreadMessageCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: itemWidth,
    paddingVertical: 10,
    backgroundColor: colors.white, // Nền sáng
    borderRadius: 8, // Góc bo mềm mại
    shadowColor: colors.backDropDark, // Hiệu ứng bóng
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Hiệu ứng nổi trên Android
    marginVertical: 5,
  },
  chatInfo: {
    width: itemWidth - profileImageSize - size.padding,
    paddingLeft: size.padding,
  },
  name: {
    fontWeight: "600",
    fontSize: 16,
    color: colors.primary,
    paddingRight: size.padding,
  },
  commonText: {
    fontSize: 14,
    color: colors.textMessage, // Tông xám đậm để rõ hơn
  },
  flexJustifyBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  flex1: {
    flex: 1,
  },
  msgIndicatorCount: {
    fontSize: 12,
    color: colors.white,
    fontWeight: "600",
  },
  msgIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.active,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.active, // Hiệu ứng ánh sáng cho vòng tròn
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  activeText: {
    fontSize: 12,
    color: colors.active,
    fontWeight: "500",
  },
  inActiveText: {
    fontSize: 12,
    color: colors.deActive, // Tông xám nhạt hơn
  },
  separator: {
    width: separatorWidth,
    backgroundColor: colors.borderColor,
    height: 0.5,
    alignSelf: "flex-end",
    marginVertical: 10,
    borderRadius: 1, // Đường phân cách mềm mại hơn
  },
});

export default RecentChat;
