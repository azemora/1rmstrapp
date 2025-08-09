import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TrainingContext, Profile } from '../context/TrainingContext';


const ProfileSelectorPage = () => {
   const navigation = useNavigation<any>();
    const { profilesData, setActiveProfile, deleteProfile } = useContext(TrainingContext);

  const handleProfileSelect = (profileId: string) => {
    setActiveProfile(profileId);

    // Lógica para decidir para qual tela ir
    const selectedProfile = profilesData.profiles[profileId];

    if (selectedProfile.methodology === 'calibrated' && !selectedProfile.calibration) {
      // Se for perfil calibrado e NUNCA foi calibrado, força a ida para a tela de calibragem
      navigation.replace('MainApp', { screen: 'Calibration' });
    } else {
      // Caso contrário, vai para a Home
      navigation.replace('MainApp', { screen: 'Home' });
    }
  };

   const handleDeleteProfile = (profileId: string) => {
      Alert.alert(
          "Excluir Perfil",
          "Tem certeza que deseja excluir este perfil? Esta ação não pode ser desfeita.",
          [
              { text: "Cancelar", style: "cancel" },
              { text: "Excluir", style: "destructive", onPress: () => deleteProfile(profileId) }
          ]
      );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Selecione um Perfil</Text>
      {Object.values(profilesData.profiles).map((profile: Profile) => (
        <View key={profile.id} style={styles.profileRow}>
            <TouchableOpacity style={styles.profileButton} onPress={() => handleProfileSelect(profile.id)}>
                <Text style={styles.profileButtonText}>{profile.name}</Text>
            </TouchableOpacity>
            {/* Não permite deletar o perfil padrão */}
            {profile.id !== 'default' && (
                <TouchableOpacity onPress={() => handleDeleteProfile(profile.id)} style={styles.deleteButton}>
                    <Text style={styles.deleteButtonText}>X</Text>
                </TouchableOpacity>
            )}
        </View>
      ))}
      <TouchableOpacity style={styles.newProfileButton} onPress={() => navigation.navigate('CreateProfile')}>
        <Text style={styles.newProfileButtonText}>+ Criar Novo Perfil</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827', justifyContent: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 40 },
  
  newProfileButton: { borderColor: '#10B981', borderWidth: 2, padding: 20, borderRadius: 12, marginTop: 30 },
  newProfileButtonText: { color: '#10B981', fontSize: 20, fontWeight: '600', textAlign: 'center' },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    profileButton: { flex: 1, backgroundColor: '#1F2937', padding: 20, borderRadius: 12 },
    profileButtonText: { color: '#A78BFA', fontSize: 20, fontWeight: '600' },
    deleteButton: { backgroundColor: '#EF4444', marginLeft: 10, padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    deleteButtonText: { color: 'white', fontSize: 20, fontWeight: 'bold' }
});

export default ProfileSelectorPage;