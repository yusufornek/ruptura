import type React from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import turkeySVG from "./turkey.svg"
import { useDamageData } from "../hooks/useDamageData"
import { useSimulation } from "../hooks/useSimulation"
import { useLegend } from "../hooks/useLegend"

const TurkeyDamageMap: React.FC = () => {
  const { damageData, updateDamageData } = useDamageData()
  const { simulationData } = useSimulation()
  const { legend } = useLegend()

  const handleMouseHover = (region: string) => {
    // Logic to handle mouse hover
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "600px" }}>
      <MapContainer center={[39.9042, 32.8613]} zoom={6} style={{ width: "100%", height: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* SVG ile çizilmiş Türkiye silueti */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <img src={turkeySVG || "/placeholder.svg"} alt="Türkiye" style={{ width: "100%", height: "100%" }} />
        </div>
        {/* Hover interaksiyonu ile detay bilgileri */}
        {damageData.map((region) => (
          <Marker
            key={region.name}
            position={region.coordinates}
            eventHandlers={{ mouseover: () => handleMouseHover(region.name) }}
          >
            <Popup>{region.details}</Popup>
          </Marker>
        ))}
      </MapContainer>
      {/* Görsel legend */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        {legend.map((item) => (
          <div key={item.label} style={{ marginBottom: "5px" }}>
            <span
              style={{
                backgroundColor: item.color,
                width: "20px",
                height: "20px",
                display: "inline-block",
                marginRight: "10px",
              }}
            ></span>
            {item.label}
          </div>
        ))}
      </div>
      {/* Dinamik bilgi kartları */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Bilgi kartları içeriği */}
      </div>
      {/* Canlı yayın göstergesi */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Canlı yayın içeriği */}
      </div>
    </div>
  )
}

export default TurkeyDamageMap
