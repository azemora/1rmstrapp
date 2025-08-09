import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TrainingContext } from '../context/TrainingContext';
import { Picker } from '@react-native-picker/picker';

const CreateProfilePage = () => {
    const navigation = useNavigation<any>();
    const { createNewProfile } = useContext(TrainingContext);
    const [profileName, setProfileName] = useState('');
    const [methodology, setMethodology] = useState<'calibrated' | 'custom'>('calibrated');

    const handleCreate = () => {
        if (!profileName.trim()) {
            Alert.alert('Erro', 'Por favor, insira um nome para o perfil.');
            return;
        }
        createNewProfile(profileName, methodology);

        if (methodology === 'calibrated') {
            navigation.replace('MainApp', { screen: 'Calibration' });
        } else {
            navigation.replace('MainApp', { screen: 'Setup' });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Criar Novo Perfil</Text>
            <TextInput
                style={styles.input}
                placeholder="Nome do Perfil (ex: Cutting, Bulk)"
                placeholderTextColor="#9CA3AF"
                value={profileName}
                onChangeText={setProfileName}
            />
            <Text style={styles.label}>Escolha a Metodologia:</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={methodology}
                    onValueChange={(itemValue) => setMethodology(itemValue)}
                    style={styles.picker}
                    dropdownIconColor="#A78BFA"
                >
                    <Picker.Item label="Calibragem Automática (Recomendado)" value="calibrated" />
                    <Picker.Item label="Plano Manual (Customizado)" value="custom" />
                </Picker>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleCreate}>
                <Text style={styles.buttonText}>Criar e Continuar</Text>
            </TouchableOpacity>
        </View>
    );
};

// Adicione os estilos ao final do arquivo
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827', justifyContent: 'center', padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 30 },
    label: { fontSize: 16, color: '#D1D5DB', marginBottom: 10, marginLeft: 5 },
    input: { backgroundColor: '#374151', color: 'white', borderRadius: 8, padding: 15, fontSize: 16, marginBottom: 20 },
    pickerContainer: { backgroundColor: '#374151', borderRadius: 8, marginBottom: 30 },
    picker: { color: 'white' },
    button: { backgroundColor: '#10B981', borderRadius: 8, padding: 15, alignItems: 'center' },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default CreateProfilePage;