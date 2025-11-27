import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { BackButton } from '../../src/components/ui/BackButton';
import { Input } from '../../src/components/ui/Input';
import { Modal } from '../../src/components/ui/Modal';
import { theme } from '../../src/theme';
import { useRoommateFilterStore } from '../../src/store/roommateFilterStore';

const PROVINCES = [
    'Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng',
    'Bình Dương',
    'Đồng Nai',
    'Cần Thơ',
    'Hải Phòng',
    'Khánh Hòa',
];

export default function RoommateFilterScreen() {
    const router = useRouter();
    const [cityModalVisible, setCityModalVisible] = useState(false);

    const {
        ageRange, setAgeRange,
        gender, setGender,
        location, setLocation,
        budgetRange, setBudgetRange,
        habits, setHabit,
        resetFilters
    } = useRoommateFilterStore();

    const handleApply = () => {
        router.back();
    };

    const handleReset = () => {
        resetFilters();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <BackButton />
                <Typography variant="h2">Bộ lọc chi tiết</Typography>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Age Range */}
                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>Thông tin cơ bản</Typography>
                    <Typography variant="label" style={{ marginBottom: 16 }}>Tuổi</Typography>
                    <View style={styles.sliderContainer}>
                        <MultiSlider
                            values={[ageRange[0], ageRange[1]]}
                            sliderLength={280}
                            onValuesChange={setAgeRange}
                            min={18}
                            max={50}
                            step={1}
                            allowOverlap={false}
                            snapped
                            selectedStyle={{ backgroundColor: theme.colors.primary }}
                            markerStyle={styles.marker}
                        />
                    </View>
                    <View style={styles.rangeLabels}>
                        <Typography variant="body">{ageRange[0]}</Typography>
                        <Typography variant="body">{ageRange[1]}+</Typography>
                    </View>

                    {/* Gender */}
                    <Typography variant="label" style={{ marginTop: 24, marginBottom: 12 }}>Giới tính</Typography>
                    <View style={styles.genderContainer}>
                        {[
                            { id: 'MALE', label: 'Nam' },
                            { id: 'FEMALE', label: 'Nữ' },
                            { id: 'ALL', label: 'Tất cả' }
                        ].map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.genderOption,
                                    gender === item.id && styles.genderActive
                                ]}
                                onPress={() => setGender(item.id as any)}
                            >
                                <Typography style={{ color: gender === item.id ? 'white' : 'black', fontWeight: 'bold' }}>
                                    {item.label}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Needs */}
                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>Nhu cầu</Typography>

                    <Typography variant="label" style={{ marginBottom: 8 }}>Khu vực mong muốn</Typography>
                    <TouchableOpacity
                        style={styles.citySelector}
                        onPress={() => setCityModalVisible(true)}
                    >
                        <Typography variant="body" style={{ color: location ? theme.colors.text : theme.colors.textSecondary }}>
                            {location || 'Chọn Tỉnh/Thành phố'}
                        </Typography>
                        <Feather name="chevron-down" size={20} color={theme.colors.text} />
                    </TouchableOpacity>

                    <Modal
                        visible={cityModalVisible}
                        onClose={() => setCityModalVisible(false)}
                        title="Chọn Tỉnh/Thành phố"
                    >
                        <ScrollView style={{ maxHeight: 400 }}>
                            {PROVINCES.map((province) => (
                                <TouchableOpacity
                                    key={province}
                                    style={[
                                        styles.provinceItem,
                                        location === province && styles.provinceItemSelected
                                    ]}
                                    onPress={() => {
                                        setLocation(province);
                                        setCityModalVisible(false);
                                    }}
                                >
                                    <Typography variant="body" style={location === province ? { color: theme.colors.primary, fontWeight: 'bold' } : {}}>
                                        {province}
                                    </Typography>
                                    {location === province && <Feather name="check" size={20} color={theme.colors.primary} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </Modal>

                    <Typography variant="label" style={{ marginTop: 16, marginBottom: 16 }}>Ngân sách</Typography>
                    <View style={styles.sliderContainer}>
                        <MultiSlider
                            values={[budgetRange[0], budgetRange[1]]}
                            sliderLength={280}
                            onValuesChange={setBudgetRange}
                            min={0}
                            max={20}
                            step={0.5}
                            allowOverlap={false}
                            snapped
                            selectedStyle={{ backgroundColor: theme.colors.primary }}
                            markerStyle={styles.marker}
                            trackStyle={{ height: 4, backgroundColor: theme.colors.border }}
                        />
                    </View>
                    <Typography variant="h3" style={{ textAlign: 'right', color: theme.colors.primary, marginTop: 8 }}>
                        {budgetRange[0]} - {budgetRange[1]} triệu VNĐ
                    </Typography>
                </View>

                {/* Lifestyle */}
                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>Lối sống</Typography>

                    <View style={styles.toggleRow}>
                        <Typography variant="body">Hút thuốc</Typography>
                        <Switch
                            value={habits.smoking}
                            onValueChange={(val) => setHabit('smoking', val)}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                            thumbColor={'white'}
                        />
                    </View>

                    <View style={styles.toggleRow}>
                        <Typography variant="body">Thích yên tĩnh</Typography>
                        <Switch
                            value={habits.quiet}
                            onValueChange={(val) => setHabit('quiet', val)}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                            thumbColor={'white'}
                        />
                    </View>

                    <View style={styles.toggleRow}>
                        <Typography variant="body">Gọn gàng</Typography>
                        <Switch
                            value={habits.tidy}
                            onValueChange={(val) => setHabit('tidy', val)}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                            thumbColor={'white'}
                        />
                    </View>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title="Xóa lọc"
                    onPress={handleReset}
                    variant="outline"
                    style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                    title="Áp dụng"
                    onPress={handleApply}
                    variant="primary"
                    style={{ flex: 1, marginLeft: 8 }}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF7F0',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.border,
    },

    content: {
        padding: 16,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 16,
        fontSize: 18,
        fontWeight: 'bold',
    },
    sliderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    marker: {
        backgroundColor: theme.colors.primary,
        height: 24,
        width: 24,
        borderWidth: 2,
        borderColor: 'black',
        borderRadius: 12,
    },
    rangeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginTop: 4,
    },
    genderContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: theme.borderRadius.md,
        borderWidth: 2,
        borderColor: theme.colors.border,
        overflow: 'hidden',
        height: 48,
        shadowColor: theme.colors.border,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 0,
    },
    genderOption: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
    },
    genderActive: {
        backgroundColor: theme.colors.primary,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: 'white',
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: theme.colors.border,
        shadowColor: theme.colors.border,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 16,
        flexDirection: 'row',
        borderTopWidth: 2,
        borderTopColor: theme.colors.border,
    },
    citySelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        backgroundColor: 'white',
    },
    provinceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    provinceItemSelected: {
        backgroundColor: '#FFF5F5',
    },
});
