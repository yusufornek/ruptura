// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IRuptura.sol";

/**
 * @title SensorRegistry
 * @dev Manages earthquake monitoring sensors for RUPTURA system
 */
contract SensorRegistry is ISensorRegistry {
    
    address public owner;
    
    // Mapping from sensor ID to sensor information
    mapping(string => SensorInfo) private sensors;
    
    // Array to track all registered sensor IDs
    string[] public sensorIds;
    
    // Mapping to check if sensor ID exists
    mapping(string => bool) private sensorExists;
    
    // Building type classifications
    mapping(string => uint8) public buildingTypeRisk;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier validSensor(string memory _sensorId) {
        require(bytes(_sensorId).length > 0, "Invalid sensor ID");
        require(sensorExists[_sensorId], "Sensor does not exist");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        _initializeBuildingTypes();
    }
    
    /**
     * @dev Initialize building type risk classifications
     */
    function _initializeBuildingTypes() private {
        buildingTypeRisk["hospital"] = 5;     // Critical infrastructure
        buildingTypeRisk["school"] = 4;       // High priority
        buildingTypeRisk["mall"] = 4;         // High occupancy
        buildingTypeRisk["office"] = 3;       // Medium priority
        buildingTypeRisk["residential"] = 2;  // Standard priority
        buildingTypeRisk["industrial"] = 1;   // Lower priority
    }
    
    /**
     * @dev Register a new earthquake monitoring sensor
     * @param _sensorId Unique identifier for the sensor
     * @param _location Geographic location of the sensor
     */
    function registerSensor(
        string memory _sensorId, 
        string memory _location
    ) external onlyOwner {
        require(bytes(_sensorId).length > 0, "Invalid sensor ID");
        require(bytes(_location).length > 0, "Invalid location");
        require(!sensorExists[_sensorId], "Sensor already registered");
        
        sensors[_sensorId] = SensorInfo({
            sensorId: _sensorId,
            location: _location,
            isActive: true,
            registeredAt: block.timestamp,
            owner: msg.sender
        });
        
        sensorIds.push(_sensorId);
        sensorExists[_sensorId] = true;
        
        emit SensorRegistered(_sensorId, _location, msg.sender);
    }
    
    /**
     * @dev Deactivate a sensor (maintenance, malfunction, etc.)
     * @param _sensorId Sensor identifier to deactivate
     */
    function deactivateSensor(string memory _sensorId) 
        external 
        onlyOwner 
        validSensor(_sensorId) 
    {
        require(sensors[_sensorId].isActive, "Sensor already inactive");
        
        sensors[_sensorId].isActive = false;
        
        emit SensorDeactivated(_sensorId);
    }
    
    /**
     * @dev Reactivate a sensor
     * @param _sensorId Sensor identifier to reactivate
     */
    function reactivateSensor(string memory _sensorId) 
        external 
        onlyOwner 
        validSensor(_sensorId) 
    {
        require(!sensors[_sensorId].isActive, "Sensor already active");
        
        sensors[_sensorId].isActive = true;
    }
    
    /**
     * @dev Get sensor information
     * @param _sensorId Sensor identifier
     * @return SensorInfo struct containing sensor details
     */
    function getSensorInfo(string memory _sensorId) 
        external 
        view 
        validSensor(_sensorId)
        returns (SensorInfo memory) 
    {
        return sensors[_sensorId];
    }
    
    /**
     * @dev Check if sensor is active
     * @param _sensorId Sensor identifier
     * @return bool indicating if sensor is active
     */
    function isSensorActive(string memory _sensorId) 
        external 
        view 
        returns (bool) 
    {
        if (!sensorExists[_sensorId]) {
            return false;
        }
        return sensors[_sensorId].isActive;
    }
    
    /**
     * @dev Get total number of registered sensors
     * @return uint256 total sensor count
     */
    function getTotalSensors() external view returns (uint256) {
        return sensorIds.length;
    }
    
    /**
     * @dev Get all active sensor IDs
     * @return string[] array of active sensor IDs
     */
    function getActiveSensorIds() external view returns (string[] memory) {
        uint256 activeCount = 0;
        
        // First, count active sensors
        for (uint256 i = 0; i < sensorIds.length; i++) {
            if (sensors[sensorIds[i]].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active sensor IDs
        string[] memory activeSensors = new string[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < sensorIds.length; i++) {
            if (sensors[sensorIds[i]].isActive) {
                activeSensors[currentIndex] = sensorIds[i];
                currentIndex++;
            }
        }
        
        return activeSensors;
    }
    
    /**
     * @dev Get all registered sensor IDs (active and inactive)
     * @return string[] array of all sensor IDs
     */
    function getAllSensorIds() external view returns (string[] memory) {
        return sensorIds;
    }
    
    /**
     * @dev Get building type risk level
     * @param _buildingType Type of building
     * @return uint8 risk level (1-5)
     */
    function getBuildingTypeRisk(string memory _buildingType) 
        external 
        view 
        returns (uint8) 
    {
        return buildingTypeRisk[_buildingType];
    }
    
    /**
     * @dev Update building type risk level (owner only)
     * @param _buildingType Type of building
     * @param _riskLevel Risk level (1-5)
     */
    function setBuildingTypeRisk(
        string memory _buildingType, 
        uint8 _riskLevel
    ) external onlyOwner {
        require(_riskLevel >= 1 && _riskLevel <= 5, "Risk level must be 1-5");
        buildingTypeRisk[_buildingType] = _riskLevel;
    }
    
    /**
     * @dev Transfer ownership of the contract
     * @param _newOwner Address of the new owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
    
    /**
     * @dev Get registry statistics
     * @return totalSensors Total number of registered sensors
     * @return activeSensors Number of active sensors
     * @return inactiveSensors Number of inactive sensors
     */
    function getRegistryStats() 
        external 
        view 
        returns (
            uint256 totalSensors,
            uint256 activeSensors,
            uint256 inactiveSensors
        ) 
    {
        totalSensors = sensorIds.length;
        activeSensors = 0;
        
        for (uint256 i = 0; i < sensorIds.length; i++) {
            if (sensors[sensorIds[i]].isActive) {
                activeSensors++;
            }
        }
        
        inactiveSensors = totalSensors - activeSensors;
    }
}
