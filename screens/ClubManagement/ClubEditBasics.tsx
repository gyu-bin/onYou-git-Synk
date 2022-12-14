import React, { useEffect, useLayoutEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, TouchableOpacity, useWindowDimensions } from "react-native";
import styled from "styled-components/native";
import { ClubEditBasicsProps } from "../../Types/Club";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "react-query";
import { Category, CategoryResponse, ClubApi, ClubUpdateRequest } from "../../api";
import { useToast } from "react-native-toast-notifications";
import CustomText from "../../components/CustomText";
import CustomTextInput from "../../components/CustomTextInput";
import { useSelector } from "react-redux";

const Container = styled.SafeAreaView`
  flex: 1;
`;

const MainView = styled.ScrollView``;
const Header = styled.View`
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: rgba(0, 0, 0, 0.1);
`;

const ImagePickerButton = styled.TouchableOpacity<{ height: number }>`
  width: 100%;
  height: ${(props) => props.height}px;
  justify-content: center;
  align-items: center;
  background-color: #d3d3d3;
`;

const ImagePickerText = styled(CustomText)`
  font-size: 14px;
  font-weight: 500;
  color: #2995fa;
  line-height: 22px;
`;

const PickedImage = styled.Image<{ height: number }>`
  width: 100%;
  height: ${(props) => props.height}px;
`;

const Content = styled.View`
  padding: 20px;
  margin-bottom: 50px;
`;
const ContentItem = styled.View`
  width: 100%;
  flex: 1;
  border-bottom-width: 1px;
  border-bottom-color: #cecece;
  padding-bottom: 3px;
  margin-bottom: 30px;
`;

const Item = styled.View`
  width: 100%;
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ItemTitle = styled(CustomText)`
  font-size: 13px;
  line-height: 19px;
  color: #b0b0b0;
  margin-bottom: 5px;
`;

const ItemText = styled(CustomText)`
  font-size: 12px;
  line-height: 16px;
  margin-right: 5px;
`;

const ItemTextInput = styled(CustomTextInput)`
  font-size: 14px;
  line-height: 20px;
  padding: 0px 5px;
  flex: 1;
`;

const RadioButtonView = styled.View`
  flex-direction: row;
  padding: 5px;
  align-items: center;
`;

const RadioButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-right: 10px;
`;

const CheckButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const CheckBox = styled.View<{ check: boolean }>`
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: ${(props) => (props.check ? "white" : "#E8E8E8")};
`;

const CategoryText = styled(CustomText)<{ selected?: boolean }>`
  font-size: 14px;
  line-height: 21px;
  text-align: center;
  color: ${(props) => (props.selected ? "white" : "black")};
`;

const CategoryView = styled.View`
  flex-direction: row;
  justify-content: flex-start;
  margin: 10px 0px;
`;
const CategoryLabel = styled.TouchableOpacity<{ selected?: boolean }>`
  justify-content: center;
  align-items: center;
  padding: 3px 5px;
  border-radius: 20px;
  border: 1px solid #d7d7d7;
  background-color: ${(props) => (props.selected ? "#295AF5" : "white")};
  margin: 0px 5px;
`;

const ClubEditBasics: React.FC<ClubEditBasicsProps> = ({
  navigation: { navigate, setOptions, goBack },
  route: {
    params: { clubData },
  },
}) => {
  const token = useSelector((state) => state.AuthReducers.authToken);
  const toast = useToast();
  const [clubName, setClubName] = useState(clubData.name);
  const [maxNumber, setMaxNumber] = useState(clubData.maxNumber === 0 ? "????????? ??????" : `${String(clubData.maxNumber)} ???`);
  const [maxNumberInfinity, setMaxNumberInfinity] = useState<boolean>(clubData.maxNumber ? false : true);
  const [phoneNumber, setPhoneNumber] = useState(clubData.contactPhone ?? "");
  const [organizationName, setOrganizationName] = useState(clubData.organizationName ?? "");
  const [isApproveRequired, setIsApproveRequired] = useState(clubData.isApprovedRequired);
  const [selectCategory1, setCategory1] = useState(clubData.categories[0]?.id ?? -1);
  const [selectCategory2, setCategory2] = useState(clubData.categories[1]?.id ?? -1);
  const [categoryBundle, setCategoryBundle] = useState<Array<Category[]>>();
  const [imageURI, setImageURI] = useState<string | null>(null);
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const imageHeight = Math.floor(((SCREEN_WIDTH * 0.8) / 4) * 3);

  const { isLoading: categoryLoading, data: categories } = useQuery<CategoryResponse>(["getCategories"], ClubApi.getCategories, {
    onSuccess: (res) => {
      const count = 4;
      const bundle = [];
      for (let i = 0; i < res.data.length; i += count) bundle.push(res.data.slice(i, i + count));
      setCategoryBundle(bundle);
    },
  });
  const mutation = useMutation(ClubApi.updateClub, {
    onSuccess: (res) => {
      if (res.status === 200 && res.resultCode === "OK") {
        toast.show(`????????? ?????????????????????.`, {
          type: "success",
        });
        navigate("ClubManagementMain", { clubData: res.data, refresh: true });
      } else {
        console.log(`updateClub mutation success but please check status code`);
        console.log(`status: ${res.status}`);
        console.log(res);
        toast.show(`Error Code: ${res.status}`, {
          type: "error",
        });
      }
    },
    onError: (error) => {
      console.log("--- Error updateClub ---");
      console.log(`error: ${error}`);
      toast.show(`Error Code: ${error}`, {
        type: "error",
      });
    },
    onSettled: (res, error) => {},
  });

  useLayoutEffect(() => {
    setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={save}>
          <CustomText style={{ color: "#2995FA", fontSize: 14, lineHeight: 20 }}>??????</CustomText>
        </TouchableOpacity>
      ),
    });
  }, [clubName, maxNumber, maxNumberInfinity, organizationName, isApproveRequired, phoneNumber, imageURI, selectCategory1, selectCategory2]);

  useEffect(() => {
    if (phoneNumber.length === 10) {
      setPhoneNumber(phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3"));
    } else if (phoneNumber.length === 11) {
      setPhoneNumber(phoneNumber.replace(/-/g, "").replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3"));
    } else if (phoneNumber.length === 12) {
      setPhoneNumber(phoneNumber.replace(/-/g, "").replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3"));
    } else if (phoneNumber.length === 13) {
      setPhoneNumber(phoneNumber.replace(/-/g, "").replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3"));
    }
  }, [phoneNumber]);

  const save = () => {
    const contactPhone = phoneNumber.replace(/-/g, "");
    const data = {
      clubName,
      clubMaxMember: maxNumberInfinity ? 0 : Number(maxNumber.split(" ")[0]),
      isApproveRequired,
      organizationName,
      contactPhone: contactPhone === "" ? null : contactPhone,
    };

    const splitedURI = new String(imageURI).split("/");

    const updateData: ClubUpdateRequest =
      imageURI === null
        ? {
            data,
            token,
            clubId: clubData.id,
          }
        : {
            image: {
              uri: imageURI.replace("file://", ""),
              type: "image/jpeg",
              name: splitedURI[splitedURI.length - 1],
            },
            data,
            token,
            clubId: clubData.id,
          };

    mutation.mutate(updateData);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [16, 9],
      quality: 1,
    });

    if (result.cancelled === false) {
      setImageURI(result.uri);
    }
  };

  const onPressCategory = (id: number) => {
    if (selectCategory1 === id) {
      return setCategory1(-1);
    } else if (selectCategory2 === id) {
      return setCategory2(-1);
    }
    if (selectCategory1 === -1) {
      return setCategory1(id);
    } else if (selectCategory2 === -1) {
      return setCategory2(id);
    } else {
      toast.show("??????????????? 2?????? ?????? ??? ????????????.", {
        type: "warning",
      });
    }
  };

  return (
    <Container>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={10} style={{ flex: 1 }}>
        <MainView>
          <Header>
            <ImagePickerButton height={imageHeight} onPress={pickImage} activeOpacity={0.8}>
              {imageURI ? <PickedImage height={imageHeight} source={{ uri: imageURI }} /> : <ImagePickerText>?????? ?????? ?????????</ImagePickerText>}
            </ImagePickerButton>
          </Header>
          <Content>
            <ContentItem>
              <ItemTitle>?????? ??????</ItemTitle>
              <ItemTextInput
                value={clubName}
                placeholder="????????? 16??? ?????? (???????????? ??????)"
                placeholderTextColor="#B0B0B0"
                maxLength={16}
                onEndEditing={() => {
                  if (clubName === "") {
                    toast.show("?????? ????????? ???????????? ????????? ??? ????????????.", {
                      type: "warning",
                    });
                    setClubName(clubData.name);
                  }
                }}
                onChangeText={(name) => setClubName(name)}
                returnKeyType="done"
                returnKeyLabel="done"
              />
            </ContentItem>
            <ContentItem>
              <ItemTitle>?????? ??????</ItemTitle>
              <Item>
                <ItemTextInput
                  keyboardType="number-pad"
                  placeholder="?????? ???????????? ?????? ???"
                  placeholderTextColor="#B0B0B0"
                  onPressIn={() => {
                    if (maxNumberInfinity === false) setMaxNumber((prev) => prev.split(" ")[0]);
                  }}
                  onEndEditing={() =>
                    setMaxNumber((prev) => {
                      if (prev === "" || prev === "0") return `${clubData.maxNumber} ???`;
                      else return `${prev} ???`;
                    })
                  }
                  value={maxNumber}
                  maxLength={6}
                  onChangeText={(num) => {
                    if (num.length < 3) setMaxNumber(num);
                    else
                      toast.show("?????? 99????????? ???????????????.", {
                        type: "warning",
                      });
                  }}
                  editable={!maxNumberInfinity}
                />
                <CheckButton
                  onPress={() => {
                    if (!maxNumberInfinity) setMaxNumber("????????? ??????");
                    else setMaxNumber(`${clubData.maxNumber} ???`);

                    setMaxNumberInfinity((prev) => !prev);
                  }}
                >
                  <ItemText>?????? ??? ??????????????? ??????</ItemText>
                  <CheckBox check={maxNumberInfinity}>
                    <Ionicons name="checkmark-sharp" size={16} color={maxNumberInfinity ? "#FF714B" : "#e8e8e8"} />
                  </CheckBox>
                </CheckButton>
              </Item>
            </ContentItem>
            <ContentItem>
              <ItemTitle>?????? ?????? ??????</ItemTitle>
              <RadioButtonView>
                <RadioButton onPress={() => setIsApproveRequired((prev) => (prev === "Y" ? "Y" : "Y"))}>
                  <Ionicons name={isApproveRequired === "Y" ? "radio-button-on" : "radio-button-off"} size={16} color={isApproveRequired === "Y" ? "#FF714B" : "black"} style={{ marginRight: 3 }} />
                  <ItemText>????????? ?????? ??? ??????</ItemText>
                </RadioButton>
                <RadioButton onPress={() => setIsApproveRequired((prev) => (prev === "Y" ? "N" : "N"))}>
                  <Ionicons name={isApproveRequired === "N" ? "radio-button-on" : "radio-button-off"} size={16} color={isApproveRequired === "N" ? "#FF714B" : "black"} style={{ marginRight: 3 }} />
                  <ItemText>????????? ?????? ??????</ItemText>
                </RadioButton>
              </RadioButtonView>
            </ContentItem>
            <ContentItem>
              <ItemTitle>?????? ????????? ?????????</ItemTitle>
              <ItemTextInput keyboardType="numeric" placeholder="010-0000-0000" maxLength={13} onChangeText={(phone) => setPhoneNumber(phone)} value={phoneNumber} />
            </ContentItem>
            <ContentItem>
              <ItemTitle>?????? ?????? ??????</ItemTitle>
              <ItemTextInput
                value={organizationName}
                placeholder="????????? ????????? ?????? ?????? ???????????? ????????? ?????????"
                placeholderTextColor="#B0B0B0"
                maxLength={16}
                onChangeText={(name) => setOrganizationName(name)}
                returnKeyType="done"
                returnKeyLabel="done"
              />
            </ContentItem>
            {categoryLoading ? (
              <></>
            ) : (
              <ContentItem style={{ borderBottomWidth: 0 }}>
                <ItemTitle>?????? ????????????</ItemTitle>
                {categoryBundle?.map((bundle, index) => (
                  <CategoryView key={index}>
                    {bundle?.map((category, index) => (
                      <CategoryLabel key={index} onPress={() => onPressCategory(category.id)} selected={selectCategory1 === category.id || selectCategory2 === category.id}>
                        <CategoryText selected={selectCategory1 === category.id || selectCategory2 === category.id}>{`${category.thumbnail} ${category.name}`}</CategoryText>
                      </CategoryLabel>
                    ))}
                  </CategoryView>
                ))}
              </ContentItem>
            )}
          </Content>
        </MainView>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default ClubEditBasics;
