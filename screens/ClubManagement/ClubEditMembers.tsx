import React, { useLayoutEffect, useState } from "react";
import { FlatList, SectionList, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import styled from "styled-components/native";
import { ChangeRole, ChangeRoleRequest, Member } from "../../api";
import CircleIcon from "../../components/CircleIcon";
import CustomText from "../../components/CustomText";
import { AntDesign } from "@expo/vector-icons";
import { Menu, MenuItem, MenuDivider } from "react-native-material-menu";
import { ClubEditMembersProps } from "../../types/Club";
import { useToast } from "react-native-toast-notifications";
import { useSelector } from "react-redux";
import { useMutation } from "react-query";
import { ClubApi } from "../../api";

const Container = styled.SafeAreaView`
  flex: 1;
`;

const Header = styled.View`
  justify-content: center;
  align-items: center;
  padding: 10px 0px;
`;

const HeaderText = styled(CustomText)`
  font-size: 9px;
  color: #959595;
`;
const ContentItem = styled.TouchableOpacity<{ col: number }>`
  flex: ${(props) => 1 / props.col};
  justify-content: center;
  align-items: flex-start;
`;

const ItemTitleView = styled.View`
  width: 100%;
  background-color: white;
  border-bottom-width: 1px;
  border-bottom-color: #cecece;
`;

const ItemTitle = styled(CustomText)`
  font-size: 10px;
  line-height: 16px;
  color: #b0b0b0;
`;

const SectionText = styled(CustomText)`
  padding: 15px 0px;
  text-align: center;
  font-size: 9px;
  line-height: 15px;
  color: #b0b0b0;
`;

const ItemText = styled(CustomText)`
  font-size: 12px;
  color: #262626;
`;

interface MemberBundle {
  title: string;
  data: MemberList[];
}

interface MemberList {
  list: Member[];
}

const ClubEditMembers: React.FC<ClubEditMembersProps> = ({
  navigation: { navigate, setOptions, goBack },
  route: {
    params: { clubData },
  },
}) => {
  const token = useSelector((state) => state.AuthReducers.authToken);
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [bundles, setBundles] = useState<MemberBundle[]>();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const ICON_SIZE = 45;
  const DEFAULT_PADDING = 40;
  const COLUMN_NUM = Math.floor((SCREEN_WIDTH - DEFAULT_PADDING) / (ICON_SIZE + 10));
  const [menuVisibleMap, setMenuVisibleMap] = useState(new Map(clubData.members.map((member) => [member.id, false])));
  const [kickOutMap, setKickOutMap] = useState(new Map(clubData.members.map((member) => [member.id, false])));
  const [memberMap, setMemberMap] = useState(new Map(clubData.members.map((member) => [member.id, { ...member }]))); // ?????? ????????? ????????? Spread ?????? ??????
  const mutation = useMutation(ClubApi.changeRole, {
    onSuccess: (res) => {
      console.log(res);
      if (res.status === 200 && res.resultCode === "OK") {
        toast.show(`????????? ?????????????????????.`, {
          type: "success",
        });
        navigate("ClubManagementMain", { clubData, refresh: true });
      } else {
        console.log(`changeRole mutation success but please check status code`);
        console.log(`status: ${res.status}`);
        console.log(res);
        toast.show(`${res.message} (Error Code: ${res.status})`, {
          type: "error",
        });
      }
    },
    onError: (error) => {
      console.log("--- Error changeRole ---");
      console.log(`error: ${error}`);
      toast.show(`Error Code: ${error}`, {
        type: "error",
      });
    },
    onSettled: (res, error) => {},
  });

  const hideMenu = (userId: number) => setMenuVisibleMap((prev) => new Map(prev).set(userId, false));
  const showMenu = (userId: number) => setMenuVisibleMap((prev) => new Map(prev).set(userId, true));

  /**
   * @description ?????? ????????? ?????? ?????? ???????????? ????????????. menu hide ?????? ?????? ???????????? ?????? 200ms ??????
   */
  const kickOut = (userId: number) => {
    setTimeout(() => setKickOutMap((prev) => new Map(prev).set(userId, true)), 200);
    hideMenu(userId);
  };

  const cancelKickOut = (userId: number) => {
    setTimeout(() => setKickOutMap((prev) => new Map(prev).set(userId, false)), 200);
    hideMenu(userId);
  };
  /**
   * @description userId ??? ?????? role ??? ????????????.
   */
  const changeRole = (member: Member, role: string) => {
    member.role = role;
    setMemberData();
    hideMenu(member.id);
  };

  const save = () => {
    let masterCount = 0;

    const data: ChangeRole[] = [];
    clubData.members.map((member) => {
      const modifiedMember = memberMap.get(member.id);
      const isKicked = kickOutMap.get(member.id);
      if (isKicked === true) {
        data.push({
          userId: member.id,
          role: null,
        });
      } else if (modifiedMember && modifiedMember.role !== member.role && isKicked === false) {
        data.push({
          userId: modifiedMember.id,
          role: modifiedMember.role,
        });
      }
    });

    for (let member of memberMap) {
      if (member[1].role === "MASTER") masterCount++;
    }

    // Validation
    // master ??? 1?????? ?????? ??????.
    // master ??? 2??? ????????? ??????.
    ////
    if (masterCount === 0) {
      toast.show(`????????? ???????????? ???????????????.`, {
        type: "danger",
      });
      return;
    }
    if (masterCount > 1) {
      toast.show(`????????? 1?????? ????????? ??? ????????????.`, {
        type: "danger",
      });
      return;
    }

    mutation.mutate({
      clubId: clubData.id,
      data,
      token,
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    console.log("refresh!");
    setRefreshing(false);
  };

  const setMemberData = () => {
    console.log("set member data!");

    const masters: Member[] = [];
    const managers: Member[] = [];
    const members: Member[] = [];

    for (let member of memberMap) {
      if (member[1].role === "MASTER") masters.push(member[1]);
      else if (member[1].role === "MANAGER") managers.push(member[1]);
      else if (member[1].role === "MEMBER") members.push(member[1]);
    }

    setBundles([
      {
        title: "Leader",
        data: masters.division(COLUMN_NUM).map((list) => {
          return { list };
        }),
      },
      {
        title: "Manager",
        data: managers.division(COLUMN_NUM).map((list) => {
          return { list };
        }),
      },
      {
        title: "Member",
        data: members.division(COLUMN_NUM).map((list) => {
          return { list };
        }),
      },
    ]);
  };

  useLayoutEffect(() => {
    console.log("useLayoutEffect");
    console.log(clubData.members);
    setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={save}>
          <CustomText style={{ color: "#2995FA", fontSize: 14, lineHeight: 20 }}>??????</CustomText>
        </TouchableOpacity>
      ),
    });
    setMemberData();
  }, [kickOutMap]);

  const loading = bundles && bundles?.length !== 0 ? false : true;

  return (
    <Container>
      <Header>
        <HeaderText>?????? ????????? ???????????? ?????? ????????? ?????? ????????? ????????? ????????????.</HeaderText>
      </Header>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <SectionList
          refreshing={refreshing}
          onRefresh={onRefresh}
          sections={bundles ?? []}
          keyExtractor={(item: MemberList, index: number) => String(index)}
          contentContainerStyle={{ paddingTop: 10, paddingHorizontal: 20, width: "100%" }}
          renderSectionHeader={({ section: { title } }) => (
            <ItemTitleView>
              <ItemTitle>{title}</ItemTitle>
            </ItemTitleView>
          )}
          renderSectionFooter={({ section: { data } }) => (data.length === 0 ? <SectionText>?????? ????????????.</SectionText> : null)}
          SectionSeparatorComponent={() => <View style={{ height: 15 }} />}
          ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
          renderItem={({ item }: { item: MemberList }) => (
            <FlatList
              key={COLUMN_NUM}
              data={item.list}
              numColumns={COLUMN_NUM}
              keyExtractor={(item: Member, index: number) => String(index)}
              renderItem={({ item }: { item: Member }) => (
                <ContentItem col={COLUMN_NUM}>
                  <Menu
                    style={{ marginLeft: ICON_SIZE / 2 + 5, marginTop: ICON_SIZE / 2 + 5 }}
                    visible={menuVisibleMap.get(item.id)}
                    anchor={
                      <TouchableOpacity onPress={() => showMenu(item.id)}>
                        {item.role !== null && item.role !== "MEMBER" ? (
                          <CircleIcon
                            size={ICON_SIZE}
                            uri={item.thumbnail}
                            name={item.name}
                            badge={item.role === "MASTER" ? "stars" : "check-circle"}
                            opacity={kickOutMap.get(item.id) === true ? 0.5 : 1}
                          />
                        ) : (
                          <CircleIcon size={ICON_SIZE} uri={item.thumbnail} name={item.name} opacity={kickOutMap.get(item.id) === true ? 0.5 : 1} />
                        )}
                      </TouchableOpacity>
                    }
                    onRequestClose={() => hideMenu(item.id)}
                  >
                    {kickOutMap.get(item.id) === false ? (
                      item.role === "MASTER" ? (
                        <>
                          <MenuItem onPress={() => changeRole(item, "MEMBER")} style={{ margin: -10 }}>
                            <AntDesign name="closecircleo" size={12} color="#FF714B" />
                            <ItemText>{` ?????? ?????? ??????`}</ItemText>
                          </MenuItem>
                          <MenuDivider />
                          <MenuItem onPress={() => changeRole(item, "MANAGER")} style={{ margin: -10 }}>
                            <AntDesign name="checkcircle" size={12} color="#FF714B" />
                            <ItemText>{` ????????? ??????`}</ItemText>
                          </MenuItem>
                        </>
                      ) : item.role === "MANAGER" ? (
                        <>
                          <MenuItem onPress={() => changeRole(item, "MASTER")} style={{ margin: -10 }}>
                            <AntDesign name="star" size={12} color="#FF714B" />
                            <ItemText>{` ?????? ??????`}</ItemText>
                          </MenuItem>
                          <MenuDivider />
                          <MenuItem onPress={() => changeRole(item, "MEMBER")} style={{ margin: -10 }}>
                            <AntDesign name="closecircleo" size={12} color="#FF714B" />
                            <ItemText>{` ????????? ?????? ??????`}</ItemText>
                          </MenuItem>
                        </>
                      ) : (
                        <>
                          <MenuItem onPress={() => changeRole(item, "MASTER")} style={{ margin: -10 }}>
                            <AntDesign name="star" size={12} color="#FF714B" />
                            <ItemText>{` ?????? ??????`}</ItemText>
                          </MenuItem>
                          <MenuDivider />
                          <MenuItem onPress={() => changeRole(item, "MANAGER")} style={{ margin: -10 }}>
                            <AntDesign name="checkcircle" size={12} color="#FF714B" />
                            <ItemText>{` ????????? ??????`}</ItemText>
                          </MenuItem>
                          <MenuDivider />
                          <MenuItem onPress={() => kickOut(item.id)} style={{ margin: -10 }}>
                            <AntDesign name="deleteuser" size={12} color="#FF714B" />
                            <ItemText>{` ?????? ??????`}</ItemText>
                          </MenuItem>
                        </>
                      )
                    ) : (
                      <>
                        <MenuItem onPress={() => cancelKickOut(item.id)} style={{ margin: -10 }}>
                          <AntDesign name="deleteuser" size={12} color="#FF714B" />
                          <ItemText>{` ?????? ?????? ??????`}</ItemText>
                        </MenuItem>
                      </>
                    )}
                  </Menu>
                </ContentItem>
              )}
            />
          )}
        />
      )}
    </Container>
  );
};

Array.prototype.division = function (n) {
  var arr = this;
  var len = arr.length;
  var cnt = Math.floor(len / n) + (Math.floor(len % n) > 0 ? 1 : 0);
  var tmp = [];

  for (var i = 0; i < cnt; i++) {
    tmp.push(arr.splice(0, n));
  }

  return tmp;
};

export default ClubEditMembers;
