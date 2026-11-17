import { NavigatorScreenParams } from '@react-navigation/native';
import { ChatType } from '@/features/community/data/chatTypes';

export type MainTabParamList = {
  Home: undefined;
  WeatherMap: undefined;
  Community: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  WelcomeAuth: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ComarcaDetail: {
    comarcaId: string;
    comarcaName: string;
    provinceName: string;
  };
  ChatConversation: {
    comarcaId: string;
    comarcaName: string;
    provinceName: string;
    chatType: ChatType;
  };
  Login: undefined;
};
