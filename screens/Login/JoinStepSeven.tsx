import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState, createRef, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
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
  width: 70%;
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
  margin-bottom: 20px;
`;

const JoinStepSeven: React.FC<NativeStackScreenProps<any, "AuthStack">> = ({ navigation: { navigate }, route: { params: name, email, password, sex, birth } }) => {
  const [userName, setUserName] = useState(name);
  const [userEmail, setUserEmail] = useState(email);
  const [userPw, setUserPw] = useState(password);
  const [approvalMethod, setApprovalMethod] = useState(sex);
  const [birthNumber, setBirthNumber] = useState(birth);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errortext, setErrortext] = useState(false);
  const phoneInputRef = createRef();

  const phoneReg = /^(01[0|1|6|7|8|9]?)-([0-9]{4})-([0-9]{4})$/;

  useEffect(() => {
    if (phoneNumber.length === 10) {
      setPhoneNumber(phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3"));
    } else if (phoneNumber.length === 11) {
      setPhoneNumber(phoneNumber.replace(/-/g, "").replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3"));
    } else if (phoneNumber.length === 12) {
      setPhoneNumber(phoneNumber.replace(/-/g, "").replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3"));
    } else if (phoneNumber.length === 13) {
      setPhoneNumber(phoneNumber.replace(/-/g, "").replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3"));
    }
  }, [phoneNumber]);

  useEffect(() => {
    const getData = async () => {
      try {
        // AsyncStorage?????? inputData??? ????????? ??? ????????????
        const value = await AsyncStorage.getItem("userInfo");
        // value??? ?????? ????????? ????????? ?????????
        if (value !== null) {
          console.log(value);
        }
      } catch (error) {
        console.log(error);
      }
    };
    // ?????? ??????
    getData();
  }, []);

  const storeData = async () => {
    try {
      await AsyncStorage.setItem(
        "userInfo",
        JSON.stringify({ name: userName.name, email: userName.email, password: userName.password, sex: userName.sex, birth: userName.birth, phone: phoneNumber }),
        () => {
          console.log("???????????? ?????? ??????");
        }
      );
      console.log("?????? ??????");
    } catch (error) {
      console.log(error);
    }
  };

  const validate = () => {
    if (!phoneReg.test(phoneNumber)) {
      setErrortext(true);
      return;
    } else {
      setErrortext(false);
      storeData();
      navigate("LoginStack", {
        screen: "JoinStepEight",
        name: userName.name,
        email: userName.email,
        password: userName.password,
        sex: userName.sex,
        birth: userName.birth,
        phone: phoneNumber,
      });
    }
  };

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
          <AskText>???????????? ????????? ?????????????</AskText>
          <SubText>???????????? ID ????????? ???????????????.</SubText>
          <Input
            placeholder="010-1234-1234"
            placeholderTextColor={"#B0B0B0"}
            keyboardType="numeric"
            maxLength={13}
            onChangeText={(phone) => setPhoneNumber(phone)}
            value={phoneNumber}
            ref={phoneInputRef}
            returnKeyType="next"
            blurOnSubmit={false}
          />
          {errortext === true || !phoneReg.test(phoneNumber) ? <Error>????????? ?????? ?????? ??????????????????.</Error> : null}
        </Wrap>
        <Wrap>
          <Button onPress={validate} disabled={!phoneReg.test(phoneNumber)}>
            <ButtonTitle>??????</ButtonTitle>
          </Button>
        </Wrap>
      </Container>
    </TouchableWithoutFeedback>
  );
};

export default JoinStepSeven;
