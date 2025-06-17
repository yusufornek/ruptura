# RUPTURA Simple Smart Contract

## Overview

This is a simplified smart contract implementation for the RUPTURA (Real-time Urban Post-earthquake Terrain and Urban Risk Assessment) system. The contract demonstrates how blockchain technology can be used to process real-time seismic sensor data and automatically trigger emergency responses.

## What This Contract Does

**Receives Sensor Data**: Processes data from Omron D7S seismic sensors
**Assesses Damage**: Calculates damage levels (1-5) based on JMA intensity and displacement  
**Triggers Responses**: Automatically activates appropriate emergency teams
**Notifies Systems**: Sends alerts to Crisis Information System (CBS)
**Logs Everything**: Maintains transparent record of all events

## Key Features

### 1. Sensor Data Processing
```solidity
function processSensorData(
    string memory _sensorId,
    uint256 _displacement,     // in millimeters
    uint8 _jmaIntensity,      // JMA scale 1-7
    bool _collapseFlag        // structural collapse detected
)
```

### 2. Damage Assessment Algorithm
- **Level 5** (Critical): Structural collapse detected
- **Level 4** (Severe): JMA ≥ 6 OR displacement > 80mm
- **Level 3** (Moderate): JMA ≥ 5 OR displacement > 50mm
- **Level 2** (Light): JMA ≥ 4 OR displacement > 20mm
- **Level 1** (Minimal): Other cases

### 3. Emergency Response Matrix (*Potential Enhancement*)
| Damage Level | Suggested Response Teams |
|-------------|----------------|
| 5 | AKUT Search & Rescue, Fire Department, AFAD, Medical, Helicopter |
| 4 | AFAD Coordination, Medical Teams, AKUT Search & Rescue |
| 3 | Structural Inspection, Medical Teams |
| 2 | Security Patrol |
| 1 | Monitoring Only |

**Note:** Emergency team coordination is designed but not implemented in Phase 1.

## Contract Structure

```
RupturaSimple.sol
├── Structs
│   ├── SensorData        # Input sensor readings
│   └── DamageAssessment  # Processing results
├── Functions
│   ├── registerSensor()      # Register new sensors
│   ├── processSensorData()   # Main processing function
│   ├── getSensorData()       # Query sensor data
│   ├── getDamageAssessment() # Query damage results
│   └── getSystemStats()      # System statistics
└── Events
    ├── SensorDataReceived    # New sensor data logged
    ├── DamageAssessed        # Damage calculation completed
    ├── EmergencyTriggered    # Emergency response activated
    └── CBSNotificationSent   # CBS system notified
```

## How It Works

### Step 1: Sensor Registration
```javascript
// Register a new Omron D7S sensor
await contract.registerSensor("OMR-IST-001");
```

### Step 2: Data Processing
```javascript
// Process incoming sensor data
await contract.processSensorData(
    "OMR-IST-001",  // Sensor ID
    75,             // 75mm displacement
    5,              // JMA intensity 5
    false           // No collapse detected
);
```

### Step 3: Automatic Response
The contract automatically:
1. ✅ Calculates damage level (Level 3 in this example)
2. ✅ Determines urgency score (60/100)
3. ✅ Triggers appropriate response teams
4. ✅ Sends CBS notification if needed
5. ✅ Logs all events on blockchain

### Step 4: Query Results
```javascript
// Get damage assessment results
const assessment = await contract.getDamageAssessment("OMR-IST-001");
console.log(`Damage Level: ${assessment.damageLevel}`);
console.log(`Response Teams: ${assessment.responseTeams}`);
```

## Sample Scenarios

### Scenario 1: Minor Earthquake
```
Input:  displacement=15mm, JMA=3, collapse=false
Output: Level 1, Monitoring only
Result: No emergency response triggered
```

### Scenario 2: Moderate Earthquake
```
Input:  displacement=45mm, JMA=4, collapse=false
Output: Level 2, Security patrol
Result: CBS notification sent
```

### Scenario 3: Severe Earthquake
```
Input:  displacement=85mm, JMA=6, collapse=false
Output: Level 4, Major emergency response
Result: AFAD, Medical, AKUT teams activated
```

### Scenario 4: Building Collapse
```
Input:  displacement=any, JMA=any, collapse=true
Output: Level 5, Full emergency response
Result: All emergency services activated
```

## Events and Monitoring

The contract emits events for real-time monitoring:

```solidity
event SensorDataReceived(string sensorId, uint256 displacement, uint8 jmaIntensity, bool collapseFlag, uint256 timestamp);
event DamageAssessed(string sensorId, uint8 damageLevel, uint8 urgencyScore, string[] responseTeams, uint256 timestamp);
event EmergencyTriggered(string sensorId, uint8 damageLevel, string message, uint256 timestamp);
event CBSNotificationSent(string sensorId, uint8 damageLevel, uint8 urgencyScore, uint256 timestamp);
```

## Deployment Instructions

### Prerequisites
- Node.js 16+
- Hardhat or Truffle
- MetaMask wallet
- Test ETH (for deployment)

### Quick Deploy
```bash
# Install dependencies
npm install

# Compile contract
npx hardhat compile

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia
```

## Technical Specifications

- **Solidity Version**: ^0.8.19
- **License**: MIT
- **Gas Optimization**: Efficient data structures
- **Security**: Input validation and access controls
- **Events**: Comprehensive logging for transparency

## Integration with RUPTURA System

This smart contract integrates with:
- **Omron D7S Sensors**: Real-time seismic data input
- **Helium Network**: IoT data transmission
- **CBS System**: Turkish Crisis Information System
- **Emergency Services**: AFAD, AKUT, Fire Department, Medical
- **Monitoring Dashboard**: Real-time visualization

## Academic Use

This contract is designed for:
- **Research Demonstration**: Shows blockchain in emergency systems
- **Educational Purpose**: Clear, commented code for learning
- **Proof of Concept**: Validates technical feasibility

## Future Enhancements

- **Multi-chain Support**: Deploy on Polygon/BSC for lower costs
- **AI Integration**: Machine learning for better damage prediction
- **Geographic Data**: GPS coordinates and building information
- **Mobile Integration**: Direct alerts to emergency personnel
- **Advanced Security**: Multi-signature for critical functions

## Contact

**Development Team**: Yusuf Örnek
**Institution**: İstanbul Üniversitesi
**Department**: Yönetim Bilişim Sistemleri
**Email**: yusufornek@ogr.iu.edu.tr
**Purpose**: Academic Research & Development

---

*This smart contract demonstrates the potential of blockchain technology in emergency management systems. It provides a transparent, automated, and reliable solution for processing seismic data and coordinating emergency responses.*
