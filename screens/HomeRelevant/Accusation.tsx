import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import styled from "styled-components/native";
import { useMutation, useQuery } from "react-query";
import { useSelector } from "react-redux";
import { ReportFeedScreenProps } from "../../types/feed";
import { FeedApi, FeedLikeRequest, FeedReportRequest } from "../../api";
import CustomText from "../../components/CustomText";
const Container = styled.SafeAreaView`
  position: relative;
  height: 100%;
`;

const AccTop = styled.View`
  top: 20px;
  position: relative;
  left: 10px;
`;

const AccInfo = styled.View`
  top: 20px;
  margin-top: 10px;
`;

const AccHeader = styled.Text`
  font-size: 22px;
  padding-bottom: 15px;
  position: relative;
`;

const AccSubHeader = styled(CustomText)`
  font-size: 13px;
  color: darkgray;
`

const AccTitle = styled(CustomText)`
  text-align: center;
  font-size: 30px;
  top: 20px;
  font-weight: bold;
  color: red;
`;

const AccText = styled(CustomText)`
  font-size: 20px;
  border: 0.5px solid lightgray;
  padding: 15px;
  color: black;
`;

interface ReportReason{
  title:string,
  reason:string,
}

const Accusation:React.FC<ReportFeedScreenProps>=({ navigation:{ navigate},
                                                   route:{params:{feedData}} }) =>{
  const token = useSelector((state:any) => state.AuthReducers.authToken);


  const mutation = useMutation( FeedApi.reportFeed, {
    onSuccess: (res) => {
      if (res.status === 200) {
        console.log(res)
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

  const ReportFeed=(reason:string)=>{
    const data={
      userId:feedData.userId,
      id:feedData.id,
      reason:reason,
    };
    console.log(data);
    const ReportData:FeedReportRequest=
      {
        data,
        token,
      }

    mutation.mutate(ReportData);
  };

  const ReportComplete = (reason:string) => {
    ReportFeed(reason)
    navigate("HomeStack", {
      screen: "ReportComplete",
    });
  };

  return (
    <Container>
      <View>
        <AccTop>
          <AccHeader>????????? ????????? ???????????????????</AccHeader>
          <AccSubHeader>??????????????? ????????? ?????????. ??????????????? ?????? ????????? ???????????????.</AccSubHeader>
        </AccTop>
        <AccInfo>
          <TouchableOpacity>
            <AccText onPress={()=>ReportComplete('SPAM')}>??????</AccText>
          </TouchableOpacity>
          <TouchableOpacity>
            <AccText onPress={()=>ReportComplete('FRAUD')}>?????? ?????? ??????</AccText>
          </TouchableOpacity>
          <TouchableOpacity>
            <AccText onPress={()=>ReportComplete('HATE')}>?????? ?????? ?????? ??????</AccText>
          </TouchableOpacity>
          <TouchableOpacity>
            <AccText onPress={()=>ReportComplete('PORNO')}>?????????</AccText>
          </TouchableOpacity>
        </AccInfo>
      </View>
    </Container>
  );
}

export default Accusation;