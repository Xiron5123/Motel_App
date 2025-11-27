import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import * as Location from 'expo-location';

import { Typography } from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Modal } from '../../src/components/ui/Modal';
import { theme } from '../../src/theme';
import api from '../../src/services/api';
import { useListings } from '../../src/hooks/useListings';
import { getImageUrl } from '../../src/utils/image';
import { formatPriceShort } from '../../src/utils/format';
import { PROVINCES, DISTRICTS } from '../../src/constants/locations';

// Mock data for filters
const FILTER_TYPES = {
  LOCATION: 'Khu vực',
  PRICE: 'Giá',
  AREA: 'Diện tích',
  FURNITURE: 'Nội thất',
};

interface ListingsFilters {
  q?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  amenities?: string[];
  lat?: number;
  lng?: number;
  radius?: number;
  status?: 'AVAILABLE' | 'RENTED';
  sortBy?: 'price_asc' | 'price_desc' | 'created_asc' | 'created_desc' | 'distance';
  page?: number;
  limit?: number;
  city?: string;
  district?: string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function HomeScreen() {
  const router = useRouter();

  // Filter States
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentFilterType, setCurrentFilterType] = useState(FILTER_TYPES.PRICE);
  const [filters, setFilters] = useState<ListingsFilters>({});
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Temp filter states
  const [tempPriceRange, setTempPriceRange] = useState([0, 30]);
  const [tempAreaRange, setTempAreaRange] = useState([0, 100]);
  const [tempFurniture, setTempFurniture] = useState<string | null>(null);
  const [tempCity, setTempCity] = useState<string | null>(null);
  const [tempDistrict, setTempDistrict] = useState<string | null>(null);

  const { data: listingsData, isLoading, refetch } = useListings(filters);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const listings = listingsData?.data || [];

  const handleFilterPress = (type: string) => {
    setCurrentFilterType(type);
    if (type === FILTER_TYPES.PRICE) {
      const min = filters.priceMin ? filters.priceMin / 1000000 : 0;
      const max = filters.priceMax ? filters.priceMax / 1000000 : 30;
      setTempPriceRange([min, max]);
    } else if (type === FILTER_TYPES.AREA) {
      const min = filters.areaMin || 0;
      const max = filters.areaMax || 100;
      setTempAreaRange([min, max]);
    } else if (type === FILTER_TYPES.FURNITURE) {
      const furniture = filters.amenities?.find(a => a.startsWith('furniture_')) || null;
      setTempFurniture(furniture);
    } else if (type === FILTER_TYPES.LOCATION) {
      setTempCity(filters.city || null);
      setTempDistrict(filters.district || null);
    }
    setModalVisible(true);
  };

  const handleLocationPress = (location: string) => {
    if (selectedLocation === location) {
      setSelectedLocation('Tất cả');
      const newFilters = { ...filters };
      delete newFilters.city;
      delete newFilters.district;
      setFilters(newFilters);
    } else {
      setSelectedLocation(location);
      // Clear "Near Me" filters if selecting a city
      const newFilters = { ...filters, city: location };
      delete newFilters.district; // Reset district when changing city via chips
      delete newFilters.lat;
      delete newFilters.lng;
      delete newFilters.radius;
      delete newFilters.sortBy;
      setFilters(newFilters);
    }
  };

  const handleNearMePress = async () => {
    if (selectedLocation === 'Near Me') {
      // Toggle off
      setSelectedLocation('Tất cả');
      const newFilters = { ...filters };
      delete newFilters.lat;
      delete newFilters.lng;
      delete newFilters.radius;
      delete newFilters.sortBy;
      setFilters(newFilters);
      return;
    }

    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập vị trí bị từ chối', 'Vui lòng cấp quyền truy cập vị trí để sử dụng tính năng này.');
        setIsGettingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setSelectedLocation('Near Me');
      setFilters({
        ...filters,
        lat: latitude,
        lng: longitude,
        radius: 5, // 5km radius
        sortBy: 'distance',
        city: undefined, // Clear city filter
        district: undefined,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSearch = () => {
    const newFilters = { ...filters };
    if (searchQuery.trim()) {
      newFilters.q = searchQuery.trim();
    } else {
      delete newFilters.q;
    }
    setFilters(newFilters);
  };

  const renderListingItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/listing/${item.id}`)}
      activeOpacity={0.9}
    >
      <Card style={styles.card} variant="flat">
        <Image
          source={{ uri: getImageUrl(item.photos?.[0]?.url) }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <Typography variant="h3" style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Typography>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Typography variant="body" style={styles.cardPrice}>
              {formatPriceShort(item.price)}
            </Typography>
            {item.distance !== undefined && item.distance !== null && (
              <Typography variant="caption" style={{ color: theme.colors.primary }}>
                {item.distance < 1
                  ? `${(item.distance * 1000).toFixed(0)}m`
                  : `${item.distance.toFixed(1)}km`}
              </Typography>
            )}
          </View>
          <Typography variant="caption" style={styles.cardAddress} numberOfLines={1}>
            {[item.address, item.ward, item.district, item.city].filter(Boolean).join(', ')}
          </Typography>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const handleApplyFilter = () => {
    const newFilters = { ...filters };

    if (currentFilterType === FILTER_TYPES.PRICE) {
      if (tempPriceRange[0] === 0 && tempPriceRange[1] === 30) {
        delete newFilters.priceMin;
        delete newFilters.priceMax;
      } else {
        newFilters.priceMin = tempPriceRange[0] * 1000000;
        newFilters.priceMax = tempPriceRange[1] * 1000000;
      }
    } else if (currentFilterType === FILTER_TYPES.AREA) {
      if (tempAreaRange[0] === 0 && tempAreaRange[1] === 100) {
        delete newFilters.areaMin;
        delete newFilters.areaMax;
      } else {
        newFilters.areaMin = tempAreaRange[0];
        newFilters.areaMax = tempAreaRange[1];
      }
    } else if (currentFilterType === FILTER_TYPES.FURNITURE) {
      if (tempFurniture) {
        newFilters.amenities = [tempFurniture];
      } else {
        delete newFilters.amenities;
      }
    } else if (currentFilterType === FILTER_TYPES.LOCATION) {
      if (tempCity) {
        newFilters.city = tempCity;
        setSelectedLocation(tempCity);
        // Clear Near Me
        delete newFilters.lat;
        delete newFilters.lng;
        delete newFilters.radius;
        delete newFilters.sortBy;
      } else {
        delete newFilters.city;
        if (selectedLocation !== 'Near Me') setSelectedLocation('Tất cả');
      }

      if (tempDistrict) {
        newFilters.district = tempDistrict;
      } else {
        delete newFilters.district;
      }
    }

    setFilters(newFilters);
    setModalVisible(false);
  };

  const handleResetFilter = () => {
    if (currentFilterType === FILTER_TYPES.PRICE) {
      setTempPriceRange([0, 30]);
    } else if (currentFilterType === FILTER_TYPES.AREA) {
      setTempAreaRange([0, 100]);
    } else if (currentFilterType === FILTER_TYPES.FURNITURE) {
      setTempFurniture(null);
    } else if (currentFilterType === FILTER_TYPES.LOCATION) {
      setTempCity(null);
      setTempDistrict(null);
    }
  };

  const renderHeader = (
    <HomeHeader
      filters={filters}
      selectedLocation={selectedLocation}
      onFilterPress={handleFilterPress}
      onLocationPress={handleLocationPress}
      onNearMePress={handleNearMePress}
      isGettingLocation={isGettingLocation}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      onSearch={handleSearch}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={listings}
        renderItem={renderListingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refetch}
      />

      {/* Filter Modal */}
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={`Chọn ${currentFilterType}`}
        footer={
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button
              title="Đặt lại"
              onPress={handleResetFilter}
              variant="outline"
              style={{ flex: 1 }}
            />
            <Button
              title="Áp dụng"
              onPress={handleApplyFilter}
              variant="primary"
              style={{ flex: 1 }}
            />
          </View>
        }
      >
        {currentFilterType === FILTER_TYPES.PRICE && (
          <View style={styles.filterContent}>
            <View style={styles.sliderContainer}>
              <MultiSlider
                values={[tempPriceRange[0], tempPriceRange[1]]}
                sliderLength={260}
                onValuesChange={(values) => setTempPriceRange(values)}
                min={0}
                max={30}
                step={0.5}
                allowOverlap={false}
                snapped
                selectedStyle={{
                  backgroundColor: theme.colors.primary,
                }}
                unselectedStyle={{
                  backgroundColor: theme.colors.border,
                }}
                containerStyle={{
                  height: 40,
                  justifyContent: 'center',
                }}
                trackStyle={{
                  height: 4,
                  borderRadius: 2,
                }}
                markerStyle={{
                  backgroundColor: theme.colors.primary,
                  height: 20,
                  width: 20,
                  borderWidth: 2,
                  borderColor: 'white',
                  borderRadius: 10,
                  elevation: 5,
                }}
              />
            </View>
            <Typography variant="body" style={{ textAlign: 'center', marginTop: 10 }}>
              Từ {tempPriceRange[0]} triệu đến {tempPriceRange[1].toFixed(1)} triệu
            </Typography>
          </View>
        )}

        {currentFilterType === FILTER_TYPES.AREA && (
          <View style={styles.filterContent}>
            <View style={styles.sliderContainer}>
              <MultiSlider
                values={[tempAreaRange[0], tempAreaRange[1]]}
                sliderLength={260}
                onValuesChange={(values) => setTempAreaRange(values)}
                min={0}
                max={100}
                step={5}
                allowOverlap={false}
                snapped
                selectedStyle={{
                  backgroundColor: theme.colors.primary,
                }}
                unselectedStyle={{
                  backgroundColor: theme.colors.border,
                }}
                containerStyle={{
                  height: 40,
                  justifyContent: 'center',
                }}
                trackStyle={{
                  height: 4,
                  borderRadius: 2,
                }}
                markerStyle={{
                  backgroundColor: theme.colors.primary,
                  height: 20,
                  width: 20,
                  borderWidth: 2,
                  borderColor: 'white',
                  borderRadius: 10,
                  elevation: 5,
                }}
              />
            </View>
            <Typography variant="body" style={{ textAlign: 'center', marginTop: 10 }}>
              Từ {tempAreaRange[0]} m² đến {tempAreaRange[1]} m²
            </Typography>
          </View>
        )}

        {currentFilterType === FILTER_TYPES.FURNITURE && (
          <View style={styles.filterContent}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {[
                { id: 'furniture_full', label: 'Đầy đủ' },
                { id: 'furniture_basic', label: 'Cơ bản' },
                { id: 'furniture_empty', label: 'Nhà trống' },
              ].map((item) => (
                <Button
                  key={item.id}
                  title={item.label}
                  variant={tempFurniture === item.id ? 'primary' : 'outline'}
                  onPress={() => setTempFurniture(item.id === tempFurniture ? null : item.id)}
                  size="small"
                />
              ))}
            </View>
          </View>
        )}

        {currentFilterType === FILTER_TYPES.LOCATION && (
          <View style={styles.filterContent}>
            <Typography variant="caption" style={{ marginBottom: 8 }}>Tỉnh/Thành phố</Typography>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {PROVINCES.map((province) => (
                <Button
                  key={province}
                  title={province}
                  variant={tempCity === province ? 'primary' : 'outline'}
                  onPress={() => {
                    setTempCity(tempCity === province ? null : province);
                    setTempDistrict(null); // Reset district when city changes
                  }}
                  size="small"
                />
              ))}
            </View>

            {tempCity && DISTRICTS[tempCity] && (
              <>
                <Typography variant="caption" style={{ marginBottom: 8 }}>Quận/Huyện</Typography>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {DISTRICTS[tempCity].map((district) => (
                    <Button
                      key={district}
                      title={district}
                      variant={tempDistrict === district ? 'primary' : 'outline'}
                      onPress={() => setTempDistrict(tempDistrict === district ? null : district)}
                      size="small"
                    />
                  ))}
                </View>
              </>
            )}
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  headerContainer: {
    marginBottom: 16,
  },
  searchWrapper: {
    marginBottom: 16,
    position: 'relative',
    height: 48,
    width: '100%',
  },
  searchShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    // zIndex removed to rely on render order
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    height: '100%',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    borderWidth: 0,
    height: '100%',
    shadowOpacity: 0,
    elevation: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  chipScroll: {
    marginBottom: 8,
    overflow: 'visible',
  },
  chipContainer: {
    marginRight: 12,
    marginBottom: 8,
  },
  chipButton: {
    // Button component handles styling
  },
  card: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardPrice: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardAddress: {
    color: '#666',
  },
  filterContent: {
    paddingVertical: 10,
  },
  sliderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20, // Add padding to container
  }
});

const HomeHeader = ({ filters, selectedLocation, onFilterPress, onLocationPress, onNearMePress, isGettingLocation, searchQuery, onSearchQueryChange, onSearch }: {
  filters: ListingsFilters;
  selectedLocation: string;
  onFilterPress: (type: string) => void;
  onLocationPress: (loc: string) => void;
  onNearMePress: () => void;
  isGettingLocation: boolean;
  searchQuery: string;
  onSearchQueryChange: (text: string) => void;
  onSearch: () => void;
}) => (
  <View style={styles.headerContainer}>
    {/* Search Bar */}
    <View style={styles.searchWrapper}>
      <View style={styles.searchShadow} />
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={onSearch}>
          <Feather name="search" size={20} color={theme.colors.text} style={styles.searchIcon} />
        </TouchableOpacity>
        <Input
          placeholder="Tìm kiếm quận, đường phố..."
          style={styles.searchInput}
          containerStyle={{ marginBottom: 0, flex: 1 }}
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          onSubmitEditing={onSearch}
          returnKeyType="search"
        />
      </View>
    </View>

    {/* Filter Chips */}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
      {Object.values(FILTER_TYPES).map((type) => {
        // Determine if this filter type is active
        let isActive = false;
        if (type === FILTER_TYPES.PRICE && (filters.priceMin !== undefined || filters.priceMax !== undefined)) isActive = true;
        if (type === FILTER_TYPES.AREA && (filters.areaMin !== undefined || filters.areaMax !== undefined)) isActive = true;
        if (type === FILTER_TYPES.FURNITURE && filters.amenities?.some(a => a.startsWith('furniture_'))) isActive = true;
        if (type === FILTER_TYPES.LOCATION && (filters.city || filters.district)) isActive = true;

        return (
          <View key={type} style={styles.chipContainer}>
            <Button
              title={type}
              size="small"
              variant={isActive ? 'primary' : 'white'}
              onPress={() => onFilterPress(type)}
              style={styles.chipButton}
              textStyle={{ fontSize: 12, fontWeight: '600' }}
            />
          </View>
        );
      })}
    </ScrollView>

    {/* Location Chips */}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
      <View style={styles.chipContainer}>
        <Button
          title={isGettingLocation ? "Đang tìm..." : "Gần bạn"}
          size="small"
          variant={selectedLocation === 'Near Me' ? 'primary' : 'secondary'}
          onPress={onNearMePress}
          style={styles.chipButton}
          textStyle={{ fontSize: 12, fontWeight: '600' }}
          icon={<Feather name="map-pin" size={12} color={selectedLocation === 'Near Me' ? 'white' : 'black'} />}
          disabled={isGettingLocation}
        />
      </View>
      {PROVINCES.slice(0, 5).map((loc) => {
        const isSelected = selectedLocation === loc;
        return (
          <View key={loc} style={styles.chipContainer}>
            <Button
              title={loc}
              size="small"
              variant={isSelected ? 'primary' : 'white'}
              onPress={() => onLocationPress(loc)}
              style={styles.chipButton}
              textStyle={{ fontSize: 12, fontWeight: '600' }}
            />
          </View>
        );
      })}
    </ScrollView>
  </View>
);
