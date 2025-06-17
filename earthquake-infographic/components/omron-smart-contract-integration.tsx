"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  Zap,
  MapPin,
  Building2,
  Clock,
  CheckCircle,
  Radio,
  Activity,
  Bell,
  Shield,
  Hash,
  Cpu,
  Database,
  X,
} from "lucide-react"

// Omron sensör verisi interface
interface OmronSensorData {
  sensorId: string
  buildingId: string
  location: {
    lat: number
    lng: number
    address: string
    district: string
    buildingType: string
  }
  displacement: number
  jmaIntensity: number
  collapseFlag: boolean
  timestamp: string
  batteryLevel: number
  signalStrength: number
}

// Akıllı kontrat tetikleme eventi
interface SmartContractTrigger {
  id: string
  contractAddress: string
  sensorId: string
  triggerReason: string
  damageLevel: number
  urgencyScore: number
  autoResponse: string[]
  transactionHash: string
  gasUsed: number
  blockNumber: number
  timestamp: string
  status: 'triggering' | 'pending' | 'confirmed' | 'failed'
}

// Kritik uyarı bildirimi
interface CriticalAlert {
  id: string
  type: 'earthquake' | 'collapse' | 'severe_damage' | 'emergency_response'
  title: string
  message: string
  sensorId: string
  buildingId: string
  location: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  isActive: boolean
  responseRequired: boolean
}

const OmronSmartContractIntegration = () => {
  const [currentSensorData, setCurrentSensorData] = useState<OmronSensorData | null>(null)
  const [contractTriggers, setContractTriggers] = useState<SmartContractTrigger[]>([])
  const [activeAlerts, setActiveAlerts] = useState<CriticalAlert[]>([])
  const [systemStatus, setSystemStatus] = useState<'monitoring' | 'alert' | 'emergency'>('monitoring')
  const [showTriggerAnimation, setShowTriggerAnimation] = useState(false)
  const [latestTrigger, setLatestTrigger] = useState<SmartContractTrigger | null>(null)

  // İstanbul ilçe koordinatları
  const istanbulDistricts = [
    { name: "Fatih", lat: 41.0186, lng: 28.9647 },
    { name: "Beyoğlu", lat: 41.0369, lng: 28.9744 },
    { name: "Kadıköy", lat: 40.9833, lng: 29.0333 },
    { name: "Beşiktaş", lat: 41.0422, lng: 29.0067 },
    { name: "Şişli", lat: 41.0602, lng: 28.9869 },
    { name: "Üsküdar", lat: 41.0214, lng: 29.0161 },
    { name: "Bakırköy", lat: 40.9833, lng: 28.8667 },
    { name: "Zeytinburnu", lat: 41.0058, lng: 28.9019 },
  ]

  const buildingTypes = ["Konut", "Hastane", "Okul", "Alışveriş Merkezi", "Ticari", "Ofis"]

  // Omron sensör verisi simülasyonu
  const generateOmronSensorData = (): OmronSensorData => {
    const district = istanbulDistricts[Math.floor(Math.random() * istanbulDistricts.length)]
    const buildingType = buildingTypes[Math.floor(Math.random() * buildingTypes.length)]
    const displacement = Math.random() * 120 + 2 // 2-122mm
    const jmaIntensity = Math.floor(Math.random() * 6) + 2 // 2-7
    const collapseFlag = displacement > 80 && jmaIntensity >= 5 && Math.random() > 0.6

    return {
      sensorId: `OMR-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      buildingId: `IST-${district.name.substr(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
      location: {
        lat: district.lat + (Math.random() - 0.5) * 0.02,
        lng: district.lng + (Math.random() - 0.5) * 0.02,
        address: `${district.name} Mahallesi ${Math.floor(Math.random() * 50) + 1}. Sokak No: ${Math.floor(Math.random() * 100) + 1}`,
        district: district.name,
        buildingType,
      },
      displacement: Number(displacement.toFixed(2)),
      jmaIntensity,
      collapseFlag,
      timestamp: new Date().toLocaleTimeString("tr-TR"),
      batteryLevel: Math.floor(Math.random() * 30) + 70, // 70-100%
      signalStrength: Math.floor(Math.random() * 30) + 70, // 70-100%
    }
  }

  // Hasar seviyesi hesaplama
  const calculateDamageLevel = (displacement: number, jmaIntensity: number, collapseFlag: boolean): number => {
    if (collapseFlag) return 5 // Yıkık
    if (jmaIntensity >= 6) return 4 // Ağır Hasarlı
    if (jmaIntensity >= 5 || displacement > 50) return 3 // Orta Hasarlı
    if (jmaIntensity >= 4 || displacement > 20) return 2 // Az Hasarlı
    return 1 // Hasarsız
  }

  // Aciliyet skoru hesaplama
  const calculateUrgencyScore = (damageLevel: number, buildingType: string): number => {
    let baseScore = damageLevel * 20
    const multiplier = buildingType === "Hastane" ? 2.0 : 
                     buildingType === "Okul" ? 1.8 : 
                     buildingType === "Alışveriş Merkezi" ? 1.6 : 1.0
    return Math.min(100, Math.floor(baseScore * multiplier))
  }

  // Akıllı kontrat tetikleme kontrolü
  const shouldTriggerSmartContract = (sensorData: OmronSensorData): boolean => {
    const damageLevel = calculateDamageLevel(sensorData.displacement, sensorData.jmaIntensity, sensorData.collapseFlag)
    // JMA 4+ veya yer değiştirme 20mm+ veya çökme bayrağı aktifse kontrat tetiklenir
    return sensorData.jmaIntensity >= 4 || sensorData.displacement > 20 || sensorData.collapseFlag || damageLevel >= 2
  }

  // Akıllı kontrat tetikleme
  const triggerSmartContract = (sensorData: OmronSensorData): SmartContractTrigger => {
    const damageLevel = calculateDamageLevel(sensorData.displacement, sensorData.jmaIntensity, sensorData.collapseFlag)
    const urgencyScore = calculateUrgencyScore(damageLevel, sensorData.location.buildingType)
    
    const autoResponse = []
    if (damageLevel >= 5) {
      autoResponse.push("AKUT Arama Kurtarma", "İtfaiye", "AFAD Koordinasyon", "Sağlık Ekipleri")
    } else if (damageLevel >= 4) {
      autoResponse.push("AFAD Koordinasyon", "Sağlık Ekipleri")
    } else if (damageLevel >= 3) {
      autoResponse.push("Yapısal İnceleme", "Güvenlik Kontrol")
    } else if (damageLevel >= 2) {
      autoResponse.push("Güvenlik Kontrol")
    }

    const trigger: SmartContractTrigger = {
      id: `trigger-${Math.random().toString(36).substr(2, 12)}`,
      contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      sensorId: sensorData.sensorId,
      triggerReason: sensorData.collapseFlag ? "Yapı Çökmesi Tespiti" :
                     sensorData.jmaIntensity >= 6 ? "Şiddetli Deprem (JMA 6+)" :
                     sensorData.displacement > 50 ? "Kritik Yer Değiştirme" :
                     "Hasar Eşiği Aşıldı",
      damageLevel,
      urgencyScore,
      autoResponse,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      gasUsed: Math.floor(Math.random() * 50000) + 21000,
      blockNumber: 8500000 + Math.floor(Math.random() * 1000),
      timestamp: new Date().toLocaleTimeString("tr-TR"),
      status: 'triggering'
    }

    return trigger
  }

  // Kritik uyarı oluşturma
  const createCriticalAlert = (sensorData: OmronSensorData, trigger: SmartContractTrigger): CriticalAlert => {
    const alertTypes = {
      5: { type: 'collapse' as const, title: '🚨 KRİTİK: YAPI ÇÖKMESI', severity: 'critical' as const },
      4: { type: 'severe_damage' as const, title: '⚠️ AĞIR HASAR TESPİTİ', severity: 'high' as const },
      3: { type: 'earthquake' as const, title: '📈 ORTA HASAR TESPİTİ', severity: 'medium' as const },
      2: { type: 'earthquake' as const, title: '📊 HASAR TESPİTİ', severity: 'low' as const },
    }

    const alertInfo = alertTypes[trigger.damageLevel as keyof typeof alertTypes] || alertTypes[2]

    return {
      id: `alert-${Math.random().toString(36).substr(2, 12)}`,
      type: alertInfo.type,
      title: alertInfo.title,
      message: `${sensorData.location.address} - ${sensorData.location.buildingType} - JMA ${sensorData.jmaIntensity} - ${sensorData.displacement}mm yer değiştirme`,
      sensorId: sensorData.sensorId,
      buildingId: sensorData.buildingId,
      location: `${sensorData.location.district}, ${sensorData.location.address}`,
      severity: alertInfo.severity,
      timestamp: new Date().toLocaleTimeString("tr-TR"),
      isActive: true,
      responseRequired: trigger.damageLevel >= 3
    }
  }

  // Ana sensör veri döngüsü
  useEffect(() => {
    const interval = setInterval(() => {
      const newSensorData = generateOmronSensorData()
      setCurrentSensorData(newSensorData)

      // Akıllı kontrat tetikleme kontrolü
      if (shouldTriggerSmartContract(newSensorData)) {
        const trigger = triggerSmartContract(newSensorData)
        setLatestTrigger(trigger)
        setShowTriggerAnimation(true)

        // Animasyon süresi
        setTimeout(() => {
          // Kontrat durumunu güncelle
          trigger.status = Math.random() > 0.1 ? 'confirmed' : 'failed'
          setContractTriggers(prev => [trigger, ...prev.slice(0, 9)])
          
          // Kritik uyarı oluştur
          const alert = createCriticalAlert(newSensorData, trigger)
          setActiveAlerts(prev => [alert, ...prev.slice(0, 4)])
          
          // Sistem durumunu güncelle
          if (trigger.damageLevel >= 4) {
            setSystemStatus('emergency')
          } else if (trigger.damageLevel >= 2) {
            setSystemStatus('alert')
          }

          setShowTriggerAnimation(false)
        }, 3000)

        // 10 saniye sonra sistem durumunu normale döndür
        setTimeout(() => {
          setSystemStatus('monitoring')
        }, 10000)
      }
    }, 8000) // 8 saniyede bir yeni veri

    return () => clearInterval(interval)
  }, [])

  // Uyarı kapatma
  const dismissAlert = (alertId: string) => {
    setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'emergency': return 'from-red-500 to-red-700'
      case 'alert': return 'from-orange-500 to-orange-700'
      default: return 'from-green-500 to-green-700'
    }
  }

  const getStatusText = () => {
    switch (systemStatus) {
      case 'emergency': return 'ACİL DURUM'
      case 'alert': return 'UYARI'
      default: return 'İZLEME'
    }
  }

  return (
    <div className="space-y-6">
      {/* Sistem Durumu */}
      <div className={`relative bg-gradient-to-r ${getStatusColor()} text-white p-6 rounded-lg shadow-lg overflow-hidden`}>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 animate-pulse"></div>
          {systemStatus !== 'monitoring' && (
            <div className="absolute top-0 left-0 w-full h-full">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white/30 rounded-full animate-ping"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${systemStatus !== 'monitoring' ? 'animate-pulse' : ''}`}>
              {systemStatus === 'emergency' ? (
                <AlertTriangle className="h-10 w-10 animate-bounce" />
              ) : systemStatus === 'alert' ? (
                <Bell className="h-10 w-10 animate-pulse" />
              ) : (
                <Shield className="h-10 w-10" />
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold">RUPTURA SİSTEM DURUMU</h2>
              <p className="text-xl opacity-90">{getStatusText()}</p>
            </div>
          </div>

          {currentSensorData && (
            <div className="text-right">
              <div className="text-lg font-semibold">Son Sensör: {currentSensorData.sensorId}</div>
              <div className="text-sm opacity-80">{currentSensorData.location.district} - {currentSensorData.timestamp}</div>
              <div className="text-sm opacity-80">JMA: {currentSensorData.jmaIntensity} | Yer Değiştirme: {currentSensorData.displacement}mm</div>
            </div>
          )}
        </div>
      </div>

      {/* Akıllı Kontrat Tetikleme Bildirimi - Sağ Üst Köşe */}
      {showTriggerAnimation && latestTrigger && (
        <div className="fixed top-4 right-4 z-50 animate-slideInRight">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-2xl p-4 max-w-sm border-2 border-white/20 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 rounded-full p-2 animate-pulse">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">⚡ AKILLI KONTRAT TETİKLENDİ</h4>
                <p className="text-xs mb-2 opacity-90">Sensör: {latestTrigger.sensorId}</p>
                <p className="text-xs mb-2 opacity-90">Sebep: {latestTrigger.triggerReason}</p>
                <div className="bg-white/10 p-2 rounded text-xs">
                  <div className="font-semibold">Kontrat:</div>
                  <div className="font-mono text-xs truncate">{latestTrigger.contractAddress.substring(0, 20)}...</div>
                </div>
              </div>
              <button
                onClick={() => setShowTriggerAnimation(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aktif Uyarılar */}
      {activeAlerts.length > 0 && (
        <div className="space-y-3">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`relative p-4 rounded-lg border-l-4 shadow-lg animate-slideInRight ${
                alert.severity === 'critical'
                  ? 'bg-red-50 border-red-500'
                  : alert.severity === 'high'
                  ? 'bg-orange-50 border-orange-500'
                  : alert.severity === 'medium'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-blue-50 border-blue-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-bold text-lg">{alert.title}</h4>
                    <Badge variant="outline" className={`${
                      alert.severity === 'critical' ? 'text-red-700 border-red-300' :
                      alert.severity === 'high' ? 'text-orange-700 border-orange-300' :
                      alert.severity === 'medium' ? 'text-yellow-700 border-yellow-300' :
                      'text-blue-700 border-blue-300'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-2">{alert.message}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div><strong>Sensör ID:</strong> {alert.sensorId}</div>
                    <div><strong>Bina ID:</strong> {alert.buildingId}</div>
                    <div><strong>Konum:</strong> {alert.location}</div>
                    <div><strong>Zaman:</strong> {alert.timestamp}</div>
                  </div>
                  {alert.responseRequired && (
                    <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-sm">
                      <strong className="text-red-800">🚨 ACİL MÜDAHALE GEREKLİ</strong>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAlert(alert.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mevcut Sensör Durumu */}
      {currentSensorData && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Radio className="h-5 w-5" />
                <span>Aktif Omron Sensörü</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">{currentSensorData.sensorId}</span>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    AKTİF
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Bina ID:</span>
                    <p className="font-semibold">{currentSensorData.buildingId}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Bina Türü:</span>
                    <p className="font-semibold">{currentSensorData.location.buildingType}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">İlçe:</span>
                    <p className="font-semibold">{currentSensorData.location.district}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Son Güncelleme:</span>
                    <p className="font-semibold">{currentSensorData.timestamp}</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Adres:</div>
                  <div className="font-medium">{currentSensorData.location.address}</div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-orange-50 rounded border">
                    <div className="text-2xl font-bold text-orange-600">{currentSensorData.displacement}</div>
                    <div className="text-xs text-gray-600">Yer Değiştirme (mm)</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded border">
                    <div className="text-2xl font-bold text-red-600">{currentSensorData.jmaIntensity}</div>
                    <div className="text-xs text-gray-600">JMA Şiddeti</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded border">
                    <div className="text-2xl font-bold text-purple-600">
                      {currentSensorData.collapseFlag ? '⚠️' : '✅'}
                    </div>
                    <div className="text-xs text-gray-600">Çökme Bayrağı</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between text-sm">
                    <span>Batarya:</span>
                    <span className="font-semibold">{currentSensorData.batteryLevel}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sinyal:</span>
                    <span className="font-semibold">{currentSensorData.signalStrength}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Son Tetiklenen Kontrat */}
          {latestTrigger && (
            <Card className="border bg-gradient-to-br from-green-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <Zap className="h-5 w-5" />
                  <span>Son Tetiklenen Akıllı Kontrat</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">{latestTrigger.id}</span>
                    <Badge variant="outline" className={
                      latestTrigger.status === 'confirmed' ? 'text-green-700 border-green-300' :
                      latestTrigger.status === 'pending' ? 'text-yellow-700 border-yellow-300' :
                      latestTrigger.status === 'failed' ? 'text-red-700 border-red-300' :
                      'text-blue-700 border-blue-300'
                    }>
                      {latestTrigger.status === 'confirmed' ? 'ONAYLANDI' :
                       latestTrigger.status === 'pending' ? 'BEKLEMEDE' :
                       latestTrigger.status === 'failed' ? 'BAŞARISIZ' : 'TETİKLENİYOR'}
                    </Badge>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Kontrat Adresi:</div>
                    <div className="font-mono text-xs">{latestTrigger.contractAddress}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tetikleme Sebebi:</span>
                      <p className="font-semibold">{latestTrigger.triggerReason}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">İşlem Hash:</span>
                      <p className="font-mono text-xs">{latestTrigger.transactionHash.substring(0, 20)}...</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Blok Numarası:</span>
                      <p className="font-semibold">{latestTrigger.blockNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Gas Kullanımı:</span>
                      <p className="font-semibold">{latestTrigger.gasUsed.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-red-50 rounded border">
                      <div className="text-2xl font-bold text-red-600">{latestTrigger.damageLevel}</div>
                      <div className="text-xs text-gray-600">Hasar Seviyesi</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded border">
                      <div className="text-2xl font-bold text-orange-600">{latestTrigger.urgencyScore}</div>
                      <div className="text-xs text-gray-600">Aciliyet Skoru</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-2">Otomatik Tetiklenen Müdahaleler:</div>
                    <div className="flex flex-wrap gap-2">
                      {latestTrigger.autoResponse.map((response, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {response}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Son Kontrat Tetiklemeleri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-purple-600" />
            <span>Son Akıllı Kontrat Tetiklemeleri</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {contractTriggers.map((trigger) => (
              <div key={trigger.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border">
                <div className="text-2xl">
                  {trigger.status === 'confirmed' ? '✅' : 
                   trigger.status === 'pending' ? '⏳' : 
                   trigger.status === 'failed' ? '❌' : '⚡'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-sm">{trigger.sensorId}</span>
                    <Badge variant="outline" className="text-xs">
                      Hasar: {trigger.damageLevel}/5
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Aciliyet: {trigger.urgencyScore}/100
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{trigger.triggerReason}</p>
                  <p className="text-xs text-gray-500">
                    Blok: {trigger.blockNumber} | Gas: {trigger.gasUsed.toLocaleString()}
                  </p>
                </div>
                <div className="text-xs text-gray-500">{trigger.timestamp}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OmronSmartContractIntegration
