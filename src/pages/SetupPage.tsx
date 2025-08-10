import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TrainingContext, Exercise, Profile, MUSCLE_GROUPS } from '../context/TrainingContext';
import ExerciseSetupRow from '../components/ExerciseSetupRow'; // Reutilizamos nosso componente

const SetupPage = () => {
  const { activeProfile, updateActiveProfile } = useContext(TrainingContext);
  
  const [localProfile, setLocalProfile] = useState<Profile | null>(() => 
    activeProfile ? JSON.parse(JSON.stringify(activeProfile)) : null
  );
  // O estado agora controla o GRUPO MUSCULAR selecionado
  const [selectedMuscle, setSelectedMuscle] = useState(MUSCLE_GROUPS[0]);

  useEffect(() => {
    setLocalProfile(activeProfile ? JSON.parse(JSON.stringify(activeProfile)) : null);
  }, [activeProfile]);

  if (!localProfile) {
    return <View style={styles.container}><Text style={styles.title}>Carregando perfil...</Text></View>;
  }

  const handleAddExercise = () => {
    const newExercise: Exercise = { 
        id: Date.now(), name: 'Novo Exercício', masterId: '', mode: 'calibrated',
    };
    const currentTemplate = localProfile.templates[selectedMuscle];
    const updatedExercises = [...currentTemplate.exercises, newExercise];
    const updatedTemplate = { ...currentTemplate, exercises: updatedExercises };
    const newProfile = { ...localProfile, templates: { ...localProfile.templates, [selectedMuscle]: updatedTemplate }};
    setLocalProfile(newProfile);
  };
  
  const handleRemoveExercise = (exerciseId: number) => {
    const currentTemplate = localProfile.templates[selectedMuscle];
    const exercises = currentTemplate.exercises.filter((ex) => ex.id !== exerciseId);
    const updatedTemplate = { ...currentTemplate, exercises };
    const newProfile = { ...localProfile, templates: { ...localProfile.templates, [selectedMuscle]: updatedTemplate }};
    updateActiveProfile(newProfile);
  };
  
  const handleUpdateExercise = (updatedExercise: Exercise) => {
    const currentTemplate = localProfile.templates[selectedMuscle];
    const exercises = currentTemplate.exercises.map((ex) =>
      ex.id === updatedExercise.id ? updatedExercise : ex
    );
    const updatedTemplate = { ...currentTemplate, exercises };
    const newProfile = { ...localProfile, templates: { ...localProfile.templates, [selectedMuscle]: updatedTemplate }};
    updateActiveProfile(newProfile);
  };
  
  const currentTemplate = localProfile.templates[selectedMuscle];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Editar Templates de Treino</Text>
      
      <View style={styles.pickerContainer}>
        <Picker 
            selectedValue={selectedMuscle} 
            onValueChange={(itemValue) => setSelectedMuscle(itemValue)} 
            style={styles.picker} 
            dropdownIconColor="#A78BFA"
        >
            {MUSCLE_GROUPS.map(group => (
                <Picker.Item key={group} label={group.charAt(0).toUpperCase() + group.slice(1)} value={group} />
            ))}
        </Picker>
      </View>

      {currentTemplate?.exercises.map((ex: Exercise) => (
        <ExerciseSetupRow
          key={ex.id}
          exercise={ex}
          onUpdate={handleUpdateExercise}
          onRemove={handleRemoveExercise}
        />
      ))}
      
      <TouchableOpacity onPress={handleAddExercise} style={[styles.button, styles.addButton]}>
        <Text style={styles.buttonText}>+ Adicionar Exercício ao Template</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: '#111827' },
    title: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 20 },
    pickerContainer: { backgroundColor: '#374151', borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#4B5563' },
    picker: { color: 'white', height: 50, justifyContent: 'center' },
    button: { borderRadius: 8, padding: 15, alignItems: 'center', marginTop: 10, marginBottom: 40 },
    addButton: { backgroundColor: '#0EA5E9' },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default SetupPage;