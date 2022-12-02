import { MaterialCommunityIcons,AntDesign } from "@expo/vector-icons";
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView, ScrollView, StatusBar, StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View
} from "react-native";
import styled from "styled-components/native";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import { FeedApi, FeedCreationRequest, FeedsResponse } from "../../api";
import { FeedCreateScreenProps,  } from '../../types/feed';
// @ts-ignore
import { ImageBrowser } from "expo-image-picker-multiple";
import { useNavigation } from "@react-navigation/native";
import MultipleImagePicker, { Results } from "@baronha/react-native-multiple-image-picker";

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
  height: ${Platform.OS === 'android' ? 55 : 65}%;
  align-items: center;
  top: ${Platform.OS === 'android' ? 3 : 0}%;
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

const SelectImageArea = styled.TouchableOpacity`

`
const SelectImage = styled.Image`
  width: 55px;
  height: 55px;
  margin: 8px;
  background-color: lightgray;
`;

const ImageCancleBtn = styled.TouchableOpacity`
`
const CancleIcon = styled.View`
  width: 20%;
  position: absolute;
  right: 12%;
  bottom: 50px;
`;
const FeedCreateArea = styled.View`
  left: 70%;
`

const FeedCreateBtn = styled.TouchableOpacity`
`
const FeedCreateText = styled.Text`
  font-size: 15px;
  color: #63abff;
  font-weight: bold;
`

const ImageSelecter: React.FC<FeedCreateScreenProps> = ({
                                                          route:{params:{clubId,userId}},
                                                          navigation: { navigate } }) => {
  const Stack = createNativeStackNavigator();
  const [refreshing, setRefreshing] = useState(false);
  //사진권한 허용
  const [imageURI, setImageURI] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();
  let [alert, alertSet] = useState(true);

  console.log(userId+'userId')
  console.log(clubId+'clubId')
  console.log(imageURI+'imageURI')

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

  //컨텐츠
  const [title, setTitle] = useState<string>("");
  const valueInfos = getValueInfos(title);

  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const imageHeight = Math.floor(((SCREEN_WIDTH * 0.8) / 16) * 9);
  const [postText, setPostText] = useState("");
  const token = useSelector((state:any) => state.AuthReducers.authToken);
  const onText = (text: React.SetStateAction<string>) => setPostText(text);
  const [content, setContent] = useState("")
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
      aspect: [16,9],
      allowsmultipleselection: true,
    });

    if (!result.cancelled) {
      setImageURI(result.uri);
    }
  };

/*  const openPicker = async () => {
    try {
      const response = await MultipleImagePicker.openPicker({
        selectedAssets: imageURI,
        singleSelectedMode: false
      });

      console.log('response: ', response);

    } catch (e) {
      console.log(e.code, e.message);
    }
  }*/

  const {
    isLoading: feedsLoading,
    data: feeds,
    isRefetching: isRefetchingFeeds,
  } = useQuery<FeedsResponse>(["getFeeds", {token}], FeedApi.getFeeds, {});

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.refetchQueries(["getFeeds"]);
    setRefreshing(false);
  };

  const mutation = useMutation(FeedApi.createFeed, {
    onSuccess: (res) => {
      if (res.status === 200 && res.json?.resultCode === "OK") {
        navigate("Tabs", {
          screen: "Home",
          feedData:res.data,
        });
        onRefresh();
      }
      else {
        console.log(`mutation success but please check status code`);
        console.log(`status: ${res.status}`);
        console.log(res.json+'json');
        return navigate("Tabs", {
          screen: "Home",
        });
      }
    },
    onError: (error) => {
      console.log("--- Error ---");
      console.log(`error: ${error}`);
      return navigate("Tabs", {
        screen: "Home",
      });
    },
    onSettled: (res, error) => {},
  });

  const onSubmit = () => {
    const data={
      clubId: clubId,
      content: content,
    };
    const splitedURI = new String(imageURI).split("/");

    const requestData: FeedCreationRequest =
      imageURI === null
        ? {
          image: null,
          data,
          token,
        }
        : {
          image: {
            uri: imageURI.replace("file://", ""),
            type: "image/jpeg",
            name: splitedURI[splitedURI.length - 1],
          },
          data,
          token,
        };

    mutation.mutate(requestData);
    console.log(data+'data')
    onRefresh();
  };

  useEffect(()=>{
    navigation.setOptions({
      headerRight: () => <TouchableOpacity onPress={onSubmit}><FeedCreateText>저장</FeedCreateText></TouchableOpacity>
    })
  },[navigation, onSubmit]);

  useEffect(() => {
    let timer = setTimeout(() => {
      alertSet(false);
    }, 3000);
  });

  /**
   * 이미지 리스트 선택하면 사진 크게보는쪽 사진뜨게
   */
  const ImageFIx = () => {
    console.log('imageFix')
  };

  /** X선택시 사진 없어지는 태그 */
  const ImageCancle = () => {
    console.log('imageCancle')
  };

  useEffect(() => {
    return () => setLoading(false);
  }, []);

  return (
    <Container>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.select({ios: 'position', android: 'padding'})} style={{ flex: 1 }}>
          <>
            <ImagePickerView>
              {/*<ImagePickerButton height={imageHeight} onPress={pickImage} activeOpacity={1}>*/}
              <ImagePickerButton height={imageHeight} onPress={pickImage} activeOpacity={1}>
                {imageURI ? (
                  // <PickedImage height={imageHeight} source={{ uri: imageURI }} />
                  <PickedImage height={imageHeight} source={{ uri: imageURI }} />
                ) : (
                  <PickBackground>
                    {alert ? (
                      <ImageCrop>
                        <MaterialCommunityIcons name="arrow-top-right-bottom-left" size={30} color="red" style={{ textAlign: "center", top: 40 }} />
                        <ImagePickerText>
                          손가락을 좌우로{"\n"} 동시에 벌려{"\n"} 이미지 크롭을 해보세요
                        </ImagePickerText>
                      </ImageCrop>
                    ) : null}
                  </PickBackground>
                )}
              </ImagePickerButton>
            </ImagePickerView>

            <SelectImageView>
              <SelectImageArea onPress={ImageFIx}>
                <SelectImage source={{ uri: imageURI }} />
                {imageURI === null ? null :
                  <ImageCancleBtn onPress={ImageCancle}>
                    <CancleIcon>
                      <AntDesign name="close" size={15} color="white" />
                    </CancleIcon>
                  </ImageCancleBtn>
                }
              </SelectImageArea>
              <SelectImageArea onPress={ImageFIx}>
                <SelectImage source={{ uri: imageURI }} />
                {imageURI === null ? null :
                  <ImageCancleBtn onPress={ImageCancle}>
                    <CancleIcon>
                      <AntDesign name="close" size={15} color="white" />
                    </CancleIcon>
                  </ImageCancleBtn>
                }
              </SelectImageArea>
              <SelectImageArea onPress={ImageFIx}>
                <SelectImage source={{ uri: imageURI }} />
                {imageURI === null ? null :
                  <ImageCancleBtn onPress={ImageCancle}>
                    <CancleIcon>
                      <AntDesign name="close" size={15} color="white" />
                    </CancleIcon>
                  </ImageCancleBtn>
                }
              </SelectImageArea>
              <SelectImageArea onPress={ImageFIx}>
                <SelectImage source={{ uri: imageURI }} />
                {imageURI === null ? null :
                  <ImageCancleBtn onPress={ImageCancle}>
                    <CancleIcon>
                      <AntDesign name="close" size={15} color="white" />
                    </CancleIcon>
                  </ImageCancleBtn>
                }
              </SelectImageArea>
              <SelectImageArea onPress={ImageFIx}>
                <SelectImage source={{ uri: imageURI }} />
                {imageURI === null ? null :
                  <ImageCancleBtn onPress={ImageCancle}>
                    <CancleIcon>
                      <AntDesign name="close" size={15} color="white" />
                    </CancleIcon>
                  </ImageCancleBtn>
                }
              </SelectImageArea>
            </SelectImageView>

            <FeedText
              placeholder="사진과 함께 남길 게시글을 작성해 보세요."
              onChangeText={(content) => setContent(content)}
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