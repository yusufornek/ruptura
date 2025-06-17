// RUPTURA Smart Contract Deployment Script
// Deploys the RupturaSimple contract to Ethereum testnet

const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting RUPTURA Smart Contract Deployment...");
    console.log("=================================================");

    // Get the contract factory
    const RupturaSimple = await ethers.getContractFactory("RupturaSimple");
    
    // Get deployment account
    const [deployer] = await ethers.getSigners();
    
    console.log("👤 Deploying contracts with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
    
    console.log("\n📦 Deploying RupturaSimple contract...");
    
    // Deploy the contract
    const rupturaContract = await RupturaSimple.deploy();
    await rupturaContract.waitForDeployment();
    
    const contractAddress = await rupturaContract.getAddress();
    console.log("✅ RupturaSimple deployed to:", contractAddress);
    
    // Wait for a few block confirmations
    console.log("⏳ Waiting for block confirmations...");
    await rupturaContract.deploymentTransaction().wait(5);
    
    // Verify deployment by calling a function
    console.log("\n🔍 Verifying deployment...");
    const owner = await rupturaContract.owner();
    console.log("📋 Contract owner:", owner);
    
    const stats = await rupturaContract.getSystemStats();
    console.log("📊 Initial stats:", {
        totalSensors: stats[0].toString(),
        totalEvents: stats[1].toString(),
        emergencyEvents: stats[2].toString()
    });
    
    // Register demo sensors
    console.log("\n🔧 Registering demo sensors...");
    const demoSensors = [
        "OMR-IST-FAT-001",
        "OMR-IST-BEY-002", 
        "OMR-IST-KAD-003"
    ];
    
    for (const sensorId of demoSensors) {
        console.log(`📡 Registering ${sensorId}...`);
        const tx = await rupturaContract.registerSensor(sensorId);
        await tx.wait();
        console.log(`✅ ${sensorId} registered successfully`);
    }
    
    // Run a test scenario
    console.log("\n🧪 Running test scenario...");
    const testTx = await rupturaContract.processSensorData(
        "OMR-IST-FAT-001",
        55,     // 55mm displacement
        4,      // JMA intensity 4
        false   // No collapse
    );
    await testTx.wait();
    
    const testAssessment = await rupturaContract.getDamageAssessment("OMR-IST-FAT-001");
    console.log("📋 Test results:", {
        damageLevel: testAssessment.damageLevel.toString(),
        urgencyScore: testAssessment.urgencyScore.toString(),
        cbsNotified: testAssessment.cbsNotified,
        responseTeams: testAssessment.responseTeams
    });
    
    console.log("\n✅ Deployment completed successfully!");
    console.log("=================================");
    console.log("📝 Contract Information:");
    console.log("   Contract Address:", contractAddress);
    console.log("   Network:", process.env.HARDHAT_NETWORK || "localhost");
    console.log("   Deployer:", deployer.address);
    console.log("   Block Number:", await deployer.provider.getBlockNumber());
    
    console.log("\n🔗 Next Steps:");
    console.log("1. Update example-usage.js with the contract address");
    console.log("2. Verify contract on Etherscan (if mainnet/testnet)");
    console.log("3. Test with: node example-usage.js full-demo");
    
    console.log("\n📋 Contract Address for Reference:");
    console.log(contractAddress);
    
    return contractAddress;
}

// Handle errors
main()
    .then((address) => {
        console.log(`\n🎉 Deployment successful! Contract: ${address}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
