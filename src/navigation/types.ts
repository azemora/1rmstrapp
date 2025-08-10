import { NavigatorScreenParams } from '@react-navigation/native';
import { Exercise, WorkoutDay } from "../context/TrainingContext";

export type HomeStackParamList = {
  HomePage: undefined;
  TimerPage: {
    exercise: Exercise;
    phaseInfo: { name: string; color: string; rest: number; sets: number | string; reps: string };
  };
  ActiveWorkout: {
    workout: WorkoutDay;
  };
};

export type DrawerParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  Setup: undefined;
  Calibration: undefined;
};

export type RootStackParamList = {
  ProfileSelector: undefined;
  CreateProfile: undefined;
  MainApp: NavigatorScreenParams<DrawerParamList>;
};