import { NavigatorScreenParams } from '@react-navigation/native';
import { Exercise } from "../context/TrainingContext";

// Define os parâmetros que a TimerPage espera receber
export type HomeStackParamList = {
  HomePage: undefined; // HomePage não recebe parâmetros
  TimerPage: {
    exercise: Exercise;
    phaseInfo: { name: string; color: string; rest: number };
  };
};

// Define as telas dentro da "gaveta" de navegação
export type DrawerParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>; // Aninhado
  Setup: undefined;
  Calibration: undefined;
};

// Define as telas do navegador principal (raiz)
export type RootStackParamList = {
  ProfileSelector: undefined;
  CreateProfile: undefined;
  MainApp: NavigatorScreenParams<DrawerParamList>; // Aninhado
};