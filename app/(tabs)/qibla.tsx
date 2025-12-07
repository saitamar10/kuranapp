import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, Animated, Easing, Platform } from 'react-native';
import { MapPin, Navigation, RefreshCw } from 'lucide-react-native';
import { turkishCities, calculateQiblaDirection } from '@/data/quranData';
import * as Location from 'expo-location';

export default function QiblaScreen() {
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [locationName, setLocationName] = useState('Konum alınıyor...');
  const [isLoading, setIsLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [compassHeading, setCompassHeading] = useState(0);
  const [isMagnetometerAvailable, setIsMagnetometerAvailable] = useState(false);
  const compassAnim = useRef(new Animated.Value(0)).current;
  const qiblaArrowAnim = useRef(new Animated.Value(0)).current;

  const getLocation = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        const { latitude, longitude } = location.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        
        const direction = calculateQiblaDirection(latitude, longitude);
        setQiblaDirection(direction);
        
        // Reverse geocoding to get city name
        try {
          const [address] = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });
          
          if (address) {
            const cityName = address.city || address.subregion || address.region || 'Bilinmeyen Konum';
            setLocationName(`${cityName}, ${address.country || 'Türkiye'}`);
          }
        } catch {
          setLocationName('Konumunuz');
        }
      } else {
        // Fallback to Istanbul
        const istanbul = turkishCities.find(c => c.name === 'İstanbul') || turkishCities[0];
        const direction = calculateQiblaDirection(istanbul.lat, istanbul.lng);
        setQiblaDirection(direction);
        setLocationName(`${istanbul.name}, Türkiye`);
        setUserCoords({ lat: istanbul.lat, lng: istanbul.lng });
        
        Alert.alert(
          'Konum İzni Gerekli',
          'Kıble yönünü doğru hesaplamak için konum izni verin. Şimdilik İstanbul için hesaplandı.',
          [{ text: 'Tamam' }]
        );
      }
    } catch (error) {
      // Fallback to Istanbul
      const istanbul = turkishCities.find(c => c.name === 'İstanbul') || turkishCities[0];
      const direction = calculateQiblaDirection(istanbul.lat, istanbul.lng);
      setQiblaDirection(direction);
      setLocationName(`${istanbul.name}, Türkiye`);
      setUserCoords({ lat: istanbul.lat, lng: istanbul.lng });
    } finally {
      setIsLoading(false);
    }
  };

  // Magnetometer for live compass (only on native platforms)
  useEffect(() => {
    let subscription: any;
    let Magnetometer: any = null;

    const startMagnetometer = async () => {
      // Skip on web platform
      if (Platform.OS === 'web') {
        setIsMagnetometerAvailable(false);
        return;
      }

      try {
        // Dynamic import for native only
        const sensors = await import('expo-sensors');
        Magnetometer = sensors.Magnetometer;
        
        const isAvailable = await Magnetometer.isAvailableAsync();
        setIsMagnetometerAvailable(isAvailable);

        if (isAvailable) {
          Magnetometer.setUpdateInterval(100);
          
          subscription = Magnetometer.addListener((data: any) => {
            let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
            angle = (angle + 360) % 360;
            // Adjust for device orientation (pointing north)
            angle = (360 - angle) % 360;
            
            setCompassHeading(angle);
            
            // Animate compass rotation
            Animated.timing(compassAnim, {
              toValue: angle,
              duration: 150,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }).start();
            
            // Animate qibla arrow - it should point to qibla relative to current heading
            const qiblaArrowAngle = (qiblaDirection - angle + 360) % 360;
            Animated.timing(qiblaArrowAnim, {
              toValue: qiblaArrowAngle,
              duration: 150,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }).start();
          });
        }
      } catch (error) {
        setIsMagnetometerAvailable(false);
      }
    };

    startMagnetometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [qiblaDirection]);

  // Initialize qibla arrow when qiblaDirection changes
  useEffect(() => {
    if (qiblaDirection > 0) {
      qiblaArrowAnim.setValue(qiblaDirection);
    }
  }, [qiblaDirection]);

  useEffect(() => {
    getLocation();
  }, []);

  // Calculate the rotation needed to point to Qibla
  // When user rotates phone, compass rotates opposite direction
  const compassRotation = compassAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '-360deg'],
  });
  
  // Qibla arrow rotation with animation
  const qiblaArrowRotation = qiblaArrowAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView className="flex-1 bg-[#1B4D3E]">
      {/* Header */}
      <View className="px-5 pt-6 pb-4">
        <Text className="text-2xl font-bold text-white mb-1">Kıble Bulucu</Text>
        <Text className="text-sm text-white/70">Kabe yönünü bulun</Text>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        {isLoading ? (
          <View className="items-center">
            <ActivityIndicator size="large" color="#C9A227" />
            <Text className="text-white mt-4">Konum alınıyor...</Text>
          </View>
        ) : (
          <>
            {/* Compass Circle */}
            <View className="w-72 h-72 rounded-full bg-white/10 items-center justify-center mb-8">
              <Animated.View
                style={{
                  width: 256,
                  height: 256,
                  borderRadius: 128,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: [{ rotate: compassRotation }],
                }}
              >
                {/* Cardinal Directions */}
                <View className="absolute top-2">
                  <Text className="text-white font-bold text-lg">K</Text>
                </View>
                <View className="absolute bottom-2">
                  <Text className="text-white/60 font-bold text-lg">G</Text>
                </View>
                <View className="absolute left-2">
                  <Text className="text-white/60 font-bold text-lg">B</Text>
                </View>
                <View className="absolute right-2">
                  <Text className="text-white/60 font-bold text-lg">D</Text>
                </View>
              </Animated.View>
              
              {/* Qibla Arrow - Always points to actual Qibla */}
              <Animated.View
                style={{
                  position: 'absolute',
                  transform: [{ rotate: qiblaArrowRotation }],
                }}
              >
                <View className="items-center">
                  <View className="w-1 h-24 bg-[#C9A227] rounded-full" />
                  <View 
                    style={{
                      position: 'absolute',
                      top: -10,
                      width: 0,
                      height: 0,
                      borderLeftWidth: 10,
                      borderRightWidth: 10,
                      borderBottomWidth: 20,
                      borderLeftColor: 'transparent',
                      borderRightColor: 'transparent',
                      borderBottomColor: '#C9A227',
                    }}
                  />
                </View>
              </Animated.View>

              {/* Kaaba Icon in center */}
              <View 
                className="absolute w-16 h-16 bg-[#C9A227] rounded-lg items-center justify-center"
              >
                <Text className="text-2xl">🕋</Text>
              </View>
            </View>

            {/* Direction Info */}
            <View className="items-center">
              <Text className="text-white/80 text-base mb-2">Kıble Yönü</Text>
              <Text className="text-white text-5xl font-bold mb-1">{Math.round(qiblaDirection)}°</Text>
              {isMagnetometerAvailable && (
                <Text className="text-[#C9A227] text-sm mb-4">Pusula: {Math.round(compassHeading)}°</Text>
              )}
              
              <View className="bg-white/10 rounded-2xl p-4 w-full">
                <View className="flex-row items-center mb-2">
                  <MapPin size={16} color="#C9A227" />
                  <Text className="text-white ml-2">{locationName}</Text>
                </View>
                <View className="flex-row items-center">
                  <Navigation size={16} color="#C9A227" />
                  <Text className="text-white/70 ml-2 text-sm">
                    Kabe: Mekke, Suudi Arabistan
                  </Text>
                </View>
              </View>
            </View>

            {/* Refresh Button */}
            <TouchableOpacity 
              className="mt-6 flex-row items-center bg-white/10 px-6 py-3 rounded-full"
              onPress={getLocation}
            >
              <RefreshCw size={18} color="#C9A227" />
              <Text className="text-white ml-2 font-medium">Konumu Yenile</Text>
            </TouchableOpacity>

            <Text className="text-white/60 text-center text-sm mt-6 px-4">
              {isMagnetometerAvailable 
                ? 'Telefonunuzu düz tutun, pusula otomatik döner. Altın ok Kabe yönünü gösterir.'
                : 'Pusula sensörü bulunamadı. Kıble yönü statik olarak gösteriliyor.'}
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
