import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  FlatList,
  Button,
  TextInput,
  Alert,
  Animated,
  ActivityIndicator,
  Image,
  Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, SafeAreaView
} from "react-native";
import styled from "styled-components/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import { Dimensions } from "react-native";
import {
  Reply,
  ReplyReponse,
  User,
  FeedApi,
  UserInfoResponse,
  getUserInfo,
  UserApi,
  getReply,
  FeedLikeRequest, FeedReplyRequest
} from "../../api";
import {
  ModifiyPeedScreenProps,
  ReplyPageScreenProps
} from "../../types/feed";
import { useToast } from "react-native-toast-notifications";
const Container = styled.SafeAreaView`
  flex: 1;
  height: 100%;
  position: absolute;
  width: 100%;
`;

const ReplyContainer = styled.ScrollView`
  height: 100%;
  flex-basis: 90%;
`;
const ReplyWriteArea = styled.View`
  height: 100%;
  flex-basis: 10%;
`;

const CommentArea = styled.View`
  flex: 1;
  flex-direction: row;
  width: 100%;
  margin: 10px 20px 0 20px;
`;

const CommentImg = styled.Image`
  width: 46px;
  height: 46px;
  border-radius: 100px;
  flex-grow: 0;
  background-color: #c4c4c4;
`;
const CommentId = styled.Text`
  color: black;
  font-size: 12px;
  left: 8px;
  font-weight: bold;
`;

const Comment = styled.Text`
  color: black;
  margin-left: 10px;
  width: 200px;
  left: 5px;
  font-size: 12px;
  font-weight: 300;
`;

const CommentMent = styled.View`
  flex-direction: row;
`;

const CommentRemainder = styled.View`
  flex-direction: row;
`;

const Time = styled.Text`
  font-size: 10px;
  font-weight: 300;
  color: #8e8e8e;
  left: 9px;
`;

const ReplyArea = styled.View`
  display: flex;
  flex-direction: row;
  padding: 5px 0 5px 20px;
  border: solid 0.5px #c4c4c4;
  top: 3%;
`;

const ReplyInputArea = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 88%;
`

const ReplyInput = styled.TextInput`
  color: #b0b0b0;
  left: 15px;
  width: 80%;
  height: 35px;
`;

const ReplyImg = styled.Image`
  width: 30px;
  height: 30px;
  border-radius: 100px;
`;

const ReplyButton = styled.TouchableOpacity``;
const ReplyDone = styled.Text`
  color: #63abff;
  font-size: 15px;
  font-weight: bold;
  width: 30px;
  height: 24px;
  top: 15%;
`;
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const ReplyPage:React.FC<ModifiyPeedScreenProps> = ({
                                                      navigation:{navigate},
                                                      route: { params: { feedData }},
                                                    }) => {
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = useSelector((state:any) => state.AuthReducers.authToken);
  const queryClient = useQueryClient();

  const [content, setContent] = useState("");

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.refetchQueries(["replys"]);
    setRefreshing(false);
  };
  /** 리플 데이터   */
  const { data: replys, isLoading: replysLoading } =
    useQuery<ReplyReponse>(["getReply",token,feedData.id], FeedApi.getReply,{
      onSuccess: (res) => {
        // console.log(res);
      },
      onError: (err) => {
        console.log(`[getFeeds error] ${err}`);
      },
    });


  /** 유저 데이터   */
  const {
    isLoading: userInfoLoading, // true or false
    data: userInfo,
  } = useQuery<UserInfoResponse>(["userInfo", token], UserApi.getUserInfo);

  // console.log(userInfo?.data.id);

  //댓글추가
  const mutation = useMutation( FeedApi.ReplyFeed, {
    onSuccess: (res) => {
      if (res.status === 200) {
        console.log(res)
        setRefreshing(false);

      } else {
        console.log(`mutation success but please check status code`);
        console.log(res);
      }
    },
    onError: (error) => {
      console.log("--- Error ---");
      console.log(`error: ${error}`);
      // return navigate("Tabs", {
      //   screen: "Home",
      // });
    },
    onSettled: (res, error) => {},
  });

  const RelpyFeed=()=>{
    if(content === ''){
      /* toast.show("댓글 공백으로 하지 마세요",{
         type: 'warning'
       })*/
      Alert.alert('공백임')

    }
    const data = {
      id: feedData.id,
      content: content,
    };
    Keyboard.dismiss();
    // console.log(data);
    const likeRequestData: FeedReplyRequest=
      {
        data,
        token,
      }

    mutation.mutate(likeRequestData);
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.select({ios: 'padding', android: undefined})} style={{ flex: 1 }}>
        <Container>
          <ReplyContainer>
            <FlatList
              refreshing={refreshing}
              onRefresh={onRefresh}
              keyExtractor={(item: Reply, index: number) => String(index)}
              data={replys?.data}
              renderItem={({ item, index }: { item: Reply; index: number }) => (
                <CommentArea key={index}>
                  <CommentImg source={{ uri: item.thumbnail }} />
                  <View style={{ marginBottom: 20, top: 7 }}>
                    <CommentMent>
                      <CommentId>{item.userName}</CommentId>
                      <Comment>{item.content}</Comment>
                    </CommentMent>
                    <CommentRemainder>
                      <Time>{item.created}</Time>
                    </CommentRemainder>
                  </View>
                </CommentArea>
              )}
            />
          </ReplyContainer>
          <ReplyWriteArea>
            <ReplyArea>
              <ReplyImg
                source={{
                  uri: userInfo?.data.thumbnail === null ? "https://k.kakaocdn.net/dn/dpk9l1/btqmGhA2lKL/Oz0wDuJn1YV2DIn92f6DVK/img_110x110.jpg" : userInfo?.data.thumbnail,
                }}
              />
              <ReplyInputArea>
                {replys?.data.length === null ?
                  <ReplyInput
                    placeholder=" 댓글을 입력해보세요..."
                    onChangeText={(content) => setContent(content)}
                    autoCompleteType="off"
                    autoCapitalize="none"
                    autoCorrect={false}
                    multiline={true}
                    returnKeyType="done"
                    returnKeyLabel="done"></ReplyInput>:
                  <ReplyInput
                    placeholder=" 댓글을 입력해보세요..."
                    onChangeText={(content) => setContent(content)}
                    autoCompleteType="off"
                    autoCapitalize="none"
                    autoCorrect={false}
                    multiline={true}
                    returnKeyType="done"
                    returnKeyLabel="done"></ReplyInput>
                }
                <ReplyButton onPress={RelpyFeed}>
                  <ReplyDone>게시</ReplyDone>
                </ReplyButton>
              </ReplyInputArea>
            </ReplyArea>
          </ReplyWriteArea>
        </Container>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};
export default ReplyPage;