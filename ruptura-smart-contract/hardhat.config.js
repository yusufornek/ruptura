require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  
  networks: {
    // Local development network
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    
    // Ethereum Sepolia testnet
    sepolia: {
      url: process.env.SEPOLIA_URL || "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gas: 2100000,
      gasPrice: 8000000000, // 8 gwei
    },
    
    // Ethereum Goerli testnet (backup)
    goerli: {
      url: process.env.GOERLI_URL || "https://goerli.infura.io/v3/YOUR_PROJECT_ID",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 5,
      gas: 2100000,
      gasPrice: 8000000000, // 8 gwei
    },
    
    // Polygon Mumbai testnet (optional)
    mumbai: {
      url: process.env.MUMBAI_URL || "https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001,
      gas: 2100000,
      gasPrice: 8000000000, // 8 gwei
    },
  },
  
  // Etherscan verification
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
    }
  },
  
  // Gas reporter configuration
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 20, // gwei
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    outputFile: "gas-report.txt",
    noColors: true,
  },
  
  // Contract size reporter
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  
  // Mocha test configuration
  mocha: {
    timeout: 40000,
  },
  
  // Path configuration
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};
