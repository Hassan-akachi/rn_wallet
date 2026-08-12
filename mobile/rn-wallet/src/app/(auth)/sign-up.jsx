import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSignUp } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styles } from "@/assets/styles/auth.styles.js";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../constants/colors";
import { Image } from "expo-image";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  
 // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!signUp) return;

    // 1. Create the user with the new password() method
    const { error: createError } = await signUp.password({
      emailAddress,
      password,
    });

    if (createError) {
      console.error("CLERK CREATE ERROR:", JSON.stringify(createError, null, 2));
      if (createError.code === "form_identifier_exists") {
        setError("That email address is already in use. Please try another.");
      } else {
        setError(createError.message || "An error occurred. Please try again.");
      }
      return; // Stop execution if there is an error
    }

    // 2. Send the verification code (Replaces prepareEmailAddressVerification)
    const { error: sendError } = await signUp.verifications.sendEmailCode();

    if (sendError) {
      console.error("CLERK SEND ERROR:", JSON.stringify(sendError, null, 2));
      setError(sendError.message || "Failed to send verification code.");
      return;
    }

    // 3. Display the OTP form
    setPendingVerification(true);
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!signUp) return;

    // 1. Verify the code (Replaces attemptEmailAddressVerification)
    const { error: verifyError } = await signUp.verifications.verifyEmailCode({
      code,
    });

    if (verifyError) {
      console.error("CLERK VERIFY ERROR:", JSON.stringify(verifyError, null, 2));
      setError("Invalid verification code. Please try again.");
      return;
    }

    // 2. Finalize the sign-up (Replaces setActive)
    // Core 3 automatically activates the session when finalize() is called
    const { error: finalizeError } = await signUp.finalize();

    if (finalizeError) {
      console.error("CLERK FINALIZE ERROR:", JSON.stringify(finalizeError, null, 2));
      setError("Account created, but failed to log in automatically.");
      return;
    }

    // Success! Redirect to home
    router.replace("/");
  };

  if (pendingVerification) {
    return (
      <View style={styles.verificationContainer}>
        <Text style={styles.verificationTitle}>Verify your email</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")}>
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={[styles.verificationInput, error && styles.errorInput]}
          value={code}
          placeholder="Enter your verification code"
          placeholderTextColor="#9A8478"
          onChangeText={(code) => setCode(code)}
        />

        <TouchableOpacity onPress={onVerifyPress} style={styles.button}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraHeight={100}
    >
      <View style={styles.container}>
        <Image
          source={require("../../../assets/images/revenue-i2.png")}
          style={styles.illustration}
        />

        <Text style={styles.title}>Create Account</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")}>
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={[styles.input, error && styles.errorInput]}
          autoCapitalize="none"
          value={emailAddress}
          placeholderTextColor="#9A8478"
          placeholder="Enter email"
          onChangeText={(email) => setEmailAddress(email)}
        />

        <TextInput
          style={[styles.input, error && styles.errorInput]}
          value={password}
          placeholder="Enter password"
          placeholderTextColor="#9A8478"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />

        <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
