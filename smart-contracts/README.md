# RUPTURA Smart Contracts

## Real-time Urban Post-earthquake Terrain and Urban Risk Assessment

This repository contains the smart contract implementations for the RUPTURA system, designed to process real-time seismic data from Omron D7S sensors and automatically trigger emergency responses based on JMA (Japan Meteorological Agency) intensity scales and structural damage assessments.

## Overview

RUPTURA is an innovative earthquake early warning and damage assessment system that combines IoT sensors, blockchain technology, and automated emergency response protocols. The smart contracts serve as the core decision-making engine, processing sensor data and coordinating emergency responses in real-time.

## Architecture

### System Components
- **Omron D7S Sensors**: Industrial-grade seismic sensors providing displacement and intensity data
- **Helium Network**: IoT connectivity infrastructure for sensor data transmission
- **Smart Contracts**: Automated decision-making and response coordination
- **CBS Integration**: Crisis Information System integration for emergency services
- **Multi-chain Support**: Ethereum and Solana implementations

### Smart Contract Features
- Real-time seismic data processing
- JMA intensity scale calculations
- 5-level damage assessment algorithm
- Automated emergency response triggering
- Multi-stakeholder coordination
- Gas-optimized operations
- Comprehensive event logging

## Repository Structure

```
smart-contracts/
├── ethereum/                  # Ethereum/Solidity implementation
│   ├── contracts/
│   │   ├── RupturaCore.sol    # Main contract
│   │   ├── SensorRegistry.sol # Sensor management
│   │   ├── EmergencyResponse.sol # Response coordination
│   │   └── interfaces/        # Contract interfaces
│   ├── migrations/            # Deployment scripts
│   ├── test/                  # Test suites
│   └── truffle-config.js      # Configuration
├── solana/                    # Solana/Rust implementation
│   ├── programs/
│   │   └── ruptura/
│   │       ├── src/
│   │       │   ├── lib.rs     # Main program
│   │       │   ├── state.rs   # State management
│   │       │   └── instructions/ # Instruction handlers
│   │       └── Cargo.toml
│   ├── tests/                 # Test suites
│   └── Anchor.toml            # Configuration
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md        # System architecture
│   ├── API_REFERENCE.md       # API documentation
│   ├── DEPLOYMENT.md          # Deployment guide
│   └── SECURITY.md            # Security analysis
└── scripts/                   # Utility scripts
    ├── deploy-ethereum.js
    ├── deploy-solana.js
    └── test-scenarios.js
```

## Quick Start

### Prerequisites
- Node.js 16+
- Rust 1.70+
- Solana CLI tools
- Truffle Suite

### Ethereum Deployment
```bash
cd ethereum
npm install
truffle compile
truffle migrate --network sepolia
```

### Solana Deployment
```bash
cd solana
anchor build
anchor deploy
```

## Key Algorithms

### JMA Intensity Calculation
The system implements the Japan Meteorological Agency seismic intensity scale (0-7) with automatic damage level mapping:

- **Level 1-2**: Minimal structural impact
- **Level 3**: Light damage assessment
- **Level 4**: Moderate damage, safety inspections triggered
- **Level 5**: Severe damage, emergency response activated
- **Level 6-7**: Critical damage, full emergency protocols

### Damage Assessment Matrix
```
Displacement (mm) | JMA Scale | Collapse Flag | Damage Level
0-20             | 1-3       | false         | 1-2
21-50            | 4-5       | false         | 2-3
51-80            | 5-6       | false         | 3-4
>80              | 6-7       | any           | 4-5
any              | any       | true          | 5
```

### Urgency Score Calculation
```
Base Score = Damage Level × 20
Building Multiplier:
- Hospital: 2.0x
- School: 1.8x
- Shopping Mall: 1.6x
- Office: 1.2x
- Residential: 1.0x
- Industrial: 0.8x

Population Factor = min(occupancy/100, 2.0)
Final Score = min(100, Base × Building × Population)
```

## Emergency Response Automation

### Response Matrix
| Damage Level | Triggered Services |
|-------------|-------------------|
| Level 1     | Monitoring only |
| Level 2     | Security patrol |
| Level 3     | Structural inspection, Safety check |
| Level 4     | AFAD coordination, Medical teams |
| Level 5     | AKUT Search & Rescue, Fire dept, Medical emergency, AFAD coordination |

### CBS Integration
The system automatically interfaces with Turkey's Crisis Information System (CBS) for:
- Real-time damage reporting
- Resource allocation coordination
- Multi-agency response coordination
- Public alert dissemination

## Testing

### Test Coverage
- Unit tests for all contract functions
- Integration tests for sensor data processing
- Stress tests for high-frequency events
- Security tests for access controls
- Gas optimization tests

### Running Tests
```bash
# Ethereum tests
cd ethereum && npm test

# Solana tests
cd solana && anchor test
```

## Contributing

### Development Guidelines
1. Follow Solidity style guide for Ethereum contracts
2. Use Rust best practices for Solana programs
3. Maintain 100% test coverage
4. Document all public functions
5. Security audit before deployment

### Code Review Process
- All changes require peer review
- Security-critical changes require security team review
- Performance impacts must be benchmarked
- Gas optimization is mandatory

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

**Project Team**: Yusuf Örnek
**Institution**: İstanbul Üniversitesi
**Department**: Yönetim Bilişim Sistemleri
**Email**: yusufornek@ogr.iu.edu.tr

## Acknowledgments

- Japan Meteorological Agency for JMA scale specifications
- Omron Corporation for D7S sensor documentation
- Helium Network for IoT infrastructure
- Turkish Emergency Management Authority (AFAD) for response protocols
