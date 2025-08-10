import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Exercise } from '../context/TrainingContext';
import { calculate1RM } from '../utils/formulas';
import Switch from './Switch';
import Icon from 'react-native-vector-icons/Ionicons';
import { masterExerciseList } from '../data/masterExerciseList';

interface ExerciseSetupRowProps {
  exercise: Exercise;
  onUpdate: (ex: Exercise) => void;
  onRemove: (id: number) => void;
}

const ExerciseSetupRow: React.FC<ExerciseSetupRowProps> = ({ exercise, onUpdate, onRemove }) => {
  const [localExercise, setLocalExercise] = useState(exercise);
  const [weightMode, setWeightMode] = useState('total');
  
  const masterExercise = masterExerciseList.find(e => e.id === localExercise.masterId);

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
          <View style={styles.switchRow}>
              <Switch isOn={weightMode === 'perSide'} onToggle={() => setWeightMode(prev => prev === 'total' ? 'perSide' : 'total')} />
              <Text style={styles.switchLabel}>Usar peso por lado (anilhas)</Text>
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

      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.buttonText}>Salvar {localExercise.name || 'Exercício'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    card: { backgroundColor: '#1F2937', borderRadius: 12, padding: 15, marginBottom: 20 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', },
    exerciseNameInput: { flex: 1, color: 'white', fontSize: 18, fontWeight: 'bold' },
    deleteButton: { backgroundColor: '#EF4444', width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    switchRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
    switchLabel: { color: '#D1D5DB', fontSize: 14, marginLeft: 10 },
    modeDescription: { color: '#9CA3AF', fontSize: 12, fontStyle: 'italic', marginBottom: 10, paddingLeft: 5 },
    inputRow: { flexDirection: 'row', alignItems: 'center' },
    input: { backgroundColor: '#374151', color: 'white', borderRadius: 8, padding: 12, flex: 1, marginRight: 10 },
    saveButton: { backgroundColor: '#10B981', borderRadius: 8, padding: 15, alignItems: 'center', marginTop: 15 },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default ExerciseSetupRow;