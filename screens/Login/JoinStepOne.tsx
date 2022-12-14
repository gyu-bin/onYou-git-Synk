import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState, useEffect, createRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Keyboard, ScrollView, Alert, TouchableWithoutFeedback, useWindowDimensions } from "react-native";
import { useMutation } from "react-query";
import { CommonApi } from "../../api";
import { useDispatch } from "react-redux";
import { Login } from "../../store/Actions";
import styled from "styled-components/native";

const Container = styled.View`
  width: 100%;
  height: 95%;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  padding-horizontal: 20px;
  padding-top: 30px;
`;

const Wrap = styled.View`
  width: 100%;
`;

const BorderWrap = styled.View`
  width: 100%;
  height: 2px;
  background-color: #d0d0d0;
`;

const Border = styled.View`
  width: 10%;
  height: 2px;
  background-color: #295af5;
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

const Error = styled.Text`
  color: #ff714b;
  font-size: 12px;
  margin-top: 7px;
`;

const JoinStepOne: React.FC<NativeStackScreenProps<any, "AuthStack">> = ({ navigation: { navigate } }) => {
  const [userName, setUserName] = useState("");
  const [errortext, setErrortext] = useState(false);

  const storeData = async () => {
    try {
      await AsyncStorage.setItem("userInfo", JSON.stringify({ name: userName }), () => {
        console.log("???????????? ?????? ??????");
      });
      console.log("?????? ??????");
    } catch (error) {
      console.log(error);
    }
  };

  const nameInputRef = createRef();
  const nameReg = /^[???-???]+$/;

  const validate = () => {
    if (!nameReg.test(userName)) {
      setErrortext(true);
      return;
    } else {
      setErrortext(false);
      storeData();
      navigate("LoginStack", {
        screen: "JoinStepTwo",
        name: userName,
      });
    }
  };

  // const goToNext = () => {
  //   navigate("LoginStack", {
  //     screen: "JoinStepTwo",
  //   });
  // };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <Container>
        <Wrap>
          <BorderWrap>
            <Border></Border>
          </BorderWrap>
          <AskText>????????? ????????? ?????????????</AskText>
          <SubText>????????? ????????? ????????? ?????????.</SubText>
          <Input
            keyboardType={"name-phone-pad"}
            placeholder="?????????"
            maxLength={10}
            autoCorrect={false}
            onChangeText={(UserName) => setUserName(UserName)}
            ref={nameInputRef}
            returnKeyType="next"
            blurOnSubmit={false}
            placeholderTextColor={"#B0B0B0"}
          />
          {errortext === true || !nameReg.test(userName) ? <Error>????????? ?????? ?????? ??????????????????.</Error> : null}
        </Wrap>
        <Wrap>
          <Button onPress={validate} disabled={!nameReg.test(userName)}>
            <ButtonTitle>??????</ButtonTitle>
          </Button>
        </Wrap>
      </Container>
    </TouchableWithoutFeedback>
  );
};

export default JoinStepOne;
