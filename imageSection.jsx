import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ImagesSection() {
  const [images, setImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission required to access gallery!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
    setModalVisible(false);
  };

  // Take photo using camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Permission required to access camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
    setModalVisible(false);
  };

  // Remove image by index
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Images</Text>
      <FlatList
        data={images}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        renderItem={({ item, index }) => (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: item }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeImage(index)}
            >
              <Ionicons name="close-circle" size={22} color="red" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>No images yet.</Text>}
      />

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Photo</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={takePhoto}>
              <Ionicons name="camera" size={22} color="#22c55e" />
              <Text style={styles.modalText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtn} onPress={pickImage}>
              <Ionicons name="image" size={22} color="#22c55e" />
              <Text style={styles.modalText}>Upload from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalText, { color: "red" }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  imageWrapper: {
    width: "48%",
    margin: "1%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  removeBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 1,
  },
  addBtn: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#22c55e",
    borderRadius: 50,
    padding: 16,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  modalText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#333",
  },
});
