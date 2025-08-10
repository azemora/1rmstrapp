import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { TrainingContext, Exercise } from '../context/TrainingContext';
import { calculate1RM } from '../utils/formulas';
import Switch from '../components/Switch';
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';

// --- Sub-componente para a Linha do Exercício ---
const ExerciseSetupRow: React.FC<{ exercise: Exercise; onUpdate: (ex: Exercise) => void; onRemove: (id: number) => void; }> = ({ exercise, onUpdate, onRemove }) => {
  const [localExercise, setLocalExercise] = useState(exercise);
  const [weightMode, setWeightMode] = useState('total');

  // Sincroniza o estado local se a prop externa mudar
  useEffect(() => {
    setLocalExercise(exercise);
  }, [exercise]);

  const handleValueChange = (field: keyof Exercise, value: string | boolean) => {
    setLocalExercise(current => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    let exerciseToSave = { ...localExercise };
    
    if (exerciseToSave.mode === 'calibrated') {
      if (!exerciseToSave.testWeight || !exerciseToSave.testReps) {
        Alert.alert('Erro', 'Preencha o peso e as repetições para salvar a calibragem.');
        return;
      }
      const totalWeight = () => {
        const weight = parseFloat(exerciseToSave.testWeight || '0');
        if (weightMode === 'perSide') {
          return (weight * 2);
        }
        return weight;
      };
      exerciseToSave.oneRepMax = calculate1RM(totalWeight(), parseInt(exerciseToSave.testReps || '0', 10));
    }
    onUpdate(exerciseToSave);
    Alert.alert('Salvo!', `${exerciseToSave.name} foi atualizado.`);
  };

  const toggleMode = () => {
    handleValueChange('mode', localExercise.mode === 'calibrated' ? 'manual' : 'calibrated');
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TextInput
            style={styles.exerciseNameInput}
            placeholder="Nome do Exercício"
            placeholderTextColor="#9CA3AF"
            value={localExercise.name}
            onChangeText={(value) => handleValueChange('name', value)}
        />
        <TouchableOpacity onPress={() => onRemove(localExercise.id)} style={styles.deleteButton}>
            <Icon name="trash-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.switchRow}>
          <Switch isOn={localExercise.mode === 'calibrated'} onToggle={toggleMode} />
          <Text style={styles.switchLabel}>
              {localExercise.mode === 'calibrated' ? 'Modo: Calibragem Automática' : 'Modo: Manual'}
          </Text>
      </View>

      {localExercise.mode === 'calibrated' ? (
        <>
          <Text style={styles.modeDescription}>Insira um teste de força para o app calcular as cargas.</Text>
          <View style={styles.inputRow}>
              <TextInput style={styles.input} placeholder={"Peso do Teste"} placeholderTextColor="#9CA3AF" keyboardType="numeric" value={String(localExercise.testWeight || '')} onChangeText={(value) => handleValueChange('testWeight', value)} />
              <TextInput style={styles.input} placeholder="Reps do Teste" placeholderTextColor="#9CA3AF" keyboardType="numeric" value={String(localExercise.testReps || '')} onChangeText={(value) => handleValueChange('testReps', value)} />
          </View>
        </>
      ) : (
        <>
          <Text style={styles.modeDescription}>Defina manualmente as séries, repetições e carga.</Text>
          <View style={styles.inputRow}>
              <TextInput style={styles.input} placeholder="Séries (ex: 3)" placeholderTextColor="#9CA3AF" keyboardType="default" value={String(localExercise.manualSets || '')} onChangeText={(value) => handleValueChange('manualSets', value)} />
              <TextInput style={styles.input} placeholder="Reps (ex: 8-10)" placeholderTextColor="#9CA3AF" keyboardType="default" value={String(localExercise.manualReps || '')} onChangeText={(value) => handleValueChange('manualReps', value)} />
              <TextInput style={styles.input} placeholder="Carga (ex: 80kg)" placeholderTextColor="#9CA3AF" keyboardType="default" value={String(localExercise.manualLoad || '')} onChangeText={(value) => handleValueChange('manualLoad', value)} />
          </View>
        </>
      )}

      <View style={styles.switchRow}>
          <Switch isOn={weightMode === 'perSide'} onToggle={() => setWeightMode(prev => prev === 'total' ? 'perSide' : 'total')} />
          <Text style={styles.switchLabel}>Usar peso por lado (anilhas)</Text>
      </View>

      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.buttonText}>Salvar {localExercise.name || 'Exercício'}</Text>
      </TouchableOpacity>
    </View>
  );
}


// --- Componente Principal da Página ---
const SetupPage = () => {
    const route = useRoute<RouteProp<any>>();
    const { activePlan, updateActivePlan } = useContext(TrainingContext);
    
    const initialDay = route.params?.selectedDay ?? 1;
    const [selectedDay, setSelectedDay] = useState(initialDay);
    const [localPlan, setLocalPlan] = useState(() => JSON.parse(JSON.stringify(activePlan || {})));

    useEffect(() => {
        setLocalPlan(JSON.parse(JSON.stringify(activePlan || {})));
    }, [activePlan]);

    // Atualiza o dia selecionado se a rota mudar
    useEffect(() => {
        if (route.params?.selectedDay !== undefined) {
            setSelectedDay(route.params.selectedDay);
        }
    }, [route.params?.selectedDay]);
    
    const handleAddExercise = () => {
        const dayData = localPlan?.[selectedDay] || { dayName: 'Novo Treino', exercises: [] };
        const newExercise: Exercise = { 
            id: Date.now(),
            name: '',
            masterId: '',
            mode: 'calibrated',
        };
        const updatedExercises = [...dayData.exercises, newExercise];
        const newPlan = { ...localPlan, [selectedDay]: { ...dayData, exercises: updatedExercises } };
        setLocalPlan(newPlan);
    };
  
    const handleRemoveExercise = (exerciseId: number) => {
        const dayData = localPlan?.[selectedDay];
        if (!dayData) return;
        const exercises = dayData.exercises.filter((ex: Exercise) => ex.id !== exerciseId);
        const newPlan = { ...localPlan, [selectedDay]: { ...dayData, exercises } };
        updateActivePlan(newPlan);
    };
  
    const handleUpdateExercise = (updatedExercise: Exercise) => {
        const dayData = localPlan?.[selectedDay];
        if (!dayData) return;
        const exercises = dayData.exercises.map((ex: Exercise) => 
            ex.id === updatedExercise.id ? updatedExercise : ex
        );
        const newPlan = { ...localPlan, [selectedDay]: { ...dayData, exercises } };
        updateActivePlan(newPlan);
    };
  
    const dayPlan = localPlan ? localPlan[selectedDay] : null;

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Editar Plano</Text>
            <View style={styles.pickerContainer}>
                <Picker selectedValue={selectedDay} onValueChange={setSelectedDay} style={styles.picker} dropdownIconColor="#A78BFA">
                    <Picker.Item label="Domingo" value={0} />
                    <Picker.Item label="Segunda-feira" value={1} />
                    <Picker.Item label="Terça-feira" value={2} />
                    <Picker.Item label="Quarta-feira" value={3} />
                    <Picker.Item label="Quinta-feira" value={4} />
                    <Picker.Item label="Sexta-feira" value={5} />
                    <Picker.Item label="Sábado" value={6} />
                </Picker>
            </View>

            {dayPlan?.exercises.map((ex: Exercise) => (
                <ExerciseSetupRow
                    key={ex.id}
                    exercise={ex}
                    onUpdate={handleUpdateExercise}
                    onRemove={handleRemoveExercise}
                />
            ))}
            
            <TouchableOpacity onPress={handleAddExercise} style={[styles.button, styles.addButton]}>
                <Text style={styles.buttonText}>+ Adicionar Exercício</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: '#111827' },
    title: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 20 },
    pickerContainer: { backgroundColor: '#374151', borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#4B5563' },
    picker: { color: 'white', height: 50, justifyContent: 'center' },
    card: { backgroundColor: '#1F2937', borderRadius: 12, padding: 15, marginBottom: 20 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', },
    exerciseNameInput: { flex: 1, color: 'white', fontSize: 18, fontWeight: 'bold', paddingVertical: 10 },
    deleteButton: { backgroundColor: '#EF4444', width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    switchRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
    switchLabel: { color: '#D1D5DB', fontSize: 14, marginLeft: 10 },
    modeDescription: { color: '#9CA3AF', fontSize: 12, fontStyle: 'italic', marginBottom: 10, paddingLeft: 5 },
    inputRow: { flexDirection: 'row', alignItems: 'center' },
    input: { backgroundColor: '#374151', color: 'white', borderRadius: 8, padding: 12, flex: 1, marginRight: 10 },
    saveButton: { backgroundColor: '#10B981', borderRadius: 8, padding: 15, alignItems: 'center', marginTop: 15 },
    button: { borderRadius: 8, padding: 15, alignItems: 'center', marginTop: 10 },
    addButton: { backgroundColor: '#0EA5E9' },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default SetupPage;