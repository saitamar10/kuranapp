import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, Animated, Easing, Platform } from 'react-native';
import { MapPin, Navigation, RefreshCw, Compass } from 'lucide-react-native';
import { turkishCities, calculateQiblaDirection } from '@/data/quranData';
import * as Location from 'expo-location';

export default function QiblaScreen() {
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [locationName, setLocationName] = useState('Konum alınıyor...');
  const [isLoading, setIsLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [compassHeading, setCompassHeading] = useState(0);
  const [isMagnetometerAvailable, setIsMagnetometerAvailable] = useState(false);
  const [sensorStatus, setSensorStatus] = useState('Sensör kontrol ediliyor...');
  const compassAnim = useRef(new Animated.Value(0)).current;
  const qiblaArrowAnim = useRef(new Animated.Value(0)).current;
  const lastAngle = useRef(0);

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

  // Smooth angle transition to avoid jumps at 0/360 boundary
  const smoothAngle = useCallback((newAngle: number, prevAngle: number) => {
    let diff = newAngle - prevAngle;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return prevAngle + diff;
  }, []);

  const updateCompass = useCallback((angle: number) => {
    const smoothedAngle = smoothAngle(angle, lastAngle.current);
    lastAngle.current = smoothedAngle;
    
    setCompassHeading(Math.round(angle));
    
    Animated.timing(compassAnim, {
      toValue: smoothedAngle,
      duration: 100,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
    
    const qiblaArrowAngle = (qiblaDirection - smoothedAngle + 720) % 360;
    Animated.timing(qiblaArrowAnim, {
      toValue: qiblaArrowAngle,
      duration: 100,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [qiblaDirection, smoothAngle, compassAnim, qiblaArrowAnim]);

  // Magnetometer for live compass
  useEffect(() => {
    let subscription: any;
    let Magnetometer: any = null;
    let DeviceMotion: any = null;
    let orientationHandler: ((event: DeviceOrientationEvent) => void) | null = null;

    const startCompass = async () => {
      // For web platform, try DeviceOrientation API
      if (Platform.OS === 'web') {
        setSensorStatus('Web sensörü kontrol ediliyor...');
        
        try {
          if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
            orientationHandler = (event: DeviceOrientationEvent) => {
              // webkitCompassHeading for iOS (absolute compass), alpha for Android
              let angle: number;
              
              if ((event as any).webkitCompassHeading !== undefined) {
                // iOS - webkitCompassHeading is already absolute compass heading
                angle = (event as any).webkitCompassHeading;
              } else if (event.alpha !== null && event.alpha !== undefined) {
                // Android - alpha is relative to initial orientation
                // Check if absolute is available
                if ((event as any).absolute === true) {
                  angle = (360 - event.alpha) % 360;
                } else {
                  angle = (360 - event.alpha) % 360;
                }
              } else {
                return;
              }
              
              updateCompass(angle);
            };

            // For iOS 13+, need to request permission
            if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
              setSensorStatus('iOS izni bekleniyor...');
              try {
                const permission = await (DeviceOrientationEvent as any).requestPermission();
                if (permission === 'granted') {
                  setIsMagnetometerAvailable(true);
                  setSensorStatus('Pusula aktif');
                  window.addEventListener('deviceorientation', orientationHandler, true);
                } else {
                  setIsMagnetometerAvailable(false);
                  setSensorStatus('İzin reddedildi');
                }
              } catch (e) {
                setIsMagnetometerAvailable(false);
                setSensorStatus('İzin hatası');
              }
            } else {
              // For Android and older iOS - add listener and check if it fires
              setIsMagnetometerAvailable(true);
              setSensorStatus('Pusula aktif');
              window.addEventListener('deviceorientation', orientationHandler, true);
              
              // Check if events are actually firing after a short delay
              setTimeout(() => {
                if (compassHeading === 0) {
                  // No events received, might not have compass
                  setSensorStatus('Sensör verisi bekleniyor...');
                }
              }, 2000);
            }
          } else {
            setIsMagnetometerAvailable(false);
            setSensorStatus('DeviceOrientation desteklenmiyor');
          }
        } catch (e) {
          setIsMagnetometerAvailable(false);
          setSensorStatus('Web sensör hatası');
        }
        return;
      }

      // Native platforms - try Magnetometer first, then DeviceMotion
      setSensorStatus('Native sensör kontrol ediliyor...');
      
      try {
        const sensors = await import('expo-sensors');
        Magnetometer = sensors.Magnetometer;
        DeviceMotion = sensors.DeviceMotion;
        
        // Try Magnetometer first
        setSensorStatus('Magnetometer kontrol ediliyor...');
        const isMagAvailable = await Magnetometer.isAvailableAsync();
        
        if (isMagAvailable) {
          setIsMagnetometerAvailable(true);
          setSensorStatus('Magnetometer aktif');
          Magnetometer.setUpdateInterval(100);
          
          subscription = Magnetometer.addListener((data: any) => {
            // Calculate heading from magnetometer data
            let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
            angle = (angle + 360) % 360;
            angle = (360 - angle) % 360;
            
            updateCompass(angle);
          });
        } else {
          // Fallback to DeviceMotion
          setSensorStatus('DeviceMotion kontrol ediliyor...');
          const isMotionAvailable = await DeviceMotion.isAvailableAsync();
          
          if (isMotionAvailable) {
            setIsMagnetometerAvailable(true);
            setSensorStatus('DeviceMotion aktif');
            DeviceMotion.setUpdateInterval(100);
            
            subscription = DeviceMotion.addListener((data: any) => {
              if (data.rotation && data.rotation.alpha !== undefined) {
                // Convert rotation to compass heading
                let angle = (data.rotation.alpha * (180 / Math.PI) + 360) % 360;
                updateCompass(angle);
              }
            });
          } else {
            setIsMagnetometerAvailable(false);
            setSensorStatus('Sensör bulunamadı');
          }
        }
      } catch (error) {
        console.log('Sensor error:', error);
        setIsMagnetometerAvailable(false);
        setSensorStatus('Sensör hatası: ' + (error as Error).message);
      }
    };

    startCompass();

    return () => {
      if (subscription) {
        subscription.remove();
      }
      // Remove web event listener
      if (Platform.OS === 'web' && typeof window !== 'undefined' && orientationHandler) {
        window.removeEventListener('deviceorientation', orientationHandler, true);
      }
    };
  }, [updateCompass]);

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
              
              {/* Compass Status */}
              <View className="flex-row items-center mb-2">
                <Compass size={14} color={isMagnetometerAvailable ? "#4ECDC4" : "#ff6b6b"} />
                <Text className={`ml-2 text-xs ${isMagnetometerAvailable ? 'text-[#4ECDC4]' : 'text-red-400'}`}>
                  {sensorStatus}
                </Text>
              </View>
              
              {isMagnetometerAvailable && (
                <Text className="text-[#C9A227] text-sm mb-4">Pusula: {compassHeading}°</Text>
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
                : Platform.OS === 'web' 
                  ? 'Web tarayıcısında pusula için HTTPS gereklidir. Mobil cihazda açın veya kıble yönünü manuel takip edin.'
                  : 'Cihazınızda pusula sensörü bulunamadı. Kıble yönü statik olarak gösteriliyor.'}
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
