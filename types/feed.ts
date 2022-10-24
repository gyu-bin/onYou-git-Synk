import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feed } from "../api";

export type RootStackParamList = {
  Home: {
    id: number;
    clubId: number;
    clubName: string | undefined;
    userId: number;
    userName: string | undefined;
    content: string | undefined;
    imageUrls: string;
    hashtag: string | undefined;
    likeYn: boolean | undefined;
    likeCount: number;
    commentCount: number;
    created: string;
    updated: string;
  };
  FeedCreater:{
    imageUrls: string;
    userId: number;
    content: string;
    hashtag: string | undefined;
    created: string;
    clubId: number;
    clubName: string;
    userName: string;
  }
  ReplyPage: {userId: number, userName: string, id: number};
  MyClubSelector:{userId: number}
  FeedCreateSuccess:{feedData: Feed}
  FeedUpdate:{id:number ,userId: number, content: string, hashtag: string}
  FeedReport:{id:number,userId:number}
  Tabs:{}
  HomeStack:{}
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList,"Home">
export type FeedCreateScreenProps = NativeStackScreenProps<RootStackParamList,"FeedCreater">
export type MyClubSelectorScreenProps = NativeStackScreenProps<RootStackParamList,"MyClubSelector">
export type ReplyPageScreenProps = NativeStackScreenProps<RootStackParamList,"ReplyPage">
export type ModifiyPeedScreenProps = NativeStackScreenProps<RootStackParamList,"FeedUpdate">
export type ReportPeedScreenProps = NativeStackScreenProps<RootStackParamList,"FeedReport">