import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Animated,
    Modal,
} from "react-native";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import moment from "moment";
import Svg, { Path } from "react-native-svg";

interface DatePickerProps {
    tideDate: Date;
    setTideDate: (tideDate: Date) => void;
}

interface OnChangeEvent {
    event: DateTimePickerEvent;
    selectedDate?: Date;
}

export default function DatePickerText({
    tideDate,
    setTideDate,
}: DatePickerProps): React.JSX.Element {
    const [showPicker, setShowPicker] = useState<boolean>(false);
    const [tempDate, setTempDate] = useState<Date>(tideDate);
    const fadeAnim = useRef<Animated.Value>(new Animated.Value(0)).current;

    const minDate: Date = new Date(
        new Date().setFullYear(new Date().getFullYear() - 1)
    );
    const maxDate: Date = new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
    );

    const onChange = ({ event, selectedDate }: OnChangeEvent) => {
        if (selectedDate) {
            setTempDate(selectedDate);
        }
        if (Platform.OS === "android" && event.type === "set" && selectedDate) {
            setTideDate(selectedDate);
        }
        if (Platform.OS === "android") {
            setShowPicker(false);
        }
    };

    const confirmIOSDate = (): void => {
        setTideDate(tempDate);
        setShowPicker(false);
    };

    const showPickerWithFade = (): void => {
        setTempDate(tideDate); // preload with current value
        setShowPicker(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    useEffect(() => {
        if (!showPicker) {
            fadeAnim.setValue(0);
        }
    }, [showPicker]);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={showPickerWithFade}
                accessibilityLabel="Select date"
                style={styles.touchable}
            >
                <Svg viewBox="0 0 400 512" width={12} height={12}>
                    <Path
                        fill="#000"
                        d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40L64 64C28.7 64 0 92.7 0 128l0 16 0 48L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-256 0-48 0-16c0-35.3-28.7-64-64-64l-40 0 0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40L152 64l0-40zM48 192l352 0 0 256c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16l0-256z"
                    />
                </Svg>
                <Text style={styles.dateText}>
                    {moment(tideDate).format("MM-DD-YYYY")}
                </Text>
            </TouchableOpacity>

            {Platform.OS === "ios" ? (
                <Modal
                    transparent
                    animationType="fade"
                    visible={showPicker}
                    onRequestClose={() => setShowPicker(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPressOut={() => setShowPicker(false)}
                    >
                        <View style={styles.pickerContainer}>
                            <DateTimePicker
                                value={tempDate}
                                mode="date"
                                display="spinner"
                                onChange={(event, selectedDate) =>
                                    onChange({ event, selectedDate })
                                }
                                minimumDate={minDate}
                                maximumDate={maxDate}
                            />
                            <TouchableOpacity
                                onPress={confirmIOSDate}
                                style={styles.doneButton}
                            >
                                <Text style={styles.doneText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            ) : (
                showPicker && (
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <DateTimePicker
                            value={tempDate}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) =>
                                onChange({ event, selectedDate })
                            }
                            minimumDate={minDate}
                            maximumDate={maxDate}
                        />
                    </Animated.View>
                )
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ECEFF2",
        paddingHorizontal: 15,
        borderRadius: 10,
        flexShrink: 1,
        height: 40,
    },
    touchable: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    dateText: {
        fontSize: 16,
        color: "#000",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    pickerContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 10,
        width: "80%",
        alignItems: "center",
    },
    doneButton: {
        marginTop: 10,
        backgroundColor: "#007AFF",
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
    doneText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
});
