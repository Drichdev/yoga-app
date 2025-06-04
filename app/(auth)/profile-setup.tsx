import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');

// Ajout d'IDs uniques pour chaque image
const defaultImages = [
  { id: '1', image: require('../../assets/images/profi1.png') },
  { id: '2', image: require('../../assets/images/profi2.png') },
  { id: '3', image: require('../../assets/images/profi3.png') },
  { id: '4', image: require('../../assets/images/profi4.png') },
  { id: '5', image: require('../../assets/images/profi5.png') },
];

export default function ProfileSetupScreen() {
  const [name, setName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | number | null>(null);
  const router = useRouter();
  const carouselRef = useRef(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    try {
      if (!name.trim() || selectedImage === null) {
        Alert.alert('Error', 'Please enter your name and select a profile picture');
        return;
      }

      let imageUri;
      if (typeof selectedImage === 'string') {
        // Pour les images de la galerie
        imageUri = selectedImage;
      } else {
        // Pour les images par défaut
        const selected = defaultImages[selectedImage as number];
        imageUri = Image.resolveAssetSource(selected.image).uri;
      }

      await AsyncStorage.multiSet([
        ['user_name', name.trim()],
        ['user_image', imageUri]
      ]);

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Configurez votre profil</Text>

      <View style={styles.carouselContainer}>
        <Carousel
          ref={carouselRef}
          loop
          width={width * 0.7}
          height={width * 0.7}
          data={defaultImages}
          scrollAnimationDuration={300}
          mode="horizontal-stack"
          modeConfig={{
            snapDirection: 'left',
            stackInterval: 30,
            scaleInterval: 0.08,
            opacityInterval: 0.15,
          }}
          onSnapToItem={(index) => setSelectedImage(index)}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              key={item.id} // Clé unique ici
              onPress={() => setSelectedImage(index)}
              style={[
                styles.imageContainer,
                selectedImage === index && styles.selectedImageContainer,
              ]}
            >
              <Image source={item.image} style={styles.carouselImage} />
            </TouchableOpacity>
          )}
        />
      </View>

      <TouchableOpacity onPress={pickImage} style={styles.galleryButton}>
        <Text style={styles.galleryButtonText}>Choisir depuis la galerie</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Votre nom</Text>
      <TextInput
        placeholder="Entrez votre nom"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={saveProfile}
          disabled={!name || selectedImage === null}
          style={[
            styles.continueButton,
            (!name || selectedImage === null) && styles.disabledButton,
          ]}
        >
          <Text style={styles.continueButtonText}>Continuez</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  carouselContainer: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    overflow: 'hidden',
    borderWidth: 5,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImageContainer: {
    borderColor: '#007AFF',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  galleryButton: {
    marginVertical: 20,
    alignSelf: 'center',
  },
  galleryButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontSize: 16,
    paddingVertical: 8,
    marginBottom: 30,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 70,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});
