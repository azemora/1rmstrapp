import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { TrainingProvider } from './src/context/TrainingContext';


import HomePage from './src/pages/HomePage';
import SetupPage from './src/pages/SetupPage';
import ProfileSelectorPage from './src/pages/ProfileSelectorPage';
import CalibrationPage from './src/pages/CalibrationPage';
import TimerPage from './src/pages/TimerPage';
import CreateProfilePage from './src/pages/CreateProfilePage';
import { RootStackParamList, DrawerParamList, HomeStackParamList } from './src/navigation/types';
import ActiveWorkoutPage from './src/pages/ActiveWorkoutPage';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();
const HomeNav = createNativeStackNavigator<HomeStackParamList>();

// O conteúdo da nossa gaveta customizada
function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props} style={{backgroundColor: '#1F2937'}}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Trocar Perfil"
        labelStyle={{color: 'white'}}
        onPress={() => props.navigation.replace('ProfileSelector')}
      />
    </DrawerContentScrollView>
  );
}

// Uma pilha de navegação para a Home e o Timer, para que um possa abrir o outro
function HomeNavigator() {
  return (
    <HomeNav.Navigator screenOptions={{ headerShown: false }}>
      <HomeNav.Screen name="HomePage" component={HomePage} />
      <HomeNav.Screen name="TimerPage" component={TimerPage} />
      {/* ADICIONADO: A rota para a tela de treino ativo */}
      <HomeNav.Screen name="ActiveWorkout" component={ActiveWorkoutPage} />
    </HomeNav.Navigator>
  );
}
// Nosso app principal, agora dentro de uma gaveta
function MainAppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#1F2937' },
        headerTintColor: '#fff',
        drawerStyle: { backgroundColor: '#1F2937' },
        drawerActiveTintColor: '#A78BFA',
        drawerInactiveTintColor: 'gray',
      }}
    >
      <Drawer.Screen name="HomeStack" component={HomeNavigator} options={{ title: 'Workout Tracker' }}/>
      <Drawer.Screen name="Setup" component={SetupPage} options={{ title: 'Editar Plano' }} />
      <Drawer.Screen name="Calibration" component={CalibrationPage} options={{ title: 'Calibragem' }}/>
    </Drawer.Navigator>
  );
}

// O navegador raiz que controla o fluxo inicial
const App: React.FC = () => {
  return (
    <TrainingProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="ProfileSelector" component={ProfileSelectorPage} />
          <Stack.Screen name="CreateProfile" component={CreateProfilePage} />
          <Stack.Screen name="MainApp" component={MainAppDrawer} />
        </Stack.Navigator>
      </NavigationContainer>
    </TrainingProvider>
  );
};

export default App;