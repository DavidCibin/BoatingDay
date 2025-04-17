import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
    Animated,
} from "react-native";

interface Station {
    id: number;
    name: string;
}

/*****************************************************************/
/* Types */
interface DropdownProps {
    nearbyStations: Station[];
    fetchTideData: (stationId: number) => void;
    setStationName: (stationName: string) => void;
}

/*****************************************************************/
/* DropdownMenu Component */
export default function DropdownMenu({
    nearbyStations,
    fetchTideData,
    setStationName,
}: DropdownProps): React.JSX.Element {
    /*****************************************************************/
    /* State */
    const [isOpen, setIsOpen] = useState(false);
    const [selectedStationId, setSelectedStationId] = useState<number>(
        nearbyStations[0].id
    );
    const fadeAnim = useRef(new Animated.Value(0)).current;

    /*****************************************************************/
    /* Functions */
    const handleSelectStation = (stationId: number, stationName: string) => {
        setSelectedStationId(stationId);
        setStationName(stationName);
        fetchTideData(stationId);
        setIsOpen(false);
    };

    const handleOpen = () => {
        setIsOpen(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    /*****************************************************************/
    /* Effects */
    useEffect(() => {
        setStationName(nearbyStations[0].name);
        setSelectedStationId(nearbyStations[0].id);
    }, [nearbyStations]);

    useEffect(() => {
        if (!isOpen) fadeAnim.setValue(0); // Reset on close
    }, [isOpen]);

    /*****************************************************************/
    /* Render */
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.dropdown}
                onPress={handleOpen}
                accessibilityLabel="Open station dropdown"
            >
                <Text style={styles.dropdownText}>Select Nearby Station</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            {isOpen && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isOpen}
                    onRequestClose={() => setIsOpen(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setIsOpen(false)}
                    >
                        <Animated.View
                            style={[
                                styles.modalContainer,
                                { opacity: fadeAnim },
                            ]}
                        >
                            <FlatList
                                data={nearbyStations}
                                keyExtractor={(item) => String(item.id)}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.item}
                                        onPress={() =>
                                            handleSelectStation(
                                                item.id,
                                                item.name
                                            )
                                        }
                                    >
                                        <Text style={styles.itemCheckmark}>
                                            {item.id === selectedStationId
                                                ? "✔"
                                                : ""}
                                        </Text>
                                        <Text style={styles.itemText}>
                                            {item.name}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </Animated.View>
                    </TouchableOpacity>
                </Modal>
            )}
        </View>
    );
}

/*****************************************************************/
/* Styles */
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    dropdown: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        maxHeight: 40,
        backgroundColor: "#ECEFF2",
        paddingHorizontal: 15,
        borderRadius: 10,
        flex: 1,
    },
    dropdownText: {
        fontSize: 15,
    },
    dropdownArrow: {
        fontSize: 14,
        paddingTop: 1,
        opacity: 0.7,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "95%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        maxHeight: "60%",
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
        borderBottomWidth: 1,
        borderColor: "#e9e9e9",
    },
    itemCheckmark: {
        width: 30,
        fontSize: 10,
    },
    itemText: {
        color: "#333",
    },
});
