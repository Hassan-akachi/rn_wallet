import SafeScreen from "../../components/SafeScreen"; 
import { ClerkProvider } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import { Slot } from 'expo-router'
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
// import { tokenCache } from '@clerk/clerk-expo/token-cache'


export default function RootLayout() {
  return (
    <SafeAreaView style={{ flex: 1,}}>
    <ClerkProvider 
    publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
    tokenCache={tokenCache}>
      <SafeScreen>
      <Slot/>
    </SafeScreen>
    <StatusBar style="dark" />
    </ClerkProvider>
    </SafeAreaView>
  );
}