// app/_layout.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Slot, SplashScreen, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

SplashScreen.preventAutoHideAsync();

type InitialRoute = "/(tabs)" | "/welcome";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<InitialRoute>("/welcome");
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        const name = await AsyncStorage.getItem("user_name");
        const image = await AsyncStorage.getItem("user_image");

        if (name && image) {
          setInitialRoute("/(tabs)");
        } else {
          setInitialRoute("/welcome");
        }
      } catch (e) {
        console.warn(e);
        setInitialRoute("/welcome");
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (isReady && initialRoute) {
      router.replace(initialRoute as any);
    }
  }, [isReady, initialRoute]);

  if (!isReady) {
    return <View />;
  }

  return <Slot />;
}
