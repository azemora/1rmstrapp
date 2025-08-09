import React, { useState } from 'react';
import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import { View, StyleSheet } from 'react-native';

// Configuração para traduzir o calendário para o português
LocaleConfig.locales['br'] = {
  monthNames: [ 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro' ],
  monthNamesShort: ['Jan.', 'Fev.', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul.', 'Ago', 'Set.', 'Out.', 'Nov.', 'Dez.'],
  dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  dayNamesShort: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  today: "Hoje"
};
LocaleConfig.defaultLocale = 'br';

interface CalendarProps {
  onDateSelect: (date: Date) => void;
}

const CalendarComponent: React.FC<CalendarProps> = ({ onDateSelect }) => {
  // Formata a data de hoje para o formato 'YYYY-MM-DD'
  const todayString = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayString);

  const handleDayPress = (day) => {
    const date = new Date(day.timestamp);
    // Ajusta o fuso horário para evitar problemas de data
    const adjustedDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);

    setSelectedDate(day.dateString);
    onDateSelect(adjustedDate);
  };

  return (
    <View style={styles.container}>
        <RNCalendar
          onDayPress={handleDayPress}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: '#8B5CF6' }, // Roxo
          }}
          theme={{
            backgroundColor: '#1F2937',
            calendarBackground: '#1F2937',
            textSectionTitleColor: '#9CA3AF',
            selectedDayBackgroundColor: '#8B5CF6',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#8B5CF6',
            dayTextColor: '#D1D5DB',
            textDisabledColor: '#4B5563',
            arrowColor: '#8B5CF6',
            monthTextColor: '#ffffff',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14
          }}
        />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1F2937',
        borderRadius: 12,
        padding: 5,
        marginBottom: 24,
    }
})

export default CalendarComponent;