// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title RUPTURA Simple Smart Contract
 * @dev A simplified earthquake monitoring and emergency response system
 * @author Yusuf Örnek - İstanbul Üniversitesi, Yönetim Bilişim Sistemleri
 */
contract RupturaSimple {
    
    // Contract owner (system administrator)
    address public owner;
    
    // Sensor data structure
    struct SensorData {
        string sensorId;
        uint256 displacement;      // in millimeters
        uint8 jmaIntensity;       // JMA scale 0-7
        bool collapseFlag;        // structural collapse detected
        uint256 timestamp;
        bool isProcessed;
    }
    
    // Damage assessment result
    struct DamageAssessment {
        uint8 damageLevel;        // 1-5 scale
        uint8 urgencyScore;       // 0-100 scale
        string[] responseTeams;   // required emergency teams
        bool cbsNotified;         // crisis system notified
        uint256 processedAt;
    }
    
    // Emergency response teams
    enum ResponseTeam {
        MONITORING,
        SECURITY_PATROL,
        STRUCTURAL_INSPECTION,
        AFAD_COORDINATION,
        MEDICAL_TEAMS,
        AKUT_SEARCH_RESCUE,
        FIRE_DEPARTMENT,
        EMERGENCY_HELICOPTER
    }
    
    // Storage mappings
    mapping(string => SensorData) public sensorReadings;
    mapping(string => DamageAssessment) public damageAssessments;
    mapping(string => bool) public activeSensors;
    
    // Arrays for tracking
    string[] public sensorIds;
    uint256 public totalProcessedEvents;
    uint256 public emergencyTriggeredCount;
    
    // Events for monitoring
    event SensorDataReceived(
        string indexed sensorId,
        uint256 displacement,
        uint8 jmaIntensity,
        bool collapseFlag,
        uint256 timestamp
    );
    
    event DamageAssessed(
        string indexed sensorId,
        uint8 damageLevel,
        uint8 urgencyScore,
        string[] responseTeams,
        uint256 timestamp
    );
    
    event EmergencyTriggered(
        string indexed sensorId,
        uint8 damageLevel,
        string message,
        uint256 timestamp
    );
    
    event CBSNotificationSent(
        string indexed sensorId,
        uint8 damageLevel,
        uint8 urgencyScore,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier validSensor(string memory _sensorId) {
        require(bytes(_sensorId).length > 0, "Invalid sensor ID");
        _;
    }
    
    modifier validJMAIntensity(uint8 _intensity) {
        require(_intensity >= 1 && _intensity <= 7, "JMA intensity must be 1-7");
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
        totalProcessedEvents = 0;
        emergencyTriggeredCount = 0;
    }
    
    /**
     * @dev Register a new sensor to the system
     * @param _sensorId Unique identifier for the sensor
     */
    function registerSensor(string memory _sensorId) 
        public 
        onlyOwner 
        validSensor(_sensorId) 
    {
        require(!activeSensors[_sensorId], "Sensor already registered");
        
        activeSensors[_sensorId] = true;
        sensorIds.push(_sensorId);
    }
    
    /**
     * @dev Process incoming sensor data and assess damage
     * @param _sensorId Sensor identifier
     * @param _displacement Structural displacement in mm
     * @param _jmaIntensity JMA seismic intensity (1-7)
     * @param _collapseFlag Whether structural collapse is detected
     */
    function processSensorData(
        string memory _sensorId,
        uint256 _displacement,
        uint8 _jmaIntensity,
        bool _collapseFlag
    ) 
        public 
        validSensor(_sensorId) 
        validJMAIntensity(_jmaIntensity)
    {
        require(activeSensors[_sensorId], "Sensor not registered");
        
        // Store sensor data
        sensorReadings[_sensorId] = SensorData({
            sensorId: _sensorId,
            displacement: _displacement,
            jmaIntensity: _jmaIntensity,
            collapseFlag: _collapseFlag,
            timestamp: block.timestamp,
            isProcessed: false
        });
        
        // Emit sensor data received event
        emit SensorDataReceived(
            _sensorId,
            _displacement,
            _jmaIntensity,
            _collapseFlag,
            block.timestamp
        );
        
        // Assess damage and trigger responses
        _assessDamageAndRespond(_sensorId);
        
        // Mark as processed
        sensorReadings[_sensorId].isProcessed = true;
        totalProcessedEvents++;
    }
    
    /**
     * @dev Internal function to assess damage and coordinate response
     * @param _sensorId Sensor identifier
     */
    function _assessDamageAndRespond(string memory _sensorId) internal {
        SensorData memory data = sensorReadings[_sensorId];
        
        // Calculate damage level (1-5 scale)
        uint8 damageLevel = _calculateDamageLevel(
            data.displacement,
            data.jmaIntensity,
            data.collapseFlag
        );
        
        // Calculate urgency score (0-100)
        uint8 urgencyScore = _calculateUrgencyScore(damageLevel);
        
        // Determine required response teams
        string[] memory responseTeams = _determineResponseTeams(damageLevel, urgencyScore);
        
        // Check if CBS notification required
        bool cbsRequired = damageLevel >= 2;
        
        // Store damage assessment
        damageAssessments[_sensorId] = DamageAssessment({
            damageLevel: damageLevel,
            urgencyScore: urgencyScore,
            responseTeams: responseTeams,
            cbsNotified: cbsRequired,
            processedAt: block.timestamp
        });
        
        // Emit damage assessment event
        emit DamageAssessed(
            _sensorId,
            damageLevel,
            urgencyScore,
            responseTeams,
            block.timestamp
        );
        
        // Trigger emergency response if needed
        if (damageLevel >= 4) {
            _triggerEmergencyResponse(_sensorId, damageLevel);
        }
        
        // Send CBS notification if required
        if (cbsRequired) {
            _sendCBSNotification(_sensorId, damageLevel, urgencyScore);
        }
    }
    
    /**
     * @dev Calculate damage level based on sensor readings
     * Algorithm: JMA intensity and displacement-based assessment
     */
    function _calculateDamageLevel(
        uint256 _displacement,
        uint8 _jmaIntensity,
        bool _collapseFlag
    ) internal pure returns (uint8) {
        // Level 5: Structural collapse detected
        if (_collapseFlag) {
            return 5;
        }
        
        // Level 4: Severe damage (JMA 6+ or displacement > 80mm)
        if (_jmaIntensity >= 6 || _displacement > 80) {
            return 4;
        }
        
        // Level 3: Moderate damage (JMA 5+ or displacement > 50mm)
        if (_jmaIntensity >= 5 || _displacement > 50) {
            return 3;
        }
        
        // Level 2: Light damage (JMA 4+ or displacement > 20mm)
        if (_jmaIntensity >= 4 || _displacement > 20) {
            return 2;
        }
        
        // Level 1: Minimal damage
        return 1;
    }
    
    /**
     * @dev Calculate urgency score (0-100 scale)
     */
    function _calculateUrgencyScore(uint8 _damageLevel) internal pure returns (uint8) {
        // Base score calculation
        uint8 baseScore = _damageLevel * 20;
        
        // Cap at 100
        return baseScore > 100 ? 100 : baseScore;
    }
    
    /**
     * @dev Determine required emergency response teams
     */
    function _determineResponseTeams(
        uint8 _damageLevel,
        uint8 _urgencyScore
    ) internal pure returns (string[] memory) {
        string[] memory teams;
        
        if (_damageLevel == 5) {
            // Critical: All emergency services
            teams = new string[](5);
            teams[0] = "AKUT Search & Rescue";
            teams[1] = "Fire Department";
            teams[2] = "AFAD Coordination";
            teams[3] = "Medical Teams";
            teams[4] = "Emergency Helicopter";
        } else if (_damageLevel == 4) {
            // Severe: Major emergency response
            teams = new string[](3);
            teams[0] = "AFAD Coordination";
            teams[1] = "Medical Teams";
            teams[2] = "AKUT Search & Rescue";
        } else if (_damageLevel == 3) {
            // Moderate: Inspection and medical check
            teams = new string[](2);
            teams[0] = "Structural Inspection";
            teams[1] = "Medical Teams";
        } else if (_damageLevel == 2) {
            // Light: Security patrol
            teams = new string[](1);
            teams[0] = "Security Patrol";
        } else {
            // Minimal: Monitoring only
            teams = new string[](1);
            teams[0] = "Monitoring";
        }
        
        return teams;
    }
    
    /**
     * @dev Trigger emergency response for critical situations
     */
    function _triggerEmergencyResponse(string memory _sensorId, uint8 _damageLevel) internal {
        emergencyTriggeredCount++;
        
        string memory message = _damageLevel == 5 
            ? "CRITICAL: Structural collapse detected - Full emergency response activated"
            : "SEVERE: Major structural damage - Emergency response activated";
        
        emit EmergencyTriggered(_sensorId, _damageLevel, message, block.timestamp);
    }
    
    /**
     * @dev Send notification to Crisis Information System (CBS)
     */
    function _sendCBSNotification(
        string memory _sensorId,
        uint8 _damageLevel,
        uint8 _urgencyScore
    ) internal {
        emit CBSNotificationSent(_sensorId, _damageLevel, _urgencyScore, block.timestamp);
    }
    
    // View functions for querying data
    
    /**
     * @dev Get sensor data by ID
     */
    function getSensorData(string memory _sensorId) 
        public 
        view 
        returns (SensorData memory) 
    {
        return sensorReadings[_sensorId];
    }
    
    /**
     * @dev Get damage assessment by sensor ID
     */
    function getDamageAssessment(string memory _sensorId) 
        public 
        view 
        returns (DamageAssessment memory) 
    {
        return damageAssessments[_sensorId];
    }
    
    /**
     * @dev Get system statistics
     */
    function getSystemStats() 
        public 
        view 
        returns (
            uint256 totalSensors,
            uint256 totalEvents,
            uint256 emergencyEvents
        ) 
    {
        return (sensorIds.length, totalProcessedEvents, emergencyTriggeredCount);
    }
    
    /**
     * @dev Get all registered sensor IDs
     */
    function getAllSensorIds() public view returns (string[] memory) {
        return sensorIds;
    }
    
    /**
     * @dev Check if sensor is active
     */
    function isSensorActive(string memory _sensorId) public view returns (bool) {
        return activeSensors[_sensorId];
    }
}
