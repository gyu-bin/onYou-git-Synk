import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
  ActivityIndicator
} from "react-native";
import styled from "styled-components/native";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import { FeedApi, FeedCreationRequest, FeedsResponse } from "../../api";
import { FeedCreateScreenProps } from "../../types/feed";
import { useNavigation } from "@react-navigation/native";
import { ImageSlider } from "react-native-image-slider-banner";
import CustomText from "../../components/CustomText";
// import ImagePicker from 'react-native-image-crop-picker';
interface ValueInfo {
  str: string;
  isHT: boolean;
  idxArr: number[];
}

const Container = styled.SafeAreaView`
  flex: 1;
  padding: 0 20px 0 20px;
`;
const ImagePickerView = styled.View`
  width: 100%;
  height: ${Platform.OS === "android" ? 62 : 65}%;
  align-items: center;
  top: ${Platform.OS === "android" ? 3 : 0}%;
`;

const PickBackground = styled.ImageBackground`
  width: 100%;
  height: 100%;
  position: absolute;
`;

const ImagePickerButton = styled.TouchableOpacity<{ height: number }>`
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  background-color: #c4c4c4;
`;

const PickedImage = styled.Image<{ height: number }>`
  width: 100%;
  height: 100%;
`;

const ImageCrop = styled.View`
  background-color: rgba(63, 63, 63, 0.7);
  width: 142px;
  height: 142px;
  border-radius: 100px;
  opacity: 0.5;
  justify-content: center;
  top: 30%;
  left: 30%;
`;

const ImagePickerText = styled.Text`
  font-size: 10px;
  color: white;
  text-align: center;
  padding: 50px 0;
`;

const FeedText = styled.TextInput`
  margin: 13px 15px 15px 30px;
  color: black;
  height: 100px;
`;

const SelectImageView = styled.View`
  background-color: rgba(0, 0, 0, 0.7);
  height: 70px;
  width: 100%;
  flex-direction: row;
  justify-content: space-around;
  padding: 0;
`;

const SelectImageArea = styled.TouchableOpacity``;
const SelectImage = styled.Image`
  width: 55px;
  height: 55px;
  margin: 8px;
  background-color: lightgray;
`;

const ImageCancleBtn = styled.TouchableOpacity``;
const CancleIcon = styled.View`
  width: 20%;
  position: absolute;
  right: 12%;
  bottom: 50px;
`;
const FeedCreateArea = styled.View`
  left: 70%;
`;

const FeedCreateBtn = styled.TouchableOpacity``;
const FeedCreateText = styled(CustomText)`
  font-size: 18px;
  color: #63abff;
  font-weight: bold;
  padding: 10px;
`;

const ImageSource = styled.Image<{ size: number }>`
  width: ${(props:any) => props.size}px;
  height: ${(props:any) => props.size}px;
`;

const ImageSelecter: React.FC<FeedCreateScreenProps> = ({
                                                          route: {
                                                            params: { clubId, userId },
                                                          },
                                                          navigation: { navigate },
                                                        }) => {
  const Stack = createNativeStackNavigator();
  const [refreshing, setRefreshing] = useState(false);
  //???????????? ??????
  const [imageURI, setImageURI] = useState<any>("");
  const [choiceImage, setChoiceImage] = useState();
  const [loading, setLoading] = useState(false);
  const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();
  const [alert, alertSet] = useState(true);
  const [isSummitShow, setSummitShow] = useState(true)
  const getValueInfos = (value: string): ValueInfo[] => {
    if (value.length === 0) {
      return [];
    }
    const splitedArr = value.split(" ");
    let idx = 0;
    return splitedArr.map((str) => {
      const idxArr = [idx, idx + str.length - 1];
      idx += str.length + 1;
      return {
        str,
        isHT: str.startsWith("#") || str.startsWith("@"),
        idxArr,
      };
    });
  };

  //?????????
  const [title, setTitle] = useState<string>("");
  const valueInfos = getValueInfos(title);

  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const imageHeight = Math.floor(((SCREEN_WIDTH * 0.8) / 16) * 9);
  const token = useSelector((state: any) => state.AuthReducers.authToken);
  const [content, setContent] = useState("");
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  //cropPicker
/*  const CropPicker=async ()=>{
    let result = await ImagePicker.openPicker({
      cropping:true,
      multiple:true,
    }).then(imageURI=>{
      console.log(imageURI)
      console.log(result)
    })
  }*/

  const pickImage = async () => {
    //????????????
        if(!status?.granted){
          const permission=await requestPermission();
          if(!permission.granted){
            return null;
          }
        }

    let result: any = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      aspect: [16, 9],
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    let array = [];
    for (let i = 0; i < result?.assets?.length; i++) {
      if (!result.canceled) {
        array.push(result.assets[i].uri);
        // setImageURI(result.assets[i].uri);
      }
    }
    setImageURI(array);
  };
  // console.log(imageURI.toString())

  const { isLoading: feedsLoading, data: feeds, isRefetching: isRefetchingFeeds } = useQuery<FeedsResponse>(["getFeeds", { token }], FeedApi.getFeeds, {});

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.refetchQueries(["getFeeds"]);
    setRefreshing(false);
  };
  

  const mutation = useMutation(FeedApi.createFeed, {
    onSuccess: (res) => {
      if (res.status === 200 && res.resultCode === "OK") {
        navigate("Tabs", {
          screen: "Home",
          feedData: res.data,
        });
      } else {
        console.log(`mutation success but please check status code`);
        console.log(`status: ${res.status}`);
      }
    },
    onError: (error) => {
      console.log("--- Error ---");
      console.log(`error: ${error}`);
    },
    onSettled: (res, error) => {},
  });


  const onSubmit = () => {
  if (imageURI.length == 0){
      Alert.alert('???????????? ???????????????')
    }
    else if(content.length == 0){
      Alert.alert('???????????? ???????????????')
    }
    else {
      setSummitShow(false);
    const data = {
      clubId: clubId,
      content: content,
    };
    let requestData: FeedCreationRequest = {
      image: [],
      data,
      token,
    };
    if (imageURI.length == 0) requestData.image = null;

    for (let i = 0; i < imageURI.length; i++) {
      const splitedURI = String(imageURI[i]).split("/");
      if (requestData.image) {
        requestData.image.push({ uri: Platform.OS === "android" ? imageURI[i] : imageURI[i].replace("file://", ""),
          type: "image/jpeg",
          name: splitedURI[splitedURI.length - 1] });
      }
    }
    mutation.mutate(requestData);
     }
  };


  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity  onPress={() => {
        onSubmit();
        }}>
          {
            isSummitShow ?
            <FeedCreateText>??????</FeedCreateText> :
            <ActivityIndicator/>
          }
        </TouchableOpacity>
      ),
    });
  }, [imageURI, content, isSummitShow]);

  useEffect(() => {
    let timer = setTimeout(() => {
      alertSet(false);
    }, 3000);
  });

  /**
   * ????????? ????????? ???????????? ?????? ??????????????? ????????????
   */
  const ImageFIx = (i: any) => {
    setChoiceImage(imageURI[i])
    /*return (
      <View key={i}>
        <ImageSlider data={[{ img: imageURI[i] }]} preview={false} caroselImageStyle={{ resizeMode: "stretch", height: 420 }} indicatorContainerStyle={{ bottom: 0 }} />
      </View>
    );*/
  };

  /** X????????? ?????? ???????????? ?????? */
  const ImageCancle = (q:any) => {
    console.log('imageCancle')
  };

  /*????????? ????????????**/
  const imagePreview = [];
  for (let i = 0; i < imageURI.length; i += 1) {
    imagePreview.push(
      <SelectImageArea key={i} onPress={() => ImageFIx(i)}>
        <SelectImage source={{ uri: imageURI[i] }}  />
        {imageURI === null ? null : (
          <ImageCancleBtn onPress={()=>ImageCancle(i)}>
            <CancleIcon >
              <AntDesign name="close" size={15} color="white" />
            </CancleIcon>
          </ImageCancleBtn>
        )}
      </SelectImageArea>
    );
  }

  /*????????? ?????????**/
  const imageChoice = [];
  const imageList = [];
  for (let i = 0; i < imageURI.length; i++) {
    imageList.push({ img: imageURI[i] });
  }
  imageChoice.push(
    <ImageSource source={{uri: choiceImage}} size={400}/>
    /* <ImageSlider data={imageList} preview={false} caroselImageStyle={{ resizeMode: "stretch", height: 420 }}
              indicatorContainerStyle={{ bottom: 0 }}
 />*/
  );

  return (
    <Container>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios"? "position": "padding" } style={{ flex: 1 }}>
          <>
              <ImagePickerView>
                {Object.keys(imageURI).length !== 0 ? (
                  <View>{imageChoice}</View>
                ) : (
                  <ImagePickerButton height={imageHeight} onPress={pickImage} activeOpacity={1}>
                    <PickBackground>
                      {alert ? (
                        <ImageCrop>
                          <MaterialCommunityIcons name="arrow-top-right-bottom-left" size={30} color="red" style={{ textAlign: "center", top: 40 }} />
                          <ImagePickerText>
                            ???????????? ?????????{"\n"} ????????? ??????{"\n"} ????????? ????????? ????????????
                          </ImagePickerText>
                        </ImageCrop>
                      ) : null}
                    </PickBackground>
                  </ImagePickerButton>
                )}
              </ImagePickerView>
              {/* <SelectImage source={{ uri: imageURI.assets[0].uri}} />*/}
              <SelectImageView>
                <View style={{ display: "flex", flexDirection: "row" }}>
                  {imagePreview}
                </View>
              </SelectImageView>
              <FeedText
                placeholder="????????? ?????? ?????? ???????????? ????????? ?????????"
                onChangeText={(content: any) => setContent(content)}
                autoCapitalize="none"
                autoCorrect={false}
                multiline={true}
                returnKeyType="done"
                returnKeyLabel="done"
              >
                {valueInfos.map(({ str, isHT, idxArr }, idx) => {
                  const [firstIdx, lastIdx] = idxArr;
                  let value = title.slice(firstIdx, lastIdx + 1);
                  const isLast = idx === valueInfos.length - 1;
                  if (isHT) {
                    return (
                      <Text style={{ color: "skyblue", backgroundColor: "black" }}>
                        {value}
                        {!isLast && <Text style={{ backgroundColor: "pink" }}> </Text>}
                      </Text>
                    );
                  }
                  return (
                    <Text style={{ color: "black" }}>
                      {value}
                      {!isLast && <Text> </Text>}
                    </Text>
                  );
                })}
              </FeedText>
          </>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Container>
  );
};

export default ImageSelecter;