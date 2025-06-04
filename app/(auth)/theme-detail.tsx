import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ThemeDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [sound, setSound] = useState<Audio.Sound>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const title = params.title as string;
  const mood = params.mood as string;
  const durationText = params.duration as string;
  const audioFile = JSON.parse(params.audioFile as string);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const togglePlayback = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
        setIsPlaying(!isPlaying);
      } else {
        const { sound: newSound, status } = await Audio.Sound.createAsync(audioFile);
        setSound(newSound);
        await newSound.playAsync();
        setIsPlaying(true);
        
        // Vérifier si la durée est disponible
        if (status.isLoaded && status.durationMillis) {
          setDuration(status.durationMillis);
        }

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            // Vérifier que positionMillis et durationMillis sont définis
            if (status.positionMillis !== undefined && status.durationMillis !== undefined) {
              const newProgress = status.positionMillis / status.durationMillis;
              setProgress(newProgress);
              setDuration(status.durationMillis);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const formatTime = (millis: number) => {
    if (!millis) return "0:00";
    
    const totalSeconds = millis / 1000;
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Convertir la durée du texte (ex: "35:00") en millisecondes
  const durationFromText = () => {
    const [mins, secs] = durationText.split(':').map(Number);
    return (mins * 60 + secs) * 1000;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.coverContainer}>
          <Image 
            source={require('../../assets/images/cover.png')} 
            style={styles.coverImage}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.mood}>{mood}</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(progress * (duration || durationFromText()))}</Text>
            <Text style={styles.timeText}>{durationText}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.playButton} 
          onPress={togglePlayback}
        >
          <Text style={styles.playButtonText}>
            {isPlaying ? '⏸' : '▶'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60, 
  },
  header: {
    marginBottom: 10,
  },
  backButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverContainer: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 30,
    overflow: 'hidden',
        alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'cover',

  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  mood: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#666',
  },
  playButton: {
    backgroundColor: '#007AFF',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 30,
  },
});