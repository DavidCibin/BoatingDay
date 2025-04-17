import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import moment from "moment";

interface DatePickerProps {
    tideDate: Date;
    setTideDate: (tideDate: Date) => void;
}

const DatePickerText = ({ tideDate, setTideDate }: DatePickerProps) => {
    const [showPicker, setShowPicker] = useState(false);

    const onChange = (
        event: DateTimePickerEvent,
        selectedDate?: Date | undefined
    ) => {
        setShowPicker(false); // Hide picker after selection
        if (selectedDate) {
            setTideDate(selectedDate);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => setShowPicker(true)}>
                <Text style={styles.dateText}>
                    {moment(tideDate).format("MM-DD-YYYY")}
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
        height: 40,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#ECEFF2",
        paddingHorizontal: 15,
        borderRadius: 10,
        flexShrink: 1
    },
    dateText: {
        fontSize: 16,
        color: "#000",
    },
});

export default DatePickerText;
