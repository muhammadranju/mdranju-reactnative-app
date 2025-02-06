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
  useColorScheme,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

import "./index.css";

SplashScreen.preventAutoHideAsync();

const App = () => {
  const [isConnected, setIsConnected] = useState(null);
  const [appIsReady, setAppIsReady] = useState(false);
  const colorScheme = useColorScheme();
  const [statusBarColor, setStatusBarColor] = useState("#0f172a");
  const [webViewKey, setWebViewKey] = useState(0);

  const theme = {
    dark: {
      background: "#0f172a",
      statusBar: "#0f172a",
      text: "#ffffff",
      danger: "#dc2626",
    },
    light: {
      background: "#ffffff",
      statusBar: "#ffffff",
      text: "#1e293b",
      danger: "#b91c1c",
    },
  };

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setWebViewKey((prev) => prev + 1); // Force WebView re-render
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

  const currentTheme = theme[colorScheme];

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <StatusBar
        animated={true}
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={"#0f172a"}
      />

      {!isConnected ? (
        <View
          style={[
            styles.offlineContainer,
            { backgroundColor: currentTheme.background },
          ]}
        >
          <Text style={[styles.offlineText, { color: currentTheme.danger }]}>
            No Internet Connection
          </Text>
          <Text style={[styles.offlineSubText, { color: currentTheme.text }]}>
            Please check your network settings and try again.
          </Text>
        </View>
      ) : (
        <WebView
          key={webViewKey}
          source={{ uri: "https://www.mdranju.xyz" }}
          startInLoadingState={true}
          renderLoading={() => (
            <View
              style={[
                styles.loadingContainer,
                { backgroundColor: currentTheme.background },
              ]}
            >
              <ActivityIndicator size="large" color={currentTheme.text} />
            </View>
          )}
          style={[
            styles.webview,
            {
              backgroundColor: currentTheme.background,
              paddingTop: statusBarColor,
            },
          ]}
          injectedJavaScript={`
            document.body.style.backgroundColor = '${currentTheme.background}';
            true;
          `}
          onLoadProgress={({ nativeEvent }) => {
            if (nativeEvent.progress === 1) {
              setStatusBarColor(currentTheme.statusBar);
            }
          }}
          onError={() => setStatusBarColor(currentTheme.statusBar)}
          mixedContentMode="compatibility"
          allowsFullscreenVideo
          javaScriptEnabled
          domStorageEnabled
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  offlineText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  offlineSubText: {
    fontSize: 16,
    textAlign: "center",
  },
});

export default App;
