import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

interface DatePickerProps {
    tideDate: Date;
    setTideDate: (tideDate: Date) => void;
}

const DatePickerText = ({ 
    tideDate,
    setTideDate
 }: DatePickerProps) => {
//   const [date, setDate] = useState(tideDate || new Date());
  const [showPicker, setShowPicker] = useState(false);

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date | undefined) => {
    console.log("Selected date:", selectedDate);
    setShowPicker(false); // Hide picker after selection
    if (selectedDate) {
        setTideDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      {/* Calendar Icon */}
      <Text style={styles.icon} onPress={() => setShowPicker(true)}>
        📅
    </Text>
      
      {/* Clickable Text */}
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <Text style={styles.dateText}>
          {tideDate.toDateString()} {/* Format as needed */}
        </Text>
      </TouchableOpacity>

      {/* Date Picker (Only shown when clicked) */}
      {showPicker && (
        <DateTimePicker
          value={tideDate}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10, // Adds spacing between icon and text
    backgroundColor: "#fff",
  },
  dateText: {
    fontSize: 16,
    color: "#000",
  },
  icon: {
    // transform: [{ rotate: "-45deg" }],
    // position: "absolute",
    // right: 25,
    fontSize: 15,
},
});

export default DatePickerText;
