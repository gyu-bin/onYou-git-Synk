import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import AppLoading from "expo-app-loading";
import * as Font from "expo-font";
import React, { useState } from "react";
import { LogBox } from "react-native";
import { ToastProvider } from "react-native-toast-notifications";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider, useDispatch, useSelector } from "react-redux";
import LoginStack from "./navigation/LoginStack";
import Root from "./navigation/Root";
import { store } from "./store";
import { Init } from "./store/actions";

LogBox.ignoreLogs(["Setting a timer"]);

const queryClient = new QueryClient();

const loadFonts = (fonts) => fonts.map((font) => Font.loadAsync(font));

const RootNavigation = () => {
  const [ready, setReady] = useState(false);
  const token = useSelector((state) => state.AuthReducers.authToken);
  const dispatch = useDispatch();

  const onFinish = () => setReady(true);

  // PreLoading
  const startLoading = async () => {
    await dispatch(Init());
  };

  if (!ready) {
    return <AppLoading startAsync={startLoading} onFinish={onFinish} onError={console.error} />;
  }

  return <NavigationContainer>{token === 1 ? <LoginStack /> : <Root />}</NavigationContainer>;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ToastProvider
          offset={50}
          successColor="#295AF5"
          warningColor="#8E8E8E"
          duration={3000}
          animationType="zoom-in"
          style={{ borderRadius: 20, paddingHorizontal: 25 }}
          icon={<Ionicons name="checkmark-circle" size={18} color="white" />}
        >
          <RootNavigation />
        </ToastProvider>
      </Provider>
    </QueryClientProvider>
  );
}
