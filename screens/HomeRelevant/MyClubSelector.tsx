import React, { useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { useInfiniteQuery, useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import styled from "styled-components/native";
import { Club, ClubApi, ClubsParams, ClubsResponse } from "../../api";
import { MyClubSelectorScreenProps } from "../../types/feed";

const Container = styled.SafeAreaView`
  flex: 1;
  height: 100%;
  position: absolute;
  width: 100%;
`;

const IntroText = styled.Text`
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
const ClubId = styled.Text`
  padding-left: 2%;
  color: black;
  font-size: 12px;
  font-weight: bold;
`;

const Comment = styled.Text`
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

const OrganizationName = styled.Text`
  width: auto;
  height: auto;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: #fff;
`;
const CreatorName = styled.Text`
  width: auto;
  height: auto;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: #fff;
  padding-left: 6px;
`;

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const MyClubSelector: React.FC<MyClubSelectorScreenProps> = ({route:{params:{id,name,userId}},navigation: { navigate } }) => {
  const token = useSelector((state) => state.AuthReducers.authToken);
  const queryClient = useQueryClient();
  const [params, setParams] = useState<ClubsParams>({
    token,
    categoryId: null,
    clubState: null,
    minMember: null,
    maxMember: null,
    sort: "created",
    showRecruiting: null,
    showMy: null,
  });

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPageTransition, setIsPageTransition] = useState<boolean>(false);

  const [feedId, setFeed] = useState(id);
  const [userName,setUserName] = useState(name);
  const [clubName, setClubName] = useState("");
  const [clubId, setClubId] = useState("");
  const [myUserId, setMyUserId] = useState(userId);

  const {
    isLoading: clubsLoading,
    data: clubs,
    isRefetching: isRefetchingClubs,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery<ClubsResponse>(["clubs", params], ClubApi.getClubs, {
    getNextPageParam: (currentPage) => {
      if (currentPage) return currentPage.hasNext === false ? null : currentPage.responses?.content[currentPage.responses?.content.length - 1].customCursor;
    },
    onSuccess: (res) => {
      setIsPageTransition(false);
      console.log(res);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const loadMore = () => {
    if (hasNextPage) fetchNextPage();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.refetchQueries(["clubs"]);
    setRefreshing(false);
  };

  const goToHome = () => {
    navigate("Tabs", {
      screen: "Home",
    });
  };

  const goToImage = (clubName: Club) => {
    navigate("HomeStack", {
      screen: "ImageSelecter",
    });
  };

  return (
    <Container>
      <IntroText>가입한 모임 List</IntroText>
      <ReplyContainer>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            refreshing={refreshing}
            onRefresh={onRefresh}
            onEndReached={loadMore}
            keyExtractor={(item: Club, index: number) => String(index)}
            data={clubs?.pages.map((page) => page.responses.content).flat()}
            renderItem={({ item, index }: { item: Club; index: number }) => (
              <ClubArea
                onPress={() => {
                  return navigate("HomeStack", {
                    screen:"ImageSelecter",
                    id:feedId.id,
                    name: feedId.userName,
                    clubName:feedId.clubName,
                    clubId: feedId.clubId,
                    userId: feedId.userId,
                  });
                }}
              >
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
            )}
          />
        )}
      </ReplyContainer>
    </Container>
  );
};
export default MyClubSelector;
