import NetInfo from "@react-native-community/netinfo";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Appearance,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const App = () => {
  const [isConnected, setIsConnected] = useState(null);
  const [appIsReady, setAppIsReady] = useState(false);
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        const state = await NetInfo.fetch();
        setIsConnected(state.isConnected);
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const getThemeStyles = () =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "#0f172a" : "#ffffff",
      },
      offlineText: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        color: colorScheme === "dark" ? "#dc2626" : "#b91c1c",
      },
      offlineSubText: {
        fontSize: 16,
        textAlign: "center",
        color: colorScheme === "dark" ? "#f1f5f9" : "#1e293b",
      },
    });

  if (!appIsReady) {
    return null;
  }

  const themeStyles = getThemeStyles();

  return (
    <SafeAreaView style={themeStyles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={colorScheme === "light" ? "dark-content" : "dark-content"}
      />

      {!isConnected ? (
        <View style={[styles.offlineContainer, themeStyles.container]}>
          <Text style={themeStyles.offlineText}>No Internet Connection</Text>
          <Text style={themeStyles.offlineSubText}>
            Please check your network settings and try again.
          </Text>
        </View>
      ) : (
        <WebView
          source={{ uri: "https://www.mdranju.xyz" }}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={[styles.loadingContainer, themeStyles.container]}>
              <ActivityIndicator
                size="large"
                color={colorScheme === "light" ? "#0f172a" : "#0a0e19"}
              />
            </View>
          )}
          style={[
            styles.webview,
            {
              marginTop: StatusBar.currentHeight,
              backgroundColor: themeStyles.container.backgroundColor,
            },
          ]}
          injectedJavaScriptForMainFrameOnly={true}
          injectedJavaScript={`
            document.body.style.backgroundColor = '${themeStyles.container.backgroundColor}';
            true;
          `}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.log("WebView error:", nativeEvent);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.log("HTTP error:", nativeEvent.statusCode);
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  offlineContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

export default App;
