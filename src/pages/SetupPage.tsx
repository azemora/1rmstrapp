import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TrainingContext, Exercise } from '../context/TrainingContext';
import { masterExerciseList } from '../data/masterExerciseList';
import { calculate1RM } from '../utils/formulas';
import Switch from '../components/Switch';

// --- DEFINIÇÕES DE TIPO ---
interface CustomExerciseRowProps {
  exercise: Exercise;
  onExerciseChange: (exerciseId: number, field: keyof Exercise, value: string) => void;
  onRemove: (exerciseId: number) => void;
  onSave: (exerciseId: number) => void;
}

// --- Sub-componente para a Linha do Exercício (Modo CUSTOM) ---
const CustomExerciseRow: React.FC<CustomExerciseRowProps> = ({ exercise, onExerciseChange, onRemove, onSave }) => {
  const [weightMode, setWeightMode] = useState('total');
  const masterExercise = masterExerciseList.find(e => e.id === exercise.masterId);
  const isBilateral = masterExercise?.inputType === 'bilateral';

  const handleValueChange = (field: keyof Exercise, value: string) => {
    onExerciseChange(exercise.id, field, value);
  };
  
  const totalWeightForCalc = () => {
    const weight = parseFloat(exercise.testWeight || '0');
    if (isBilateral && weightMode === 'perSide') {
      const barWeight = masterExercise?.barbellWeight || 0;
      return (weight * 2) + barWeight;
    }
    return weight;
  };
  
  exercise.calculatedTotalWeight = totalWeightForCalc();

  return(
    <View style={styles.card}>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={exercise.masterId} onValueChange={(value) => handleValueChange('masterId', value)} style={styles.picker} dropdownIconColor="#A78BFA">
          <Picker.Item label="Selecione um exercício..." value="" />
          {masterExerciseList.map(me => <Picker.Item key={me.id} label={me.name} value={me.id} />)}
        </Picker>
      </View>
      <View style={styles.inputRow}>
        <TextInput style={styles.input} placeholder={isBilateral && weightMode === 'perSide' ? "Peso por lado" : "Peso total"} placeholderTextColor="#9CA3AF" keyboardType="numeric" value={String(exercise.testWeight || '')} onChangeText={(value) => handleValueChange('testWeight', value)} />
        <TextInput style={styles.input} placeholder="Reps" placeholderTextColor="#9CA3AF" keyboardType="numeric" value={String(exercise.testReps || '')} onChangeText={(value) => handleValueChange('testReps', value)} />
        <TouchableOpacity onPress={() => onSave(exercise.id)} style={styles.saveButtonSmall}><Text style={styles.buttonTextSmall}>✓</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => onRemove(exercise.id)} style={styles.deleteButton}><Text style={styles.buttonTextSmall}>X</Text></TouchableOpacity>
      </View>
      {isBilateral && (
        <View style={styles.switchRow}>
          <Switch isOn={weightMode === 'perSide'} onToggle={() => setWeightMode(prev => prev === 'total' ? 'perSide' : 'total')} />
          <Text style={styles.switchLabel}>Usar peso por lado (anilhas)</Text>
        </View>
      )}
    </View>
  );
}

// --- Componente Principal da Página ---
const SetupPage = () => {
  const { activeProfile, updateActivePlan } = useContext(TrainingContext);
  
  const [localPlan, setLocalPlan] = useState(() => JSON.parse(JSON.stringify(activeProfile?.plan || {})));
  const [selectedDay, setSelectedDay] = useState(1);
  const [exerciseToAdd, setExerciseToAdd] = useState('');

  useEffect(() => {
    setLocalPlan(JSON.parse(JSON.stringify(activeProfile?.plan || {})));
  }, [activeProfile]);

  const handleAddExercise = (methodology: 'custom' | 'calibrated') => {
    const dayData = localPlan?.[selectedDay] || { dayName: 'Novo Treino', exercises: [] };
    let newExercise: Exercise;
    
    if (methodology === 'custom') {
        newExercise = { id: Date.now(), masterId: '', name: '', testWeight: '', testReps: '', oneRepMax: 0 };
    } else {
        if (!exerciseToAdd) return;
        const masterEx = masterExerciseList.find(me => me.id === exerciseToAdd);
        if (!masterEx) return;
        newExercise = { id: Date.now(), masterId: masterEx.id, name: masterEx.name, sets: '', reps: '' };
    }

    const updatedExercises = [...dayData.exercises, newExercise];
    const newPlan = { ...localPlan, [selectedDay]: { ...dayData, exercises: updatedExercises } };
    
    setLocalPlan(newPlan);
    if(methodology === 'calibrated') {
        updateActivePlan(newPlan); // Salva direto no modo calibrado
        setExerciseToAdd(''); // Reseta o picker
    }
  };
  
  const handleRemoveExercise = (exerciseId: number) => {
    const dayData = localPlan?.[selectedDay];
    if (!dayData) return;
    const exercises = dayData.exercises.filter((ex: Exercise) => ex.id !== exerciseId);
    const newPlan = { ...localPlan, [selectedDay]: { ...dayData, exercises } };
    setLocalPlan(newPlan);
    updateActivePlan(newPlan); // Salva a remoção direto
  };
  
  // Funções apenas para o modo CUSTOM
  const handleExerciseChange = (exerciseId: number, field: keyof Exercise, value: string) => {
    const dayData = localPlan?.[selectedDay];
    if (!dayData) return;
    const exercises = dayData.exercises.map( (ex: Exercise) => {
      if (ex.id === exerciseId) {
        const updatedExercise = { ...ex, [field]: value };
        if (field === 'masterId') {
          const masterEx = masterExerciseList.find(me => me.id === value);
          updatedExercise.name = masterEx ? masterEx.name : 'Selecione um exercício';
        }
        return updatedExercise;
      }
      return ex;
    });
    setLocalPlan({ ...localPlan, [selectedDay]: { ...dayData, exercises } });
  };
  
  const handleSaveSingleExercise = (exerciseId: number) => {
    if (!localPlan) return;
    let planToSave = JSON.parse(JSON.stringify(localPlan));
    const dayData = planToSave[selectedDay];
    if (dayData?.exercises) {
      const exerciseToUpdate = dayData.exercises.find((ex: Exercise) => ex.id === exerciseId);
      if (exerciseToUpdate) {
        exerciseToUpdate.oneRepMax = calculate1RM(exerciseToUpdate.calculatedTotalWeight, parseInt(exerciseToUpdate.testReps, 10));
        updateActivePlan(planToSave);
        Alert.alert('Exercício Salvo!', 'O 1RM foi atualizado.');
      }
    }
  };
  
  const dayPlan = localPlan ? localPlan[selectedDay] : null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Editar Plano</Text>
      
      <View style={styles.pickerContainer}>
        <Picker selectedValue={selectedDay} onValueChange={(itemValue) => setSelectedDay(itemValue)} style={styles.picker} dropdownIconColor="#A78BFA">
            <Picker.Item label="Segunda-feira" value={1} />
            <Picker.Item label="Terça-feira" value={2} />
            <Picker.Item label="Quarta-feira" value={3} />
            <Picker.Item label="Quinta-feira" value={4} />
            <Picker.Item label="Sexta-feira" value={5} />
            <Picker.Item label="Sábado" value={6} />
            <Picker.Item label="Domingo" value={0} />
        </Picker>
      </View>

      {activeProfile?.methodology === 'calibrated' ? (
        <View style={styles.card}>
            <Text style={styles.methodologyTitle}>Metodologia: Calibragem Automática</Text>
            {dayPlan?.exercises.map((ex: Exercise) => (
                <View key={ex.id} style={styles.calibratedExerciseRow}>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                    <TouchableOpacity onPress={() => handleRemoveExercise(ex.id)} style={styles.deleteButtonSmall}>
                        <Text style={styles.buttonTextSmall}>X</Text>
                    </TouchableOpacity>
                </View>
            ))}
            <View style={styles.pickerContainer}>
                <Picker selectedValue={exerciseToAdd} onValueChange={(itemValue) => setExerciseToAdd(itemValue)} style={styles.picker} dropdownIconColor="#A78BFA">
                    <Picker.Item label="Adicionar exercício ao dia..." value="" />
                    {masterExerciseList.map(me => <Picker.Item key={me.id} label={me.name} value={me.id} />)}
                </Picker>
            </View>
            <TouchableOpacity onPress={() => handleAddExercise('calibrated')} style={[styles.button, styles.addButton]}>
                <Text style={styles.buttonText}>+ Adicionar</Text>
            </TouchableOpacity>
        </View>
      ) : (
        <>
            {dayPlan?.exercises.map((ex: Exercise) => (
                <CustomExerciseRow
                    key={ex.id}
                    exercise={ex}
                    onExerciseChange={handleExerciseChange}
                    onRemove={handleRemoveExercise}
                    onSave={handleSaveSingleExercise}
                />
            ))}
            <TouchableOpacity onPress={() => handleAddExercise('custom')} style={[styles.button, styles.addButton]}>
                <Text style={styles.buttonText}>+ Adicionar Exercício</Text>
            </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: '#111827' },
    title: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 20 },
    pickerContainer: { backgroundColor: '#374151', borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#4B5563' },
    picker: { color: 'white' },
    card: { backgroundColor: '#1F2937', borderRadius: 12, padding: 15, marginBottom: 20 },
    inputRow: { flexDirection: 'row', alignItems: 'center' },
    input: { backgroundColor: '#374151', color: 'white', borderRadius: 8, padding: 12, flex: 1, marginRight: 10 },
    deleteButton: { backgroundColor: '#EF4444', width: 45, height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    saveButtonSmall: { backgroundColor: '#10B981', width: 45, height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    buttonTextSmall: { color: 'white', fontWeight: 'bold', fontSize: 18 },
    button: { borderRadius: 8, padding: 15, alignItems: 'center', marginTop: 10 },
    addButton: { backgroundColor: '#10B981' },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    switchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
    switchLabel: { color: '#D1D5DB', fontSize: 14, marginLeft: 10 },
    methodologyTitle: { fontSize: 18, fontWeight: 'bold', color: '#A78BFA', textAlign: 'center', marginBottom: 20 },
    calibratedExerciseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#374151', padding: 15, borderRadius: 8, marginBottom: 10 },
    exerciseName: { color: 'white', fontSize: 16 },
    deleteButtonSmall: { backgroundColor: '#EF4444', width: 35, height: 35, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
});

export default SetupPage;