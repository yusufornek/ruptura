"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Radio,
  Wifi,
  Signal,
  Battery,
  Zap,
  Globe,
  Activity,
  Clock,
  Database,
  Shield,
  CheckCircle,
  AlertTriangle,
  Satellite,
  MapPin,
  TrendingUp,
  Network,
  Server,
  Layers,
} from "lucide-react"

// Helium Hotspot Verisi
interface HeliumHotspot {
  hotspotId: string
  hotspotName: string
  location: {
    lat: number
    lng: number
    district: string
    neighborhood: string
    address: string
  }
  status: 'online' | 'offline' | 'syncing'
  signalStrength: number // dBm
  witnessCount: number // kaç hotspot'u "witness" edebiliyor
  coverage: 'excellent' | 'good' | 'poor'
  dataTransferred: number // MB
  packetsProcessed: number
  earnings: number // HNT
  lastActivity: string
  batteryLevel?: number // solar powered olanlar için
  elevation: number // metre
  gain: number // dBi antenna gain
}

// LoRaWAN Network Performansı
interface LoRaWANStats {
  totalHotspots: number
  activeHotspots: number
  averageSignalStrength: number
  totalDataTransferred: number // GB
  packetsPerSecond: number
  averageLatency: number // ms
  networkCoverage: number // %
  successRate: number // %
}

// Blockchain Transaction Verisi
interface HeliumTransaction {
  transactionId: string
  type: 'data_transfer' | 'witness' | 'consensus' | 'rewards'
  timestamp: string
  hotspotId: string
  dataSize: number // bytes
  fee: number // HNT
  blockHeight: number
  confirmed: boolean
}

// İstanbul Helium Hotspot konumları
const istanbulHotspots = [
  { district: "Beyoğlu", neighborhood: "Taksim", lat: 41.0369, lng: 28.9844 },
  { district: "Fatih", neighborhood: "Sultanahmet", lat: 41.0054, lng: 28.9768 },
  { district: "Kadıköy", neighborhood: "Moda", lat: 40.9833, lng: 29.0333 },
  { district: "Beşiktaş", neighborhood: "Ortaköy", lat: 41.0553, lng: 29.0269 },
  { district: "Şişli", neighborhood: "Mecidiyeköy", lat: 41.0667, lng: 28.9833 },
  { district: "Üsküdar", neighborhood: "Salacak", lat: 41.0214, lng: 29.0161 },
  { district: "Bakırköy", neighborhood: "Ataköy", lat: 40.9667, lng: 28.8667 },
  { district: "Zeytinburnu", neighborhood: "Merkezefendi", lat: 41.0058, lng: 28.9019 },
  { district: "Sarıyer", neighborhood: "Maslak", lat: 41.1067, lng: 29.0167 },
  { district: "Ataşehir", neighborhood: "Acıbadem", lat: 40.9667, lng: 29.0167 },
  { district: "Maltepe", neighborhood: "Bağlarbaşı", lat: 40.9333, lng: 29.1167 },
  { district: "Pendik", neighborhood: "Kaynarca", lat: 40.8833, lng: 29.2333 },
]

const HeliumNetworkMonitor = () => {
  const [hotspots, setHotspots] = useState<HeliumHotspot[]>([])
  const [networkStats, setNetworkStats] = useState<LoRaWANStats>({
    totalHotspots: 0,
    activeHotspots: 0,
    averageSignalStrength: -95,
    totalDataTransferred: 0,
    packetsPerSecond: 0,
    averageLatency: 1200,
    networkCoverage: 85,
    successRate: 94.2,
  })
  const [transactions, setTransactions] = useState<HeliumTransaction[]>([])
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null)
  const [isNetworkActive, setIsNetworkActive] = useState(true)

  // Hotspot verisi üretimi
  const generateHotspotData = (): HeliumHotspot[] => {
    const hotspotsData: HeliumHotspot[] = []

    istanbulHotspots.forEach((location, index) => {
      // Her lokasyonda 2-5 hotspot
      const hotspotCount = Math.floor(Math.random() * 4) + 2
      
      for (let i = 0; i < hotspotCount; i++) {
        const hotspotId = `HLM-${location.district.toUpperCase()}-${String(index + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
        
        // Hotspot isimleri (Helium gerçek isimlendirme tarzında)
        const animalNames = ["Majestic", "Proud", "Swift", "Brave", "Clever", "Loyal", "Strong", "Gentle"]
        const objects = ["Pigeon", "Dolphin", "Eagle", "Wolf", "Fox", "Lion", "Bear", "Tiger"]
        const hotspotName = `${animalNames[Math.floor(Math.random() * animalNames.length)]} ${objects[Math.floor(Math.random() * objects.length)]}`
        
        // Konuma küçük rastgelelik ekle
        const lat = location.lat + (Math.random() - 0.5) * 0.02
        const lng = location.lng + (Math.random() - 0.5) * 0.02
        
        // Status dağılımı (%85 online, %10 syncing, %5 offline)
        let status: 'online' | 'offline' | 'syncing' = 'online'
        const statusRandom = Math.random()
        if (statusRandom < 0.05) status = 'offline'
        else if (statusRandom < 0.15) status = 'syncing'
        
        // Signal strength (-70 to -120 dBm)
        const signalStrength = Math.floor(Math.random() * 50) - 120
        
        // Coverage kalitesi signal strength'e göre
        let coverage: 'excellent' | 'good' | 'poor' = 'good'
        if (signalStrength > -85) coverage = 'excellent'
        else if (signalStrength < -105) coverage = 'poor'
        
        // Witness count (1-20 arası, coverage'a göre)
        let witnessCount = Math.floor(Math.random() * 15) + 1
        if (coverage === 'excellent') witnessCount += Math.floor(Math.random() * 5) + 5
        else if (coverage === 'poor') witnessCount = Math.max(1, witnessCount - 5)
        
        const hotspot: HeliumHotspot = {
          hotspotId,
          hotspotName,
          location: {
            lat,
            lng,
            district: location.district,
            neighborhood: location.neighborhood,
            address: `${location.neighborhood} Mah. ${Math.floor(Math.random() * 50) + 1}. Sokak No: ${Math.floor(Math.random() * 100) + 1}`,
          },
          status,
          signalStrength,
          witnessCount,
          coverage,
          dataTransferred: Math.floor(Math.random() * 1000) + 100, // MB
          packetsProcessed: Math.floor(Math.random() * 10000) + 1000,
          earnings: Number((Math.random() * 0.5 + 0.1).toFixed(4)), // HNT
          lastActivity: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString("tr-TR"),
          batteryLevel: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 70 : undefined, // %30'u solar
          elevation: Math.floor(Math.random() * 200) + 10, // 10-210 metre
          gain: [1.2, 3, 5.8, 8][Math.floor(Math.random() * 4)], // dBi
        }
        
        hotspotsData.push(hotspot)
      }
    })
    
    return hotspotsData
  }

  // LoRaWAN istatistikleri hesaplama
  const calculateNetworkStats = (hotspotsData: HeliumHotspot[]): LoRaWANStats => {
    const activeHotspots = hotspotsData.filter(h => h.status === 'online').length
    const totalSignal = hotspotsData.reduce((sum, h) => sum + h.signalStrength, 0)
    const totalData = hotspotsData.reduce((sum, h) => sum + h.dataTransferred, 0)
    const totalPackets = hotspotsData.reduce((sum, h) => sum + h.packetsProcessed, 0)
    
    return {
      totalHotspots: hotspotsData.length,
      activeHotspots,
      averageSignalStrength: Number((totalSignal / hotspotsData.length).toFixed(1)),
      totalDataTransferred: Number((totalData / 1024).toFixed(2)), // GB
      packetsPerSecond: Math.floor(totalPackets / 3600), // Son saat bazında
      averageLatency: Math.floor(Math.random() * 800) + 800, // 800-1600 ms
      networkCoverage: Math.floor((activeHotspots / hotspotsData.length) * 100),
      successRate: Number((95 + Math.random() * 4).toFixed(1)), // %95-99
    }
  }

  // Blockchain transaction simülasyonu
  const generateTransactions = (hotspotsData: HeliumHotspot[]): HeliumTransaction[] => {
    const transactionTypes: Array<'data_transfer' | 'witness' | 'consensus' | 'rewards'> = 
      ['data_transfer', 'witness', 'consensus', 'rewards']
    
    const transactionsData: HeliumTransaction[] = []
    
    // Son 20 transaction
    for (let i = 0; i < 20; i++) {
      const hotspot = hotspotsData[Math.floor(Math.random() * hotspotsData.length)]
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)]
      
      let dataSize = 0
      let fee = 0
      
      switch (type) {
        case 'data_transfer':
          dataSize = Math.floor(Math.random() * 200) + 50 // 50-250 bytes
          fee = 0.00001
          break
        case 'witness':
          dataSize = 32 // witness signature
          fee = 0
          break
        case 'consensus':
          dataSize = Math.floor(Math.random() * 100) + 100
          fee = 0.000001
          break
        case 'rewards':
          dataSize = 64
          fee = 0
          break
      }
      
      const transaction: HeliumTransaction = {
        transactionId: `tx_${Math.random().toString(36).substr(2, 16)}`,
        type,
        timestamp: new Date(Date.now() - Math.random() * 1800000).toLocaleTimeString("tr-TR"),
        hotspotId: hotspot.hotspotId,
        dataSize,
        fee,
        blockHeight: 8500000 + Math.floor(Math.random() * 1000),
        confirmed: Math.random() > 0.1, // %90 confirmed
      }
      
      transactionsData.push(transaction)
    }
    
    return transactionsData.sort((a, b) => b.blockHeight - a.blockHeight)
  }

  // İlk veri yükleme
  useEffect(() => {
    const initialHotspots = generateHotspotData()
    setHotspots(initialHotspots)
    setNetworkStats(calculateNetworkStats(initialHotspots))
    setTransactions(generateTransactions(initialHotspots))
  }, [])

  // 30 saniye güncellemeler
  useEffect(() => {
    if (!isNetworkActive) return

    const interval = setInterval(() => {
      const updatedHotspots = generateHotspotData()
      setHotspots(updatedHotspots)
      setNetworkStats(calculateNetworkStats(updatedHotspots))
      setTransactions(generateTransactions(updatedHotspots))
    }, 30000) // 30 saniye

    return () => clearInterval(interval)
  }, [isNetworkActive])

  const selectedHotspotData = selectedHotspot ? hotspots.find(h => h.hotspotId === selectedHotspot) : null

  const getCoverageColor = (coverage: string) => {
    switch (coverage) {
      case 'excellent': return "#16a34a"
      case 'good': return "#eab308"
      case 'poor': return "#ef4444"
      default: return "#6b7280"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return "#16a34a"
      case 'syncing': return "#eab308"
      case 'offline': return "#ef4444"
      default: return "#6b7280"
    }
  }

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'data_transfer': return "📤"
      case 'witness': return "👁️"
      case 'consensus': return "🤝"
      case 'rewards': return "💰"
      default: return "📊"
    }
  }

  return (
    <div className="space-y-6">
      {/* Network Kontrol Paneli */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 p-6 rounded-lg border shadow-sm">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
            <span className="text-2xl">🌐</span>
            <span>Helium LoRaWAN Ağı</span>
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant={isNetworkActive ? "destructive" : "default"}
              size="sm"
              onClick={() => setIsNetworkActive(!isNetworkActive)}
            >
              {isNetworkActive ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Ağı Durdur
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-1" />
                  Ağı Başlat
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm bg-white/80 px-3 py-1 rounded-full">
            <div className={`w-3 h-3 rounded-full ${isNetworkActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="font-semibold">{isNetworkActive ? 'AĞ AKTİF' : 'AĞ DURDURULDU'}</span>
          </div>
          <Badge variant="outline" className="text-purple-700 border-purple-300">
            Solana Blockchain
          </Badge>
          <Badge variant="outline" className="text-blue-700 border-blue-300">
            İstanbul: {networkStats.totalHotspots} Hotspot
          </Badge>
        </div>
      </div>

      {/* Network İstatistikleri */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="border bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{networkStats.activeHotspots}</div>
            <div className="text-sm text-gray-600">Aktif Hotspot</div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4 text-center">
            <Signal className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{networkStats.averageSignalStrength}</div>
            <div className="text-sm text-gray-600">Ort. Sinyal (dBm)</div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4 text-center">
            <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{networkStats.totalDataTransferred}</div>
            <div className="text-sm text-gray-600">GB Veri</div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{networkStats.packetsPerSecond}</div>
            <div className="text-sm text-gray-600">Paket/Saat</div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{networkStats.averageLatency}</div>
            <div className="text-sm text-gray-600">Gecikme (ms)</div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="p-4 text-center">
            <Globe className="h-8 w-8 text-teal-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-teal-600">{networkStats.networkCoverage}%</div>
            <div className="text-sm text-gray-600">Kapsama</div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-indigo-50 to-white">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-indigo-600">{networkStats.successRate}%</div>
            <div className="text-sm text-gray-600">Başarı Oranı</div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="p-4 text-center">
            <Network className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-600">{networkStats.totalHotspots}</div>
            <div className="text-sm text-gray-600">Toplam Hotspot</div>
          </CardContent>
        </Card>
      </div>

      {/* Hotspot Listesi ve Detaylar */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Radio className="h-5 w-5 text-purple-600" />
              <span>Helium Hotspot Ağı</span>
              <Badge variant="outline">{networkStats.activeHotspots} / {networkStats.totalHotspots}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {hotspots.slice(0, 12).map((hotspot) => (
                <div
                  key={hotspot.hotspotId}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedHotspot === hotspot.hotspotId 
                      ? 'bg-purple-50 border-purple-300' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedHotspot(hotspot.hotspotId)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {hotspot.status === 'online' ? '🟢' : 
                         hotspot.status === 'syncing' ? '🟡' : '🔴'}
                      </span>
                      <span className="font-semibold text-sm">{hotspot.hotspotName}</span>
                      <Badge 
                        variant="outline"
                        style={{ 
                          borderColor: getCoverageColor(hotspot.coverage),
                          color: getCoverageColor(hotspot.coverage)
                        }}
                      >
                        {hotspot.coverage.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">{hotspot.lastActivity}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Konum:</span>
                      <p className="font-medium">{hotspot.location.neighborhood}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Sinyal:</span>
                      <p className="font-medium" style={{ color: getCoverageColor(hotspot.coverage) }}>
                        {hotspot.signalStrength} dBm
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Witness:</span>
                      <p className="font-medium">{hotspot.witnessCount}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Kazanç:</span>
                      <p className="font-medium text-green-600">{hotspot.earnings} HNT</p>
                    </div>
                  </div>
                  
                  {hotspot.batteryLevel && (
                    <div className="mt-2 flex items-center space-x-2">
                      <Battery className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">Solar: {hotspot.batteryLevel}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Seçili Hotspot Detayları */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Satellite className="h-5 w-5 text-blue-600" />
              <span>Hotspot Detayları</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedHotspotData ? (
              <div className="space-y-4">
                {/* Hotspot Genel Bilgiler */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center space-x-2">
                    <span>📡</span>
                    <span>{selectedHotspotData.hotspotName}</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Hotspot ID:</span>
                      <p className="font-medium">{selectedHotspotData.hotspotId}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Durum:</span>
                      <p className="font-medium" style={{ color: getStatusColor(selectedHotspotData.status) }}>
                        {selectedHotspotData.status === 'online' ? '🟢 Çevrimiçi' :
                         selectedHotspotData.status === 'syncing' ? '🟡 Senkronizasyon' : '🔴 Çevrimdışı'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Kapsama Kalitesi:</span>
                      <p className="font-medium" style={{ color: getCoverageColor(selectedHotspotData.coverage) }}>
                        {selectedHotspotData.coverage === 'excellent' ? 'Mükemmel' :
                         selectedHotspotData.coverage === 'good' ? 'İyi' : 'Zayıf'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Son Aktivite:</span>
                      <p className="font-medium">{selectedHotspotData.lastActivity}</p>
                    </div>
                  </div>
                </div>

                {/* Teknik Specifications */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center space-x-2">
                    <span>🔧</span>
                    <span>Teknik Özellikler</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Sinyal Gücü:</span>
                      <p className="font-medium">{selectedHotspotData.signalStrength} dBm</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Anten Kazancı:</span>
                      <p className="font-medium">{selectedHotspotData.gain} dBi</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Yükseklik:</span>
                      <p className="font-medium">{selectedHotspotData.elevation} m</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Witness Sayısı:</span>
                      <p className="font-medium">{selectedHotspotData.witnessCount}</p>
                    </div>
                    {selectedHotspotData.batteryLevel && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Solar Batarya:</span>
                        <p className="font-medium text-green-600">{selectedHotspotData.batteryLevel}%</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Metrikleri */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-orange-800 mb-3 flex items-center space-x-2">
                    <span>📊</span>
                    <span>Performans Metrikleri</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Veri Transferi:</span>
                      <p className="font-medium">{selectedHotspotData.dataTransferred} MB</p>
                    </div>
                    <div>
                      <span className="text-gray-600">İşlenen Paket:</span>
                      <p className="font-medium">{selectedHotspotData.packetsProcessed.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">HNT Kazancı:</span>
                      <p className="font-bold text-green-600">{selectedHotspotData.earnings} HNT</p>
                    </div>
                    <div>
                      <span className="text-gray-600">USD Değeri:</span>
                      <p className="font-medium">${(selectedHotspotData.earnings * 6.5).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Konum Bilgileri */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center space-x-2">
                    <span>📍</span>
                    <span>Konum Bilgileri</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>İlçe:</strong> {selectedHotspotData.location.district}</p>
                    <p><strong>Mahalle:</strong> {selectedHotspotData.location.neighborhood}</p>
                    <p><strong>Adres:</strong> {selectedHotspotData.location.address}</p>
                    <p><strong>Koordinatlar:</strong> {selectedHotspotData.location.lat.toFixed(6)}, {selectedHotspotData.location.lng.toFixed(6)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Radio className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Detay görmek için bir hotspot seçin</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Blockchain Transactions */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-800">
            <Layers className="h-5 w-5" />
            <span>Son Helium Blockchain İşlemleri</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {transactions.slice(0, 10).map((tx, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-white rounded-lg border">
                <div className="text-2xl">
                  {getTransactionTypeIcon(tx.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-sm">{tx.transactionId.substring(0, 16)}...</span>
                    <Badge variant="outline" className={`text-xs ${tx.confirmed ? 'text-green-700 border-green-300' : 'text-yellow-700 border-yellow-300'}`}>
                      {tx.confirmed ? 'Confirmed' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">
                    <strong>Type:</strong> {tx.type.replace('_', ' ').toUpperCase()} | 
                    <strong> Block:</strong> {tx.blockHeight} |
                    <strong> Size:</strong> {tx.dataSize} bytes
                  </p>
                  <p className="text-xs text-gray-500">
                    <strong>Hotspot:</strong> {tx.hotspotId} | 
                    <strong> Fee:</strong> {tx.fee} HNT
                  </p>
                </div>
                <div className="text-xs text-gray-500">{tx.timestamp}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network Health Summary */}
      <Card className="border bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <Shield className="h-5 w-5" />
            <span>Ağ Sağlık Özeti</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Kapsama Analizi</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Mükemmel Kapsama:</span>
                  <span className="font-semibold">{hotspots.filter(h => h.coverage === 'excellent').length} hotspot</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>İyi Kapsama:</span>
                  <span className="font-semibold">{hotspots.filter(h => h.coverage === 'good').length} hotspot</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Zayıf Kapsama:</span>
                  <span className="font-semibold">{hotspots.filter(h => h.coverage === 'poor').length} hotspot</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Durum Dağılımı</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">🟢 Çevrimiçi:</span>
                  <span className="font-semibold">{hotspots.filter(h => h.status === 'online').length} hotspot</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-600">🟡 Senkron:</span>
                  <span className="font-semibold">{hotspots.filter(h => h.status === 'syncing').length} hotspot</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">🔴 Çevrimdışı:</span>
                  <span className="font-semibold">{hotspots.filter(h => h.status === 'offline').length} hotspot</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Ağ Performansı</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ortalama Witness:</span>
                  <span className="font-semibold">{(hotspots.reduce((sum, h) => sum + h.witnessCount, 0) / hotspots.length).toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Toplam HNT Kazancı:</span>
                  <span className="font-semibold text-green-600">{hotspots.reduce((sum, h) => sum + h.earnings, 0).toFixed(4)} HNT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Solar Hotspot:</span>
                  <span className="font-semibold">{hotspots.filter(h => h.batteryLevel !== undefined).length} adet</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default HeliumNetworkMonitor
