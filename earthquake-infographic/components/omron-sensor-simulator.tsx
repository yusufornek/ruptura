"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Activity,
  Radio,
  Battery,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Waves,
  Zap,
  Signal,
  Clock,
  Home,
  TrendingUp,
  AlertCircle,
} from "lucide-react"

// Omron D7S Sensör Veri Yapısı
interface OmronSensorData {
  sensorId: string
  buildingId: string
  location: {
    lat: number
    lng: number
    district: string
    neighborhood: string
    address: string
  }
  displacement: {
    x: number // mm cinsinden yatay yer değiştirme
    y: number // mm cinsinden yatay yer değiştirme  
    z: number // mm cinsinden dikey yer değiştirme
    total: number // toplam yer değiştirme
  }
  jmaIntensity: number // 1-7 JMA skalası
  structuralDamageLevel: number // 1-5 hasar derecesi
  collapseFlag: boolean
  sensorStatus: 'active' | 'damaged' | 'offline'
  batteryLevel: number // %
  signalStrength: number // dBm
  lastUpdate: string
  alertLevel: 'normal' | 'warning' | 'critical' | 'emergency'
  buildingType: string
  floorCount: number
  constructionYear: number
}

// Helium LoRaWAN Paket Verisi
interface LoRaWANPacket {
  packetId: string
  sensorId: string
  dataSize: number // bytes
  transmissionTime: number // ms
  signalQuality: 'excellent' | 'good' | 'poor'
  hopCount: number
  encryptionStatus: boolean
}

// İstanbul'daki gerçek bölgeler ve mahalleler
const istanbulLocations = [
  {
    district: "Fatih",
    neighborhoods: [
      { name: "Sultanahmet", lat: 41.0054, lng: 28.9768 },
      { name: "Eminönü", lat: 41.0175, lng: 28.97 },
      { name: "Beyazıt", lat: 41.0105, lng: 28.9639 },
      { name: "Aksaray", lat: 41.0019, lng: 28.9553 },
      { name: "Laleli", lat: 41.0089, lng: 28.9594 },
    ],
  },
  {
    district: "Beyoğlu",
    neighborhoods: [
      { name: "Taksim", lat: 41.0369, lng: 28.9844 },
      { name: "Galata", lat: 41.0255, lng: 28.9742 },
      { name: "Karaköy", lat: 41.0255, lng: 28.9742 },
      { name: "Cihangir", lat: 41.0319, lng: 28.9789 },
      { name: "Kasımpaşa", lat: 41.0425, lng: 28.9725 },
    ],
  },
  {
    district: "Kadıköy",
    neighborhoods: [
      { name: "Moda", lat: 40.9833, lng: 29.0333 },
      { name: "Fenerbahçe", lat: 40.9833, lng: 29.05 },
      { name: "Göztepe", lat: 40.9667, lng: 29.0667 },
      { name: "Bostancı", lat: 40.9583, lng: 29.0833 },
      { name: "Acıbadem", lat: 40.9667, lng: 29.0167 },
    ],
  },
  {
    district: "Beşiktaş",
    neighborhoods: [
      { name: "Ortaköy", lat: 41.0553, lng: 29.0269 },
      { name: "Bebek", lat: 41.0833, lng: 29.0333 },
      { name: "Etiler", lat: 41.0833, lng: 29.0167 },
      { name: "Levent", lat: 41.0833, lng: 29.0 },
      { name: "Nişantaşı", lat: 41.05, lng: 28.9833 },
    ],
  },
  {
    district: "Şişli",
    neighborhoods: [
      { name: "Mecidiyeköy", lat: 41.0667, lng: 28.9833 },
      { name: "Gayrettepe", lat: 41.0667, lng: 29.0 },
      { name: "Fulya", lat: 41.0667, lng: 29.0167 },
      { name: "Osmanbey", lat: 41.05, lng: 28.9667 },
      { name: "Harbiye", lat: 41.05, lng: 28.9833 },
    ],
  },
  {
    district: "Üsküdar",
    neighborhoods: [
      { name: "Salacak", lat: 41.0214, lng: 29.0161 },
      { name: "Çengelköy", lat: 41.05, lng: 29.1 },
      { name: "Beylerbeyi", lat: 41.0417, lng: 29.0417 },
      { name: "Kuzguncuk", lat: 41.0333, lng: 29.0333 },
      { name: "Altunizade", lat: 41.0167, lng: 29.0667 },
    ],
  },
]

const buildingTypes = ["Konut", "Ofis", "Alışveriş Merkezi", "Okul", "Hastane", "Fabrika", "Hotel"]

const OmronSensorSimulator = () => {
  const [sensors, setSensors] = useState<OmronSensorData[]>([])
  const [loraPackets, setLoraPackets] = useState<LoRaWANPacket[]>([])
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null)
  const [isSimulationRunning, setIsSimulationRunning] = useState(true)
  const [earthquakeSimulation, setEarthquakeSimulation] = useState(false)

  // Sensör verisi üretimi
  const generateSensorData = (): OmronSensorData[] => {
    const sensorData: OmronSensorData[] = []

    istanbulLocations.forEach((district) => {
      district.neighborhoods.forEach((neighborhood) => {
        // Her mahallede 2-4 sensör
        const sensorCount = Math.floor(Math.random() * 3) + 2
        
        for (let i = 0; i < sensorCount; i++) {
          const sensorId = `OMR-${district.district.toUpperCase()}-${neighborhood.name.toUpperCase()}-${String(i + 1).padStart(2, '0')}`
          const buildingId = `IST-${district.district.toUpperCase()}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`
          
          // Konuma küçük rastgelelik ekle
          const lat = neighborhood.lat + (Math.random() - 0.5) * 0.01
          const lng = neighborhood.lng + (Math.random() - 0.5) * 0.01
          
          // Normal durum için düşük yer değiştirme değerleri
          let baseDisplacement = Math.random() * 5 // 0-5 mm normal
          
          // Deprem simülasyonu aktifse daha yüksek değerler
          if (earthquakeSimulation) {
            baseDisplacement = Math.random() * 100 + 20 // 20-120 mm
          }
          
          const xDisplacement = baseDisplacement * (Math.random() - 0.5) * 2
          const yDisplacement = baseDisplacement * (Math.random() - 0.5) * 2
          const zDisplacement = baseDisplacement * (Math.random() - 0.5)
          const totalDisplacement = Math.sqrt(xDisplacement ** 2 + yDisplacement ** 2 + zDisplacement ** 2)
          
          // JMA şiddeti hesaplama (yer değiştirmeye göre)
          let jmaIntensity = 1
          if (totalDisplacement > 100) jmaIntensity = 7
          else if (totalDisplacement > 80) jmaIntensity = 6
          else if (totalDisplacement > 60) jmaIntensity = 5
          else if (totalDisplacement > 40) jmaIntensity = 4
          else if (totalDisplacement > 20) jmaIntensity = 3
          else if (totalDisplacement > 10) jmaIntensity = 2
          
          // Hasar derecesi hesaplama
          let damageLevel = 1
          const collapseFlag = totalDisplacement > 80 && Math.random() > 0.7
          
          if (collapseFlag) damageLevel = 5
          else if (jmaIntensity >= 6) damageLevel = 4
          else if (jmaIntensity >= 5 || totalDisplacement > 50) damageLevel = 3
          else if (jmaIntensity >= 4 || totalDisplacement > 20) damageLevel = 2
          
          // Uyarı seviyesi
          let alertLevel: 'normal' | 'warning' | 'critical' | 'emergency' = 'normal'
          if (collapseFlag) alertLevel = 'emergency'
          else if (damageLevel >= 4) alertLevel = 'critical'
          else if (damageLevel >= 3) alertLevel = 'warning'
          
          // Sensör durumu
          let sensorStatus: 'active' | 'damaged' | 'offline' = 'active'
          if (totalDisplacement > 90) sensorStatus = Math.random() > 0.5 ? 'damaged' : 'offline'
          else if (totalDisplacement > 60) sensorStatus = Math.random() > 0.8 ? 'damaged' : 'active'
          
          const sensor: OmronSensorData = {
            sensorId,
            buildingId,
            location: {
              lat,
              lng,
              district: district.district,
              neighborhood: neighborhood.name,
              address: `${neighborhood.name} Mah. ${Math.floor(Math.random() * 50) + 1}. Sokak No: ${Math.floor(Math.random() * 100) + 1}`,
            },
            displacement: {
              x: Number(xDisplacement.toFixed(2)),
              y: Number(yDisplacement.toFixed(2)),
              z: Number(zDisplacement.toFixed(2)),
              total: Number(totalDisplacement.toFixed(2)),
            },
            jmaIntensity,
            structuralDamageLevel: damageLevel,
            collapseFlag,
            sensorStatus,
            batteryLevel: Math.floor(Math.random() * 30) + 70, // 70-100%
            signalStrength: Math.floor(Math.random() * 30) - 120, // -120 to -90 dBm
            lastUpdate: new Date().toLocaleTimeString("tr-TR"),
            alertLevel,
            buildingType: buildingTypes[Math.floor(Math.random() * buildingTypes.length)],
            floorCount: Math.floor(Math.random() * 15) + 1,
            constructionYear: Math.floor(Math.random() * 50) + 1970,
          }
          
          sensorData.push(sensor)
        }
      })
    })
    
    return sensorData
  }

  // LoRaWAN paket simülasyonu
  const generateLoRaPackets = (sensorData: OmronSensorData[]): LoRaWANPacket[] => {
    return sensorData.map((sensor) => {
      const packetSize = Math.floor(Math.random() * 100) + 51 // 51-151 bytes (LoRaWAN limit)
      const transmissionTime = Math.floor(Math.random() * 2000) + 500 // 500-2500 ms
      
      let signalQuality: 'excellent' | 'good' | 'poor' = 'good'
      if (sensor.signalStrength > -95) signalQuality = 'excellent'
      else if (sensor.signalStrength < -110) signalQuality = 'poor'
      
      return {
        packetId: `PKT-${sensor.sensorId}-${Date.now()}`,
        sensorId: sensor.sensorId,
        dataSize: packetSize,
        transmissionTime,
        signalQuality,
        hopCount: Math.floor(Math.random() * 3) + 1,
        encryptionStatus: true,
      }
    })
  }

  // İlk veri yükleme
  useEffect(() => {
    const initialSensors = generateSensorData()
    setSensors(initialSensors)
    setLoraPackets(generateLoRaPackets(initialSensors))
  }, [])

  // 30 saniye güncellemeler
  useEffect(() => {
    if (!isSimulationRunning) return

    const interval = setInterval(() => {
      const updatedSensors = generateSensorData()
      setSensors(updatedSensors)
      setLoraPackets(generateLoRaPackets(updatedSensors))
    }, 30000) // 30 saniye

    return () => clearInterval(interval)
  }, [isSimulationRunning, earthquakeSimulation])

  // İstatistikler
  const stats = {
    total: sensors.length,
    active: sensors.filter(s => s.sensorStatus === 'active').length,
    damaged: sensors.filter(s => s.sensorStatus === 'damaged').length,
    offline: sensors.filter(s => s.sensorStatus === 'offline').length,
    emergency: sensors.filter(s => s.alertLevel === 'emergency').length,
    critical: sensors.filter(s => s.alertLevel === 'critical').length,
    warning: sensors.filter(s => s.alertLevel === 'warning').length,
    collapsed: sensors.filter(s => s.collapseFlag).length,
    avgJMA: sensors.length > 0 ? (sensors.reduce((sum, s) => sum + s.jmaIntensity, 0) / sensors.length).toFixed(1) : '0',
    avgDisplacement: sensors.length > 0 ? (sensors.reduce((sum, s) => sum + s.displacement.total, 0) / sensors.length).toFixed(1) : '0',
  }

  const selectedSensorData = selectedSensor ? sensors.find(s => s.sensorId === selectedSensor) : null

  const getDamageColor = (level: number) => {
    switch (level) {
      case 1: return "#16a34a" // yeşil
      case 2: return "#eab308" // sarı
      case 3: return "#f97316" // turuncu
      case 4: return "#ef4444" // kırmızı
      case 5: return "#1f2937" // siyah
      default: return "#6b7280"
    }
  }

  const getAlertColor = (alert: string) => {
    switch (alert) {
      case 'normal': return "#16a34a"
      case 'warning': return "#eab308"
      case 'critical': return "#ef4444"
      case 'emergency': return "#7c2d12"
      default: return "#6b7280"
    }
  }

  return (
    <div className="space-y-6">
      {/* Kontrol Paneli */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-6 rounded-lg border shadow-sm">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
            <span className="text-2xl">🔬</span>
            <span>Omron D7S Sensör Ağı</span>
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant={isSimulationRunning ? "destructive" : "default"}
              size="sm"
              onClick={() => setIsSimulationRunning(!isSimulationRunning)}
            >
              {isSimulationRunning ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Durdur
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-1" />
                  Başlat
                </>
              )}
            </Button>
            <Button
              variant={earthquakeSimulation ? "destructive" : "outline"}
              size="sm"
              onClick={() => setEarthquakeSimulation(!earthquakeSimulation)}
            >
              <Waves className="h-4 w-4 mr-1" />
              {earthquakeSimulation ? "Deprem Sona Erdiriliyor" : "Deprem Simüle Et"}
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm bg-white/80 px-3 py-1 rounded-full">
            <div className={`w-3 h-3 rounded-full ${isSimulationRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="font-semibold">{isSimulationRunning ? 'CANLI' : 'DURDURULDU'}</span>
          </div>
          <Badge variant="outline" className="text-blue-700 border-blue-300">
            30s Güncelleme
          </Badge>
          <Badge variant="outline" className="text-purple-700 border-purple-300">
            İstanbul: {stats.total} Sensör
          </Badge>
        </div>
      </div>

      {/* Ana İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="border bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Aktif Sensör</div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{stats.emergency}</div>
            <div className="text-sm text-gray-600">Acil Durum</div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-4 text-center">
            <Home className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{stats.collapsed}</div>
            <div className="text-sm text-gray-600">Çökme Algılandı</div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{stats.avgJMA}</div>
            <div className="text-sm text-gray-600">Ort. JMA Şiddeti</div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{stats.avgDisplacement}</div>
            <div className="text-sm text-gray-600">Ort. Yer Değ. (mm)</div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="p-4 text-center">
            <Signal className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-600">{loraPackets.length}</div>
            <div className="text-sm text-gray-600">LoRa Paketleri</div>
          </CardContent>
        </Card>
      </div>

      {/* Sensör Listesi */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Radio className="h-5 w-5 text-blue-600" />
              <span>Aktif Sensörler</span>
              <Badge variant="outline">{stats.active} / {stats.total}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {sensors
                .filter(sensor => sensor.alertLevel !== 'normal')
                .slice(0, 10)
                .map((sensor) => (
                  <div
                    key={sensor.sensorId}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedSensor === sensor.sensorId 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedSensor(sensor.sensorId)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {sensor.sensorStatus === 'active' ? '📡' : 
                           sensor.sensorStatus === 'damaged' ? '⚠️' : '❌'}
                        </span>
                        <span className="font-semibold text-sm">{sensor.sensorId}</span>
                        <Badge 
                          variant="outline"
                          style={{ 
                            borderColor: getAlertColor(sensor.alertLevel),
                            color: getAlertColor(sensor.alertLevel)
                          }}
                        >
                          {sensor.alertLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">{sensor.lastUpdate}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Konum:</span>
                        <p className="font-medium">{sensor.location.neighborhood}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Yer Değiştirme:</span>
                        <p className="font-medium" style={{ color: getDamageColor(sensor.structuralDamageLevel) }}>
                          {sensor.displacement.total.toFixed(1)} mm
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">JMA Şiddeti:</span>
                        <p className="font-medium">{sensor.jmaIntensity}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Hasar Seviyesi:</span>
                        <p className="font-medium" style={{ color: getDamageColor(sensor.structuralDamageLevel) }}>
                          {sensor.structuralDamageLevel}/5
                        </p>
                      </div>
                    </div>
                    
                    {sensor.collapseFlag && (
                      <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs">
                        <strong className="text-red-800">⚠️ ÇÖKME ALARMI AKTIF</strong>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Seçili Sensör Detayları */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <span>Sensör Detayları</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSensorData ? (
              <div className="space-y-4">
                {/* Sensör Genel Bilgiler */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center space-x-2">
                    <span>📡</span>
                    <span>{selectedSensorData.sensorId}</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Bina ID:</span>
                      <p className="font-medium">{selectedSensorData.buildingId}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Durum:</span>
                      <p className="font-medium">
                        {selectedSensorData.sensorStatus === 'active' ? '🟢 Aktif' :
                         selectedSensorData.sensorStatus === 'damaged' ? '🟡 Hasarlı' : '🔴 Çevrimdışı'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Batarya:</span>
                      <p className="font-medium">{selectedSensorData.batteryLevel}%</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Sinyal:</span>
                      <p className="font-medium">{selectedSensorData.signalStrength} dBm</p>
                    </div>
                  </div>
                </div>

                {/* Konum Bilgileri */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center space-x-2">
                    <span>📍</span>
                    <span>Konum Bilgileri</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>İlçe:</strong> {selectedSensorData.location.district}</p>
                    <p><strong>Mahalle:</strong> {selectedSensorData.location.neighborhood}</p>
                    <p><strong>Adres:</strong> {selectedSensorData.location.address}</p>
                    <p><strong>Bina Türü:</strong> {selectedSensorData.buildingType}</p>
                    <p><strong>Kat Sayısı:</strong> {selectedSensorData.floorCount}</p>
                    <p><strong>Yapım Yılı:</strong> {selectedSensorData.constructionYear}</p>
                  </div>
                </div>

                {/* Yer Değiştirme Verileri */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-orange-800 mb-3 flex items-center space-x-2">
                    <span>📐</span>
                    <span>Yer Değiştirme Analizi</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">X Ekseni:</span>
                      <p className="font-medium">{selectedSensorData.displacement.x} mm</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Y Ekseni:</span>
                      <p className="font-medium">{selectedSensorData.displacement.y} mm</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Z Ekseni:</span>
                      <p className="font-medium">{selectedSensorData.displacement.z} mm</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Toplam:</span>
                      <p className="font-bold text-lg" style={{ color: getDamageColor(selectedSensorData.structuralDamageLevel) }}>
                        {selectedSensorData.displacement.total} mm
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-600">JMA Şiddeti:</span>
                      <p className="font-bold text-xl">{selectedSensorData.jmaIntensity}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Hasar Seviyesi:</span>
                      <p className="font-bold text-xl" style={{ color: getDamageColor(selectedSensorData.structuralDamageLevel) }}>
                        {selectedSensorData.structuralDamageLevel}/5
                      </p>
                    </div>
                  </div>
                </div>

                {/* Uyarılar */}
                {selectedSensorData.collapseFlag && (
                  <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                      <h4 className="font-bold text-red-800">ÇÖKME ALARMI</h4>
                    </div>
                    <p className="text-red-700 text-sm mt-2">
                      Bu sensörde yapısal çökme belirtileri tespit edildi. Acil müdahale gerekiyor!
                    </p>
                  </div>
                )}

                {/* LoRaWAN Paket Bilgisi */}
                {loraPackets.find(p => p.sensorId === selectedSensorData.sensorId) && (
                  <div className="bg-purple-50 p-4 rounded-lg border">
                    <h4 className="font-semibold text-purple-800 mb-3 flex items-center space-x-2">
                      <span>📶</span>
                      <span>LoRaWAN İletişim</span>
                    </h4>
                    {(() => {
                      const packet = loraPackets.find(p => p.sensorId === selectedSensorData.sensorId)!
                      return (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Paket Boyutu:</span>
                            <p className="font-medium">{packet.dataSize} bytes</p>
                          </div>
                          <div>
                            <span className="text-gray-600">İletim Süresi:</span>
                            <p className="font-medium">{packet.transmissionTime} ms</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Sinyal Kalitesi:</span>
                            <p className="font-medium">
                              {packet.signalQuality === 'excellent' ? '🟢 Mükemmel' :
                               packet.signalQuality === 'good' ? '🟡 İyi' : '🔴 Zayıf'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Şifreleme:</span>
                            <p className="font-medium">{packet.encryptionStatus ? '🔒 Aktif' : '🔓 Pasif'}</p>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Radio className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Detay görmek için bir sensör seçin</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Son Uyarılar */}
      <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            <span>Son Kritik Uyarılar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sensors
              .filter(s => s.alertLevel === 'emergency' || s.alertLevel === 'critical')
              .slice(0, 5)
              .map((sensor, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-white rounded-lg border">
                  <div className="text-2xl">
                    {sensor.alertLevel === 'emergency' ? '🚨' : '⚠️'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold">{sensor.sensorId}</span>
                      <Badge variant="outline" style={{ color: getAlertColor(sensor.alertLevel), borderColor: getAlertColor(sensor.alertLevel) }}>
                        {sensor.alertLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{sensor.location.neighborhood} - {sensor.buildingType}</p>
                    <p className="text-sm">
                      <strong>Yer değiştirme:</strong> {sensor.displacement.total} mm | 
                      <strong> JMA:</strong> {sensor.jmaIntensity} |
                      <strong> Hasar:</strong> {sensor.structuralDamageLevel}/5
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">{sensor.lastUpdate}</div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OmronSensorSimulator
