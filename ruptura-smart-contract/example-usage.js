// RUPTURA Smart Contract Usage Examples
// This file demonstrates how to interact with the RupturaSimple contract

const { ethers } = require("ethers");

// Contract ABI (simplified for demo)
const CONTRACT_ABI = [
    "function registerSensor(string memory _sensorId) public",
    "function processSensorData(string memory _sensorId, uint256 _displacement, uint8 _jmaIntensity, bool _collapseFlag) public",
    "function getSensorData(string memory _sensorId) public view returns (tuple(string sensorId, uint256 displacement, uint8 jmaIntensity, bool collapseFlag, uint256 timestamp, bool isProcessed))",
    "function getDamageAssessment(string memory _sensorId) public view returns (tuple(uint8 damageLevel, uint8 urgencyScore, string[] responseTeams, bool cbsNotified, uint256 processedAt))",
    "function getSystemStats() public view returns (uint256 totalSensors, uint256 totalEvents, uint256 emergencyEvents)",
    "function getAllSensorIds() public view returns (string[] memory)",
    "function isSensorActive(string memory _sensorId) public view returns (bool)",
    "event SensorDataReceived(string indexed sensorId, uint256 displacement, uint8 jmaIntensity, bool collapseFlag, uint256 timestamp)",
    "event DamageAssessed(string indexed sensorId, uint8 damageLevel, uint8 urgencyScore, string[] responseTeams, uint256 timestamp)",
    "event EmergencyTriggered(string indexed sensorId, uint8 damageLevel, string message, uint256 timestamp)",
    "event CBSNotificationSent(string indexed sensorId, uint8 damageLevel, uint8 urgencyScore, uint256 timestamp)"
];

// Configuration
const CONFIG = {
    // Replace with your deployed contract address
    CONTRACT_ADDRESS: "0x1234567890123456789012345678901234567890",
    
    // Replace with your provider URL
    PROVIDER_URL: "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
    
    // Replace with your private key (use environment variables in production)
    PRIVATE_KEY: "your_private_key_here"
};

/**
 * Initialize contract connection
 */
async function initializeContract() {
    const provider = new ethers.JsonRpcProvider(CONFIG.PROVIDER_URL);
    const wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    
    return { contract, wallet, provider };
}

/**
 * Example 1: Register sensors in the system
 */
async function registerSensors() {
    console.log("🔧 Registering Omron D7S sensors...");
    
    try {
        const { contract } = await initializeContract();
        
        const sensors = [
            "OMR-IST-FAT-001",  // Fatih district sensor
            "OMR-IST-BEY-002",  // Beyoğlu district sensor
            "OMR-IST-KAD-003",  // Kadıköy district sensor
            "OMR-IST-BES-004",  // Beşiktaş district sensor
            "OMR-IST-SIS-005"   // Şişli district sensor
        ];
        
        for (const sensorId of sensors) {
            console.log(`📡 Registering sensor: ${sensorId}`);
            const tx = await contract.registerSensor(sensorId);
            await tx.wait();
            console.log(`✅ Sensor ${sensorId} registered successfully`);
        }
        
        console.log("🎉 All sensors registered!");
        
    } catch (error) {
        console.error("❌ Error registering sensors:", error.message);
    }
}

/**
 * Example 2: Process different earthquake scenarios
 */
async function processEarthquakeScenarios() {
    console.log("🌍 Processing earthquake scenarios...");
    
    try {
        const { contract } = await initializeContract();
        
        // Scenario 1: Minor earthquake - No emergency response
        await processScenario(contract, {
            name: "Minor Earthquake",
            sensorId: "OMR-IST-FAT-001",
            displacement: 15,    // 15mm
            jmaIntensity: 3,     // JMA 3
            collapseFlag: false,
            expectedLevel: 1     // Level 1 - Monitoring only
        });
        
        // Scenario 2: Moderate earthquake - Security patrol needed
        await processScenario(contract, {
            name: "Moderate Earthquake",
            sensorId: "OMR-IST-BEY-002",
            displacement: 45,    // 45mm
            jmaIntensity: 4,     // JMA 4
            collapseFlag: false,
            expectedLevel: 2     // Level 2 - Security patrol
        });
        
        // Scenario 3: Strong earthquake - Emergency response
        await processScenario(contract, {
            name: "Strong Earthquake",
            sensorId: "OMR-IST-KAD-003",
            displacement: 65,    // 65mm
            jmaIntensity: 5,     // JMA 5
            collapseFlag: false,
            expectedLevel: 3     // Level 3 - Structural inspection
        });
        
        // Scenario 4: Severe earthquake - Major emergency
        await processScenario(contract, {
            name: "Severe Earthquake",
            sensorId: "OMR-IST-BES-004",
            displacement: 90,    // 90mm
            jmaIntensity: 6,     // JMA 6
            collapseFlag: false,
            expectedLevel: 4     // Level 4 - Major emergency response
        });
        
        // Scenario 5: Building collapse - Critical emergency
        await processScenario(contract, {
            name: "Building Collapse",
            sensorId: "OMR-IST-SIS-005",
            displacement: 120,   // 120mm
            jmaIntensity: 7,     // JMA 7
            collapseFlag: true,  // Collapse detected!
            expectedLevel: 5     // Level 5 - Full emergency response
        });
        
    } catch (error) {
        console.error("❌ Error processing scenarios:", error.message);
    }
}

/**
 * Process a single earthquake scenario
 */
async function processScenario(contract, scenario) {
    console.log(`\n🚨 Processing: ${scenario.name}`);
    console.log(`📊 Input: ${scenario.displacement}mm, JMA ${scenario.jmaIntensity}, Collapse: ${scenario.collapseFlag}`);
    
    try {
        // Process sensor data
        const tx = await contract.processSensorData(
            scenario.sensorId,
            scenario.displacement,
            scenario.jmaIntensity,
            scenario.collapseFlag
        );
        
        const receipt = await tx.wait();
        console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
        
        // Wait a moment for data to be processed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get damage assessment results
        const assessment = await contract.getDamageAssessment(scenario.sensorId);
        
        console.log(`📈 Results:`);
        console.log(`   - Damage Level: ${assessment.damageLevel}/5`);
        console.log(`   - Urgency Score: ${assessment.urgencyScore}/100`);
        console.log(`   - CBS Notified: ${assessment.cbsNotified ? "✅ Yes" : "❌ No"}`);
        console.log(`   - Response Teams: ${assessment.responseTeams.join(", ")}`);
        
        // Validate expected results
        if (assessment.damageLevel === scenario.expectedLevel) {
            console.log(`✅ Scenario processed correctly!`);
        } else {
            console.log(`⚠️  Unexpected damage level: got ${assessment.damageLevel}, expected ${scenario.expectedLevel}`);
        }
        
    } catch (error) {
        console.error(`❌ Error in scenario ${scenario.name}:`, error.message);
    }
}

/**
 * Example 3: Monitor contract events in real-time
 */
async function monitorEvents() {
    console.log("📡 Starting event monitoring...");
    
    try {
        const { contract } = await initializeContract();
        
        // Listen for sensor data events
        contract.on("SensorDataReceived", (sensorId, displacement, jmaIntensity, collapseFlag, timestamp) => {
            console.log(`\n📊 Sensor Data Received:`);
            console.log(`   Sensor: ${sensorId}`);
            console.log(`   Displacement: ${displacement}mm`);
            console.log(`   JMA Intensity: ${jmaIntensity}`);
            console.log(`   Collapse: ${collapseFlag}`);
            console.log(`   Time: ${new Date(Number(timestamp) * 1000).toLocaleString()}`);
        });
        
        // Listen for damage assessment events
        contract.on("DamageAssessed", (sensorId, damageLevel, urgencyScore, responseTeams, timestamp) => {
            console.log(`\n🎯 Damage Assessed:`);
            console.log(`   Sensor: ${sensorId}`);
            console.log(`   Damage Level: ${damageLevel}/5`);
            console.log(`   Urgency Score: ${urgencyScore}/100`);
            console.log(`   Response Teams: ${responseTeams.join(", ")}`);
        });
        
        // Listen for emergency triggers
        contract.on("EmergencyTriggered", (sensorId, damageLevel, message, timestamp) => {
            console.log(`\n🚨 EMERGENCY TRIGGERED:`);
            console.log(`   Sensor: ${sensorId}`);
            console.log(`   Damage Level: ${damageLevel}`);
            console.log(`   Message: ${message}`);
            console.log(`   ⚠️  IMMEDIATE RESPONSE REQUIRED!`);
        });
        
        // Listen for CBS notifications
        contract.on("CBSNotificationSent", (sensorId, damageLevel, urgencyScore, timestamp) => {
            console.log(`\n📡 CBS Notification Sent:`);
            console.log(`   Sensor: ${sensorId}`);
            console.log(`   Damage Level: ${damageLevel}`);
            console.log(`   Urgency Score: ${urgencyScore}`);
        });
        
        console.log("✅ Event monitoring started. Press Ctrl+C to stop.");
        
    } catch (error) {
        console.error("❌ Error monitoring events:", error.message);
    }
}

/**
 * Example 4: Query system statistics
 */
async function getSystemStatistics() {
    console.log("📈 Fetching system statistics...");
    
    try {
        const { contract } = await initializeContract();
        
        // Get overall system stats
        const stats = await contract.getSystemStats();
        console.log(`\n📊 System Statistics:`);
        console.log(`   Total Sensors: ${stats[0]}`);
        console.log(`   Total Events: ${stats[1]}`);
        console.log(`   Emergency Events: ${stats[2]}`);
        
        // Get all sensor IDs
        const sensorIds = await contract.getAllSensorIds();
        console.log(`\n📡 Registered Sensors:`);
        for (const sensorId of sensorIds) {
            const isActive = await contract.isSensorActive(sensorId);
            console.log(`   ${sensorId}: ${isActive ? "🟢 Active" : "🔴 Inactive"}`);
        }
        
        // Get recent sensor data for each sensor
        console.log(`\n📋 Recent Sensor Data:`);
        for (const sensorId of sensorIds) {
            try {
                const sensorData = await contract.getSensorData(sensorId);
                if (sensorData.isProcessed) {
                    console.log(`   ${sensorId}:`);
                    console.log(`     - Displacement: ${sensorData.displacement}mm`);
                    console.log(`     - JMA Intensity: ${sensorData.jmaIntensity}`);
                    console.log(`     - Collapse: ${sensorData.collapseFlag ? "Yes" : "No"}`);
                    console.log(`     - Processed: ${sensorData.isProcessed ? "Yes" : "No"}`);
                }
            } catch (error) {
                console.log(`   ${sensorId}: No data available`);
            }
        }
        
    } catch (error) {
        console.error("❌ Error fetching statistics:", error.message);
    }
}

/**
 * Main execution function
 */
async function main() {
    console.log("🚀 RUPTURA Smart Contract Demo");
    console.log("===============================");
    
    const args = process.argv.slice(2);
    const command = args[0] || "help";
    
    switch (command) {
        case "register":
            await registerSensors();
            break;
            
        case "scenarios":
            await processEarthquakeScenarios();
            break;
            
        case "monitor":
            await monitorEvents();
            break;
            
        case "stats":
            await getSystemStatistics();
            break;
            
        case "full-demo":
            console.log("🎬 Running full demonstration...\n");
            await registerSensors();
            await new Promise(resolve => setTimeout(resolve, 2000));
            await processEarthquakeScenarios();
            await new Promise(resolve => setTimeout(resolve, 2000));
            await getSystemStatistics();
            break;
            
        default:
            console.log(`
📚 Available Commands:
   node example-usage.js register     - Register sensors
   node example-usage.js scenarios    - Run earthquake scenarios
   node example-usage.js monitor      - Monitor events in real-time
   node example-usage.js stats        - Show system statistics
   node example-usage.js full-demo    - Run complete demonstration

⚙️  Setup Instructions:
   1. Install dependencies: npm install ethers
   2. Update CONFIG object with your contract address and provider
   3. Set your private key (use environment variables in production)
   4. Run: node example-usage.js full-demo

🎯 Purpose:
   This script demonstrates the RUPTURA smart contract functionality
   for processing seismic sensor data and triggering emergency responses.
            `);
    }
}

// Export functions for module use
module.exports = {
    initializeContract,
    registerSensors,
    processEarthquakeScenarios,
    monitorEvents,
    getSystemStatistics
};

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
