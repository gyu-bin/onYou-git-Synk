import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, View, Text } from "react-native";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient
} from "react-query";
import { useSelector } from "react-redux";
import styled from "styled-components/native";
import { Club, ClubApi, ClubResponse, ClubsParams, ClubsResponse, Feed, UserApi } from "../../api";
import { MyClubSelectorScreenProps } from "../../types/feed";
import CustomTextInput from "../../components/CustomTextInput";
import CustomText from "../../components/CustomText";
const Container = styled.SafeAreaView`
  flex: 1;
  height: 100%;
  position: absolute;
  width: 100%;
`;

const IntroText = styled(CustomText)`
  text-align: right;
  padding: 5px 14px 0 0;
  font-size: 10px;
  color: #b0b0b0;
`;

const ReplyContainer = styled.View`
  height: 100%;
`;

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

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const MyClubSelector: React.FC<MyClubSelectorScreenProps> = ({ navigation: { navigate},
                                                               route:{params:{userId}} }) => {
  const token = useSelector((state:any) => state.AuthReducers.authToken);
  const queryClient = useQueryClient();
  const [params, setParams] = useState<ClubsParams>({
    token,
    categoryId: 0,
    minMember: null,
    maxMember: null,
    sortType: "created",
    orderBy: "DESC",
    showRecruiting: 0,
    showMy: 0,
  });
  const [clubId,setClubId] = useState("")
  const [clubName, setClubName] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [isPageTransition, setIsPageTransition] = useState<boolean>(false);

  const {
    isLoading: myClubInfoLoading, // true or false
    data: myClub,
  } = useQuery<ClubResponse>(["selectMyClubs", token], UserApi.selectMyClubs);

  const goToImageSelect = (clubData:Club) =>{
    return navigate("HomeStack", {
      screen:'ImageSelecter',
      userId: userId,
      clubId:clubData.id
    });
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.refetchQueries(["clubs"]);
    setRefreshing(false);
  };
  return (
    <Container>
      <IntroText>가입한 모임 List</IntroText>
      <ReplyContainer>
            <FlatList
            refreshing={refreshing} onRefresh={onRefresh}
            keyExtractor={(item: Club, index: number) => String(index)}
            data={myClub?.data}
            renderItem={({ item, index }: { item: Club; index: number }) => (
              <ClubArea onPress={() => goToImageSelect(item)}>
                <ClubImg source={{ uri: item.thumbnail }} />
                <ClubMy>
                  <CommentMent>
                    <ClubId>{item.name}</ClubId>
                  </CommentMent>
                  <CommentRemainder>
                    <CtrgArea>
                      <CtgrText>
                        {item.categories?.length>1?
                          (
                            <View style={{display:'flex',flexDirection:'row'}}>
                              <OrganizationName>{item.categories?.map((name)=>{return name.name})}</OrganizationName>
                              {/*<OrganizationName>{item.categories[0].name}</OrganizationName>
                                      <OrganizationName>,</OrganizationName>
                                      <OrganizationName>{item.categories[1].name}</OrganizationName>*/}
                            </View>
                          ):(
                            <OrganizationName>{item.categories[0].name}</OrganizationName>
                          )
                        }
                      </CtgrText>
                    </CtrgArea>
                  </CommentRemainder>
                </ClubMy>
              </ClubArea>
            )}/>
      </ReplyContainer>
    </Container>
  );
};
export default MyClubSelector;