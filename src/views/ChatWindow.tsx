import { runAxiosAsync } from "@api/runAxiosAsync";
import AppHeader from "@conponents/AppHeader";
import useAuth from "@hooks/useAuth";
import useClient from "@hooks/useClient";
import { AppStackParamList } from "@navigator/AppNavigator";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  addConversation,
  Conversation,
  selectConversationById,
  updateConversation,
} from "@store/conversation";
import BackButton from "@Ui/BackBotton";
import EmptyChatContainer from "@Ui/EmptyChatContainer";
import PeerProfile from "@Ui/PeerProfile";
import { FC, useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Button, Image } from "react-native";
import {
  GiftedChat,
  IMessage,
  InputToolbar,
  MessageImageProps,
} from "react-native-gifted-chat";
import { useDispatch, useSelector } from "react-redux";
import socket, { NewMessageResponse } from "src/socket";
import EmptyView from "./EmptyView";
import { useFocusEffect } from "@react-navigation/native";
import { updateActiveChat } from "@store/chats";
import { selectImages } from "@utils/helper";
import mime from "mime";

type Props = NativeStackScreenProps<AppStackParamList, "ChatWindow">;

type OutGoingImageMessage = {
  message: {
    id: string;
    time: string;
    text: string;
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
  };
  to: string;
  conversationId: string;
};

const getTime = (value: IMessage["createdAt"]) => {
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
};

const formatConversationToIMessage = (value?: Conversation): IMessage[] => {
  const formattedValues = value?.chats.map((chat) => {
    return {
      _id: chat.id,
      text: chat.text,
      createdAt: new Date(chat.time),
      received: chat.viewed,
      user: {
        _id: chat.user.id,
        name: chat.user.name,
        avatar: chat.user.avatar,
      },
      image: chat.text.startsWith("http") ? chat.text : undefined, // Check if the message is an image
    };
  });

  const message = formattedValues || [];

  return message.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

let timeoutId: NodeJS.Timeout | null;
const TYPING_TIMEOUT = 2000;

const ChatWindow: FC<Props> = ({ route }) => {
  const { authState } = useAuth();
  const { conversationId, peerProfile } = route.params;
  const conversation = useSelector(selectConversationById(conversationId));
  const dispatch = useDispatch();
  const { authClient } = useClient();
  const [fetchingChats, setFetchingChats] = useState(false);
  const [typing, setTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const profile = authState.profile;

  const handleOnMessageSend = (messages: IMessage[]) => {
    if (!profile) return;
    const currentMessage = messages[messages.length - 1];

    const newMessage = {
      message: {
        id: currentMessage._id.toString(),
        text: currentMessage.text,
        time: getTime(currentMessage.createdAt),
        user: {
          id: profile.id,
          name: profile.name,
          avatar: profile.avatar,
        },
      },
      conversationId,
      to: peerProfile.id,
    };

    dispatch(
      updateConversation({
        conversationId,
        chat: { ...newMessage.message, viewed: false },
        peerProfile,
      })
    );

    dispatch(
      updateActiveChat({
        id: conversationId,
        lastMessage: newMessage.message.text,
        peerProfile,
        timestamp: newMessage.message.time,
        unreadChatCounts: 0,
      })
    );

    socket.emit("chat:new", newMessage);
  };

  const handleOnImageSend = (imageMessage: IMessage) => {
    if (!profile) return;
    const newImageMessage: OutGoingImageMessage = {
      message: {
        id: imageMessage._id.toString(),
        text: imageMessage.text,
        time: getTime(imageMessage.createdAt),
        user: {
          id: profile.id,
          name: profile.name,
          avatar: profile.avatar,
        },
      },
      conversationId,
      to: peerProfile.id,
    };

    dispatch(
      updateConversation({
        conversationId,
        chat: { ...newImageMessage.message, viewed: false },
        peerProfile,
      })
    );

    dispatch(
      updateActiveChat({
        id: conversationId,
        lastMessage: newImageMessage.message.text,
        peerProfile,
        timestamp: newImageMessage.message.time,
        unreadChatCounts: 0,
      })
    );

    socket.emit("chat:image", newImageMessage);
  };

  const handleImageUpload = async () => {
    if (!profile) return;
    const [image] = await selectImages({
      allowsMultipleSelection: false,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (image) {
      setSelectedImage(image);

      const imageMessage: IMessage = {
        _id: new Date().getTime().toString(),
        text: image, // Assuming the image URI is used as the message text
        createdAt: new Date(),
        user: {
          _id: profile.id,
          name: profile.name,
          avatar: profile.avatar,
        },
        image, // Add the image URI to the message
      };

      const formData = new FormData();
      formData.append("image", {
        name: "Image",
        uri: image,
        type: mime.getType(image),
      } as any);

      const response = await runAxiosAsync<{
        image: { url: string; id: string };
      }>(
        authClient.post(
          `/conversation/${conversationId}/upload-image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
      );

      if (response?.image?.url) {
        const updatedImageMessage = {
          ...imageMessage,
          text: response.image.url, // Update the message text with the image URL
          image: response.image.url, // Update the image property with the image URL
        };

        handleOnImageSend(updatedImageMessage);
      }
    }
  };

  const emitTypingEnd = (timeout: number) => {
    return setTimeout(() => {
      socket.emit("chat:typing", { active: false, to: peerProfile.id });
      timeoutId = null;
    }, timeout);
  };

  const handleOnInputChange = () => {
    if (timeoutId) {
      timeoutId = emitTypingEnd(TYPING_TIMEOUT);
    } else {
      socket.emit("chat:typing", { active: true, to: peerProfile.id });
      timeoutId = emitTypingEnd(TYPING_TIMEOUT);
    }
  };

  const fetchOldChats = async () => {
    setFetchingChats(true);
    const res = await runAxiosAsync<{ conversation: Conversation }>(
      authClient("/conversation/chats/" + conversationId)
    );
    setFetchingChats(false);

    if (res?.conversation) {
      dispatch(addConversation([res.conversation]));
    }
  };

  const sendSeenRequest = () => {
    runAxiosAsync(
      authClient.patch(`/conversation/seen/${conversationId}/${peerProfile.id}`)
    );
  };

  useEffect(() => {
    const handleApiRequest = async () => {
      await fetchOldChats();
      await sendSeenRequest();
    };
    handleApiRequest();
  }, []);

  const updateTypingStatus = (data: { typing: boolean }) => {
    setTyping(data.typing);
  };

  useFocusEffect(
    useCallback(() => {
      const updateSeenStatus = (data: NewMessageResponse) => {
        socket.emit("chat:seen", {
          messageId: data.message.id,
          conversationId,
          peerId: peerProfile.id,
        });
      };
      socket.on("chat:message", updateSeenStatus);
      socket.on("chat:typing", updateTypingStatus);

      return () => {
        socket.off("chat:message", updateSeenStatus);
        socket.off("chat:typing", updateTypingStatus);
      };
    }, [])
  );

  const renderMessageImage = (props: MessageImageProps<IMessage>) => {
    return (
      <Image
        source={{ uri: props.currentMessage.image }}
        style={styles.customMessageImage}
      />
    );
  };

  if (!profile) return null;

  if (fetchingChats) return <EmptyView title="Hãy đợi..." />;

  return (
    <View style={styles.container}>
      <AppHeader
        backButton={<BackButton />}
        center={
          <PeerProfile name={peerProfile.name} avatar={peerProfile.avatar} />
        }
      />
      <GiftedChat
        messages={formatConversationToIMessage(conversation)}
        user={{
          _id: profile.id,
          name: profile.name,
          avatar: profile.avatar,
        }}
        onSend={handleOnMessageSend}
        renderChatEmpty={() => <EmptyChatContainer />}
        onInputTextChanged={handleOnInputChange}
        isTyping={typing}
        renderMessageImage={renderMessageImage}
        renderInputToolbar={(props) => (
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <InputToolbar
                {...props}
                containerStyle={styles.inputToolbar}
                primaryStyle={styles.inputPrimaryStyle}
              />
            </View>
            <Button title="📷" onPress={handleImageUpload} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customMessageImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    margin: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
  },
  inputWrapper: {
    flex: 1,
    marginRight: 8,
    borderRadius: 25,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dddddd",
    overflow: "hidden",
  },
  inputToolbar: {
    borderRadius: 25,
    backgroundColor: "#ffffff",
    borderWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  inputPrimaryStyle: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ChatWindow;
