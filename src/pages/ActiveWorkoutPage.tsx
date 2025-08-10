import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { TrainingContext, Exercise } from '../context/TrainingContext';
import { getTrainingPhase, getWorkingLoad } from '../utils/formulas';
import { HomeStackParamList } from '../navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';

type ActiveWorkoutPageRouteProp = RouteProp<HomeStackParamList, 'ActiveWorkout'>;
interface ActiveWorkoutPageProps { 
  route: ActiveWorkoutPageRouteProp; 
}

const ActiveWorkoutPage: React.FC<ActiveWorkoutPageProps> = ({ route }) => {
    const navigation = useNavigation<any>();
    const { workout } = route.params;
    const [currentExIndex, setCurrentExIndex] = useState(0);
    const [loggedReps, setLoggedReps] = useState<Array<string>>([]);
    
    const { activeProfile } = useContext(TrainingContext);

    // --- A CORREÇÃO ESTÁ AQUI ---
    // Se for um dia de descanso, 'workout' será nulo.
    if (!workout || workout.exercises.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.exerciseName}>Dia de Descanso!</Text>
                    <Text style={styles.progressText}>Nenhum exercício para hoje.</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.nextButton}>
                    <Text style={styles.nextButtonText}>Voltar</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }
    // A partir daqui, o TypeScript sabe que 'workout' não é mais nulo.

    const exercise = workout.exercises[currentExIndex];
    const phaseInfo = getTrainingPhase(new Date());
    const workingLoad = getWorkingLoad(exercise.oneRepMax, phaseInfo.phase);
    const setsCount = Array(phaseInfo.sets).fill(0);

    const handleRepChange = (text: string, index: number) => {
        const newReps = [...loggedReps];
        newReps[index] = text.replace(/[^0-9]/g, '');
        setLoggedReps(newReps);
    };

    const goToNextExercise = () => {
        if (currentExIndex < workout.exercises.length - 1) {
            setCurrentExIndex(currentExIndex + 1);
            setLoggedReps([]);
        } else {
            Alert.alert("Treino Finalizado!", "Parabéns, você completou o treino de hoje.");
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.progressText}>{currentExIndex + 1} / {workout.exercises.length}</Text>
            </View>

            <View style={styles.detailsCard}>
                <Text style={styles.detailText}>Séries: {phaseInfo.sets}</Text>
                <Text style={styles.detailText}>Reps Alvo: {phaseInfo.reps}</Text>
                <Text style={styles.detailText}>Carga: {workingLoad}</Text>
            </View>

            <ScrollView>
                {setsCount.map((_, index) => (
                    <View key={index} style={styles.setRow}>
                        <Text style={styles.setText}>Série {index + 1}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Reps"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="number-pad"
                            value={loggedReps[index] || ''}
                            onChangeText={(text) => handleRepChange(text, index)}
                        />
                        <TouchableOpacity onPress={() => navigation.navigate('TimerPage', { exercise, phaseInfo: {...phaseInfo, rest: 180, color: '#FFF'} })}>
                            <Icon name="time-outline" size={30} color="#8B5CF6" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            <TouchableOpacity style={styles.nextButton} onPress={goToNextExercise}>
                <Text style={styles.nextButtonText}>
                    {currentExIndex < workout.exercises.length - 1 ? 'Próximo Exercício' : 'Finalizar Treino'}
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827' },
    header: { padding: 20 },
    exerciseName: { color: 'white', fontSize: 32, fontWeight: 'bold', textAlign: 'center' },
    progressText: { color: '#9CA3AF', fontSize: 16, textAlign: 'center', marginTop: 5 },
    detailsCard: { backgroundColor: '#1F2937', marginHorizontal: 20, borderRadius: 12, padding: 15, flexDirection: 'row', justifyContent: 'space-around' },
    detailText: { color: 'white', fontSize: 16, fontWeight: '600' },
    setRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginVertical: 10 },
    setText: { color: 'white', fontSize: 18, flex: 1 },
    input: { backgroundColor: '#374151', color: 'white', borderRadius: 8, padding: 15, fontSize: 18, flex: 2, textAlign: 'center', marginHorizontal: 15 },
    nextButton: { backgroundColor: '#10B981', padding: 20, alignItems: 'center', margin: 20, borderRadius: 12 },
    nextButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default ActiveWorkoutPage;