import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

interface SwitchProps {
  isOn: boolean;
  onToggle: () => void;
}

const Switch: React.FC<SwitchProps> = ({ isOn, onToggle }) => {
  return (
    // Um botão transparente que muda de cor com base no estado 'isOn'
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onToggle} 
      style={[styles.container, isOn ? styles.containerOn : styles.containerOff]}
    >
      {/* O círculo branco que se move para a esquerda ou direita */}
      <View style={[styles.handle, isOn ? styles.handleOn : styles.handleOff]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 52,
    height: 28,
    borderRadius: 15,
    justifyContent: 'center',
    padding: 2,
  },
  containerOn: {
    backgroundColor: '#8B5CF6', // Roxo
  },
  containerOff: {
    backgroundColor: '#4B5563', // Cinza
  },
  handle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  handleOn: {
    alignSelf: 'flex-end', // Alinha à direita
  },
  handleOff: {
    alignSelf: 'flex-start', // Alinha à esquerda
  },
});

export default Switch;