// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IRuptura Interface
 * @dev Core interface definitions for RUPTURA earthquake monitoring system
 */

interface ISensorRegistry {
    struct SensorInfo {
        string sensorId;
        string location;
        bool isActive;
        uint256 registeredAt;
        address owner;
    }
    
    event SensorRegistered(string indexed sensorId, string location, address owner);
    event SensorDeactivated(string indexed sensorId);
    
    function registerSensor(string memory _sensorId, string memory _location) external;
    function deactivateSensor(string memory _sensorId) external;
    function getSensorInfo(string memory _sensorId) external view returns (SensorInfo memory);
    function isSensorActive(string memory _sensorId) external view returns (bool);
}

interface IDamageAssessment {
    struct AssessmentResult {
        uint8 damageLevel;
        uint8 urgencyScore;
        uint256 confidence;
        uint256 timestamp;
        bool requiresEmergencyResponse;
    }
    
    event DamageAssessed(
        string indexed sensorId,
        uint8 damageLevel,
        uint8 urgencyScore,
        uint256 confidence
    );
    
    function assessDamage(
        uint256 _displacement,
        uint8 _jmaIntensity,
        bool _collapseFlag,
        string memory _buildingType
    ) external pure returns (AssessmentResult memory);
    
    function calculateUrgencyScore(uint8 _damageLevel, string memory _buildingType) 
        external pure returns (uint8);
}

interface IEmergencyResponse {
    enum ResponseTeam {
        MONITORING,
        SECURITY_PATROL,
        STRUCTURAL_INSPECTION,
        AFAD_COORDINATION,
        MEDICAL_TEAMS,
        SEARCH_RESCUE,
        FIRE_DEPARTMENT,
        EMERGENCY_HELICOPTER
    }
    
    struct ResponsePlan {
        ResponseTeam[] teams;
        uint8 priority;
        uint256 estimatedResponseTime;
        bool cbsNotificationRequired;
    }
    
    event EmergencyTriggered(
        string indexed sensorId,
        uint8 damageLevel,
        ResponseTeam[] teams,
        uint256 timestamp
    );
    
    function triggerEmergencyResponse(
        string memory _sensorId,
        uint8 _damageLevel,
        uint8 _urgencyScore
    ) external;
    
    function getResponsePlan(uint8 _damageLevel) 
        external view returns (ResponsePlan memory);
}

interface IRupturaCore {
    struct SensorData {
        string sensorId;
        uint256 displacement;
        uint8 jmaIntensity;
        bool collapseFlag;
        string buildingType;
        uint256 timestamp;
        bool isProcessed;
    }
    
    event SensorDataProcessed(
        string indexed sensorId,
        uint256 displacement,
        uint8 jmaIntensity,
        bool collapseFlag,
        uint256 timestamp
    );
    
    function processSensorData(
        string memory _sensorId,
        uint256 _displacement,
        uint8 _jmaIntensity,
        bool _collapseFlag,
        string memory _buildingType
    ) external;
    
    function getSensorData(string memory _sensorId) 
        external view returns (SensorData memory);
    
    function getSystemStats() 
        external view returns (uint256 totalSensors, uint256 totalEvents, uint256 emergencyEvents);
}
