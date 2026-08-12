import { useClerk } from "@clerk/expo";
import * as Linking from "expo-linking";
import { Alert, Text, TouchableOpacity } from "react-native";
import { styles } from "../assets/styles/home.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "../constants/colors";

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();

  // const handleSignOut = async () => {

  //   try {
  //     // Sign out the user
  //     await signOut();

  //     // Redirect to the sign-in page after signing out
  //     Linking.openURL(Linking.createURL("/"));
  //   } catch (error) {
  //     console.error("Error signing out:", error);
  //   }
  //   Alert.alert("Logout", "Are you sure you want to logout?", [
  //     { text: "Cancel", style: "cancel" },
  //     { text: "Logout", style: "destructive", onPress: signOut },
  //   ]);
  // };

  const handleSignOut = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        style: "destructive", 
        onPress: async () => {
          try {
            await signOut();
            // Expo Router handles redirection automatically 
            // when the auth state changes, no need for Linking.openURL
          } catch (error) {
            console.error("Error signing out:", error);
          }
        }
      },
    ]);
  };

  return (
    <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
      <Ionicons name="log-out-outline" size={22} color={COLORS.text} />
    </TouchableOpacity>
  );
};