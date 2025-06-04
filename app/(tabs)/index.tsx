import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type Theme = {
  id: string;
  title: string;
  duration: string;
  mood: string;
  audioFile: any;
};

type DayData = {
  date: string;
  dayName: string;
  dayNumber: string;
  themes: Theme[];
};

export default function HomeScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [days, setDays] = useState<DayData[]>([]);
  const [currentDateIndex, setCurrentDateIndex] = useState(2);
  const [sound, setSound] = useState<Audio.Sound>();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const demoThemes = [
    { id: '1', title: 'Energy morning', duration: '10:00', mood: 'Rock your skills', audioFile: require('../../assets/music/energy.mp4') },
    { id: '2', title: 'Back pain', duration: '15:00', mood: 'Cheerful mood', audioFile: require('../../assets/music/pain.mp4') },
    { id: '3', title: 'Focus mode', duration: '25:00', mood: 'Deep concentration', audioFile: require('../../assets/music/focus.mp4') },
    { id: '4', title: 'Sleep well', duration: '10:00', mood: 'Relaxing sounds', audioFile: require('../../assets/music/sleep.mp4') },
    { id: '5', title: 'Meditation', duration: '15:00', mood: 'Inner peace', audioFile: require('../../assets/music/meditation.mp3') },
  ];

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

      const today = new Date();
      const daysData: DayData[] = [];

      for (let i = -2; i <= 2; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const dayName = dayNames[date.getDay()];
        const dayNumber = date.getDate().toString();

        daysData.push({
          date: date.toISOString().split('T')[0],
          dayName,
          dayNumber,
          themes: Array.from(new Map([...demoThemes.slice(0, 5), ...demoThemes.slice(0, 3)].map(item => [item.id, item])).values())
        });
      }

      setDays(daysData);
    };

    fetchData();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

const playSound = async (audioFile: any, themeId: string) => {
  try {
    // Si un son est déjà en cours
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.stopAsync();
      }
      await sound.unloadAsync();
      setSound(undefined);
    }

    // Si on clique sur le même bouton => arrêt
    if (playingId === themeId) {
      setPlayingId(null);
      return;
    }

    // Lecture du nouveau son
    const { sound: newSound } = await Audio.Sound.createAsync(audioFile);
    setSound(newSound);
    setPlayingId(themeId);

    await newSound.playAsync();

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        setPlayingId(null);
        newSound.unloadAsync();
      }
    });

  } catch (error) {
    console.error('Erreur de lecture audio :', error);
  }
};


  const navigateToThemeDetail = (theme: Theme) => {
    router.push({
      pathname: '../theme-detail',
      params: {
        title: theme.title,
        mood: theme.mood,
        duration: theme.duration,
        audioFile: JSON.stringify(theme.audioFile)
      }
    });
  };

  const filteredThemes = days[currentDateIndex]?.themes.filter(theme =>
    theme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    theme.mood.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{name}</Text>
        </View>
        {image && (
          <Image
            source={{ uri: image }}
            style={styles.profileImage}
            contentFit="cover"
          />
        )}
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search ..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Calendrier */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.calendarContainer}
        snapToInterval={width * 0.2}
        decelerationRate="fast"
        onScroll={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          const newIndex = Math.round(x / (width * 0.2));
          if (newIndex !== currentDateIndex) {
            setCurrentDateIndex(newIndex);
          }
        }}
        scrollEventThrottle={16}
      >
        {days.map((day, index) => (
          <TouchableOpacity
            key={day.date}
            style={[
              styles.dayContainer,
              index === currentDateIndex && styles.currentDayContainer
            ]}
            onPress={() => setCurrentDateIndex(index)}
          >
            <Text style={styles.dayName}>{day.dayName}</Text>
            <Text style={styles.dayNumber}>{day.dayNumber}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Titre des picks du jour */}
      <View style={styles.picksHeader}>
        <Text style={styles.picksTitle}>Today's picks 🧘</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des thèmes */}
      <FlatList
        data={filteredThemes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.themeCard}
            onPress={() => navigateToThemeDetail(item)}
          >
            <View style={styles.themeInfo}>
              <Text style={styles.themeTitle}>{item.title}</Text>
              <Text style={styles.themeMood}>{item.mood} • {item.duration}</Text>
            </View>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => playSound(item.audioFile, item.id)}
            >
              <Text style={styles.playButtonText}>{playingId === item.id ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.themesList}
      />
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    paddingTop: 70,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 15,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  calendarContainer: {
    paddingBottom: 15,
  },
  dayContainer: {
    width: width * 0.18,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  currentDayContainer: {
    backgroundColor: '#f0f7ff',
  },
  dayName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 5,
  },
  picksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  picksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#007AFF',
    fontSize: 16,
  },
  themesList: {
    paddingBottom: 20,
  },
  themeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  themeInfo: {
    flex: 1,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  themeMood: {
    fontSize: 14,
    color: '#666',
  },
  playButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});