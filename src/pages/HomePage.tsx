import React, { useState, useContext } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import CalendarComponent from '../components/Calendar';
import { TrainingContext, Exercise, Profile } from '../context/TrainingContext';
import { getTrainingPhase, getWorkingLoad } from '../utils/formulas';
import { TRAINING_PHASES } from '../data/trainingConfig';

interface ExerciseCardProps {
  exercise: Exercise;
  date: Date;
  navigation: any;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, date, navigation }) => {
  const isManual = exercise.mode === 'manual';
  const phaseInfo = getTrainingPhase(date);
  const phaseConfig = TRAINING_PHASES[phaseInfo.phase];

  let displaySets = isManual ? exercise.manualSets : phaseInfo.sets;
  let displayReps = isManual ? exercise.manualReps : phaseInfo.reps;
  let displayLoad = 'Calibrar'; // Padrão

  if (isManual) {
    displayLoad = exercise.manualLoad || 'Definir';
  } else if (exercise.oneRepMax && exercise.oneRepMax > 0) {
    displayLoad = getWorkingLoad(exercise.oneRepMax, phaseInfo.phase);
  }

  return (
    <View style={[styles.card, { borderTopColor: phaseConfig.color, borderTopWidth: 4 }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TimerPage', { 
            exercise, 
            phaseInfo: { ...phaseConfig, ...phaseInfo, sets: displaySets, reps: displayReps } 
        })}>
          <Icon name="time-outline" size={28} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.exerciseDetails}>Séries: {displaySets}</Text>
        <Text style={styles.exerciseDetails}>Repetições: {displayReps}</Text>
        <Text style={styles.exerciseDetails}>Carga: {displayLoad}</Text>
      </View>
    </View>
  );
};
  
const RestDay = () => (
    <View style={styles.card}>
      <Text style={styles.exerciseName}>Dia de Descanso!</Text>
      <Text style={styles.exerciseDetails}>Aproveite para se recuperar.</Text>
    </View>
);

const HomePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigation = useNavigation<any>();
  const { activeProfile } = useContext(TrainingContext);
  
  const dayOfWeek = selectedDate.getDay();
  const workoutForDay = activeProfile?.plan ? activeProfile.plan[dayOfWeek] : null;

  const phaseInfo = getTrainingPhase(selectedDate);
  const phaseConfig = TRAINING_PHASES[phaseInfo.phase];

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollView}>
            <CalendarComponent onDateSelect={setSelectedDate} />
            
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Setup', { selectedDay: selectedDate.getDay() })} // Enviando o dia da semana
                style={[styles.button, styles.editButton]}
              >
                  <Text style={styles.buttonText}>Adicionar/Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
    onPress={() => navigation.navigate('ActiveWorkout', { workout: workoutForDay })} 
    style={[styles.startButton, {backgroundColor: phaseConfig.color}]}
>
    <Text style={styles.startButtonText}>Começar Treino</Text>
</TouchableOpacity>
            </View>

            <View style={styles.headerContainer}>
                <Text style={styles.workoutName}>{workoutForDay ? workoutForDay.dayName : 'Descanso'}</Text>
                {workoutForDay && workoutForDay.exercises.length > 0 && 
                  <Text style={[styles.phaseTitle, {color: phaseConfig.color}]}>{phaseConfig.name}</Text>
                }
            </View>

            {workoutForDay && workoutForDay.exercises.length > 0 && activeProfile ? (
                workoutForDay.exercises.map((exercise: Exercise) => 
                  <ExerciseCard 
                    key={exercise.id} 
                    exercise={exercise}
                    date={selectedDate}
                    navigation={navigation}
                  />)
            ) : ( <RestDay /> )}
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827' },
    scrollView: { padding: 10 },
    actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20, },
    button: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16, },
    editButton: { backgroundColor: '#4B5563', },
    headerContainer: { paddingHorizontal: 5, marginBottom: 10 },
    workoutName: { fontSize: 24, fontWeight: '600', color: '#A78BFA' },
    phaseTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
    card: { backgroundColor: '#1F2937', borderRadius: 12, padding: 16, marginBottom: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    exerciseName: { fontSize: 20, fontWeight: 'bold', color: '#F9FAFB', flexShrink: 1, paddingRight: 10 },
    exerciseDetails: { fontSize: 16, color: '#D1D5DB' },
    detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#374151' },
     startButton: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
    startButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default HomePage;