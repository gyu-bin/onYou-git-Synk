import React, {useState} from "react";
import {
  ActivityIndicator,
  Alert, Animated, Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform, RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableWithoutFeedback, useWindowDimensions,
  View
} from "react-native";
import styled from "styled-components/native";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import {
  Feed,
  FeedApi,
  FeedReplyRequest, FeedsResponse,
  getReply,
  getUserInfo,
  Reply,
  ReplyReponse,
  UserApi,
  UserInfoResponse
} from "../../api";
import { ModifiyPeedScreenProps } from "../../types/feed";
import { useToast } from "react-native-toast-notifications";
import {SwipeListView,SwipeRow} from 'react-native-swipe-list-view';
import { AntDesign, Ionicons } from "@expo/vector-icons";

const Loader = styled.SafeAreaView`
  flex: 1;
`;

const Container = styled.SafeAreaView`
  height: 100%;
  position: relative;
  width: 100%;
  flex: 1;
`;

const CommentList = styled.View`
  height: 95%;
`
const SwipeHiddenItemContainer = styled.View`
  flex: 1;
  height: 100%;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
`
const SwipeHiddenItem = styled.View`
  width: 70px;
  height: 100%;
  justify-content: center;
  align-items: center;
`
const SwipeHiddenItemText = styled.TouchableOpacity`
  color: black;
  font-size: 14px;
  text-align: center;
`

const CommentArea = styled.View`
  flex: 1;
  flex-direction: row;
  width: 100%;
  padding: 10px 20px 0 20px;
  position: relative;
  background-color: #ffffff;;
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

const NoReplyText = styled.Text`
  font-size: 20px;
  text-align: center;
  left: 0;
  right: 0;
  margin: auto;
  color: #B0B0B0;
`

const NoReplyScrollView = styled.ScrollView`
  padding-Top: 50%;
`

const Time = styled.Text`
  font-size: 10px;
  font-weight: 300;
  color: #8e8e8e;
  left: 9px;
`;

const ReplyArea = styled.View`
  display: flex;
  flex-direction: row;
  padding: 1% 0 0 20px;
  height: auto;
  bottom: ${Platform.OS === 'ios' ? 3 : 0}%;
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

const ModalIcon = styled.TouchableOpacity``;
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const ReplyPage:React.FC<ModifiyPeedScreenProps> = ({
                                                      navigation:{navigate},
                                                      route: { params: { feedData }},
                                                    }) => {
  const toast = useToast();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const token = useSelector((state:any) => state.AuthReducers.authToken);
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [searchVal, setSearchVal] = useState("");
  /** 리플 데이터   */
  const { data: replys, isLoading: replysLoading } =
    useQuery<ReplyReponse>(["getReply",token,feedData.id], FeedApi.getReply,{
      onSuccess: (res) => {
        setContent('');
      },
      onError: (err) => {
        console.log(`[getFeeds error] ${err}`);
      },
    });
  const {
    isLoading: feedsLoading,
    data: feeds,
    isRefetching: isRefetchingFeeds,
  } = useQuery<FeedsResponse>(["getFeeds", {token}], FeedApi.getFeeds, {});

  /** 유저 데이터   */
  const {
    isLoading: userInfoLoading, // true or false
    data: userInfo,
  } = useQuery<UserInfoResponse>(["userInfo", token], UserApi.getUserInfo);

  // console.log(userInfo?.data.id);
  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.refetchQueries(["getReply"]);
    await queryClient.refetchQueries(["getFeeds"]);
    setRefreshing(false);
  };

  const mutation = useMutation( FeedApi.ReplyFeed, {
    onSuccess: (res) => {
      if (res.status === 200) {
        console.log(res)
        onRefresh();
        setContent('')
      } else {
        console.log(`mutation success but please check status code`);
        console.log(res);
      }
    },
    onError: (error) => {
      console.log("--- Error ---");
      console.log(`error: ${error}`);
    },
    onSettled: (res, error) => {},
  });
  /**댓글추가*/
  const RelpyFeed=()=>{
    if(content === ''){
      Alert.alert('댓글을 입력하세요.')
    }else{
      const data = {
        id: feedData.id,
        content: content,
      };
      setContent("");
      Keyboard.dismiss();
      const likeRequestData: FeedReplyRequest=
        {
          data,
          token,
        }
      mutation.mutate(likeRequestData);
    }
  }

  /**댓글삭제*/
  const deleteCheck = (feedData:Feed) => {
    Alert.alert(
      "댓글을 삭제하시겠어요?",
      "",
      [
        {
          text: "아니요",
          onPress: () => console.log("삭제 Api 호출"),
          style: "cancel",
        },
        { text: "네", onPress: () =>Alert.alert('댓글삭제')},
      ],
      { cancelable: false }
    );
    onRefresh();
  };

  const timeLine =(date) =>{
    const start = new Date(date);
    const end = new Date(); // 현재 날짜

    let diff = (end - start); // 경과 시간

    const times = [
      {time: "분", milliSeconds: 1000 * 60},
      {time: "시간", milliSeconds: 1000 * 60 * 60},
      {time: "일", milliSeconds: 1000 * 60 * 60 * 24},
      {time: "개월", milliSeconds: 1000 * 60 * 60 * 24 * 30},
      {time: "년", milliSeconds: 1000 * 60 * 60 * 24 * 365},
    ].reverse();

    // 년 단위부터 알맞는 단위 찾기
    for (const value of times) {
      const betweenTime = Math.floor(diff / value.milliSeconds);

      // 큰 단위는 0보다 작은 소수 단위 나옴
      if (betweenTime > 0) {
        return `${betweenTime}${value.time} 전`;
      }
    }

    // 모든 단위가 맞지 않을 시
    return "방금 전";
  }

  return replysLoading ? (
    <Loader>
      <ActivityIndicator/>
    </Loader>
  ):(
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
                          keyboardVerticalOffset={Platform.OS === "ios" ? 110 : 100} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <>
          <CommentList>
            {replys?.data.length !== 0 ?
              <SafeAreaView style={{flex: 1}}>
                <SwipeListView
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  keyExtractor={(item: Reply, index: number) => String(index)}
                  data={replys?.data}
                  disableVirtualization={false}
                  leftOpenValue={0}
                  rightOpenValue={-70}
                  renderItem={({ item, index }: { item: Reply; index: number }) => (
                    <ScrollView>
                      <CommentArea key={index}>
                        <CommentImg source={{ uri: item.thumbnail }} />
                        <View style={{ marginBottom: 20, top: 7 }}>
                          <CommentMent>
                            <CommentId>{item.userName}</CommentId>
                            <Comment>{item.content}</Comment>
                          </CommentMent>
                          <CommentRemainder>
                            <Time>{timeLine(item.created)}</Time>
                          </CommentRemainder>
                        </View>
                      </CommentArea>
                    </ScrollView>
                  )}
                  renderHiddenItem={(item, index) => (
                    <SwipeHiddenItemContainer>
                      <SwipeHiddenItem>
                        <SwipeHiddenItemText></SwipeHiddenItemText>
                      </SwipeHiddenItem>
                      <SwipeHiddenItem style={{backgroundColor: 'skyblue'}}>
                        <SwipeHiddenItemText onPress={()=>deleteCheck(item)}>
                          <AntDesign name="delete" size={24} color="black" />
                        </SwipeHiddenItemText>
                      </SwipeHiddenItem>
                    </SwipeHiddenItemContainer>
                  )}
                />
              </SafeAreaView>
              :
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <NoReplyScrollView
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }>
                  <CommentArea>
                    <NoReplyText>아직 등록된 댓글이 없습니다. {"\n"} 첫 댓글을 남겨보세요</NoReplyText>
                  </CommentArea>
                </NoReplyScrollView>
              </TouchableWithoutFeedback>
            }
          </CommentList>

          <ReplyArea>
            <ReplyImg
              source={{
                uri: userInfo?.data.thumbnail === null ? "https://k.kakaocdn.net/dn/dpk9l1/btqmGhA2lKL/Oz0wDuJn1YV2DIn92f6DVK/img_110x110.jpg" : userInfo?.data.thumbnail,
              }}
            />
            <ReplyInputArea>
              {replys?.data.length === null ?
                <ReplyInput
                  placeholder="댓글을 입력해보세요..."
                  onChangeText={(content:any) => setContent(content)}
                  autoCompleteType="off"
                  autoCapitalize="none"
                  autoCorrect={false}
                  multiline={true}
                  returnKeyType="done"
                  returnKeyLabel="done"
                  value={content}
                />:
                <ReplyInput
                  placeholder="댓글을 입력해보세요..."
                  onChangeText={(content:any) => setContent(content)}
                  autoCompleteType="off"
                  autoCapitalize="none"
                  autoCorrect={false}
                  multiline={true}
                  returnKeyType="done"
                  returnKeyLabel="done"
                  value={content}
                />
              }
              <ReplyButton onPress={RelpyFeed}>
                <ReplyDone>게시</ReplyDone>
              </ReplyButton>
            </ReplyInputArea>
          </ReplyArea>
        </>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};
export default ReplyPage;