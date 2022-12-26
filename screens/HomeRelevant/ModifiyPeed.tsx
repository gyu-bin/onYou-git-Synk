import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components/native";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar, Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View
} from "react-native";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  Club,
  ClubResponse,
  Feed,
  FeedApi,
  FeedUpdateRequest, ModifiedReponse, UserApi, UserInfoResponse
} from "../../api";
import { ModifiyPeedScreenProps } from "../../types/feed";
import { RootStackParamList } from "../../types/Club";
import { useNavigation } from "@react-navigation/native";
import { Modalize } from "react-native-modalize";
import { Portal } from "react-native-portalize";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "../../components/CustomText";
import { ImageSlider } from "react-native-image-slider-banner";

const Loader = styled.SafeAreaView`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-top: ${Platform.OS === "android" ? StatusBar.currentHeight : 0}px;
`;
const Container=styled.SafeAreaView`
  flex: 1;
  margin-bottom: ${Platform.OS === "ios" ? 20 : 30}px;
  padding: 0 20px 0 20px;
`
const FeedUser = styled.View`
  flex-direction: row;
  padding: 20px 0 0 0;
`;

const UserInfo = styled.View`
  padding-left: 10px;
`;

const UserImage = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 100px;
  border-style: solid;
  border-color: #dddddd;
  border-width: 1.5px;
  background-color: #c4c4c4;
`;

const UserId = styled.Text`
  color: black;
  font-weight: bold;
  font-size: 14px;
  padding-bottom: 5px;
`;
const ClubBox = styled.TouchableOpacity`
  padding: 3px 6px 3px 6px;
  background-color: #c4c4c4;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  flex: 1
`;

const ClubName = styled.Text`
  font-size: 10px;
  font-weight: 500;
  color: white;
`;

const FeedHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  margin: 20px 40px 10px 0;
`;

const FeedImage = styled.View`
  padding: 10px 10px;
  justify-content: center;
  align-items: center;
`;

const Content = styled.View`
  padding: 0 12px 0 12px;
`;

const ContentArea = styled.View`
`
const ImageArea = styled.View`
  // padding-bottom: 1px;  
`

const Ment = styled.TextInput`
  width: 100%;
  height: 150px;
  color: black;
  font-size: 14px;
  background-color: bisque;
`;

const ImageSource = styled.Image<{ size: number }>`
  width: ${(props:any) => props.size}px;
  height: ${(props:any) => props.size}px;
`;

const FixCompleteText = styled.Text`
  color: #63abff;
  font-size: 15px;
  font-weight: bold;
`

const ModalContainer = styled.View`
  flex: 1;
`;

const ModalView = styled.View`
  background-color: white;
  align-items: center;
  opacity: 1;
  width: 100%;
  height: auto;
`;

const ModalText = styled(CustomText)`
  font-weight: bold;
  text-align: center;
  font-size: 18px;
  margin: 30px 0 0 0;
  width: 100%;
  color: black;
  height: auto;
`;

//모달내 클럽리스트
const ClubArea = styled.TouchableOpacity`
  flex-direction: row;
  width: 100%;
  height: auto;
  padding: 5px 15px 0 15px;
  border-style: solid;
  border-bottom-color: #e9e9e9;
  border-bottom-width: 1px;
  align-self: flex-start;
`;

const ClubImg = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  margin: 5px;
`;

const ClubMy = styled.View`
  justify-content: center;
  padding-top: 3%;
`;
const ClubId = styled(CustomText)`
  padding-left: 2%;
  color: black;
  font-size: 12px;
  font-weight: bold;
`;

const Comment = styled(CustomText)`
  color: black;
  margin-left: 10px;
  width: 200px;
  font-size: 12px;
  font-weight: 300;
`;

const CommentMent = styled.View`
  flex-direction: row;
  padding-bottom: 4px;
`;

const CommentRemainder = styled.View`
  flex-direction: row;
`;

const CtrgArea = styled.View`
  width: auto;
  height: auto;
  margin: 0.1px 6px 13.9px 8px;
  border-radius: 3px;
  background-color: #c4c4c4;
`;

const CtgrText = styled.View`
  display: flex;
  flex-direction: row;
  margin: 3px 5px 3px 5px;
`;

const OrganizationName = styled(CustomText)`
  width: auto;
  height: auto;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: #fff;
`;
const CreatorName = styled(CustomText)`
  width: auto;
  height: auto;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: #fff;
  padding-left: 6px;
`;
interface FeedEditItem{
  id:number
  content:string;
  screen: keyof RootStackParamList;
}

const ModifiyPeed:React.FC<ModifiyPeedScreenProps>=({
                                                      navigation:{navigate},
                                                      route:{params: {feedData}}})=> {
  const token = useSelector((state:any) => state.AuthReducers.authToken);
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const SCREEN_PADDING_SIZE = 20;
  const FEED_IMAGE_SIZE = SCREEN_WIDTH - SCREEN_PADDING_SIZE * 2;
  const [isPageTransition, setIsPageTransition] = useState<boolean>(false)
  const [content, setContent] = useState("")
  const [data, setData] = useState<Feed>(feedData);
  const [items, setItems] = useState<FeedEditItem[]>();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const modalizeRef = useRef<Modalize>(null);
  const onOpen = () => {
    console.log("Before Modal Passed FeedId");
    modalizeRef?.current?.open();
  };

  //피드호출
  const {
    isLoading: feedsLoading,
    data: feeds,
    isRefetching: isRefetchingFeeds,
  } = useQuery<ModifiedReponse>(["getFeeds",token,feedData.id], FeedApi.getSelectFeeds, {
    onSuccess: (res) => {
      console.log('modifyCall')
      setIsPageTransition(false);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const {
    isLoading: userInfoLoading, // true or false
    data: userInfo,
  } = useQuery<UserInfoResponse>(["userInfo", token], UserApi.getUserInfo);

  const mutation = useMutation(FeedApi.updateFeed, {
    onSuccess: (res) => {
      if (res.status === 200) {
        return navigate("Tabs", {
          screen: "Home",
        });
      } else {
        console.log(`mutation success but please check status code`);
        console.log(`status: ${res.status}`);
        console.log(res.json);
        /*  return navigate("Tabs", {
            screen: "Home",
          });*/
      }
    },
    onError: (error) => {
      console.log("--- Error ---");
      console.log(`error: ${error}`);
      /*   return navigate("Tabs", {
           screen: "Home",
         });*/
    },
    onSettled: (res, error) => {},
  });

  //피드업데이트
  const FixComplete = async () =>{
    const data={
      id: feedData.id,
      access: "PUBLIC",
      content: content,
    };
    console.log("fixed Data:", data);

    const requestData: FeedUpdateRequest={
      data,
      token,
    };

    mutation.mutate(requestData)

  };
  const {
    isLoading: myClubInfoLoading, // true or false
    data: myClub,
  } = useQuery<ClubResponse>(["selectMyClubs", token], UserApi.selectMyClubs);
  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.refetchQueries(["selectMyClubs"]);
    setRefreshing(false);
  };

  useEffect(()=>{
    navigation.setOptions({
      headerRight: () => <TouchableOpacity onPress={FixComplete}><FixCompleteText>저장</FixCompleteText></TouchableOpacity>
    })
  },[navigation, FixComplete]);

  console.log('수정페이지')

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        <KeyboardAvoidingView behavior={Platform.select({ios: 'position', android: 'position'})} style={{flex: 1}}>
          {/* <ImageArea> */}
          <FeedUser>
            <UserImage source={{ uri: userInfo?.data.thumbnail }} />
            <UserInfo>
              <UserId>{data.userName}</UserId>
                <ClubBox onPress={onOpen}>
                  <ClubName>{data.clubName}</ClubName>
                </ClubBox>
              <Portal>
                <Modalize
                  ref={modalizeRef}
                  modalHeight={200}
                  handlePosition="inside"
                >
                  <ModalContainer>
                    <ModalView>
                      <FlatList
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        keyExtractor={(item: Club, index: number) => String(index)}
                        data={myClub?.data}
                        renderItem={({ item, index }: { item: Club; index: number }) => (
                          <ClubArea key={index}>
                            <ClubImg source={{ uri: item.thumbnail }} />
                            <ClubMy>
                              <CommentMent>
                                <ClubId>{item.clubShortDesc}</ClubId>
                              </CommentMent>
                              <CommentRemainder>
                                <CtrgArea>
                                  <CtgrText>
                                    <OrganizationName>{item.organizationName}</OrganizationName>
                                    <CreatorName>{item.creatorName}</CreatorName>
                                  </CtgrText>
                                </CtrgArea>
                              </CommentRemainder>
                            </ClubMy>
                          </ClubArea>
                        )}/>
                      <ModalText>123</ModalText>
                    </ModalView>
                  </ModalContainer>
                </Modalize>
              </Portal>
            </UserInfo>

          </FeedUser>
          <FeedImage>
            <ImageSlider
              data={[{ img: data.imageUrls[0] }, { img: data.imageUrls[1]},{ img: data.imageUrls[2] }]}
              closeIconColor="#fff"
              preview={false}
              caroselImageStyle={{resizeMode: 'stretch',height: 400}}
              indicatorContainerStyle={{ bottom: 0 }}
              size={FEED_IMAGE_SIZE}
            /></FeedImage>
          <ContentArea>
            <Ment
              onChangeText={(content:any) => setContent(content)}
              autoCompleteType="off"
              autoCapitalize="none"
              autoCorrect={false}
              multiline={true}
              returnKeyType="done"
              returnKeyLabel="done"
            >
              {data.content}
            </Ment>
          </ContentArea>
        </KeyboardAvoidingView>
      </Container>
    </TouchableWithoutFeedback>
  );
};
export default ModifiyPeed;