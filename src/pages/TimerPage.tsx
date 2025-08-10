import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Vibration } from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Exercise } from '../context/TrainingContext';
import { HomeStackParamList } from '../navigation/types';

// ... (Tipos TimerPageRouteProp e TimerPageProps)

const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const TimerPage: React.FC<TimerPageProps> = ({ route }) => {
  const navigation = useNavigation();
  const { exercise, phaseInfo } = route.params;

  const [secondsLeft, setSecondsLeft] = useState(phaseInfo.rest);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(s => s - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      Vibration.vibrate([500, 500, 500]); // Vibra 3 vezes quando o tempo acaba
      // Aqui poderíamos tocar um som
    }
    
    // Limpa o intervalo quando o componente é desmontado ou o timer para
    return () => { if(interval) clearInterval(interval) };
  }, [isActive, secondsLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(phaseInfo.rest);
  }

  const getButtonText = () => {
      if (secondsLeft === 0) return "PRÓXIMA SÉRIE!";
      if (isActive) return "PAUSAR";
      return "COMEÇAR DESCANSO";
  }

  return (
    <SafeAreaView style={[styles.container, { borderTopColor: phaseInfo.color, borderTopWidth: 6 }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back-outline" size={30} color="white" />
          <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.phaseName}>{phaseInfo.name} | {exercise.reps} reps</Text>
        
        <Text style={styles.timerDisplay}>{formatTime(secondsLeft)}</Text>

        <TouchableOpacity 
            onPress={secondsLeft === 0 ? resetTimer : toggleTimer} 
            style={[styles.button, isActive && styles.pauseButton]}
        >
          <Text style={styles.buttonText}>{getButtonText()}</Text>
        </TouchableOpacity>
        
        {/* Mostra o botão de resetar apenas se o timer não estiver ativo e já tiver começado */}
        {!isActive && secondsLeft > 0 && secondsLeft < phaseInfo.rest && (
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
    exerciseName: { fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 8 },
    phaseName: { fontSize: 20, color: '#9CA3AF', marginBottom: 60 },
    timerDisplay: { fontSize: 90, fontWeight: '200', color: 'white', marginBottom: 60, fontFamily: 'monospace' },
    button: { backgroundColor: '#10B981', borderRadius: 99, paddingVertical: 20, paddingHorizontal: 60 },
    pauseButton: { backgroundColor: '#F59E0B' }, // Laranja para pausar
    buttonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    resetButton: { marginTop: 20 },
    resetButtonText: { color: '#9CA3AF', fontSize: 16 },
});

export default TimerPage;