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

/** ************************************************************** */
/* Types */
interface DatePickerProps {
    tideDate: Date;
    setTideDate: (tideDate: Date) => void;
}

interface OnChangeEvent {
    event: DateTimePickerEvent;
    selectedDate?: Date;
}

/** ************************************************************** */
/* Variables */
let styles: ReturnType<typeof StyleSheet.create>;

/** ************************************************************** */
/* DatePicker Component */
export default function DatePickerText({
    tideDate,
    setTideDate,
}: DatePickerProps): React.JSX.Element {
    /** ************************************************************** */
    /* State */
    const [showPicker, setShowPicker] = useState<boolean>(false);
    const [tempDate, setTempDate] = useState<Date>(tideDate);

    /** ************************************************************** */
    /* Refs */
    const fadeAnim = useRef<Animated.Value>(new Animated.Value(0)).current;

    /** ************************************************************** */
    /* Constants */
    const minDate: Date = new Date(
        new Date().setFullYear(new Date().getFullYear() - 1),
    );
    const maxDate: Date = new Date(
        new Date().setFullYear(new Date().getFullYear() + 1),
    );

    /** ************************************************************** */
    /* Functions */
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

    /** ************************************************************** */
    /* Effects */
    useEffect(() => {
        if (!showPicker) {
            fadeAnim.setValue(0);
        }
    }, [showPicker, fadeAnim]);

    /** ************************************************************** */
    /* Render */
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

/** ************************************************************** */
/* Styles */
styles = StyleSheet.create({
    container: {
        alignItems: "center",
        backgroundColor: "#ECEFF2",
        borderRadius: 10,
        flexDirection: "row",
        flexShrink: 1,
        height: 40,
        paddingHorizontal: 15,
    },
    dateText: {
        color: "#000",
        fontSize: 16,
    },
    doneButton: {
        backgroundColor: "#007AFF",
        borderRadius: 6,
        marginTop: 10,
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    doneText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    modalOverlay: {
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        flex: 1,
        justifyContent: "center",
    },
    pickerContainer: {
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 10,
        width: "80%",
    },
    touchable: {
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
    },
});
