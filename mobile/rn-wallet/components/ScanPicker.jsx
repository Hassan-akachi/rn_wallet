import { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { scanFile } from "../utils/receiptScanner";

export default function ScanPicker({ onScanned, styles }) {
  const [scanning, setScanning] = useState(false);

  const run = async (uri, mimeType) => {
    setScanning(true);
    try {
      const data = await scanFile(uri, mimeType);
      if (!data.amount && !data.title) {
        Alert.alert("Nothing found", "Couldn't read details from that file. Try a clearer photo.");
      }
      onScanned(data);
    } catch (e) {
      Alert.alert("Scan failed", e.message);
    } finally {
      setScanning(false);
    }
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission needed", "Allow photo access to scan receipts.");
   const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, mediaTypes: ['images'] });
    if (!res.canceled) run(res.assets[0].uri, res.assets[0].mimeType || "image/jpeg");
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission needed", "Allow camera access to scan receipts.");
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!res.canceled) run(res.assets[0].uri, res.assets[0].mimeType || "image/jpeg");
  };

  const pickDocument = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "image/*"], copyToCacheDirectory: true });
    if (!res.canceled) run(res.assets[0].uri, res.assets[0].mimeType || "application/pdf");
  };

  const openMenu = () =>
    Alert.alert("Scan receipt", "Choose a source", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Pick Image", onPress: pickImage },
      { text: "Pick Document", onPress: pickDocument },
      { text: "Cancel", style: "cancel" },
    ]);

  return (
    <TouchableOpacity style={styles.scanButton} onPress={openMenu} disabled={scanning}>
      {scanning ? (
        <ActivityIndicator size="small" color={COLORS.primary} />
      ) : (
        <Ionicons name="scan-outline" size={20} color={COLORS.primary} />
      )}
      <Text style={styles.scanButtonText}>{scanning ? "Scanning..." : "Scan receipt / document"}</Text>
    </TouchableOpacity>
  );
}
