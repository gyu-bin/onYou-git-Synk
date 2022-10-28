import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, Dimensions, FlatList, Modal,
  TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import styled from "styled-components/native";
import {
  Feed,
  FeedApi,
  FeedsParams,
  FeedsResponse,
  UserApi,
  UserInfoResponse,
  likeCount,
  likeCountReverse,
  FeedsLikeReponse, ClubApi, ClubCreationRequest, FeedLikeRequest, FeedReverseLikeRequest
} from "../api";
import CustomText from "../components/CustomText";
import ImageSelecter from "./HomeRelevant/ImageSelecter";
import { FeedData, HomeScreenProps, HomeStack } from "../types/feed";
import ReplyPage from "./HomeRelevant/ReplyPage";
const Container = styled.SafeAreaView`
  flex: 1;
`;

const HeaderView = styled.View<{ size: number }>`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px ${(props) => props.size}px 10px ${(props) => props.size}px;
  margin-bottom: 10px;
`;

const SubView = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const LogoImage = styled.Image`
  width: 28px;
  height: 28px;
  margin-right: 10px;
  border-radius: 14px;
`;
const LogoText = styled(CustomText)`
  font-size: 26px;
  font-weight: bold;
  color: #020202;
  line-height: 30px;
`;

const UserImage = styled.Image`
  width: 42.5px;
  height: 42.5px;
  border-radius: 100px;
  background-color: #c4c4c4;
`;

const UserId = styled.Text`
  color: black;
  font-weight: bold;
  font-size: 14px;
  padding-bottom: 5px;
`;

const ClubBox = styled.View`
  padding: 3px 6px 3px 6px;
  background-color: #c4c4c4;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
`;

const ClubName = styled.Text`
  font-size: 10px;
  font-weight: 500;
  color: white;
`;

//ModalStyle
//ModalStyle
const ModalArea = styled.View``;

const ModalIcon = styled.TouchableOpacity``;
const CenteredView = styled.View`
  flex: 1;
  justify-content: flex-end;
  align-items: center;
  background-color: gray;
  opacity: 0.8;
`;

const ModalView = styled.View`
  background-color: white;
  padding: 35px;
  align-items: center;
  opacity: 1;
  width: 100%;
  height: 30%;
`;

const ModalText = styled.Text`
  font-weight: bold;
  text-align: center;
  font-size: 20px;
  margin: 15px;
  width: 120%;
  color: black;
`;
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

//Img Slider

const FloatingButton = styled.TouchableOpacity`
  position: absolute;
  right: 25px;
  top: 1.7%;
  width: 30px;
  height: 30px;
  background-color: red;
  color: black;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  font-size: 10px;
`;

const FeedContainer = styled.View`
  flex: 1;
  width: 100%;
  margin-bottom: 30px;
  padding: 0 20px 0 20px;
`;

const FeedHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  margin: 20px 0 10px 0;
`;

const FeedUser = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const UserInfo = styled.View`
  padding-left: 10px;
`;
const FeedMain = styled.View``;
const FeedImage = styled.View``;
const FeedInfo = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 5px 10px 5px;
`;
const LeftInfo = styled.View`
  flex-direction: row;
`;
const InfoArea = styled.View`
  flex-direction: row;
  align-items: center;
  padding-right: 10px;
`;

const LikeClick=styled.TouchableOpacity`

`

const NumberText = styled.Text`
  font-size: 12px;
  font-weight: 300;
  padding-left: 5px;
`;
const RightInfo = styled.View``;
const Timestamp = styled.Text`
  color: #9a9a9a;
  font-size: 12px;
`;

const Content = styled.View`
  padding: 0 12px 0 12px;
`;

const Ment = styled(CustomText)`
  width: 100%;
  color: black;
  font-size: 12px;
`;

const ImageSource = styled.Image<{ size: number }>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
`;

interface HeartType {
  feedId: number;
  heart: boolean;
}

const Home:React.FC<HomeScreenProps> = ({ navigation: { navigate},
                                   route:{params:{feedData}} }) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const queryClient = useQueryClient();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const SCREEN_PADDING_SIZE = 20;
  const FEED_IMAGE_SIZE = SCREEN_WIDTH - SCREEN_PADDING_SIZE * 2;
  const token = useSelector((state) => state.AuthReducers.authToken);
  const [isPageTransition, setIsPageTransition] = useState<boolean>(false);

  const [feedAllData,setFeedAllData]=useState<Array<FeedData>>([]); //정보들

  const [selectFeedId, SetSelectFeedId]=useState<number>();

  //heart선택
  const [heartMap, setHeartMap] = useState(new Map());
  //피드
  const {
    isLoading: feedsLoading,
    data: feeds,
    isRefetching: isRefetchingFeeds,
  } = useQuery<FeedsResponse>(["getFeeds", {token}], FeedApi.getFeeds, {
    //useQuery(["getFeeds", token], FeedApi.getFeeds, {
    onSuccess: (res) => {
      // const result: FeedData[]=[];
      setIsPageTransition(false);
      //좋아요 숫자 증감
      let heartDataMap = new Map();
      for (let i = 0; i < res?.data?.length; ++i) {
        heartDataMap.set(res.data[i].id, false);
        //나중에 api 호출했을때는 false자리에 id 불러오듯이 값 받아와야함.
        /*let refined: FeedData={
          clubId: res?.data[i].clubId,
          clubName: res.data[i].clubName,
          commentCount: res.data[i].commentCount,
          content: res.data[i].content,
          created: res.data[i].created,
          hashtags: res.data[i].hashtags,
          imageUrls: res.data[i].imageUrls,
          isEnd: false,
          likeYn: res.data[i].likeYn,
          likesCount: res.data[i].likesCount,
          userName: res.data[i].userName,
          id: res?.data[i].id,
          userId: res?.data[i].userId
        }
        result.push(refined);*/

      }
      // result.push({ isEnd: true });
      setHeartMap(heartDataMap);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  //피드아이디
  for(let i= 0; i < feeds?.data?.length; ++i){
    let feedId = feeds?.data[i]?.id;
    SetSelectFeedId(feedId);
    console.log(feedId+"feedId");
  }
  console.log(selectFeedId+"selectFeedId");
  console.log(feedData.id+"feedData.id");
  console.log(feedData.userId+"feedData.userId");

  let feedId = feeds?.data[0]?.id;

  //User
  const {
    isLoading: userInfoLoading, // true or false
    data: userInfo,
  } = useQuery<UserInfoResponse>(["getUserInfo", token], UserApi.getUserInfo);
  /**사용자아이디.*/
  let myId = userInfo?.data?.id; //

//Like
  const LikeMutation = useMutation( FeedApi.likeCount, {
    onSuccess: (res) => {
      if (res.status === 200) {
        console.log(res)
      } else {
        console.log(`mutation success but please check status code`);
        console.log(res);
        // return navigate("Home", {});
      }
    },
    onError: (error) => {
      console.log("--- Error ---");
      console.log(`error: ${error}`);
      // return navigate("Home", {});
    },
    onSettled: (res, error) => {},
  });

  const LikeFeed=()=>{
    const data = {
      userId: myId,
      id: feedId,
    };
    console.log(data);
    const likeRequestData: FeedLikeRequest=
      {
        data,
        token,
      }

    LikeMutation.mutate(likeRequestData);
  };

  //ReverseLike
  const LikeReverseMutation = useMutation( FeedApi.likeCountReverse, {
    onSuccess: (res) => {
      if (res.status === 200) {
        console.log(res)
      } else {
        console.log(`mutation success but please check status code`);
        console.log(res);
        // return navigate("Home", {});
      }
    },
    onError: (error) => {
      console.log("--- Error ---");
      console.log(`error: ${error}`);
      // return navigate("Home", {});
    },
    onSettled: (res, error) => {},
  });

  const LikeReverseFeed=()=>{
    const data = {
      userId: myId,
      id: feedId,
    };

    console.log(data);
    const likeRequestData: FeedReverseLikeRequest=
      {
        data,
        token,
      }

    LikeMutation.mutate(likeRequestData);
  };

  const {
    isLoading: commentPlusLoading,
    data: commentPlusCount,
  }=useMutation<FeedsLikeReponse>([myId, token], FeedApi.likeCount)

  const {
    isLoading: commentReverseLoading,
    data: commentReverseCount,
  }=useMutation<FeedsLikeReponse>([myId, token], FeedApi.likeCountReverse)

  const feedSize = Math.round(SCREEN_WIDTH / 3) - 1;

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const goToProfile = () => {
    navigate("HomeStack", {
      screen: "Profile",
    });
  };

  const goToContent = () => {
    navigate("HomeStack", {
      screen: "ImageSelecter",
    });
  };

  /**댓글창 이동*/
  const goToReply = () => {
    navigate("HomeStack", {
      screen: "ReplyPage",
      id:feedData.id,
      userId: feedData.userId,
    });
  };

  const goToModifiy = () => {
    navigate("HomeStack", {
      screen: "ModifiyPeed",
      id:feedData.id,
      userId: feedData.userId,
    });
    setModalVisible(!isModalVisible);
  };

  const goToClub = () => {
    return navigate("HomeStack", {
      screen: "MyClubSelector",
      userId: myId,
    });
  };

  const goToAccusation = () => {
    navigate("HomeStack", {
      screen: "Accusation",
      id:feedData.id,
      userId: myId,
    });
    setModalVisible(!isModalVisible);
  };

  const closeModal = () => {
    setModalVisible(!isModalVisible);
  };

  const deleteCheck = () => {
    Alert.alert(
      "게시글을 삭제하시겠어요?",
      "30일 이내에 내 활동의 최근 삭제 항목에서 이 게시물을 복원할 수 있습니다." + "30일이 지나면 영구 삭제 됩니다. ",
      [
        {
          text: "아니요",
          onPress: () => console.log(""),
          style: "cancel",
        },
        { text: "네", onPress: () => Alert.alert("삭제되었습니다.") },
      ],
      { cancelable: false }
    );
    setModalVisible(!isModalVisible);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.refetchQueries(["feeds"]);
    setRefreshing(false);
  };

  const ReportModal = () =>{

  }

  return (
    <Container>
      <FeedContainer>
        <HeaderView size={SCREEN_PADDING_SIZE}>
          <SubView>
            <LogoImage source={{ uri: "https://i.pinimg.com/564x/cd/c9/a5/cdc9a5ffec176461e7a1503d3b2553d4.jpg" }} />
            <LogoText>OnYou</LogoText>
          </SubView>
          <SubView>
            <MaterialIcons name="add-photo-alternate" onPress={goToClub} style={{ left: 9 }} size={19} color="black" />
          </SubView>
        </HeaderView>
        <FlatList
          refreshing={refreshing}
          onRefresh={onRefresh}
          keyExtractor={(item: Feed, index: number) => String(index)}
          data={feeds?.data.reverse()}
          renderItem={({ item, index }: { item: Feed; index: number }) => (
            <>
              <FeedHeader key={index}>
                <FeedUser onPress={goToProfile}>
                  <UserImage
                    source={{
                      uri: userInfo?.data.thumbnail === null ? "https://k.kakaocdn.net/dn/dpk9l1/btqmGhA2lKL/Oz0wDuJn1YV2DIn92f6DVK/img_110x110.jpg" : userInfo?.data.thumbnail,
                    }}
                  />
                  <UserInfo>
                    <UserId>{item.userName}</UserId>
                    <ClubBox>
                      <ClubName>{item.clubName}</ClubName>
                    </ClubBox>
                  </UserInfo>
                </FeedUser>
                <ModalArea>
                  <ModalIcon onPress={toggleModal}>
                    <Ionicons name="ellipsis-vertical" size={20} color={"black"} />
                  </ModalIcon>
                  <View>
                    <Modal animationType="slide" transparent={true} visible={isModalVisible}>
                      <CenteredView onTouchEnd={closeModal}>
                        <ModalView>
                          <ModalText onPress={goToModifiy}>수정</ModalText>
                          <ModalText style={{ color: "red" }} onPress={deleteCheck}>
                            삭제
                          </ModalText>
                          <ModalText onPress={goToAccusation}>신고</ModalText>
                        </ModalView>
                      </CenteredView>
                    </Modal>
                  </View>
                </ModalArea>
              </FeedHeader>
              <FeedMain>
                <FeedImage>
                  <ImageSource source={item.imageUrls[0] === undefined ? require("../assets/basic.jpg") : { uri: item.imageUrls[0] }} size={FEED_IMAGE_SIZE} />
                </FeedImage>
                <FeedInfo>
                  <LeftInfo>
                    <InfoArea>
                      <TouchableOpacity onPress={() => setHeartMap((prev) => new Map(prev).set(item.id, !prev.get(item.id)))}>
                        {heartMap.get(item.id) ? <Ionicons name="md-heart" size={20} color="red" likeYn={true} /> : <Ionicons name="md-heart-outline" size={20} color="black" likeYn={false} />}
                      </TouchableOpacity>
                      {heartMap.get(item.id) ? <LikeClick onPress={LikeFeed}><NumberText>{item.likesCount +1}</NumberText></LikeClick>
                        : <LikeClick onPress={LikeReverseFeed}><NumberText>{item.likesCount }</NumberText></LikeClick>}
                    </InfoArea>
                    <ReplyPage feedId={feedData.id} userId={feedData.userId}>
                    <InfoArea>
                      <TouchableOpacity onPress={() => goToReply()}>
                        <Ionicons name="md-chatbox-ellipses-outline" size={20} color="black" />
                      </TouchableOpacity>
                      <NumberText>{item.commentCount}</NumberText>
                    </InfoArea>
                    </ReplyPage>
                  </LeftInfo>
                  <RightInfo>
                    <Timestamp>{item.created}</Timestamp>
                  </RightInfo>
                </FeedInfo>
                <Content>
                  <Ment>
                    {item.content}
                  </Ment>
                </Content>
              </FeedMain>
            </>
          )}
        ></FlatList>
      </FeedContainer>
    </Container>
  );
};
export default Home;

