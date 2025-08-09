import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Exercise } from '../context/TrainingContext';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from '../navigation/types';




type TimerPageRouteParams = {
  TimerPage: {
    exercise: Exercise;
    phaseInfo: { name: string; color: string; rest: number };
  };
};

type TimerPageRouteProp = RouteProp<HomeStackParamList, 'TimerPage'>;

interface TimerPageProps {
  route: TimerPageRouteProp;
}

const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const TimerPage: React.FC<TimerPageProps> = ({ route }) => {
  const navigation = useNavigation();
  const { exercise, phaseInfo } = route.params;

  const [seconds, setSeconds] = useState(phaseInfo.rest);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
        if(interval) clearInterval(interval);
    } else if (seconds === 0) {
        // Toca animação/som aqui
        setIsActive(false);
    }
    return () => { if(interval) clearInterval(interval) };
  }, [isActive, seconds]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(phaseInfo.rest);
  }

  return (
    <SafeAreaView style={[styles.container, { borderTopColor: phaseInfo.color, borderTopWidth: 6 }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back-outline" size={30} color="white" />
          <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.phaseName}>{phaseInfo.name}</Text>
        
        <Text style={styles.timerDisplay}>{formatTime(seconds)}</Text>

        <TouchableOpacity onPress={toggleTimer} style={styles.button}>
          <Text style={styles.buttonText}>{isActive ? 'Pausar' : 'Começar Descanso'}</Text>
        </TouchableOpacity>
        
        {!isActive && seconds < phaseInfo.rest && (
            <TouchableOpacity onPress={resetTimer} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Resetar</Text>
            </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    backButton: { position: 'absolute', top: 50, left: 10, flexDirection: 'row', alignItems: 'center', zIndex: 10 },
    backButtonText: { color: 'white', fontSize: 18 },
    exerciseName: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 8 },
    phaseName: { fontSize: 20, color: '#9CA3AF', marginBottom: 60 },
    timerDisplay: { fontSize: 80, fontWeight: 'bold', color: 'white', marginBottom: 60, fontFamily: 'monospace' },
    button: { backgroundColor: '#8B5CF6', borderRadius: 15, paddingVertical: 20, paddingHorizontal: 60 },
    buttonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    resetButton: { marginTop: 20 },
    resetButtonText: { color: '#9CA3AF', fontSize: 16 },
});

export default TimerPage;