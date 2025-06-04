import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Image as RNImage, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TabTwoScreen() {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const userName = await AsyncStorage.getItem('user_name');
      const userImage = await AsyncStorage.getItem('user_image');

      if (userName) setName(userName);

      if (userImage) {
        if (userImage.startsWith('file://') || userImage.startsWith('http')) {
          setImage(userImage);
        } else {
          const parsed = JSON.parse(userImage);
          setImage(typeof parsed === 'string' ? parsed : RNImage.resolveAssetSource(parsed).uri);
        }
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.replace('/(auth)/welcome');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={24} color="#ff4444" />
        </TouchableOpacity>
      </View>

      {image ? (
        <Image source={{ uri: image }} style={styles.profileImage} contentFit="cover" />
      ) : null}

      <Text style={styles.name}>{name}</Text>

      <View style={styles.footer}>
        <Text style={styles.authorText}>Author: Drichdev</Text>
      </View>
    </View>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    marginBottom: 60,
  },
  authorText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#888',
  },
});