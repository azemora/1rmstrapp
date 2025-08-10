import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- ESTRUTURAS DE TIPO (ÚNICA FONTE DA VERDADE) ---
export type Exercise = {
  id: number; name: string; masterId: string; mode: 'calibrated' | 'manual';
  oneRepMax?: number; testWeight?: string; testReps?: string; calculatedTotalWeight?: number;
  manualSets?: string; manualReps?: string; manualLoad?: string;
};
export type WorkoutTemplate = { name: string; exercises: Exercise[]; };
export type WeeklySplit = { [key: number]: string[]; };
export type WorkoutLog = { date: string; exerciseId: string; sets: { reps: number; load: number }[]; };
export type Profile = {
  id: string; name: string;
  templates: { [muscleGroup: string]: WorkoutTemplate };
  weeklySplit: WeeklySplit;
  history: WorkoutLog[];
};
export type ProfilesData = {
  activeProfileId: string | null;
  profiles: { [key: string]: Profile };
};

// --- INTERFACE DO CONTEXTO ---
interface TrainingContextType {
  profilesData: ProfilesData;
  activeProfile: Profile | null;
  updateActiveProfile: (updatedProfile: Profile) => void;
  createNewProfile: (name: string) => void;
  setActiveProfile: (profileId: string) => void;
  deleteProfile: (profileId: string) => void;
}

// --- DADOS PADRÃO ---
export const MUSCLE_GROUPS = ['peito', 'costas', 'pernas', 'ombro', 'biceps', 'triceps'];
const blankTemplates: { [muscleGroup: string]: WorkoutTemplate } = {};
MUSCLE_GROUPS.forEach(group => {
  blankTemplates[group] = { name: group.charAt(0).toUpperCase() + group.slice(1), exercises: [] };
});
const defaultWeeklySplit: WeeklySplit = {
  0: [], 1: ['biceps', 'costas'], 2: ['peito', 'triceps', 'ombro'], 3: ['pernas'],
  4: ['biceps', 'costas'], 5: ['pernas', 'peito'], 6: ['triceps', 'ombro'],
};
const defaultProfile: Profile = {
    id: 'default', name: 'Plano Padrão',
    templates: blankTemplates, weeklySplit: defaultWeeklySplit, history: [],
};
const defaultProfilesData: ProfilesData = {
  activeProfileId: 'default',
  profiles: { 'default': defaultProfile },
};

// --- CRIAÇÃO E PROVEDOR DO CONTEXTO ---
export const TrainingContext = createContext<TrainingContextType>({
    profilesData: defaultProfilesData,
    activeProfile: null,
    updateActiveProfile: () => {},
    createNewProfile: () => {},
    setActiveProfile: () => {},
    deleteProfile: () => {},
});

export const TrainingProvider = ({ children }: { children: ReactNode }) => {
    const [profilesData, setProfilesData] = useState<ProfilesData>(defaultProfilesData);
    
    // ... useEffects para carregar e salvar ...

    const createNewProfile = (name: string) => {
        const newId = `profile_${Date.now()}`;
        const newProfile: Profile = {
            id: newId, name,
            templates: blankTemplates, weeklySplit: defaultWeeklySplit, history: [],
        };
        setProfilesData(prevData => ({
            profiles: { ...prevData.profiles, [newId]: newProfile },
            activeProfileId: newId,
        }));
    };

    const updateActiveProfile = (updatedProfile: Profile) => {
        if (!profilesData.activeProfileId) return;
        setProfilesData(prevData => ({
            ...prevData,
            profiles: { ...prevData.profiles, [prevData.activeProfileId!]: updatedProfile }
        }));
    };

    const setActiveProfile = (profileId: string) => {
        setProfilesData(prevData => ({ ...prevData, activeProfileId: profileId }));
    };
    
    const deleteProfile = (profileId: string) => {
        setProfilesData(prevData => {
            const updatedProfiles = { ...prevData.profiles };
            delete updatedProfiles[profileId];
            const newActiveProfileId = prevData.activeProfileId === profileId ? null : prevData.activeProfileId;
            return { ...prevData, profiles: updatedProfiles, activeProfileId: newActiveProfileId };
        });
    };
 const activeProfile = profilesData.activeProfileId ? profilesData.profiles[profilesData.activeProfileId] : null;
    const value = { profilesData, activeProfile, updateActiveProfile, createNewProfile, setActiveProfile, deleteProfile };

    return (
        <TrainingContext.Provider value={value}>
            {children}
        </TrainingContext.Provider>
    );
};