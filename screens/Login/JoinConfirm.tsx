import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState, createRef, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Keyboard, ScrollView, Alert, TouchableWithoutFeedback, useWindowDimensions } from "react-native";
import { useMutation, useQuery } from "react-query";
import { UserApi, UserInfoRequest, User, SignUp } from "../../api";
import { useSelector, useDispatch } from "react-redux";
import { Login } from "../../store/Actions";
import styled from "styled-components/native";
import { resolveUri } from "expo-asset/build/AssetSources";

const Container = styled.View`
  width: 100%;
  height: 95%;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  padding-horizontal: 20px;
`;

const Wrap = styled.View`
  width: 100%;
`;

const AskText = styled.Text`
  color: #000000;
  font-size: 20px;
  font-weight: bold;
  margin-top: 24px;
`;

const SubText = styled.Text`
  color: #a0a0a0;
  font-size: 12px;
  margin-top: 7px;
  margin-bottom: 15px;
`;

const Form = styled.View`
  width: 100%;
  margin-top: 25px;
`;

const TitleBorder = styled.View`
  width: 100%;
  padding-bottom: 5px;
  border-bottom-width: 1px;
  border-bottom-color: #b3b3b3;
`;

const Title = styled.Text`
  color: #000000;
  font-size: 16px;
  font-weight: bold;
`;

const TextWrap = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 6px;
`;

const TextTitle = styled.Text`
  color: #838383;
  font-size: 14px;
`;

const TextInfo = styled.Text`
  color: #295af5;
  font-size: 14px;
`;

const Input = styled.TextInput`
  border-bottom-width: 1px;
  border-bottom-color: #b3b3b3;
  margin-top: 47px;
  font-size: 18px;
`;

const Button = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 48px;
  background-color: ${(props) => (props.disabled ? "#d3d3d3" : "#295AF5")};
`;

const ButtonTitle = styled.Text`
  color: #fff;
  font-size: 18px;
  font-weight: 700;
`;

const JoinConfirm: React.FC<NativeStackScreenProps<any, "AuthStack">> = ({ navigation: { navigate }, route: { params: name, email, password } }) => {
  const [userName, setUserName] = useState(name);

  const mutation = useMutation(UserApi.registerUserInfo, {
    onSuccess: (res) => {
      if (res.status === 200 && res.resultCode === "OK") {
        console.log(`success`);
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

  const onSubmit = () => {
    const data = {
      name: name?.name,
      email: name?.email,
      password: name?.password,
      sex: name?.sex === "??????" ? "M" : "F",
      birthday: name?.birth,
      phoneNumber: name?.phone,
      organizationName: name?.church,
    };

    const requestData: SignUp = data;

    console.log(requestData);

    mutation.mutate(requestData);
  };

  const goToNext = () => {
    onSubmit();
    navigate("LoginStack", {
      screen: "JoinStepSuccess",
      email: name?.email,
      password: name?.password,
    });
  };

  return (
    <Container>
      <Wrap>
        <AskText>?????? ????????? ?????? ????????????????</AskText>
        <SubText>?????? ????????? ????????? ??????????????? ????????? ??? ????????????.</SubText>

        <Form>
          <TitleBorder>
            <Title>????????? ??????</Title>
          </TitleBorder>
          <TextWrap>
            <TextTitle>??????</TextTitle>
            <TextInfo>{name?.name}</TextInfo>
          </TextWrap>
          <TextWrap>
            <TextTitle>?????????</TextTitle>
            <TextInfo>{name?.email}</TextInfo>
          </TextWrap>
        </Form>
        <Form>
          <TitleBorder>
            <Title>?????? ??????</Title>
          </TitleBorder>
          <TextWrap>
            <TextTitle>??????</TextTitle>
            <TextInfo>{name?.sex}</TextInfo>
          </TextWrap>
          <TextWrap>
            <TextTitle>????????????</TextTitle>
            <TextInfo>{name?.birth}</TextInfo>
          </TextWrap>
          <TextWrap>
            <TextTitle>?????????</TextTitle>
            <TextInfo>{name?.phone}</TextInfo>
          </TextWrap>
          <TextWrap>
            <TextTitle>????????????</TextTitle>
            <TextInfo>{name?.church}</TextInfo>
          </TextWrap>
        </Form>
        <Form>
          <TitleBorder>
            <Title>?????? ????????????</Title>
          </TitleBorder>
        </Form>
      </Wrap>
      <Wrap>
        <Button onPress={goToNext}>
          <ButtonTitle>???????????????</ButtonTitle>
        </Button>
      </Wrap>
    </Container>
  );
};

export default JoinConfirm;
