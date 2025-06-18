# 🌍 RUPTURA - A Decentralized System for Damage Detection and
Emergency Response with Helium-Based IoT Sensors
in Case of Internet and Cellular Network Outages
During Earthquakes

<div align="center">

![RUPTURA Logo](https://img.shields.io/badge/RUPTURA-Earthquake%20Monitoring-red?style=for-the-badge&logo=earthquake)

**Real-time earthquake monitoring and emergency response coordination system**

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-purple?style=flat-square&logo=solidity)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)

</div>

## 📋 About the Project

RUPTURA is a comprehensive system developed for post-earthquake urban damage assessment and emergency response coordination. By processing real-time data from Omron D7S sensors, it determines damage levels according to the JMA (Japan Meteorological Agency) intensity scale and activates automatic emergency response protocols.

### 🎯 Key Features

- **Real-time Monitoring**: Instant data acquisition from Omron D7S sensors
- **Smart Damage Assessment**: 5-level damage analysis based on JMA scale
- **Automatic Emergency Response**: Automatic team coordination based on damage level
- **Blockchain Security**: Ethereum-based smart contract system
- **Interactive Visualization**: Real-time data on Turkey map
- **Multi-language Support**: Turkish and English interface

## 🏗️ System Architecture

```
RUPTURA Ecosystem
├── earthquake-infographic/     # Web Interface
│   ├── Interactive Dashboard
│   ├── Real-time Data Visualization
│   └── Turkey Earthquake Map
├── smart-contracts/           # Blockchain System
│   ├── Sensor Registry
│   ├── Damage Assessment
│   ├── Emergency Response
│   └── Core Coordination
└── Academic Resources/        # Academic Documents
    ├── System Diagrams
    ├── Algorithm Flowcharts
    └── Research Documentation
```

## 🚀 Project Components

### 1. 🌐 Earthquake Infographic (Web Interface)
Visualize real-time earthquake data with a modern and interactive web dashboard.

**Features:**
- Turkey earthquake map (Leaflet)
- Real-time sensor simulation
- Omron D7S sensor data visualization
- Helium Network integration
- Smart contract integration
- Responsive design

**Technologies:**
- Next.js 15.2
- React 19
- TypeScript
- Tailwind CSS 
- shadcn/ui Components
- Leaflet Maps
- Recharts

### 2. ⛓️ Smart Contracts (Blockchain System)
Secure data processing with Ethereum-based modular smart contract system.

**Contract Structure:**
- **RupturaCore.sol**: Main coordination contract
- **SensorRegistry.sol**: Sensor registration and management
- **DamageAssessment.sol**: Damage assessment algorithms
- **EmergencyResponse.sol**: Emergency response coordination
- **IRuptura.sol**: Interface definitions

**Features:**
- Gas-optimized operations
- Modular architecture
- Comprehensive event logging
- Multi-stakeholder coordination
- Real-time damage assessment

## 🔧 Installation and Setup

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Git

### 1. Web Interface Setup

```bash
# Clone the repository
git clone https://github.com/your-username/ruptura.git
cd ruptura/earthquake-infographic

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
```

The web interface will run at `http://localhost:3000`.

### 2. Smart Contract Setup

```bash
cd smart-contracts/ethereum

# Install dependencies (if any)
npm install

# You can examine the contracts
ls contracts/
```

## 📊 Damage Assessment Algorithm

### JMA Intensity Scale Integration

| Level | JMA Value | Description | Response |
|-------|-----------|-------------|----------|
| 1 | 1-2 | Minimal damage | Monitoring |
| 2 | 3-4 | Light damage | Security patrol |
| 3 | 4-5 | Moderate damage | Structural inspection |
| 4 | 5-6 | Severe damage | AFAD coordination |
| 5 | 6-7+ | Critical damage | Full emergency response |

### Emergency Response Teams

- **Monitoring Team**: Continuous monitoring
- **Security Patrol**: Area security control
- **Structural Inspection**: Building damage assessment
- **AFAD Coordination**: Central coordination
- **Medical Teams**: Health intervention
- **Search & Rescue (AKUT)**: Debris rescue operations
- **Fire Department**: Fire and emergency response
- **Emergency Helicopter**: Air-supported intervention

## 🎮 Demo and Usage

### Web Interface Demo
1. Visit the main page
2. View sensor locations on Turkey map
3. Start sensor simulation
4. Monitor real-time damage assessments
5. Follow emergency response protocols

### Smart Contract Interaction
1. Sensor registration operations
2. Damage assessment calculations  
3. Emergency response team coordination
4. System health status monitoring

## 📈 System Performance

- **Sensor Data Processing**: < 2 seconds
- **Damage Assessment**: < 1 second
- **Emergency Response Trigger**: < 5 seconds
- **Web Interface Response**: < 500ms
- **Smart Contract Gas**: Optimized

## 🏥 Emergency Scenarios

### Scenario 1: Moderate Earthquake (JMA 4-5)
1. Sensor data is received
2. Damage level 3 is calculated
3. Structural inspection team is triggered
4. Medical team enters alert mode
5. Notification is sent to CBS system

### Scenario 2: Major Earthquake (JMA 6+)
1. Critical damage level 4-5 is detected
2. All emergency response teams are activated
3. AFAD coordination becomes active
4. Search and rescue teams deploy to the field
5. Emergency helicopter support is requested

## 🛡️ Security and Validation

- **Blockchain Security**: Ethereum-based immutable records
- **Data Integrity**: Cryptographic hash validation
- **Access Control**: Role-based permissions
- **Input Validation**: Comprehensive data sanitization
- **Event Logging**: Full audit trail

## 🔮 Future Developments

- [ ] AI-powered damage prediction
- [ ] Drone integration
- [ ] Social media sentiment analysis
- [ ] Mobile application development
- [ ] IoT sensor network expansion
- [ ] Machine learning optimization

## 📚 Academic Resources

Academic documents prepared within the project scope:
- System architecture diagrams
- Algorithm flowcharts
- Performance analysis reports
- LaTeX documents
- Mermaid charts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)  
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**RUPTURA** - Technology for earthquake safety

[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=flat-square&logo=github)](https://github.com/your-username/ruptura)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

*For safer cities...*

</div>
