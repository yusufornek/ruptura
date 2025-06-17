// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IRuptura.sol";
import "./SensorRegistry.sol";
import "./DamageAssessment.sol";
import "./EmergencyResponse.sol";

/**
 * @title RupturaCore
 * @dev Main contract for RUPTURA earthquake monitoring and emergency response system
 */
contract RupturaCore is IRupturaCore {
    
    address public admin;
    
    // Contract instances
    SensorRegistry public sensorRegistry;
    DamageAssessment public damageAssessment;
    EmergencyResponse public emergencyResponse;
    
    // Sensor data storage
    mapping(string => SensorData) private sensorData;
    
    // System statistics
    uint256 public totalProcessedEvents;
    uint256 public totalEmergencyEvents;
    uint256 public systemStartTime;
    
    // Data processing settings
    uint256 public processingThreshold = 30; // seconds between updates
    mapping(string => uint256) public lastProcessedTime;
    
    // Events for comprehensive logging
    event SystemInitialized(
        address sensorRegistry,
        address damageAssessment,
        address emergencyResponse,
        uint256 timestamp
    );
    
    event DataProcessingCompleted(
        string indexed sensorId,
        uint8 damageLevel,
        uint8 urgencyScore,
        bool emergencyTriggered,
        uint256 timestamp
    );
    
    event SystemAlert(
        string indexed sensorId,
        string alertType,
        string message,
        uint256 timestamp
    );
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier validSensorId(string memory _sensorId) {
        require(bytes(_sensorId).length > 0, "Invalid sensor ID");
        _;
    }
    
    modifier validJMAIntensity(uint8 _jmaIntensity) {
        require(_jmaIntensity >= 1 && _jmaIntensity <= 7, "JMA intensity must be 1-7");
        _;
    }
    
    modifier processingThresholdMet(string memory _sensorId) {
        require(
            block.timestamp - lastProcessedTime[_sensorId] >= processingThreshold,
            "Processing threshold not met"
        );
        _;
    }
    
    constructor() {
        admin = msg.sender;
        systemStartTime = block.timestamp;
        
        // Deploy child contracts
        sensorRegistry = new SensorRegistry();
        damageAssessment = new DamageAssessment();
        emergencyResponse = new EmergencyResponse();
        
        emit SystemInitialized(
            address(sensorRegistry),
            address(damageAssessment),
            address(emergencyResponse),
            block.timestamp
        );
    }
    
    /**
     * @dev Process incoming sensor data and coordinate system response
     * @param _sensorId Unique sensor identifier
     * @param _displacement Structural displacement in millimeters
     * @param _jmaIntensity JMA seismic intensity (1-7)
     * @param _collapseFlag Whether structural collapse is detected
     * @param _buildingType Type of building being monitored
     */
    function processSensorData(
        string memory _sensorId,
        uint256 _displacement,
        uint8 _jmaIntensity,
        bool _collapseFlag,
        string memory _buildingType
    ) 
        external 
        validSensorId(_sensorId)
        validJMAIntensity(_jmaIntensity)
        processingThresholdMet(_sensorId)
    {
        // Verify sensor is registered and active
        require(sensorRegistry.isSensorActive(_sensorId), "Sensor not active");
        
        // Store sensor data
        sensorData[_sensorId] = SensorData({
            sensorId: _sensorId,
            displacement: _displacement,
            jmaIntensity: _jmaIntensity,
            collapseFlag: _collapseFlag,
            buildingType: _buildingType,
            timestamp: block.timestamp,
            isProcessed: false
        });
        
        emit SensorDataProcessed(
            _sensorId,
            _displacement,
            _jmaIntensity,
            _collapseFlag,
            block.timestamp
        );
        
        // Process damage assessment
        IDamageAssessment.AssessmentResult memory assessment = damageAssessment.assessDamage(
            _displacement,
            _jmaIntensity,
            _collapseFlag,
            _buildingType
        );
        
        // Update processing status
        sensorData[_sensorId].isProcessed = true;
        lastProcessedTime[_sensorId] = block.timestamp;
        totalProcessedEvents++;
        
        // Trigger emergency response if needed
        if (assessment.requiresEmergencyResponse) {
            emergencyResponse.triggerEmergencyResponse(
                _sensorId,
                assessment.damageLevel,
                assessment.urgencyScore
            );
            
            totalEmergencyEvents++;
            
            emit SystemAlert(
                _sensorId,
                "EMERGENCY_TRIGGERED",
                "Emergency response activated due to critical damage assessment",
                block.timestamp
            );
        }
        
        emit DataProcessingCompleted(
            _sensorId,
            assessment.damageLevel,
            assessment.urgencyScore,
            assessment.requiresEmergencyResponse,
            block.timestamp
        );
    }
    
    /**
     * @dev Register a new sensor in the system
     * @param _sensorId Unique sensor identifier
     * @param _location Geographic location of sensor
     */
    function registerSensor(
        string memory _sensorId,
        string memory _location
    ) external onlyAdmin {
        sensorRegistry.registerSensor(_sensorId, _location);
        
        emit SystemAlert(
            _sensorId,
            "SENSOR_REGISTERED",
            "New sensor registered in the system",
            block.timestamp
        );
    }
    
    /**
     * @dev Deactivate a sensor
     * @param _sensorId Sensor identifier to deactivate
     */
    function deactivateSensor(string memory _sensorId) external onlyAdmin {
        sensorRegistry.deactivateSensor(_sensorId);
        
        emit SystemAlert(
            _sensorId,
            "SENSOR_DEACTIVATED",
            "Sensor deactivated for maintenance",
            block.timestamp
        );
    }
    
    /**
     * @dev Get sensor data by ID
     * @param _sensorId Sensor identifier
     * @return SensorData struct containing sensor information
     */
    function getSensorData(string memory _sensorId) 
        external 
        view 
        validSensorId(_sensorId)
        returns (SensorData memory) 
    {
        return sensorData[_sensorId];
    }
    
    /**
     * @dev Get comprehensive system statistics
     * @return totalSensors Number of registered sensors
     * @return totalEvents Total processed events
     * @return emergencyEvents Total emergency events triggered
     */
    function getSystemStats() 
        external 
        view 
        returns (
            uint256 totalSensors,
            uint256 totalEvents,
            uint256 emergencyEvents
        ) 
    {
        (totalSensors,,) = sensorRegistry.getRegistryStats();
        totalEvents = totalProcessedEvents;
        emergencyEvents = totalEmergencyEvents;
    }
    
    /**
     * @dev Get detailed system health status
     * @return uptimeSeconds System uptime in seconds
     * @return activeSensors Number of active sensors
     * @return activeEmergencies Number of active emergency cases
     * @return systemHealth Overall system health score (0-100)
     */
    function getSystemHealth() 
        external 
        view 
        returns (
            uint256 uptimeSeconds,
            uint256 activeSensors,
            uint256 activeEmergencies,
            uint8 systemHealth
        ) 
    {
        uptimeSeconds = block.timestamp - systemStartTime;
        
        (, activeSensors,) = sensorRegistry.getRegistryStats();
        
        (,activeEmergencies,) = emergencyResponse.getEmergencyStats();
        
        // Calculate system health (simplified algorithm)
        systemHealth = _calculateSystemHealth(activeSensors, activeEmergencies);
    }
    
    /**
     * @dev Calculate system health score
     * @param _activeSensors Number of active sensors
     * @param _activeEmergencies Number of active emergencies
     * @return uint8 health score (0-100)
     */
    function _calculateSystemHealth(
        uint256 _activeSensors,
        uint256 _activeEmergencies
    ) private pure returns (uint8) {
        uint256 baseHealth = 100;
        
        // Reduce health based on active emergencies
        if (_activeEmergencies > 0) {
            uint256 emergencyPenalty = _activeEmergencies * 10;
            baseHealth = baseHealth > emergencyPenalty ? baseHealth - emergencyPenalty : 0;
        }
        
        // Reduce health if insufficient sensors
        if (_activeSensors < 3) {
            baseHealth = baseHealth > 20 ? baseHealth - 20 : 0;
        }
        
        return uint8(baseHealth);
    }
    
    /**
     * @dev Get damage assessment for specific sensor
     * @param _displacement Displacement value
     * @param _jmaIntensity JMA intensity
     * @param _collapseFlag Collapse flag
     * @param _buildingType Building type
     * @return Assessment result
     */
    function getDamageAssessment(
        uint256 _displacement,
        uint8 _jmaIntensity,
        bool _collapseFlag,
        string memory _buildingType
    ) external view returns (IDamageAssessment.AssessmentResult memory) {
        return damageAssessment.assessDamage(_displacement, _jmaIntensity, _collapseFlag, _buildingType);
    }
    
    /**
     * @dev Get emergency response plan for damage level
     * @param _damageLevel Damage level (1-5)
     * @return Response plan details
     */
    function getEmergencyResponsePlan(uint8 _damageLevel) 
        external 
        view 
        returns (IEmergencyResponse.ResponsePlan memory) 
    {
        return emergencyResponse.getResponsePlan(_damageLevel);
    }
    
    /**
     * @dev Batch process multiple sensor readings
     * @param _sensorIds Array of sensor IDs
     * @param _displacements Array of displacement values
     * @param _jmaIntensities Array of JMA intensities
     * @param _collapseFlags Array of collapse flags
     * @param _buildingTypes Array of building types
     */
    function batchProcessSensorData(
        string[] memory _sensorIds,
        uint256[] memory _displacements,
        uint8[] memory _jmaIntensities,
        bool[] memory _collapseFlags,
        string[] memory _buildingTypes
    ) external {
        require(
            _sensorIds.length == _displacements.length &&
            _displacements.length == _jmaIntensities.length &&
            _jmaIntensities.length == _collapseFlags.length &&
            _collapseFlags.length == _buildingTypes.length,
            "Array lengths must match"
        );
        
        for (uint256 i = 0; i < _sensorIds.length; i++) {
            // Check if sensor is active and threshold is met
            if (sensorRegistry.isSensorActive(_sensorIds[i]) && 
                block.timestamp - lastProcessedTime[_sensorIds[i]] >= processingThreshold) {
                
                // Process each sensor data
                this.processSensorData(
                    _sensorIds[i],
                    _displacements[i],
                    _jmaIntensities[i],
                    _collapseFlags[i],
                    _buildingTypes[i]
                );
            }
        }
    }
    
    /**
     * @dev Emergency system shutdown
     */
    function emergencyShutdown() external onlyAdmin {
        emit SystemAlert(
            "",
            "SYSTEM_SHUTDOWN",
            "Emergency system shutdown initiated",
            block.timestamp
        );
        
        // In a real implementation, this would safely shutdown all operations
        // For now, we just emit the event
    }
    
    /**
     * @dev Update processing threshold
     * @param _newThreshold New threshold in seconds
     */
    function updateProcessingThreshold(uint256 _newThreshold) external onlyAdmin {
        require(_newThreshold >= 1 && _newThreshold <= 300, "Invalid threshold");
        processingThreshold = _newThreshold;
    }
    
    /**
     * @dev Transfer admin role
     * @param _newAdmin Address of new admin
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");
        admin = _newAdmin;
    }
    
    /**
     * @dev Get contract addresses for integration
     * @return sensorRegistryAddr Address of sensor registry contract
     * @return damageAssessmentAddr Address of damage assessment contract
     * @return emergencyResponseAddr Address of emergency response contract
     */
    function getContractAddresses() 
        external 
        view 
        returns (
            address sensorRegistryAddr,
            address damageAssessmentAddr,
            address emergencyResponseAddr
        ) 
    {
        return (
            address(sensorRegistry),
            address(damageAssessment),
            address(emergencyResponse)
        );
    }
    
    /**
     * @dev Get sensor processing history
     * @param _sensorId Sensor identifier
     * @return lastProcessed Last processing timestamp
     * @return totalProcessed Total times this sensor was processed
     * @return canProcess Whether sensor can be processed now
     */
    function getSensorProcessingInfo(string memory _sensorId) 
        external 
        view 
        returns (
            uint256 lastProcessed,
            uint256 totalProcessed,
            bool canProcess
        ) 
    {
        lastProcessed = lastProcessedTime[_sensorId];
        
        // This is a simplified implementation
        // In a real system, you'd track individual sensor processing counts
        totalProcessed = sensorData[_sensorId].isProcessed ? 1 : 0;
        
        canProcess = sensorRegistry.isSensorActive(_sensorId) && 
                    (block.timestamp - lastProcessed >= processingThreshold);
    }
    
    /**
     * @dev Get real-time system overview
     * @return systemStatus Current system status
     * @return activeAlerts Number of active alerts
     * @return processingRate Events processed per hour
     * @return responseEfficiency Emergency response efficiency percentage
     */
    function getSystemOverview() 
        external 
        view 
        returns (
            string memory systemStatus,
            uint256 activeAlerts,
            uint256 processingRate,
            uint8 responseEfficiency
        ) 
    {
        // Determine system status
        if (totalEmergencyEvents > 0) {
            systemStatus = "ALERT";
        } else if (totalProcessedEvents > 0) {
            systemStatus = "OPERATIONAL";
        } else {
            systemStatus = "STANDBY";
        }
        
        // Active alerts (simplified - count active emergencies)
        (,activeAlerts,) = emergencyResponse.getEmergencyStats();
        
        // Processing rate (events per hour)
        uint256 hoursRunning = (block.timestamp - systemStartTime) / 3600;
        processingRate = hoursRunning > 0 ? totalProcessedEvents / hoursRunning : 0;
        
        // Response efficiency (simplified calculation)
        responseEfficiency = totalEmergencyEvents > 0 ? 
            uint8((totalEmergencyEvents * 100) / (totalEmergencyEvents + 1)) : 100;
    }
}
