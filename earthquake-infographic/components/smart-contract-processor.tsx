"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Zap,
  Code,
  Database,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Layers,
  Activity,
  TrendingUp,
  MapPin,
  Building2,
  Radio,
  Globe,
  Hash,
  Cpu,
  Server,
  Brain,
} from "lucide-react"

// Akıllı Kontrat İşlem Verisi
interface SmartContractTransaction {
  transactionId: string
  contractAddress: string
  functionCall: string
  sensorId: string
  buildingId: string
  inputData: {
    displacement: number
    jmaIntensity: number
    collapseFlag: boolean
    timestamp: string
  }
  outputData: {
    damageLevel: number
    urgencyScore: number
    responseRequired: string[]
    cbsNotified: boolean
  }
  gasUsed: number
  gasPrice: number // HNT
  blockNumber: number
  status: 'pending' | 'confirmed' | 'failed'
  executionTime: number // ms
  timestamp: string
}

// CBS Bildirimi
interface CBSNotification {
  notificationId: string
  buildingId: string
  coordinates: [number, number]
  damageLevel: number
  urgencyScore: number
  estimatedCasualties: number
  responseTeams: string[]
  timestamp: string
  status: 'sent' | 'acknowledged' | 'responded'
  responseTime: number // dakika
}

// Akıllı Kontrat İstatistikleri
interface ContractStats {
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  averageGasCost: number
  averageExecutionTime: number
  totalDamageAssessments: number
  cbsNotificationsSent: number
  emergencyResponsesTriggered: number
}

const SmartContractProcessor = () => {
  const [transactions, setTransactions] = useState<SmartContractTransaction[]>([])
  const [cbsNotifications, setCbsNotifications] = useState<CBSNotification[]>([])
  const [contractStats, setContractStats] = useState<ContractStats>({
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    averageGasCost: 0,
    averageExecutionTime: 0,
    totalDamageAssessments: 0,
    cbsNotificationsSent: 0,
    emergencyResponsesTriggered: 0,
  })
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null)
  const [isProcessorActive, setIsProcessorActive] = useState(true)

  // Akıllı kontrat adresleri
  const contractAddresses = [
    "0x1a2b3c4d5e6f7890abcdef1234567890",
    "0x9876543210fedcba0987654321098765",
    "0xabcdef1234567890fedcba9876543210",
  ]

  // Hasar derecesi hesaplama algoritması
  const calculateDamageLevel = (displacement: number, jmaIntensity: number, collapseFlag: boolean): number => {
    if (collapseFlag) return 5 // Yıkık
    if (jmaIntensity >= 6) return 4 // Ağır Hasarlı
    if (jmaIntensity >= 5 || displacement > 50) return 3 // Orta Hasarlı
    if (jmaIntensity >= 4 || displacement > 20) return 2 // Az Hasarlı
    return 1 // Hasarsız
  }

  // Aciliyet skoru hesaplama
  const calculateUrgencyScore = (damageLevel: number, buildingType: string, population: number): number => {
    let baseScore = damageLevel * 20 // 20-100 arası temel skor
    
    // Bina türüne göre çarpan
    const buildingMultiplier: Record<string, number> = {
      "Hastane": 2.0,
      "Okul": 1.8,
      "Alışveriş Merkezi": 1.6,
      "Konut": 1.0,
      "Ofis": 1.2,
      "Fabrika": 0.8,
    }
    
    const multiplier = buildingMultiplier[buildingType] || 1.0
    const populationFactor = Math.min(population / 100, 2.0) // Max 2x çarpan
    
    return Math.min(100, Math.floor(baseScore * multiplier * populationFactor))
  }

  // Gerekli müdahale türlerini belirle
  const determineResponseRequired = (damageLevel: number, urgencyScore: number): string[] => {
    const responses: string[] = []
    
    if (damageLevel >= 5) {
      responses.push("AKUT Arama Kurtarma", "İtfaiye", "AFAD Koordinasyon", "Sağlık Ekipleri", "Emniyet")
    } else if (damageLevel >= 4) {
      responses.push("AKUT Arama Kurtarma", "Sağlık Ekipleri", "AFAD Koordinasyon")
    } else if (damageLevel >= 3) {
      responses.push("Yapısal İnceleme", "Sağlık Kontrol")
    } else if (damageLevel >= 2) {
      responses.push("Güvenlik Kontrol")
    }
    
    if (urgencyScore > 80) {
      responses.push("Helikopter Ambulans")
    }
    
    return responses
  }

  // Omron sensör verisi simülasyonu
  const generateSensorData = () => {
    const buildings = [
      { type: "Hastane", population: 200 },
      { type: "Okul", population: 800 },
      { type: "Konut", population: 150 },
      { type: "Alışveriş Merkezi", population: 500 },
      { type: "Ofis", population: 300 },
      { type: "Fabrika", population: 100 },
    ]
    
    const building = buildings[Math.floor(Math.random() * buildings.length)]
    const displacement = Math.random() * 120 + 5 // 5-125 mm
    const jmaIntensity = Math.floor(Math.random() * 6) + 2 // 2-7
    const collapseFlag = displacement > 80 && Math.random() > 0.7
    
    return {
      displacement,
      jmaIntensity,
      collapseFlag,
      buildingType: building.type,
      population: building.population,
    }
  }

  // Akıllı kontrat işlem simülasyonu
  const generateContractTransaction = (): SmartContractTransaction => {
    const sensorData = generateSensorData()
    const damageLevel = calculateDamageLevel(sensorData.displacement, sensorData.jmaIntensity, sensorData.collapseFlag)
    const urgencyScore = calculateUrgencyScore(damageLevel, sensorData.buildingType, sensorData.population)
    const responseRequired = determineResponseRequired(damageLevel, urgencyScore)
    
    const transactionId = `tx_${Math.random().toString(36).substr(2, 16)}`
    const sensorId = `OMR-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    const buildingId = `IST-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    
    const transaction: SmartContractTransaction = {
      transactionId,
      contractAddress: contractAddresses[Math.floor(Math.random() * contractAddresses.length)],
      functionCall: "processSensorData",
      sensorId,
      buildingId,
      inputData: {
        displacement: Number(sensorData.displacement.toFixed(2)),
        jmaIntensity: sensorData.jmaIntensity,
        collapseFlag: sensorData.collapseFlag,
        timestamp: new Date().toISOString(),
      },
      outputData: {
        damageLevel,
        urgencyScore,
        responseRequired,
        cbsNotified: damageLevel >= 2, // Seviye 2 ve üzeri için CBS bildirimi
      },
      gasUsed: Math.floor(Math.random() * 50000) + 21000, // 21k-71k gas
      gasPrice: Number((Math.random() * 0.001 + 0.0001).toFixed(6)), // HNT
      blockNumber: 8500000 + Math.floor(Math.random() * 1000),
      status: Math.random() > 0.05 ? 'confirmed' : Math.random() > 0.5 ? 'pending' : 'failed',
      executionTime: Math.floor(Math.random() * 1000) + 200, // 200-1200 ms
      timestamp: new Date().toLocaleTimeString("tr-TR"),
    }
    
    return transaction
  }

  // CBS bildirimi oluştur
  const generateCBSNotification = (transaction: SmartContractTransaction): CBSNotification => {
    const districts = ["Fatih", "Beyoğlu", "Kadıköy", "Beşiktaş", "Şişli", "Üsküdar"]
    const district = districts[Math.floor(Math.random() * districts.length)]
    
    // İstanbul koordinatları yakınında rastgele konum
    const lat = 41.0 + (Math.random() - 0.5) * 0.2
    const lng = 29.0 + (Math.random() - 0.5) * 0.3
    
    const notification: CBSNotification = {
      notificationId: `cbs_${Math.random().toString(36).substr(2, 12)}`,
      buildingId: transaction.buildingId,
      coordinates: [lat, lng],
      damageLevel: transaction.outputData.damageLevel,
      urgencyScore: transaction.outputData.urgencyScore,
      estimatedCasualties: Math.floor(Math.random() * 50) + (transaction.outputData.damageLevel * 5),
      responseTeams: transaction.outputData.responseRequired,
      timestamp: new Date().toLocaleTimeString("tr-TR"),
      status: Math.random() > 0.3 ? 'acknowledged' : Math.random() > 0.6 ? 'responded' : 'sent',
      responseTime: Math.floor(Math.random() * 30) + 5, // 5-35 dakika
    }
    
    return notification
  }

  // İstatistikleri güncelle
  const updateStats = (newTransactions: SmartContractTransaction[], newNotifications: CBSNotification[]) => {
    const successful = newTransactions.filter(t => t.status === 'confirmed').length
    const failed = newTransactions.filter(t => t.status === 'failed').length
    const totalGas = newTransactions.reduce((sum, t) => sum + (t.gasUsed * t.gasPrice), 0)
    const totalExecTime = newTransactions.reduce((sum, t) => sum + t.executionTime, 0)
    const emergencyResponses = newTransactions.filter(t => t.outputData.damageLevel >= 4).length
    
    setContractStats({
      totalTransactions: newTransactions.length,
      successfulTransactions: successful,
      failedTransactions: failed,
      averageGasCost: newTransactions.length > 0 ? Number((totalGas / newTransactions.length).toFixed(6)) : 0,
      averageExecutionTime: newTransactions.length > 0 ? Math.floor(totalExecTime / newTransactions.length) : 0,
      totalDamageAssessments: newTransactions.filter(t => t.outputData.damageLevel > 1).length,
      cbsNotificationsSent: newNotifications.length,
      emergencyResponsesTriggered: emergencyResponses,
    })
  }

  // İlk veri yükleme
  useEffect(() => {
    const initialTransactions = Array.from({ length: 15 }, () => generateContractTransaction())
    const initialNotifications = initialTransactions
      .filter(t => t.outputData.cbsNotified && t.status === 'confirmed')
      .map(t => generateCBSNotification(t))
    
    setTransactions(initialTransactions)
    setCbsNotifications(initialNotifications)
    updateStats(initialTransactions, initialNotifications)
  }, [])

  // 30 saniye güncellemeler
  useEffect(() => {
    if (!isProcessorActive) return

    const interval = setInterval(() => {
      // Yeni işlemler ekle
      const newTransaction = generateContractTransaction()
      const updatedTransactions = [newTransaction, ...transactions.slice(0, 19)] // Son 20 işlem
      
      // CBS bildirimi oluştur
      let updatedNotifications = [...cbsNotifications]
      if (newTransaction.outputData.cbsNotified && newTransaction.status === 'confirmed') {
        const newNotification = generateCBSNotification(newTransaction)
        updatedNotifications = [newNotification, ...cbsNotifications.slice(0, 14)] // Son 15 bildirim
      }
      
      setTransactions(updatedTransactions)
      setCbsNotifications(updatedNotifications)
      updateStats(updatedTransactions, updatedNotifications)
    }, 30000) // 30 saniye

    return () => clearInterval(interval)
  }, [isProcessorActive, transactions, cbsNotifications])

  const selectedTransactionData = selectedTransaction ? 
    transactions.find(t => t.transactionId === selectedTransaction) : null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return "#16a34a"
      case 'pending': return "#eab308"
      case 'failed': return "#ef4444"
      default: return "#6b7280"
    }
  }

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

  const getUrgencyColor = (score: number) => {
    if (score >= 80) return "#dc2626" // kritik
    if (score >= 60) return "#ea580c" // yüksek
    if (score >= 40) return "#d97706" // orta
    return "#16a34a" // düşük
  }

  return (
    <div className="space-y-6">
      {/* Akıllı Kontrat Kontrol Paneli */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 p-6 rounded-lg border shadow-sm">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
            <span className="text-2xl">⚡</span>
            <span>RUPTURA Akıllı Kontrat İşleyici</span>
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant={isProcessorActive ? "destructive" : "default"}
              size="sm"
              onClick={() => setIsProcessorActive(!isProcessorActive)}
            >
              {isProcessorActive ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Durdur
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-1" />
                  Başlat
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm bg-white/80 px-3 py-1 rounded-full">
            <div className={`w-3 h-3 rounded-full ${isProcessorActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="font-semibold">{isProcessorActive ? 'İŞLEYİCİ AKTİF' : 'İŞLEYİCİ DURDURULDU'}</span>
          </div>
          <Badge variant="outline" className="text-green-700 border-green-300">
            Solana Blockchain
          </Badge>
          <Badge variant="outline" className="text-blue-700 border-blue-300">
            Gerçek Zamanlı İşlem
          </Badge>
        </div>
      </div>

      {/* Akıllı Kontrat İstatistikleri */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="border bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4 text-center">
            <Code className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{contractStats.totalTransactions}</div>
            <div className="text-sm text-gray-600">Toplam İşlem</div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{contractStats.successfulTransactions}</div>
            <div className="text-sm text-gray-600">Başarılı</div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{contractStats.failedTransactions}</div>
            <div className="text-sm text-gray-600">Başarısız</div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4 text-center">
            <Cpu className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{contractStats.averageExecutionTime}</div>
            <div className="text-sm text-gray-600">Ort. Süre (ms)</div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{contractStats.averageGasCost.toFixed(6)}</div>
            <div className="text-sm text-gray-600">Ort. Gas (HNT)</div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="p-4 text-center">
            <Building2 className="h-8 w-8 text-teal-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-teal-600">{contractStats.totalDamageAssessments}</div>
            <div className="text-sm text-gray-600">Hasar Analizi</div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-indigo-50 to-white">
          <CardContent className="p-4 text-center">
            <Globe className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-indigo-600">{contractStats.cbsNotificationsSent}</div>
            <div className="text-sm text-gray-600">CBS Bildirimi</div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{contractStats.emergencyResponsesTriggered}</div>
            <div className="text-sm text-gray-600">Acil Müdahale</div>
          </CardContent>
        </Card>
      </div>

      {/* İşlemler ve Detaylar */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Layers className="h-5 w-5 text-green-600" />
              <span>Son Akıllı Kontrat İşlemleri</span>
              <Badge variant="outline">{contractStats.successfulTransactions} / {contractStats.totalTransactions}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.transactionId}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTransaction === transaction.transactionId 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedTransaction(transaction.transactionId)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {transaction.status === 'confirmed' ? '✅' : 
                         transaction.status === 'pending' ? '⏳' : '❌'}
                      </span>
                      <span className="font-semibold text-sm">{transaction.transactionId.substring(0, 12)}...</span>
                      <Badge 
                        variant="outline"
                        style={{ 
                          borderColor: getStatusColor(transaction.status),
                          color: getStatusColor(transaction.status)
                        }}
                      >
                        {transaction.status.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">{transaction.timestamp}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Sensör:</span>
                      <p className="font-medium">{transaction.sensorId}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Hasar Seviyesi:</span>
                      <p className="font-medium" style={{ color: getDamageColor(transaction.outputData.damageLevel) }}>
                        {transaction.outputData.damageLevel}/5
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Aciliyet:</span>
                      <p className="font-medium" style={{ color: getUrgencyColor(transaction.outputData.urgencyScore) }}>
                        {transaction.outputData.urgencyScore}/100
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Gas:</span>
                      <p className="font-medium">{(transaction.gasUsed * transaction.gasPrice).toFixed(6)} HNT</p>
                    </div>
                  </div>
                  
                  {transaction.outputData.cbsNotified && (
                    <div className="mt-2 p-2 bg-blue-100 border border-blue-300 rounded text-xs">
                      <strong className="text-blue-800">📡 CBS SİSTEMİNE BİLDİRİLDİ</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Seçili İşlem Detayları */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Hash className="h-5 w-5 text-purple-600" />
              <span>İşlem Detayları</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTransactionData ? (
              <div className="space-y-4">
                {/* İşlem Genel Bilgiler */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center space-x-2">
                    <span>🔗</span>
                    <span>Blockchain İşlemi</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">İşlem ID:</span>
                      <p className="font-medium">{selectedTransactionData.transactionId}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Durum:</span>
                      <p className="font-medium" style={{ color: getStatusColor(selectedTransactionData.status) }}>
                        {selectedTransactionData.status === 'confirmed' ? '✅ Onaylandı' :
                         selectedTransactionData.status === 'pending' ? '⏳ Beklemede' : '❌ Başarısız'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Blok Numarası:</span>
                      <p className="font-medium">{selectedTransactionData.blockNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">İşlem Süresi:</span>
                      <p className="font-medium">{selectedTransactionData.executionTime} ms</p>
                    </div>
                  </div>
                </div>

                {/* Kontrat Bilgileri */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center space-x-2">
                    <span>⚡</span>
                    <span>Akıllı Kontrat</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Kontrat Adresi:</strong> {selectedTransactionData.contractAddress}</p>
                    <p><strong>Fonksiyon:</strong> {selectedTransactionData.functionCall}</p>
                    <p><strong>Gas Kullanımı:</strong> {selectedTransactionData.gasUsed.toLocaleString()}</p>
                    <p><strong>Gas Fiyatı:</strong> {selectedTransactionData.gasPrice} HNT</p>
                    <p><strong>Toplam Maliyet:</strong> {(selectedTransactionData.gasUsed * selectedTransactionData.gasPrice).toFixed(6)} HNT</p>
                  </div>
                </div>

                {/* Giriş Verileri */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-orange-800 mb-3 flex items-center space-x-2">
                    <span>📥</span>
                    <span>Sensör Giriş Verileri</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Sensör ID:</span>
                      <p className="font-medium">{selectedTransactionData.sensorId}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Bina ID:</span>
                      <p className="font-medium">{selectedTransactionData.buildingId}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Yer Değiştirme:</span>
                      <p className="font-medium">{selectedTransactionData.inputData.displacement} mm</p>
                    </div>
                    <div>
                      <span className="text-gray-600">JMA Şiddeti:</span>
                      <p className="font-medium">{selectedTransactionData.inputData.jmaIntensity}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Çökme Bayrağı:</span>
                      <p className="font-medium">
                        {selectedTransactionData.inputData.collapseFlag ? '🚨 ÇÖKME TESPİT EDİLDİ' : '✅ Yapı Stabil'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Çıkış Sonuçları */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center space-x-2">
                    <span>📤</span>
                    <span>Analiz Sonuçları</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Hasar Seviyesi:</span>
                        <p className="font-bold text-lg" style={{ color: getDamageColor(selectedTransactionData.outputData.damageLevel) }}>
                          {selectedTransactionData.outputData.damageLevel}/5
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Aciliyet Skoru:</span>
                        <p className="font-bold text-lg" style={{ color: getUrgencyColor(selectedTransactionData.outputData.urgencyScore) }}>
                          {selectedTransactionData.outputData.urgencyScore}/100
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600 block mb-2">Gerekli Müdahale Türleri:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedTransactionData.outputData.responseRequired.map((response, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {response}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">CBS Bildirimi:</span>
                      <p className="font-medium">
                        {selectedTransactionData.outputData.cbsNotified ? '📡 Gönderildi' : '❌ Gönderilmedi'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Code className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Detay görmek için bir işlem seçin</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CBS Bildirimleri */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <Globe className="h-5 w-5" />
            <span>CBS Sistemi Bildirimleri</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cbsNotifications.slice(0, 10).map((notification, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-white rounded-lg border">
                <div className="text-2xl">
                  {notification.status === 'responded' ? '✅' : 
                   notification.status === 'acknowledged' ? '👁️' : '📤'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-sm">{notification.notificationId}</span>
                    <Badge 
                      variant="outline" 
                      style={{ color: getDamageColor(notification.damageLevel), borderColor: getDamageColor(notification.damageLevel) }}
                    >
                      Seviye {notification.damageLevel}
                    </Badge>
                    <Badge 
                      variant="outline"
                      style={{ color: getUrgencyColor(notification.urgencyScore), borderColor: getUrgencyColor(notification.urgencyScore) }}
                    >
                      Aciliyet: {notification.urgencyScore}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">
                    <strong>Bina:</strong> {notification.buildingId} | 
                    <strong> Koordinat:</strong> {notification.coordinates[0].toFixed(4)}, {notification.coordinates[1].toFixed(4)} |
                    <strong> Tahmini Zayiat:</strong> {notification.estimatedCasualties} kişi
                  </p>
                  <p className="text-xs text-gray-500">
                    <strong>Müdahale Ekipleri:</strong> {notification.responseTeams.join(", ")} | 
                    <strong> Yanıt Süresi:</strong> {notification.responseTime} dk
                  </p>
                </div>
                <div className="text-xs text-gray-500">{notification.timestamp}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Algoritma Açıklaması */}
      <Card className="border bg-gradient-to-r from-gray-50 to-slate-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-800">
            <Brain className="h-5 w-5" />
            <span>RUPTURA Hasar Analiz Algoritması</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">🔢 Hasar Seviyesi Hesaplama</h4>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-red-100 rounded border-l-4 border-red-500">
                  <strong>Seviye 5 (Yıkık):</strong> Çökme bayrağı aktif
                </div>
                <div className="p-2 bg-orange-100 rounded border-l-4 border-orange-500">
                  <strong>Seviye 4 (Ağır Hasarlı):</strong> JMA ≥ 6
                </div>
                <div className="p-2 bg-yellow-100 rounded border-l-4 border-yellow-500">
                  <strong>Seviye 3 (Orta Hasarlı):</strong> JMA ≥ 5 veya Yer değiştirme > 50mm
                </div>
                <div className="p-2 bg-blue-100 rounded border-l-4 border-blue-500">
                  <strong>Seviye 2 (Az Hasarlı):</strong> JMA ≥ 4 veya Yer değiştirme > 20mm
                </div>
                <div className="p-2 bg-green-100 rounded border-l-4 border-green-500">
                  <strong>Seviye 1 (Hasarsız):</strong> Diğer durumlar
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">⚡ Aciliyet Skoru Faktörleri</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Temel Skor:</span>
                  <span className="font-semibold">Hasar Seviyesi × 20</span>
                </div>
                <div className="flex justify-between">
                  <span>Hastane Çarpanı:</span>
                  <span className="font-semibold text-red-600">2.0x</span>
                </div>
                <div className="flex justify-between">
                  <span>Okul Çarpanı:</span>
                  <span className="font-semibold text-orange-600">1.8x</span>
                </div>
                <div className="flex justify-between">
                  <span>AVM Çarpanı:</span>
                  <span className="font-semibold text-yellow-600">1.6x</span>
                </div>
                <div className="flex justify-between">
                  <span>Nüfus Faktörü:</span>
                  <span className="font-semibold">Maks 2.0x</span>
                </div>
                <div className="p-2 bg-blue-50 rounded mt-3">
                  <strong>Final Skor:</strong> Min(100, Temel × Bina × Nüfus)
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SmartContractProcessor
