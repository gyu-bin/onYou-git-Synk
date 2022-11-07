import React, { useState } from "react";
import styled from "styled-components/native";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  Feed,
  FeedApi,
  FeedsResponse, FeedUpdateRequest, ModifiedReponse,
  updateFeed
} from "../../api";
import { ModifiyPeedScreenProps } from "../../types/feed";

const Loader = styled.SafeAreaView`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-top: ${Platform.OS === "android" ? StatusBar.currentHeight : 0}px;
`;
const Container=styled.View`
  flex: 1;
`
const FeedUser = styled.View`
  flex-direction: row;
  padding: 20px 0 0 20px;
`;

const UserInfo = styled.View`
  padding-left: 10px;
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
const ClubBox = styled.TouchableOpacity`
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
const FeedImage = styled.View`
  padding: 20px;
`;

const FeedImageUrl=styled.Image`
  width: 100%;
  height: 70%;
`
const Content = styled.View`
  padding: 0 12px 0 12px;
`;

const Ment = styled.TextInput`
  width: 100%;
  color: black;
  font-size: 12px;
`;

const ImageSource = styled.Image<{ size: number }>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
`;

interface FeedEditItem{
  id:number
  content:string;
}

const ModifiyPeed:React.FC<ModifiyPeedScreenProps>=({
                                                      navigation:{navigate},
                                                      route:{params: {feedData}}})=> {
  const token = useSelector((state:any) => state.AuthReducers.authToken);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const SCREEN_PADDING_SIZE = 20;
  const FEED_IMAGE_SIZE = SCREEN_WIDTH - SCREEN_PADDING_SIZE * 2;
  const [isPageTransition, setIsPageTransition] = useState<boolean>(false)
  const [fixContent, setFixContent]=useState("");
  const [items, setItems] = useState<FeedEditItem[]>();

  const [content, setContent] = useState("")
  //피드호출
  const {
    isLoading: feedsLoading,
    data: feeds,
    isRefetching: isRefetchingFeeds,
  } = useQuery<ModifiedReponse>(["getFeeds",token,feedData.id], FeedApi.getSelectFeeds, {
    onSuccess: (res) => {
      setIsPageTransition(false);
      // console.log(res);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const mutation = useMutation(FeedApi.updateFeed, {
    onSuccess: async (res) => {
      if (res.status === 200 && res.json?.resultCode === "OK") {
        setRefreshing(true);
        await queryClient.refetchQueries(["modify"]);
        setRefreshing(false);
        /* return navigate("Tabs", {
           screen: "Home",
         });*/
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
    /*  return navigate("Tabs", {
        screen: "Home",
      });*/
    },
    onSettled: (res, error) => {},
  });



  //피드업데이트
  const FixComplete =() =>{
    const data={
      id: feedData.id,
      content: content,
    };
    console.log(data);

    const requestData: FeedUpdateRequest={
      data,
      token,
    };
    mutation.mutate(requestData);
  };
  return feedsLoading ?(
    <Loader>
      <ActivityIndicator/>
    </Loader>
    ):(
      <>
    <Container>
{/*      <View>
        {items?.map((item,index)=>(
          <View key={index}>
            <View>
              <Text>{item.content}</Text>
            </View>
          </View>
        ))}
      </View>*/}
      <FlatList
        keyExtractor={(item: Feed, index: number) => String(index)}
        data={feeds?.data}
        renderItem={({ item, index }: { item: Feed; index: number }) => (
          <>
          <View key={index}>
            <FeedUser >
              <UserImage source={{ uri: "https://i.pinimg.com/564x/9e/d8/4c/9ed84cf3fc04d0011ec4f75c0692c83e.jpg" }} />
              <UserInfo>
                <UserId>{item.userName}</UserId>
                <ClubBox>
                  <ClubName>{item.clubName}</ClubName>
                </ClubBox>
              </UserInfo>
            </FeedUser>

            <FeedImage>
              <ImageSource source={item.imageUrls[0]===undefined?{uri:"https://i.pinimg.com/564x/eb/24/52/eb24524c5c645ce204414237b999ba11.jpg"}:{uri:item.imageUrls[0]}} size={FEED_IMAGE_SIZE}/>
            </FeedImage>
            <Content>
              <Ment value={fixContent} onChangeText={(value:string)=>setFixContent(value)}>
              {/*<Ment>*/}
                {item.content}
              </Ment>
            </Content>

            <TouchableOpacity onPress={FixComplete}>
            {/*<TouchableOpacity>*/}
              <Text>수정완료</Text>
            </TouchableOpacity>
          </View>
          </>
        )}></FlatList>
    </Container>
    </>
  );
}

export default ModifiyPeed;