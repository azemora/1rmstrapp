import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trainingPlan as initialPlan } from '../data/trainingPlan';

// --- ESTRUTURAS DE TIPO ---
export type Exercise = {
  id: number;
  name: string;
  masterId: string; // Mantemos para a metadata do exercício
  
  // Propriedade para controlar o modo
  mode: 'calibrated' | 'manual';

  // Propriedades para o modo 'calibrated'
  testWeight?: string;
  testReps?: string;
  oneRepMax?: number;
  calculatedTotalWeight?: number;

  // Propriedades para o modo 'manual'
  manualSets?: string;
  manualReps?: string;
  manualLoad?: string;
};

export type WorkoutDay = { dayName: string; exercises: Exercise[]; } | null;
export type Plan = { [key: number]: WorkoutDay; };
export type CalibrationData = { exerciseId: string; weight: number; reps: number; oneRepMax: number; } | null;

export type Profile = {
  id: string;
  name: string;
  plan: Plan;
  methodology: 'calibrated' | 'custom';
  calibration: CalibrationData;
};

export type ProfilesData = {
  activeProfileId: string | null;
  profiles: { [key: string]: Profile };
};

interface TrainingContextType {
  profilesData: ProfilesData;
  activePlan: Plan | null;
  activeProfile: Profile | null;
  setActiveProfile: (profileId: string) => void;
  updateActivePlan: (newPlan: Plan) => void;
  createNewProfile: (name: string, methodology: 'calibrated' | 'custom') => void;
  updateCalibrationData: (data: CalibrationData) => void;
  deleteProfile: (profileId: string) => void;
}

// --- PLANO INICIAL E PADRÕES ---
const blankPlan: Plan = {
  0: null, 1: { dayName: 'Segunda', exercises: [] }, 2: null, 3: { dayName: 'Quarta', exercises: [] },
  4: null, 5: { dayName: 'Sexta', exercises: [] }, 6: null,
};

const defaultProfile: Profile = {
    id: 'default',
    name: 'Plano Padrão',
    plan: blankPlan,
    methodology: 'calibrated',
    calibration: null,
}

const defaultProfilesData: ProfilesData = {
  activeProfileId: 'default',
  profiles: { 'default': defaultProfile },
};

// --- CONTEXTO ---
export const TrainingContext = createContext<TrainingContextType>({
  profilesData: defaultProfilesData,
  activePlan: null,
  activeProfile: null,
  setActiveProfile: () => {},
  updateActivePlan: () => {},
  createNewProfile: () => {},
  updateCalibrationData: () => {},
  deleteProfile: () => {}

});

// --- PROVEDOR ---
interface TrainingProviderProps {
  children: ReactNode;
}

export const TrainingProvider = ({ children }: TrainingProviderProps) => {
  const [profilesData, setProfilesData] = useState<ProfilesData>(defaultProfilesData);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const savedData = await AsyncStorage.getItem('profilesData');
        if (savedData) {
          setProfilesData(JSON.parse(savedData));
        }
      } catch (error) { console.error("Failed to load profiles", error); }
    };
    loadProfiles();
  }, []);

  useEffect(() => {
    const saveProfiles = async () => {
      try {
        await AsyncStorage.setItem('profilesData', JSON.stringify(profilesData));
      } catch (error) { console.error("Failed to save profiles", error); }
    };
    saveProfiles();
  }, [profilesData]);

  const setActiveProfile = (profileId: string) => {
    setProfilesData(prevData => ({ ...prevData, activeProfileId: profileId }));
  };

  const updateActivePlan = (newPlan: Plan) => {
    if (!profilesData.activeProfileId) return;
    setProfilesData(prevData => {
      const activeId = prevData.activeProfileId!;
      const updatedProfiles = { ...prevData.profiles };
      updatedProfiles[activeId].plan = newPlan;
      return { ...prevData, profiles: updatedProfiles };
    });
  };

  const deleteProfile = (profileId: string) => {
    setProfilesData(prevData => {
        const updatedProfiles = { ...prevData.profiles };
        delete updatedProfiles[profileId];

        // Se o perfil deletado era o ativo, reseta o perfil ativo
        const newActiveProfileId = prevData.activeProfileId === profileId ? null : prevData.activeProfileId;

        return { ...prevData, profiles: updatedProfiles, activeProfileId: newActiveProfileId };
    });
};

  const createNewProfile = (name: string, methodology: 'calibrated' | 'custom') => {
      const newId = `profile_${Date.now()}`;
      const newProfile: Profile = {
          id: newId,
          name,
          plan: blankPlan,
          methodology,
          calibration: null,
      };
      setProfilesData(prevData => {
          const updatedProfiles = { ...prevData.profiles, [newId]: newProfile };
          return { ...prevData, profiles: updatedProfiles, activeProfileId: newId };
      });
  };

  const updateCalibrationData = (data: CalibrationData) => {
    if (!profilesData.activeProfileId) return;
    setProfilesData(prevData => {
        const activeId = prevData.activeProfileId!;
        const updatedProfiles = { ...prevData.profiles };
        updatedProfiles[activeId].calibration = data;
        return { ...prevData, profiles: updatedProfiles };
    });
  };

  const activeProfile = profilesData.activeProfileId ? profilesData.profiles[profilesData.activeProfileId] : null;
  const activePlan = activeProfile?.plan || null;

  const value = { profilesData, activePlan, activeProfile, setActiveProfile, updateActivePlan, createNewProfile, updateCalibrationData, deleteProfile};

  return (
    <TrainingContext.Provider value={value}>
      {children}
    </TrainingContext.Provider>
  );
};