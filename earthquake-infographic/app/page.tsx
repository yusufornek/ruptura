"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Building2,
  Radio,
  Link,
  Map,
  Thermometer,
  Brain,
  Shield,
  Eye,
  CheckCircle,
  AlertTriangle,
  Zap,
  Activity,
  MapPin,
  Users,
  Clock,
  TrendingUp,
  Star,
  ZoomIn,
  ZoomOut,
  Filter,
  Home,
  Waves,
  Globe,
  Satellite,
  Navigation,
  X,
  Info,
} from "lucide-react"

// Import RUPTURA components
import OmronSensorSimulator from "@/components/omron-sensor-simulator"
import HeliumNetworkMonitor from "@/components/helium-network-monitor"
import SmartContractProcessor from "@/components/smart-contract-processor"
import OmronSmartContractIntegration from "@/components/omron-smart-contract-integration"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { useLanguage } from "@/contexts/LanguageContext"

// Simulated real-time data
const useRealTimeData = () => {
  const [data, setData] = useState({
    activeHotspots: 987432,
    connectedSensors: 15847,
    alertsToday: 23,
    responseTime: 2.3,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({
        activeHotspots: prev.activeHotspots + Math.floor(Math.random() * 10),
        connectedSensors: prev.connectedSensors + Math.floor(Math.random() * 5),
        alertsToday: prev.alertsToday + (Math.random() > 0.9 ? 1 : 0),
        responseTime: Math.max(1.5, prev.responseTime + (Math.random() - 0.5) * 0.2),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return data
}

// Earthquake data simulation
const useEarthquakeData = () => {
  const { t } = useLanguage()
  const [earthquakeData, setEarthquakeData] = useState({
    afad: { magnitude: 5.3, time: "14:23:45", location: t('marmara.sea') },
    kandilli: { magnitude: 5.6, time: "14:23:47", location: t('istanbul.offshore') },
    usgs: { magnitude: 5.4, time: "14:23:46", location: t('northwestern.turkey') },
    emsc: { magnitude: 5.5, time: "14:23:48", location: t('sea.of.marmara') },
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setEarthquakeData({
        afad: {
          magnitude: 4.5 + Math.random() * 2,
          time: new Date().toLocaleTimeString("tr-TR"),
          location: t('marmara.sea'),
        },
        kandilli: {
          magnitude: 4.7 + Math.random() * 2,
          time: new Date().toLocaleTimeString("tr-TR"),
          location: t('istanbul.offshore'),
        },
        usgs: {
          magnitude: 4.6 + Math.random() * 2,
          time: new Date().toLocaleTimeString("tr-TR"),
          location: t('northwestern.turkey'),
        },
        emsc: {
          magnitude: 4.8 + Math.random() * 2,
          time: new Date().toLocaleTimeString("tr-TR"),
          location: t('sea.of.marmara'),
        },
      })
    }, 15000)

    return () => clearInterval(interval)
  }, [t])

  return earthquakeData
}

// Detailed Turkey Damage Map Component
const DetailedTurkeyMap = () => {
  const { t } = useLanguage()
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(6)
  const [damageFilter, setDamageFilter] = useState("all")
  const [damageData, setDamageData] = useState<Record<string, any>>({})
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [showZoomAlert, setShowZoomAlert] = useState(true)

  // Major Turkish cities with real coordinates
  const cities = [
    { id: "istanbul", name: "İstanbul", lat: 41.0082, lng: 28.9784, population: 15519267, risk: "high" },
    { id: "ankara", name: "Ankara", lat: 39.9334, lng: 32.8597, population: 5663322, risk: "medium" },
    { id: "izmir", name: "İzmir", lat: 38.4192, lng: 27.1287, population: 4394694, risk: "high" },
    { id: "bursa", name: "Bursa", lat: 40.1826, lng: 29.0665, population: 3194720, risk: "medium" },
    { id: "antalya", name: "Antalya", lat: 36.8969, lng: 30.7133, population: 2619832, risk: "low" },
    { id: "adana", name: "Adana", lat: 37.0, lng: 35.3213, population: 2274106, risk: "medium" },
    { id: "konya", name: "Konya", lat: 37.8746, lng: 32.4932, population: 2277017, risk: "low" },
    { id: "gaziantep", name: "Gaziantep", lat: 37.0662, lng: 37.3833, population: 2154051, risk: "high" },
    { id: "kayseri", name: "Kayseri", lat: 38.7312, lng: 35.4787, population: 1421362, risk: "medium" },
    { id: "trabzon", name: "Trabzon", lat: 41.0015, lng: 39.7178, population: 811901, risk: "low" },
  ]

  // Istanbul districts for detailed view
  const istanbulDistricts = [
    { name: "Fatih", lat: 41.0186, lng: 28.9647, buildings: 1250 },
    { name: "Beyoğlu", lat: 41.0369, lng: 28.9744, buildings: 980 },
    { name: "Beşiktaş", lat: 41.0422, lng: 29.0067, buildings: 750 },
    { name: "Kadıköy", lat: 40.9833, lng: 29.0333, buildings: 1100 },
    { name: "Üsküdar", lat: 41.0214, lng: 29.0161, buildings: 890 },
    { name: "Şişli", lat: 41.0602, lng: 28.9869, buildings: 1350 },
    { name: "Bakırköy", lat: 40.9833, lng: 28.8667, buildings: 920 },
    { name: "Zeytinburnu", lat: 41.0058, lng: 28.9019, buildings: 680 },
    { name: "Eminönü", lat: 41.0175, lng: 28.97, buildings: 450 },
    { name: "Beylikdüzü", lat: 41.0025, lng: 28.6558, buildings: 1580 },
  ]

  const damageTypes = [
    { type: "collapsed", color: "#dc2626", name: "Yıkık", severity: 5 },
    { type: "severe", color: "#ea580c", name: "Ağır Hasarlı", severity: 4 },
    { type: "moderate", color: "#d97706", name: "Orta Hasarlı", severity: 3 },
    { type: "light", color: "#eab308", name: "Az Hasarlı", severity: 2 },
    { type: "intact", color: "#16a34a", name: "Hasarsız", severity: 1 },
  ]

  // Generate detailed damage data including street-level
  useEffect(() => {
    const generateDamageData = () => {
      const newDamageData: Record<string, any> = {}

      cities.forEach((city) => {
        const riskMultiplier = city.risk === "high" ? 2.0 : city.risk === "medium" ? 1.2 : 0.6
        const totalDamage = Math.floor(Math.random() * 1000 * riskMultiplier)

        // Generate street-level incidents for Istanbul
        const streetIncidents: any[] = []
        if (city.id === "istanbul") {
          istanbulDistricts.forEach((district) => {
            const districtIncidents = Math.floor(Math.random() * 15) + 5
            for (let i = 0; i < districtIncidents; i++) {
              streetIncidents.push({
                id: `${district.name}-${i}`,
                district: district.name,
                street: `${district.name} ${Math.floor(Math.random() * 50) + 1}. Sokak`,
                buildingNo: Math.floor(Math.random() * 100) + 1,
                time: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString("tr-TR"),
                damage: damageTypes[Math.floor(Math.random() * damageTypes.length)],
                buildingType: ["Konut", "Ticari", "Okul", "Hastane", "Alışveriş Merkezi"][
                  Math.floor(Math.random() * 5)
                ],
                coordinates: {
                  lat: district.lat + (Math.random() - 0.5) * 0.02,
                  lng: district.lng + (Math.random() - 0.5) * 0.02,
                },
                floors: Math.floor(Math.random() * 15) + 1,
                residents: Math.floor(Math.random() * 50) + 5,
              })
            }
          })
        }

        newDamageData[city.id] = {
          totalBuildings: Math.floor(Math.random() * 50000) + 10000,
          totalDamage,
          damages: {
            collapsed: Math.floor(totalDamage * 0.1),
            severe: Math.floor(totalDamage * 0.2),
            moderate: Math.floor(totalDamage * 0.3),
            light: Math.floor(totalDamage * 0.4),
          },
          recentIncidents: Array.from({ length: 8 }, (_, i) => ({
            id: i,
            time: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString("tr-TR"),
            address: `${city.name} ${Math.floor(Math.random() * 100)} Sokak No:${Math.floor(Math.random() * 50)}`,
            damage: damageTypes[Math.floor(Math.random() * damageTypes.length)],
            coordinates: {
              lat: city.lat + (Math.random() - 0.5) * 0.05,
              lng: city.lng + (Math.random() - 0.5) * 0.05,
            },
          })),
          streetIncidents: streetIncidents,
        }
      })

      setDamageData(newDamageData)
    }

    generateDamageData()
    const interval = setInterval(generateDamageData, 8000)
    return () => clearInterval(interval)
  }, [])

  // Load Leaflet
  useEffect(() => {
    if (typeof window !== "undefined" && !leafletLoaded) {
      const loadLeaflet = async () => {
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          document.head.appendChild(link)
        }

        if (!(window as any).L) {
          const script = document.createElement("script")
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          script.onload = () => {
            setLeafletLoaded(true)
          }
          document.head.appendChild(script)
        } else {
          setLeafletLoaded(true)
        }
      }

      loadLeaflet()
    }
  }, [leafletLoaded])

  // Initialize map when Leaflet is loaded
  useEffect(() => {
    if (leafletLoaded && (window as any).L && !mapInstance) {
      const L = (window as any).L

      const mapContainer = document.getElementById("turkey-map")
      if (mapContainer) {
        mapContainer.innerHTML = ""
      }

      const map = L.map("turkey-map").setView([39.9042, 32.8597], 6)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map)

      setMapInstance(map)

      map.on("zoomend", () => {
        setZoomLevel(map.getZoom())
      })
    }
  }, [leafletLoaded, mapInstance])

  // Add markers when map and damage data are ready
  useEffect(() => {
    if (mapInstance && Object.keys(damageData).length > 0 && (window as any).L) {
      const L = (window as any).L

      // Clear existing markers
      mapInstance.eachLayer((layer: any) => {
        if (layer instanceof L.CircleMarker || layer instanceof L.Marker) {
          mapInstance.removeLayer(layer)
        }
      })

      // Add city markers
      cities.forEach((city) => {
        const cityData = damageData[city.id]
        if (!cityData) return

        const totalDamaged = cityData.totalDamage || 0
        const damagePercentage = (totalDamaged / cityData.totalBuildings) * 100

        let markerColor = "#16a34a"
        if (damagePercentage > 15) markerColor = "#dc2626"
        else if (damagePercentage > 8) markerColor = "#ea580c"
        else if (damagePercentage > 3) markerColor = "#d97706"

        const marker = L.circleMarker([city.lat, city.lng], {
          radius: Math.max(8, Math.min(25, totalDamaged / 50)),
          fillColor: markerColor,
          color: "#fff",
          weight: 3,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(mapInstance)

        const popupContent = `
          <div style="min-width: 250px; font-family: system-ui;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${city.name}</h3>
            <p style="margin: 0 0 12px 0; color: #666; font-size: 12px;">${t('population')}: ${city.population.toLocaleString()}</p>
            
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 12px;">${t('total.buildings')}:</span>
                <span style="font-weight: 600;">${cityData.totalBuildings.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 12px;">${t('damaged.buildings')}:</span>
                <span style="font-weight: 600; color: #dc2626;">${totalDamaged.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 12px;">${t('damage.rate')}:</span>
                <span style="font-weight: 600; color: ${markerColor};">${damagePercentage.toFixed(1)}%</span>
              </div>
            </div>

            <div style="margin-bottom: 12px;">
              ${Object.entries(cityData.damages)
                .map(([type, count]: [string, any]) => {
                  const damageType = damageTypes.find((d) => d.type === type)
                  // Assuming damageType.name is already a key like 'collapsed.buildings', 'severely.damaged' etc.
                  // If not, a mapping would be needed here. For now, let's assume they are keys.
                  const translatedDamageName = damageType ? t(damageType.name.toLowerCase().replace(/ /g, '.')) : type;
                  return `
                  <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                    <span style="color: ${damageType?.color}">${translatedDamageName}:</span>
                    <span>${count}</span>
                  </div>
                `
                })
                .join("")}
            </div>

            <button onclick="window.showCityDetails && window.showCityDetails('${city.id}')" 
                    style="width: 100%; background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer;">
              ${t('show.details')}
            </button>
          </div>
        `

        marker.bindPopup(popupContent)

        // Add street-level incidents for higher zoom levels
        if (zoomLevel > 10 && city.id === "istanbul" && cityData.streetIncidents) {
          cityData.streetIncidents.forEach((incident: any) => {
            const incidentMarker = L.circleMarker([incident.coordinates.lat, incident.coordinates.lng], {
              radius: 3,
              fillColor: incident.damage.color,
              color: "#fff",
              weight: 1,
              opacity: 1,
              fillOpacity: 0.9,
            }).addTo(mapInstance)

            incidentMarker.bindPopup(`
              <div style="min-width: 220px; font-family: system-ui;">
                <div style="margin-bottom: 8px;">
                  <span style="font-size: 16px; margin-right: 8px;">🏢</span>
                  <span style="font-weight: 600;">${incident.buildingType}</span>
                </div>
                <p style="margin: 4px 0; font-size: 12px; color: #666;">
                  <strong>Adres:</strong> ${incident.street} No: ${incident.buildingNo}
                </p>
                <p style="margin: 4px 0; font-size: 12px; color: #666;">
                  <strong>İlçe:</strong> ${incident.district}
                </p>
                <p style="margin: 4px 0; font-size: 12px;">
                  <strong>Durum:</strong> <span style="color: ${incident.damage.color}; font-weight: 600;">${incident.damage.name}</span>
                </p>
                <p style="margin: 4px 0; font-size: 11px; color: #888;">
                  <strong>Kat Sayısı:</strong> ${incident.floors} | <strong>Sakin:</strong> ${incident.residents}
                </p>
                <p style="margin: 4px 0; font-size: 11px; color: #888;">
                  <strong>${t('time')}:</strong> ${incident.time}
                </p>
              </div>
            `)
          })
        } else if (zoomLevel > 10) {
          // Regular incidents for other cities
          cityData.recentIncidents.forEach((incident: any) => {
            const incidentMarker = L.circleMarker([incident.coordinates.lat, incident.coordinates.lng], {
              radius: 4,
              fillColor: incident.damage.color,
              color: "#fff",
              weight: 1,
              opacity: 1,
              fillOpacity: 0.9,
            }).addTo(mapInstance)

            incidentMarker.bindPopup(`
              <div style="min-width: 200px; font-family: system-ui;">
                <div style="margin-bottom: 8px;">
                  <span style="font-size: 16px; margin-right: 8px;">🏢</span>
                  <span style="font-weight: 600;">${t('building.damage')}</span>
                </div>
                <p style="margin: 4px 0; font-size: 12px; color: #666;">${incident.address}</p>
                <p style="margin: 4px 0; font-size: 12px;">
                  Durum: <span style="color: ${incident.damage.color}; font-weight: 600;">${incident.damage.name}</span>
                </p>
                <p style="margin: 4px 0; font-size: 11px; color: #888;">Saat: ${incident.time}</p>
              </div>
            `)
          })
        }
      })
      ;(window as any).showCityDetails = (cityId: string) => {
        setSelectedCity(cityId)
      }
    }
  }, [mapInstance, damageData, zoomLevel])

  const getCityStats = () => {
    if (!selectedCity || !damageData[selectedCity]) return null
    const cityData = damageData[selectedCity]
    const city = cities.find((c) => c.id === selectedCity)
    return { cityData, city }
  }

  const stats = getCityStats()

  const zoomToIstanbul = () => {
    if (mapInstance) {
      mapInstance.setView([41.0082, 28.9784], 13)
      setShowZoomAlert(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-gradient-to-r from-white via-blue-50 to-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-gray-900">{t('map.controls')}</h3>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => mapInstance && mapInstance.zoomIn()}>
              <ZoomIn className="h-4 w-4 mr-1" />
              {t('zoom.in')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => mapInstance && mapInstance.zoomOut()}>
              <ZoomOut className="h-4 w-4 mr-1" />
              {t('zoom.out')}
            </Button>
            <Button variant="default" size="sm" onClick={zoomToIstanbul} className="bg-blue-600 hover:bg-blue-700">
              <MapPin className="h-4 w-4 mr-1" />
              {t('istanbul.detail')}
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <select
              value={damageFilter}
              onChange={(e) => setDamageFilter(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="all">{t('all.damages')}</option>
              <option value="collapsed">{t('collapsed.buildings')}</option>
              <option value="severe">{t('severely.damaged')}</option>
              <option value="infrastructure">{t('infrastructure.damages')}</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span>{t('live.data')}</span>
          </div>
        </div>
      </div>

      {/* Main Map */}
      <div className="relative">
        <div id="turkey-map" className="w-full h-96 rounded-lg border shadow-lg bg-blue-50">
          {!leafletLoaded && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{t('loading.map')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Zoom Alert Popup */}
        {showZoomAlert && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl shadow-2xl border-2 border-white/20 backdrop-blur-sm max-w-md animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Info className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-2">{t('zoom.istanbul.detail.title')}</h4>
                  <p className="text-sm mb-4 leading-relaxed">
                    {t('zoom.istanbul.detail.desc')}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      onClick={zoomToIstanbul}
                      size="sm"
                      className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      {t('go.to.istanbul')}
                    </Button>
                    <Button
                      onClick={() => setShowZoomAlert(false)}
                      size="sm"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border max-w-xs">
          <h4 className="font-semibold text-sm mb-3 text-gray-800">{t('map.legend')}</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-4 h-4 rounded-full bg-red-600"></div>
              <span className="text-gray-700">{t('high.damage.legend')}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-4 h-4 rounded-full bg-orange-600"></div>
              <span className="text-gray-700">{t('medium.damage.legend')}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-4 h-4 rounded-full bg-yellow-600"></div>
              <span className="text-gray-700">{t('low.damage.legend')}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-4 h-4 rounded-full bg-green-600"></div>
              <span className="text-gray-700">{t('minimal.damage.legend')}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t">
            <h5 className="font-semibold text-xs mb-2 text-gray-800">💡 {t('tip')}</h5>
            <div className="text-xs text-gray-600">
              <p>
                • <strong>{t('zoom.to.istanbul')}</strong>
              </p>
              <p>• {t('street.level.details.tip')}</p>
              <p>• {t('info.for.each.building')}</p>
            </div>
          </div>
        </div>

        {/* Live Data Indicator */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">{t('live.data.indicator')}</span>
          </div>
        </div>

        {/* Zoom Level Indicator */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border">
          <div className="text-sm text-gray-700">
            {t('zoom.level')}: <span className="font-semibold">{zoomLevel}</span>
            {zoomLevel > 10 && <span className="text-green-600 ml-2">• {t('street.detail.indicator')}</span>}
            {zoomLevel > 13 && <span className="text-blue-600 ml-2">• {t('building.detail.indicator')}</span>}
          </div>
        </div>
      </div>

      {/* Zoom Instruction Card */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <ZoomIn className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">🎯 {t('detailed.map.experience.title')}</h3>
              <p className="text-gray-700 mb-3">
                <strong>{t('detailed.map.experience.istanbul.zoom')}</strong> {t('detailed.map.experience.discover')}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  {t('detailed.map.experience.building.details')}
                </Badge>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {t('detailed.map.experience.district.coverage')}
                </Badge>
                <Badge variant="outline" className="text-purple-700 border-purple-300">
                  {t('detailed.map.experience.real.addresses')}
                </Badge>
              </div>
            </div>
            <Button onClick={zoomToIstanbul} className="bg-blue-600 hover:bg-blue-700">
              <MapPin className="h-4 w-4 mr-2" />
              {t('detailed.map.experience.explore.now')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rest of the component remains the same... */}
      {stats && (
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span>{stats.city?.name} Detaylı Hasar Raporu</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>Bina İstatistikleri</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Toplam Bina:</span>
                    <span className="font-semibold">{stats.cityData.totalBuildings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hasarlı Bina:</span>
                    <span className="font-semibold text-red-600">{stats.cityData.totalDamage.toLocaleString()}</span>
                  </div>
                  {Object.entries(stats.cityData.damages).map(([type, count]: [string, any]) => {
                    const damageType = damageTypes.find((d) => d.type === type)
                    return (
                      <div key={type} className="flex justify-between">
                        <span className="text-sm" style={{ color: damageType?.color }}>
                          {damageType?.name}:
                        </span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Son Olaylar</span>
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(stats.cityData.streetIncidents || stats.cityData.recentIncidents)
                    .slice(0, 6)
                    .map((incident: any) => (
                      <div key={incident.id} className="p-2 bg-gray-50 rounded border text-xs">
                        <div className="flex items-center space-x-2 mb-1">
                          <span>🏢</span>
                          <span className="font-medium">{incident.buildingType || "Bina Hasarı"}</span>
                          <span className="text-gray-500">{incident.time}</span>
                        </div>
                        <p className="text-gray-600 mb-1">
                          {incident.street
                            ? `${incident.street} No: ${incident.buildingNo}, ${incident.district}`
                            : incident.address}
                        </p>
                        <span
                          className="px-2 py-1 rounded text-xs text-white"
                          style={{ backgroundColor: incident.damage.color }}
                        >
                          {incident.damage.name}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Hasar Dağılımı</h4>
                <div className="space-y-3">
                  {Object.entries(stats.cityData.damages).map(([type, count]: [string, any]) => {
                    const damageType = damageTypes.find((d) => d.type === type)
                    const percentage = (count / stats.cityData.totalDamage) * 100
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span style={{ color: damageType?.color }}>{damageType?.name}</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: damageType?.color,
                            }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Statistics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-6 text-center">
            <Home className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2 text-gray-900">Toplam Yıkık Bina</h3>
            <div className="text-3xl font-bold text-red-600">
              {Object.values(damageData)
                .reduce((total: number, city: any) => total + (city.damages?.collapsed || 0), 0)
                .toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Türkiye Geneli</p>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-6 text-center">
            <Building2 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2 text-gray-900">Ağır Hasarlı</h3>
            <div className="text-3xl font-bold text-orange-600">
              {Object.values(damageData)
                .reduce((total: number, city: any) => total + (city.damages?.severe || 0), 0)
                .toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Acil Müdahale Gerekli</p>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6 text-center">
            <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2 text-gray-900">Etkilenen Şehir</h3>
            <div className="text-3xl font-bold text-blue-600">{Object.keys(damageData).length}</div>
            <p className="text-sm text-gray-600">Aktif İzleme</p>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6 text-center">
            <Activity className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2 text-gray-900">Aktif Sensör</h3>
            <div className="text-3xl font-bold text-green-600">
              {cities.reduce((total, city) => total + Math.floor(Math.random() * 1000) + 500, 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Veri Toplama</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Emergency Teams Map Component - Future Feature
const EmergencyTeamsMap = () => {
  const { t } = useLanguage()
  const [isBlurred, setIsBlurred] = useState(true) // Always blurred
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  // Map is always blurred - no animation effect needed

  // Load Leaflet for emergency map
  useEffect(() => {
    if (typeof window !== "undefined" && !leafletLoaded) {
      const loadLeaflet = async () => {
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          document.head.appendChild(link)
        }

        if (!(window as any).L) {
          const script = document.createElement("script")
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          script.onload = () => {
            setLeafletLoaded(true)
          }
          document.head.appendChild(script)
        } else {
          setLeafletLoaded(true)
        }
      }
      loadLeaflet()
    }
  }, [leafletLoaded])

  // Initialize emergency teams map - focused on Istanbul
  useEffect(() => {
    if (leafletLoaded && (window as any).L && !mapInstance) {
      const L = (window as any).L

      const mapContainer = document.getElementById("emergency-teams-map")
      if (mapContainer) {
        mapContainer.innerHTML = ""
      }

      // Center on Istanbul with appropriate zoom
      const map = L.map("emergency-teams-map").setView([41.0082, 28.9784], 11)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map)

      // Add some mock emergency team markers
      const mockTeams = [
        { lat: 41.0082, lng: 28.9784, type: "fire", name: "İtfaiye 1" },
        { lat: 41.0186, lng: 28.9647, type: "police", name: "Emniyet 1" },
        { lat: 41.0369, lng: 28.9744, type: "medical", name: "Ambulans 1" },
        { lat: 40.9833, lng: 29.0333, type: "akut", name: "AKUT 1" },
        { lat: 41.0214, lng: 29.0161, type: "afad", name: "AFAD 1" },
      ]

      const colors = {
        fire: "#dc2626",
        police: "#1e40af", 
        medical: "#7c3aed",
        akut: "#16a34a",
        afad: "#ea580c"
      }

      mockTeams.forEach(team => {
        L.circleMarker([team.lat, team.lng], {
          radius: 8,
          fillColor: colors[team.type as keyof typeof colors],
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(map).bindPopup(`<b>${team.name}</b><br/>${t('under.research')}`)
      })

      setMapInstance(map)
    }
  }, [leafletLoaded, mapInstance])

  return (
    <div className="space-y-6">
      {/* Emergency Teams Section Title */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-gradient-to-r from-red-50 via-orange-50 to-red-50 p-6 rounded-lg border shadow-sm">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
            <span className="text-2xl">🚨</span>
            <span>{t('emergency.teams.live.tracking.title')}</span>
          </h3>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm bg-white/80 px-3 py-1 rounded-full">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="font-semibold">{t('under.research.status')}</span>
          </div>
        </div>
      </div>

      {/* Emergency Teams Map with Blur Overlay */}
      <div className="relative">
        <div 
          className={`w-full transition-all duration-500 ${
            isBlurred ? 'blur-lg' : 'blur-none'
          }`}
        >
          <div id="emergency-teams-map" className="w-full h-[500px] rounded-lg border shadow-lg bg-red-50">
            {!leafletLoaded && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">{t('loading.emergency.map')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overlay Message */}
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
            isBlurred ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-12 border-2 border-orange-200 shadow-2xl max-w-2xl mx-4 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4 animate-bounce">🔬</div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                {t('feature.under.research.title')}
              </h3>
            </div>
            
            <div className="space-y-4 text-gray-700">
              <p className="text-lg font-semibold text-orange-600">
                🚨 {t('emergency.teams.live.tracking.system')}
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <span className="font-semibold">📍 {t('real.time.location')}</span>
                  <p className="text-xs mt-1">{t('real.time.location.desc')}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <span className="font-semibold">🚔 {t('team.coordination')}</span>
                  <p className="text-xs mt-1">{t('team.coordination.desc')}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <span className="font-semibold">📊 {t('mission.management')}</span>
                  <p className="text-xs mt-1">{t('mission.management.desc')}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <span className="font-semibold">⚡ {t('ruptura.integration')}</span>
                  <p className="text-xs mt-1">{t('ruptura.integration.desc')}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg border border-orange-200">
                <p className="text-sm font-medium text-orange-800">
                  {t('feature.under.research.desc')}
                </p>
              </div>

              <div className="flex items-center justify-center space-x-4 mt-6 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span>{t('under.research')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>{t('technology.review')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>{t('implementation.planning')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Future Feature Info Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-6 text-center">
            <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚔</span>
            </div>
            <h3 className="font-semibold mb-2 text-gray-900">{t('police.coordination')}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('police.coordination.desc')}
            </p>
            <Badge variant="outline" className="text-orange-700 border-orange-300">
              {t('under.research')}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-6 text-center">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚒</span>
            </div>
            <h3 className="font-semibold mb-2 text-gray-900">{t('firedept.afad')}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('firedept.afad.desc')}
            </p>
            <Badge variant="outline" className="text-red-700 border-red-300">
              {t('under.research')}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6 text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚑</span>
            </div>
            <h3 className="font-semibold mb-2 text-gray-900">{t('health.akut')}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('health.akut.desc')}
            </p>
            <Badge variant="outline" className="text-green-700 border-green-300">
              {t('under.research')}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Animated Counter Component
const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return (
    <span>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  )
}

export default function RupturaInfographic() {
  const realTimeData = useRealTimeData()
  const earthquakeData = useEarthquakeData()
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const { t } = useLanguage()

  // Show welcome modal on every page load
  useEffect(() => {
    setShowWelcomeModal(true)
  }, [])

  const handleModalClose = () => {
    setShowWelcomeModal(false)
    // Not saving to localStorage anymore - modal will appear on every refresh
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Welcome Information Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleModalClose}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-gradient-to-br from-white via-blue-50 to-white rounded-2xl shadow-2xl border-2 border-blue-200 max-w-5xl w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 p-4 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 animate-pulse"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">RUPTURA</h1>
                    <div className="text-blue-200 text-xs">{t('welcome.modal.platform.type')}</div>
                  </div>
                  <div className="text-4xl">⚠️</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Title */}
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">{t('welcome.modal.title')}</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-red-400 mx-auto rounded-full mt-2"></div>
              </div>

              {/* Main Content - Grid Layout */}
              <div className="grid md:grid-cols-2 gap-4 text-gray-700 mb-6">
                <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
                  <h3 className="font-semibold text-orange-800 mb-1 flex items-center text-sm">
                    <span className="mr-2">🔬</span>
                    {t('welcome.modal.demo.purpose.title')}
                  </h3>
                  <p className="text-xs">
                    {t('welcome.modal.demo.purpose.desc')}
                  </p>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                  <h3 className="font-semibold text-blue-800 mb-1 flex items-center text-sm">
                    <span className="mr-2">🎯</span>
                    {t('welcome.modal.platform.aim.title')}
                  </h3>
                  <p className="text-xs">
                    {t('welcome.modal.platform.aim.desc')}
                  </p>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-r-lg">
                  <h3 className="font-semibold text-purple-800 mb-1 flex items-center text-sm">
                    <span className="mr-2">📊</span>
                    {t('welcome.modal.content.info.title')}
                  </h3>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>{t('welcome.modal.content.info.item1')}</li>
                    <li>{t('welcome.modal.content.info.item2')}</li>
                    <li>{t('welcome.modal.content.info.item3')}</li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                  <h3 className="font-semibold text-green-800 mb-1 flex items-center text-sm">
                    <span className="mr-2">✅</span>
                    {t('welcome.modal.usage.terms.title')}
                  </h3>
                  <p className="text-xs">
                    {t('welcome.modal.usage.terms.desc')}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center">
                <Button 
                  onClick={handleModalClose}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('welcome.modal.button.text')}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  {t('welcome.modal.first.visit.message')}
                </p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-16 right-6 w-16 h-16 bg-blue-200/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-16 left-6 w-12 h-12 bg-purple-200/30 rounded-full animate-bounce"></div>
          </div>
        </div>
      )}
      {/* Enhanced Header */}
      <header className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative container mx-auto px-6 py-16">
          {/* GitHub Link */}
          <div className="absolute top-6 left-6 z-50">
            <a
              href="https://github.com/yusufornek/ruptura"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-lg px-4 py-2 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-1">
                <div className="p-1 bg-white/10 rounded">
                  <span className="text-sm">📚</span>
                </div>
                <div className="p-1 bg-white/10 rounded">
                  <span className="text-sm">💻</span>
                </div>
              </div>
              <div className="text-white">
                <div className="text-sm font-semibold group-hover:text-blue-200 transition-colors">
                  {t('github.repo')}
                </div>
                <div className="text-xs text-blue-200 opacity-90">
                  {t('code.and.docs')}
                </div>
              </div>
            </a>
          </div>

          {/* Language Switcher */}
          <div className="absolute top-6 right-6 z-50">
            <LanguageSwitcher />
          </div>
          
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-6 mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-12 animate-pulse">
                  <Activity className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                </div>
              </div>
              <div>
                <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                  RUPTURA
                </h1>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-semibold">{t('system.active')}</span>
              </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto mb-8">
              <p className="text-3xl md:text-4xl text-blue-100 mb-4 font-light">
                {t('system.title')}
              </p>
              <p className="text-xl text-blue-200 leading-relaxed">
                {t('system.subtitle')}
              </p>
            </div>

            {/* Earthquake Data Panel */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center justify-center space-x-2">
                <Waves className="h-5 w-5" />
                <span>{t('latest.earthquake.data')}</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="text-sm text-blue-200 mb-1">AFAD</div>
                  <div className="text-2xl font-bold text-white">{earthquakeData.afad.magnitude.toFixed(1)}</div>
                  <div className="text-xs text-blue-300">{earthquakeData.afad.time}</div>
                  <div className="text-xs text-blue-300">{earthquakeData.afad.location}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="text-sm text-blue-200 mb-1">Kandilli</div>
                  <div className="text-2xl font-bold text-white">{earthquakeData.kandilli.magnitude.toFixed(1)}</div>
                  <div className="text-xs text-blue-300">{earthquakeData.kandilli.time}</div>
                  <div className="text-xs text-blue-300">{earthquakeData.kandilli.location}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="text-sm text-blue-200 mb-1">USGS</div>
                  <div className="text-2xl font-bold text-white">{earthquakeData.usgs.magnitude.toFixed(1)}</div>
                  <div className="text-xs text-blue-300">{earthquakeData.usgs.time}</div>
                  <div className="text-xs text-blue-300">{earthquakeData.usgs.location}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="text-sm text-blue-200 mb-1">EMSC</div>
                  <div className="text-2xl font-bold text-white">{earthquakeData.emsc.magnitude.toFixed(1)}</div>
                  <div className="text-xs text-blue-300">{earthquakeData.emsc.time}</div>
                  <div className="text-xs text-blue-300">{earthquakeData.emsc.location}</div>
                </div>
              </div>
            </div>

            {/* Real-time stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                <div className="text-3xl font-bold text-blue-300 mb-1">
                  <AnimatedCounter value={realTimeData.activeHotspots} />
                </div>
                <div className="text-sm text-blue-200">{t('active.hotspots')}</div>
                <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                  <div className="bg-blue-400 h-1 rounded-full w-3/4 animate-pulse"></div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                <div className="text-3xl font-bold text-green-300 mb-1">
                  <AnimatedCounter value={realTimeData.connectedSensors} />
                </div>
                <div className="text-sm text-blue-200">{t('connected.sensors')}</div>
                <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                  <div className="bg-green-400 h-1 rounded-full w-4/5 animate-pulse"></div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                <div className="text-3xl font-bold text-orange-300 mb-1">
                  <AnimatedCounter value={realTimeData.alertsToday} />
                </div>
                <div className="text-sm text-blue-200">{t('todays.alerts')}</div>
                <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                  <div className="bg-orange-400 h-1 rounded-full w-1/2 animate-pulse"></div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                <div className="text-3xl font-bold text-purple-300 mb-1">{realTimeData.responseTime.toFixed(1)}s</div>
                <div className="text-sm text-blue-200">{t('response.time')}</div>
                <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                  <div className="bg-purple-400 h-1 rounded-full w-5/6 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-purple-500/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-20 w-12 h-12 bg-green-500/20 rounded-full animate-ping"></div>
      </header>

      {/* Acknowledgment Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-700 text-white py-2.5 px-6 shadow-md">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-base sm:text-lg">🎓</span>
              <span className="font-medium">{t('project.acknowledgment.banner')}</span>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-blue-200">
              <span className="text-xs">•</span>
              <span className="text-xs italic">{t('project.status')}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-12 space-y-16">
        {/* Crisis Section */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('current.situation.crisis')}</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              {t('traditional.infrastructure.collapse')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <Card className="border-l-4 border-l-red-500 shadow-lg bg-gradient-to-br from-red-50 to-white">
              <CardContent className="p-8 text-center">
                <div className="text-6xl font-bold text-red-500 mb-4">
                  <AnimatedCounter value={80} suffix="%" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{t('communication.outage')}</h3>
                <p className="text-gray-600">{t('potential.infrastructure.loss.turkey')}</p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                  <div className="h-3 bg-red-500 rounded-full" style={{ width: "80%" }}></div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {[
                {
                  icon: AlertTriangle,
                  title: t('gsm.outages'),
                  desc: t('physical.damage.overloading'),
                },
                { icon: Clock, title: t('delayed.damage.detection'), desc: t('manual.processes.security.risks') },
                { icon: Users, title: t('coordination.deficiency'), desc: t('inefficiency.in.aid.operations') },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border shadow-sm"
                >
                  <div className="bg-red-100 p-3 rounded-lg">
                    <item.icon className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* Solution Flow */}
        <section className="space-y-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('ruptura.solution')}</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              {t('revolutionary.disaster.management')}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Building2, title: t('iot.sensors'), desc: t('iot.sensors.desc'), color: "green" },
              { icon: Radio, title: t('helium.network'), desc: t('helium.network.desc'), color: "blue" },
              { icon: Link, title: t('blockchain'), desc: t('blockchain.desc'), color: "purple" },
              { icon: Map, title: t('gis.aid'), desc: t('gis.aid.desc'), color: "orange" },
            ].map((item, index) => (
              <Card
                key={index}
                className={`text-center hover:shadow-lg transition-shadow border bg-gradient-to-br from-${item.color}-50 to-white`}
              >
                <CardContent className="p-6">
                  <div
                    className={`bg-${item.color}-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}
                  >
                    <item.icon className={`h-8 w-8 text-${item.color}-600`} />
                  </div>
                  <h3 className="font-semibold mb-2 text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* Detailed Turkey Map Section */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('turkey.realtime.damage.map')}</h2>
            <p className="text-xl text-gray-600 mb-2">{t('instant.damage.detection.visualization')}</p>
            <p className="text-sm text-gray-500">
              {t('district.street.level.detail')}
            </p>
          </div>

          <DetailedTurkeyMap />
        </section>

        <Separator />

        {/* Emergency Teams Map Section */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('emergency.teams.live.tracking')}</h2>
            <p className="text-xl text-gray-600 mb-2">
              {t('emergency.teams.desc')}
            </p>
            <p className="text-sm text-gray-500">
              {t('real.time.response.status')}
            </p>
          </div>

          <EmergencyTeamsMap />
        </section>

        <Separator />

        {/* Market Potential */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('market.potential.growth')}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { value: 1000000, label: t('helium.hotspots'), color: "blue", icon: Radio },
              { value: 192, label: t('country.coverage'), color: "green", icon: MapPin },
              { value: 77000, label: t('cities.towns'), color: "purple", icon: Building2 },
            ].map((item, index) => (
              <Card
                key={index}
                className={`border hover:shadow-lg transition-shadow bg-gradient-to-br from-${item.color}-50 to-white`}
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`bg-${item.color}-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}
                  >
                    <item.icon className={`h-8 w-8 text-${item.color}-600`} />
                  </div>
                  <div className={`text-4xl font-bold text-${item.color}-600 mb-2`}>
                    <AnimatedCounter value={item.value} />
                  </div>
                  <p className="text-gray-600">{item.label}</p>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-${item.color}-500 h-2 rounded-full transition-all duration-2000`}
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* Technology Stack */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('technology.stack')}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <Thermometer className="h-5 w-5 text-blue-600" />
                  <span>{t('smart.sensor.technologies')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: t('accelerometers'), desc: t('vibration.detection'), icon: "🌡️" },
                  { name: t('omron.d7s'), desc: t('earthquake.intensity'), icon: "📐" },
                  { name: t('strain.gauges'), desc: t('structural.deformation'), icon: "📏" },
                  { name: t('gps.sensors'), desc: t('precise.location'), icon: "🛰️" },
                ].map((sensor, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg"
                  >
                    <span className="text-2xl">{sensor.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{sensor.name}</h4>
                      <p className="text-sm text-gray-600">{sensor.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border bg-gradient-to-br from-orange-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <Brain className="h-5 w-5 text-orange-600" />
                  <span>{t('edge.computing.ai')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-800 mb-2">{t('realtime.processing')}</h4>
                    <p className="text-sm text-gray-700">
                      {t('realtime.processing.desc')}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">{t('machine.learning')}</h4>
                    <p className="text-sm text-gray-700">
                      {t('machine.learning.desc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* RUPTURA Omron Integration Section */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('ruptura.live.demo')}</h2>
            <p className="text-xl text-gray-600 mb-2">
              {t('ruptura.demo.desc')}
            </p>
            <p className="text-sm text-gray-500">
              {t('ruptura.demo.detail')}
            </p>
          </div>

          <OmronSmartContractIntegration />
        </section>

        <Separator />

        {/* RUPTURA Component Demonstrations */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('system.components.demo')}</h2>
            <p className="text-xl text-gray-600 mb-2">
              {t('system.components.desc')}
            </p>
          </div>

          {/* Omron Sensor Network */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">🔬 {t('omron.sensor.network')}</h3>
              <p className="text-gray-600">
                {t('omron.sensor.desc')}
              </p>
            </div>
            <OmronSensorSimulator />
          </div>

          <Separator />

          {/* Helium Network */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">📡 {t('helium.lorawan.monitor')}</h3>
              <p className="text-gray-600">
                {t('transmission.decentralized.network')}
              </p>
            </div>
            <HeliumNetworkMonitor />
          </div>

          <Separator />

          {/* Smart Contract Processor */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">⚡ {t('smart.contract.processor')}</h3>
              <p className="text-gray-600">
                {t('processing.blockchain.damage.analysis')}
              </p>
            </div>
            <SmartContractProcessor />
          </div>
        </section>

        <Separator />

        {/* Blockchain Benefits */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('blockchain.trust.transparency')}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: t('immutable.record'), desc: t('immutable.record.desc'), color: "blue" },
              { icon: Eye, title: t('full.transparency'), desc: t('full.transparency.desc'), color: "green" },
              { icon: CheckCircle, title: t('reliability'), desc: t('reliability.desc'), color: "purple" },
            ].map((item, index) => (
              <Card
                key={index}
                className={`text-center border hover:shadow-lg transition-shadow bg-gradient-to-br from-${item.color}-50 to-white`}
              >
                <CardContent className="p-6">
                  <div
                    className={`bg-${item.color}-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}
                  >
                    <item.icon className={`h-8 w-8 text-${item.color}-600`} />
                  </div>
                  <h3 className="font-semibold mb-2 text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-8">
              <div className="flex items-center space-x-4 mb-6">
                <Zap className="h-8 w-8 text-green-600" />
                <h3 className="text-2xl font-bold text-green-800">{t('automatic.aid.smart.contracts')}</h3>
              </div>
              <p className="text-gray-700 mb-4">
                {t('automatically.triggering.emergency.aid')}
              </p>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">{t('example.scenario')}</h4>
                <p className="text-sm text-gray-700">
                  {t('jma.scenario')}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* SWOT Analysis */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('turkey.market.swot')}</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-t-4 border-t-green-500 bg-gradient-to-br from-green-50 to-white">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                <CardTitle className="text-green-700 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>{t('swot.strengths.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{t('swot.strengths.item1')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{t('swot.strengths.item2')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{t('swot.strengths.item3')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{t('swot.strengths.item4')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-red-500 bg-gradient-to-br from-red-50 to-white">
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
                <CardTitle className="text-red-700 flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{t('swot.weaknesses.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{t('swot.weaknesses.item1')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{t('swot.weaknesses.item2')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{t('swot.weaknesses.item3')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{t('swot.weaknesses.item4')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-blue-500 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="text-blue-700 flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>{t('swot.opportunities.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{t('swot.opportunities.item1')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{t('swot.opportunities.item2')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{t('swot.opportunities.item3')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{t('swot.opportunities.item4')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-yellow-500 bg-gradient-to-br from-yellow-50 to-white">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100">
                <CardTitle className="text-yellow-700 flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{t('swot.threats.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>{t('swot.threats.item1')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>{t('swot.threats.item2')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>{t('swot.threats.item3')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>{t('swot.threats.item4')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Future Roadmap */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('ruptura.roadmap')}</h2>
          </div>

          <div className="space-y-6">
            {[
              { phase: t('phase.1'), title: t('proof.of.concept'), desc: t('proof.of.concept.desc'), status: "active" },
              {
                phase: t('phase.2'),
                title: t('pilot.projects'),
                desc: t('pilot.projects.desc'),
                status: "upcoming",
              },
              { phase: t('phase.3'), title: t('scaling'), desc: t('scaling.desc'), status: "future" },
              { phase: t('phase.4'), title: t('international'), desc: t('international.desc'), status: "future" },
            ].map((item, index) => (
              <Card
                key={index}
                className={`border hover:shadow-lg transition-shadow ${
                  item.status === "active"
                    ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50"
                    : item.status === "upcoming"
                      ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50"
                      : "border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Badge
                      variant="outline"
                      className={`text-lg px-4 py-2 ${
                        item.status === "active"
                          ? "border-green-500 text-green-700"
                          : item.status === "upcoming"
                            ? "border-blue-500 text-blue-700"
                            : "border-gray-500 text-gray-700"
                      }`}
                    >
                      {item.phase}
                    </Badge>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                    {item.status === "active" && (
                      <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="relative bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 overflow-hidden mt-20">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative container mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white">RUPTURA</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm">{t('system.active')}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {t('footer.description')}
              </p>

              {/* Project Acknowledgment */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 mb-6">
                <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                  <span className="text-lg">🎓</span>
                  <span>{t('project.acknowledgment.footer.title')}</span>
                </h4>
                <p className="text-gray-300 text-sm mb-2">
                  {t('project.acknowledgment.footer.desc1')}
                </p>
                <p className="text-gray-300 text-sm mb-2">
                  {t('project.acknowledgment.footer.desc2')}
                </p>
                <p className="text-gray-300 text-sm mb-3">
                  {t('project.acknowledgment.footer.desc3')}
                </p>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>{t('project.developer')}</div>
                  <div>{t('project.university')} - {t('project.department')}</div>
                  <div>{t('project.course')}</div>
                  <div className="italic text-blue-300">{t('project.status')}</div>
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <Globe className="h-6 w-6 text-blue-400 mb-2" />
                  <div className="text-white font-semibold">192</div>
                  <div className="text-gray-400 text-sm">{t('footer.countries')}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <Satellite className="h-6 w-6 text-green-400 mb-2" />
                  <div className="text-white font-semibold">24/7</div>
                  <div className="text-gray-400 text-sm">{t('footer.monitoring')}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <Navigation className="h-6 w-6 text-purple-400 mb-2" />
                  <div className="text-white font-semibold">{'<3s'}</div>
                  <div className="text-gray-400 text-sm">{t('footer.response')}</div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-semibold text-white mb-6">{t('footer.quick.links')}</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    {t('footer.link.technology')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    {t('footer.link.map')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    {t('footer.link.market.analysis')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    {t('footer.link.swot')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    {t('footer.link.roadmap')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xl font-semibold text-white mb-6">{t('footer.contact')}</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400">📧</span>
                  </div>
                  <span className="text-gray-300">info@ruptura.tech</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-green-400">📱</span>
                  </div>
                  <span className="text-gray-300">+90 212 XXX XX XX</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-purple-400">📍</span>
                  </div>
                  <span className="text-gray-300">{t('footer.location')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400">
                {t('footer.copyright')}
              </div>
              <div className="flex items-center space-x-6">
                <span className="text-gray-400 text-sm">{t('footer.powered.by')}</span>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/10 px-3 py-1 rounded-full text-xs text-gray-300">Helium</div>
                  <div className="bg-white/10 px-3 py-1 rounded-full text-xs text-gray-300">IoT</div>
                  <div className="bg-white/10 px-3 py-1 rounded-full text-xs text-gray-300">Blockchain</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-16 h-16 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-12 h-12 bg-purple-500/10 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 right-20 w-8 h-8 bg-green-500/10 rounded-full animate-ping"></div>
      </footer>
    </div>
  )
}
