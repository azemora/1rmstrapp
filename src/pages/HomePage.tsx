import React, { useState, useContext } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import CalendarComponent from '../components/Calendar';
import { TrainingContext, Exercise, Profile, CalibrationData } from '../context/TrainingContext';
import { getTrainingPhase, getWorkingLoad } from '../utils/formulas';
import { TRAINING_PHASES } from '../data/trainingConfig';

interface ExerciseCardProps {
  exercise: Exercise;
  date: Date;
  calibration: CalibrationData;
  navigation: any;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, date, calibration, navigation }) => {
  if (!calibration) {
    return (
      <View style={styles.card}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseDetails}>Calibragem pendente. Vá para a tela de Calibragem no menu.</Text>
      </View>
    );
  }

  const phaseInfo = getTrainingPhase(date);
  const workingLoad = getWorkingLoad(calibration.oneRepMax, phaseInfo.phase);
  const phaseConfig = TRAINING_PHASES[phaseInfo.phase];

  return (
    <View style={[styles.card, { borderTopColor: phaseConfig.color, borderTopWidth: 4 }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TimerPage', { exercise, phaseInfo: phaseConfig })}>
          <Icon name="time-outline" size={28} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.exerciseDetails}>Séries: {phaseInfo.sets}</Text>
        <Text style={styles.exerciseDetails}>Repetições: {phaseInfo.reps}</Text>
        <Text style={styles.exerciseDetails}>Carga: ~{workingLoad}kg</Text>
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
  const { profilesData, activeProfile, setActiveProfile } = useContext(TrainingContext);
  
  const dayOfWeek = selectedDate.getDay();
  const workoutForDay = activeProfile?.plan ? activeProfile.plan[dayOfWeek] : null;

  const phaseInfo = getTrainingPhase(selectedDate);
  const phaseConfig = TRAINING_PHASES[phaseInfo.phase];

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={profilesData.activeProfileId || undefined}
                onValueChange={(itemValue: string) => setActiveProfile(itemValue)}
                style={styles.picker}
                dropdownIconColor="#A78BFA"
              >
                {Object.values(profilesData.profiles).map((profile: Profile) => (
                  <Picker.Item key={profile.id} label={profile.name} value={profile.id} />
                ))}
              </Picker>
            </View>

            <CalendarComponent onDateSelect={setSelectedDate} />
            
            <View style={styles.headerContainer}>
                <View>
                    <Text style={styles.workoutName}>{workoutForDay ? workoutForDay.dayName : 'Descanso'}</Text>
                    {workoutForDay && <Text style={[styles.phaseTitle, {color: phaseConfig.color}]}>{phaseConfig.name}</Text>}
                </View>
                <TouchableOpacity onPress={() => {}} style={[styles.startButton, {backgroundColor: phaseConfig.color}]}>
                    <Text style={styles.startButtonText}>Começar Treino</Text>
                </TouchableOpacity>
            </View>

            {workoutForDay && workoutForDay.exercises.length > 0 && activeProfile ? (
                workoutForDay.exercises.map((exercise: Exercise) => 
                  <ExerciseCard 
                    key={exercise.id} 
                    exercise={exercise}
                    date={selectedDate}
                    calibration={activeProfile.calibration}
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
    pickerContainer: { backgroundColor: '#374151', borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#4B5563' },
    picker: { color: 'white' },
    headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginHorizontal: 5 },
    workoutName: { fontSize: 24, fontWeight: '600', color: '#A78BFA' },
    phaseTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
    startButton: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
    startButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    card: { backgroundColor: '#1F2937', borderRadius: 12, padding: 16, marginBottom: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    exerciseName: { fontSize: 20, fontWeight: 'bold', color: '#F9FAFB' },
    exerciseDetails: { fontSize: 16, color: '#D1D5DB', marginTop: 8 },
    detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
});

export default HomePage;