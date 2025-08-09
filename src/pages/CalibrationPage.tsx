import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { TrainingContext } from '../context/TrainingContext';
import { masterExerciseList } from '../data/masterExerciseList';
import { calculate1RM } from '../utils/formulas';
import Switch from '../components/Switch'; // Importe o Switch

const CalibrationPage = () => {
    const navigation = useNavigation<any>();
    const { updateCalibrationData } = useContext(TrainingContext);
    const [exerciseId, setExerciseId] = useState('');
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [weightMode, setWeightMode] = useState('total'); // 'total' ou 'perSide'

    const masterExercise = masterExerciseList.find(e => e.id === exerciseId);
    const isBilateral = masterExercise?.inputType === 'bilateral';

    const handleSaveCalibration = () => {
        if (!exerciseId || !weight || !reps) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        let totalWeight = parseFloat(weight);
        if (isBilateral && weightMode === 'perSide') {
            const barWeight = masterExercise?.barbellWeight || 0;
            totalWeight = (parseFloat(weight) * 2) + barWeight;
        }

        const oneRepMax = calculate1RM(totalWeight, parseInt(reps, 10));
        
        const calibrationData = {
            exerciseId,
            weight: parseFloat(weight),
            reps: parseInt(reps, 10),
            oneRepMax,
        };

        updateCalibrationData(calibrationData);
        Alert.alert('Calibragem Salva!', `Seu 1RM base foi calculado como ${oneRepMax.toFixed(2)}kg. Agora, adicione os exercícios ao seu plano.`);
        
        // MUDANÇA DE FLUXO: Após calibrar, vai para a tela de Edição/Setup
        navigation.navigate('Setup');
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Calibragem de Força</Text>
            <Text style={styles.subtitle}>Escolha um exercício principal e insira sua melhor performance recente (ex: peso para 8-10 repetições até a falha).</Text>

            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={exerciseId}
                    onValueChange={(itemValue) => setExerciseId(itemValue)}
                    style={styles.picker}
                    dropdownIconColor="#A78BFA"
                >
                    <Picker.Item label="Selecione o exercício base..." value="" />
                    {masterExerciseList.map(ex => <Picker.Item key={ex.id} label={ex.name} value={ex.id} />)}
                </Picker>
            </View>

            <TextInput
                style={styles.input}
                placeholder="Peso utilizado (kg)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
            />
            <TextInput
                style={styles.input}
                placeholder="Repetições até a falha"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={reps}
                onChangeText={setReps}
            />
            {isBilateral && (
                <View style={styles.switchRow}>
                    <Switch isOn={weightMode === 'perSide'} onToggle={() => setWeightMode(prev => prev === 'total' ? 'perSide' : 'total')} />
                    <Text style={styles.switchLabel}>Usar peso por lado (anilhas)</Text>
                </View>
            )}

            <TouchableOpacity style={styles.button} onPress={handleSaveCalibration}>
                <Text style={styles.buttonText}>Salvar e Montar Treino</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827', padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#D1D5DB', textAlign: 'center', marginBottom: 30, paddingHorizontal: 10 },
    pickerContainer: { backgroundColor: '#374151', borderRadius: 8, marginBottom: 15 },
    picker: { color: 'white' },
    input: { backgroundColor: '#374151', color: 'white', borderRadius: 8, padding: 15, fontSize: 16, marginBottom: 15 },
    button: { backgroundColor: '#8B5CF6', borderRadius: 8, padding: 15, alignItems: 'center', marginTop: 20 },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, alignSelf: 'center' },
    switchLabel: { color: '#D1D5DB', fontSize: 14, marginLeft: 10 },
});

export default CalibrationPage;