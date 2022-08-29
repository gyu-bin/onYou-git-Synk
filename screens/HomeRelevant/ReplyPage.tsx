import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, StatusBar, FlatList, Button, TextInput, Alert, Animated, ActivityIndicator, Image } from "react-native";
import styled from "styled-components/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { Dimensions } from "react-native";
import { Reply, ReplyReponse, User, UserReponse, FeedApi, getReply } from "../../api";
const Container = styled.SafeAreaView`
  flex: 1;
  height: 100%;
  position: absolute;
  width: 100%;
`;

const Loader = styled.SafeAreaView`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-top: ${Platform.OS === "android" ? StatusBar.currentHeight : 0};
`;

const ReplyContainer = styled.View`
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
  top: 6px;
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

const Like = styled.Text`
  justify-content: flex-start;
`;
const FieldInput = styled.TextInput`
  height: 40px;
  border-radius: 5px;
  background-color: #f3f3f3;
  font-size: 15px;
  width: 100%;
`;

const ReplyArea = styled.View`
  display: flex;
  flex-direction: row;
  padding: 10px 0 10px 20px;
  border: solid 0.5px #c4c4c4;
  bottom: 0;
`;

const ReplyInput = styled.TextInput`
  color: #b0b0b0;
  left: 15px;
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
  left: 550%;
  width: 30px;
  height: 24px;
  top: 15%;
`;
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const ReplyPage: React.FC<NativeStackScreenProps<any, "ReplyPage">> = ({ navigation: { navigate } }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [Home, setHome] = useState([{}]);
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state.AuthReducers.authToken);
  const getHome = () => {
    const result = [];
    for (let i = 0; i < 2; ++i) {
      result.push({
        id: i,
        img: "https://i.pinimg.com/564x/96/a1/11/96a111a649dd6d19fbde7bcbbb692216.jpg",
        name: "문규빈",
        content: "",
        memberNum: Math.ceil(Math.random() * 10),
      });
    }

    setHome(result);
  };

  const getData = async () => {
    await Promise.all([getHome()]);
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getData();
    setRefreshing(false);
  };

  const FeedId = () => {
    return fetch(`http://3.39.190.23:8080/api/feeds`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  };

  const getReply = () => {
    return fetch(`http://3.39.190.23:8080/api/feeds/8/comments`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  };

  const getUser = () => {
    return fetch(`http://3.39.190.23:8080/api/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  };

  const { data: users, isLoading: userLoading } = useQuery<UserReponse>(["getUser"], getUser, {
    onSuccess: (res) => {
      console.log(res);
    },
    onError: (err) => {
      console.log(`[getFeeds error] ${err}`);
    },
  });

  const { data: replys, isLoading: replysLoading } = useQuery<ReplyReponse>(["getReply"], getReply, {
    onSuccess: (res) => {
      console.log(res);
    },
    onError: (err) => {
      console.log(`[getFeeds error] ${err}`);
    },
  });

  const goToHome = () => {
    navigate("Tabs", {
      screen: "Home",
    });
  };

  return (
    <Container>
      <ReplyContainer>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            refreshing={refreshing}
            onRefresh={onRefresh}
            keyExtractor={(item: Reply, index: number) => String(index)}
            data={replys?.data}
            renderItem={({ item, index }: { item: Reply; index: number }) => (
              <CommentArea>
                <CommentImg source={{ uri: item.thumbnail }} />
                <View style={{ marginBottom: 20, top: 7 }}>
                  <CommentMent>
                    <CommentId>{item.userName}</CommentId>
                    <Comment>{item.content}</Comment>
                  </CommentMent>
                  <CommentRemainder>
                    <Time>{rand(1, 60)}분 전</Time>
                  </CommentRemainder>
                </View>
              </CommentArea>
            )}
          />
        )}
      </ReplyContainer>
      <ReplyWriteArea>
        {loading ? (
          <Loader>
            <ActivityIndicator />
          </Loader>
        ) : (
          <FlatList
            refreshing={refreshing}
            onRefresh={onRefresh}
            keyExtractor={(item: User, index: number) => String(index)}
            data={users?.data}
            renderItem={({ item, index }: { item: User; index: number }) => (
              <ReplyArea>
                <ReplyImg source={{ uri: item.thumbnail }} />
                <ReplyInput>댓글을 입력해보세요...</ReplyInput>
                <ReplyButton>
                  <ReplyDone>게시</ReplyDone>
                </ReplyButton>
              </ReplyArea>
            )}
          />
        )}
      </ReplyWriteArea>
    </Container>
  );
};
export default ReplyPage;
