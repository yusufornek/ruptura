// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IRuptura.sol";

/**
 * @title EmergencyResponse
 * @dev Emergency response coordination and team management system
 */
contract EmergencyResponse is IEmergencyResponse {
    
    address public coordinator;
    
    // Response team configurations
    mapping(ResponseTeam => TeamConfig) private teamConfigs;
    
    // Response plans by damage level
    mapping(uint8 => ResponsePlan) private responsePlans;
    
    // Active emergency responses
    mapping(string => EmergencyCase) private activeCases;
    
    // Response team availability
    mapping(ResponseTeam => bool) public teamAvailability;
    
    // Emergency case tracking
    string[] public activeCaseIds;
    uint256 public totalEmergencies;
    
    struct TeamConfig {
        string name;
        uint256 responseTime; // in minutes
        uint8 capacity; // number of concurrent cases
        bool isActive;
    }
    
    struct EmergencyCase {
        string sensorId;
        uint8 damageLevel;
        uint8 urgencyScore;
        ResponseTeam[] assignedTeams;
        uint256 triggeredAt;
        uint256 responseTime;
        bool isResolved;
        string status;
    }
    
    event ResponseTeamAssigned(
        string indexed sensorId,
        ResponseTeam indexed team,
        uint256 estimatedArrival
    );
    
    event EmergencyResolved(
        string indexed sensorId,
        uint256 responseTime,
        ResponseTeam[] teams
    );
    
    event CBSNotified(
        string indexed sensorId,
        uint8 damageLevel,
        uint8 urgencyScore,
        uint256 timestamp
    );
    
    modifier onlyCoordinator() {
        require(msg.sender == coordinator, "Only coordinator can call this function");
        _;
    }
    
    modifier validDamageLevel(uint8 _damageLevel) {
        require(_damageLevel >= 1 && _damageLevel <= 5, "Invalid damage level");
        _;
    }
    
    constructor() {
        coordinator = msg.sender;
        _initializeTeamConfigs();
        _initializeResponsePlans();
        _initializeTeamAvailability();
    }
    
    /**
     * @dev Initialize emergency response team configurations
     */
    function _initializeTeamConfigs() private {
        teamConfigs[ResponseTeam.MONITORING] = TeamConfig({
            name: "Monitoring Team",
            responseTime: 5,
            capacity: 10,
            isActive: true
        });
        
        teamConfigs[ResponseTeam.SECURITY_PATROL] = TeamConfig({
            name: "Security Patrol",
            responseTime: 15,
            capacity: 5,
            isActive: true
        });
        
        teamConfigs[ResponseTeam.STRUCTURAL_INSPECTION] = TeamConfig({
            name: "Structural Inspection Team",
            responseTime: 30,
            capacity: 3,
            isActive: true
        });
        
        teamConfigs[ResponseTeam.AFAD_COORDINATION] = TeamConfig({
            name: "AFAD Coordination Center",
            responseTime: 10,
            capacity: 8,
            isActive: true
        });
        
        teamConfigs[ResponseTeam.MEDICAL_TEAMS] = TeamConfig({
            name: "Medical Emergency Teams",
            responseTime: 12,
            capacity: 4,
            isActive: true
        });
        
        teamConfigs[ResponseTeam.SEARCH_RESCUE] = TeamConfig({
            name: "AKUT Search & Rescue",
            responseTime: 25,
            capacity: 2,
            isActive: true
        });
        
        teamConfigs[ResponseTeam.FIRE_DEPARTMENT] = TeamConfig({
            name: "Fire Department",
            responseTime: 8,
            capacity: 6,
            isActive: true
        });
        
        teamConfigs[ResponseTeam.EMERGENCY_HELICOPTER] = TeamConfig({
            name: "Emergency Helicopter",
            responseTime: 20,
            capacity: 1,
            isActive: true
        });
    }
    
    /**
     * @dev Initialize response plans for different damage levels
     */
    function _initializeResponsePlans() private {
        // Level 1: Minimal damage
        ResponseTeam[] memory level1Teams = new ResponseTeam[](1);
        level1Teams[0] = ResponseTeam.MONITORING;
        responsePlans[1] = ResponsePlan({
            teams: level1Teams,
            priority: 1,
            estimatedResponseTime: 5,
            cbsNotificationRequired: false
        });
        
        // Level 2: Light damage
        ResponseTeam[] memory level2Teams = new ResponseTeam[](1);
        level2Teams[0] = ResponseTeam.SECURITY_PATROL;
        responsePlans[2] = ResponsePlan({
            teams: level2Teams,
            priority: 2,
            estimatedResponseTime: 15,
            cbsNotificationRequired: true
        });
        
        // Level 3: Moderate damage
        ResponseTeam[] memory level3Teams = new ResponseTeam[](2);
        level3Teams[0] = ResponseTeam.STRUCTURAL_INSPECTION;
        level3Teams[1] = ResponseTeam.MEDICAL_TEAMS;
        responsePlans[3] = ResponsePlan({
            teams: level3Teams,
            priority: 3,
            estimatedResponseTime: 30,
            cbsNotificationRequired: true
        });
        
        // Level 4: Severe damage
        ResponseTeam[] memory level4Teams = new ResponseTeam[](3);
        level4Teams[0] = ResponseTeam.AFAD_COORDINATION;
        level4Teams[1] = ResponseTeam.MEDICAL_TEAMS;
        level4Teams[2] = ResponseTeam.SEARCH_RESCUE;
        responsePlans[4] = ResponsePlan({
            teams: level4Teams,
            priority: 4,
            estimatedResponseTime: 25,
            cbsNotificationRequired: true
        });
        
        // Level 5: Critical damage
        ResponseTeam[] memory level5Teams = new ResponseTeam[](5);
        level5Teams[0] = ResponseTeam.SEARCH_RESCUE;
        level5Teams[1] = ResponseTeam.FIRE_DEPARTMENT;
        level5Teams[2] = ResponseTeam.AFAD_COORDINATION;
        level5Teams[3] = ResponseTeam.MEDICAL_TEAMS;
        level5Teams[4] = ResponseTeam.EMERGENCY_HELICOPTER;
        responsePlans[5] = ResponsePlan({
            teams: level5Teams,
            priority: 5,
            estimatedResponseTime: 20,
            cbsNotificationRequired: true
        });
    }
    
    /**
     * @dev Initialize team availability status
     */
    function _initializeTeamAvailability() private {
        teamAvailability[ResponseTeam.MONITORING] = true;
        teamAvailability[ResponseTeam.SECURITY_PATROL] = true;
        teamAvailability[ResponseTeam.STRUCTURAL_INSPECTION] = true;
        teamAvailability[ResponseTeam.AFAD_COORDINATION] = true;
        teamAvailability[ResponseTeam.MEDICAL_TEAMS] = true;
        teamAvailability[ResponseTeam.SEARCH_RESCUE] = true;
        teamAvailability[ResponseTeam.FIRE_DEPARTMENT] = true;
        teamAvailability[ResponseTeam.EMERGENCY_HELICOPTER] = true;
    }
    
    /**
     * @dev Trigger emergency response for earthquake damage
     * @param _sensorId Sensor identifier that detected the damage
     * @param _damageLevel Assessed damage level (1-5)
     * @param _urgencyScore Calculated urgency score (0-100)
     */
    function triggerEmergencyResponse(
        string memory _sensorId,
        uint8 _damageLevel,
        uint8 _urgencyScore
    ) external validDamageLevel(_damageLevel) {
        require(bytes(_sensorId).length > 0, "Invalid sensor ID");
        require(!activeCases[_sensorId].triggeredAt != 0, "Emergency already active for this sensor");
        
        // Get response plan for damage level
        ResponsePlan memory plan = responsePlans[_damageLevel];
        
        // Create emergency case
        activeCases[_sensorId] = EmergencyCase({
            sensorId: _sensorId,
            damageLevel: _damageLevel,
            urgencyScore: _urgencyScore,
            assignedTeams: plan.teams,
            triggeredAt: block.timestamp,
            responseTime: plan.estimatedResponseTime,
            isResolved: false,
            status: "ACTIVE"
        });
        
        activeCaseIds.push(_sensorId);
        totalEmergencies++;
        
        // Assign response teams
        for (uint256 i = 0; i < plan.teams.length; i++) {
            ResponseTeam team = plan.teams[i];
            if (teamAvailability[team] && teamConfigs[team].isActive) {
                uint256 estimatedArrival = block.timestamp + (teamConfigs[team].responseTime * 1 minutes);
                emit ResponseTeamAssigned(_sensorId, team, estimatedArrival);
            }
        }
        
        // Send CBS notification if required
        if (plan.cbsNotificationRequired) {
            _sendCBSNotification(_sensorId, _damageLevel, _urgencyScore);
        }
        
        emit EmergencyTriggered(_sensorId, _damageLevel, plan.teams, block.timestamp);
    }
    
    /**
     * @dev Resolve an active emergency case
     * @param _sensorId Sensor identifier
     * @param _responseTime Actual response time in minutes
     */
    function resolveEmergency(
        string memory _sensorId,
        uint256 _responseTime
    ) external onlyCoordinator {
        require(activeCases[_sensorId].triggeredAt != 0, "Emergency case not found");
        require(!activeCases[_sensorId].isResolved, "Emergency already resolved");
        
        activeCases[_sensorId].isResolved = true;
        activeCases[_sensorId].responseTime = _responseTime;
        activeCases[_sensorId].status = "RESOLVED";
        
        emit EmergencyResolved(
            _sensorId,
            _responseTime,
            activeCases[_sensorId].assignedTeams
        );
        
        // Remove from active cases
        _removeActiveCaseId(_sensorId);
    }
    
    /**
     * @dev Get response plan for specific damage level
     * @param _damageLevel Damage level (1-5)
     * @return ResponsePlan containing team assignments and configuration
     */
    function getResponsePlan(uint8 _damageLevel) 
        external 
        view 
        validDamageLevel(_damageLevel)
        returns (ResponsePlan memory) 
    {
        return responsePlans[_damageLevel];
    }
    
    /**
     * @dev Get emergency case details
     * @param _sensorId Sensor identifier
     * @return EmergencyCase struct with case details
     */
    function getEmergencyCase(string memory _sensorId) 
        external 
        view 
        returns (EmergencyCase memory) 
    {
        return activeCases[_sensorId];
    }
    
    /**
     * @dev Get team configuration
     * @param _team Response team enum
     * @return TeamConfig struct with team details
     */
    function getTeamConfig(ResponseTeam _team) 
        external 
        view 
        returns (TeamConfig memory) 
    {
        return teamConfigs[_team];
    }
    
    /**
     * @dev Update team availability status
     * @param _team Response team
     * @param _available Availability status
     */
    function setTeamAvailability(
        ResponseTeam _team, 
        bool _available
    ) external onlyCoordinator {
        teamAvailability[_team] = _available;
    }
    
    /**
     * @dev Update team configuration
     * @param _team Response team
     * @param _responseTime Response time in minutes
     * @param _capacity Team capacity
     * @param _isActive Active status
     */
    function updateTeamConfig(
        ResponseTeam _team,
        uint256 _responseTime,
        uint8 _capacity,
        bool _isActive
    ) external onlyCoordinator {
        teamConfigs[_team].responseTime = _responseTime;
        teamConfigs[_team].capacity = _capacity;
        teamConfigs[_team].isActive = _isActive;
    }
    
    /**
     * @dev Get all active emergency case IDs
     * @return string[] array of active case sensor IDs
     */
    function getActiveCases() external view returns (string[] memory) {
        return activeCaseIds;
    }
    
    /**
     * @dev Get emergency response statistics
     * @return totalCases Total number of emergency cases
     * @return activeCases Number of currently active cases
     * @return averageResponseTime Average response time across all cases
     */
    function getEmergencyStats() 
        external 
        view 
        returns (
            uint256 totalCases,
            uint256 activeCases,
            uint256 averageResponseTime
        ) 
    {
        totalCases = totalEmergencies;
        activeCases = activeCaseIds.length;
        
        // Calculate average response time (simplified)
        if (totalCases > 0) {
            averageResponseTime = 20; // Placeholder - in real implementation, calculate from resolved cases
        }
    }
    
    /**
     * @dev Send notification to Crisis Information System (CBS)
     * @param _sensorId Sensor identifier
     * @param _damageLevel Damage level
     * @param _urgencyScore Urgency score
     */
    function _sendCBSNotification(
        string memory _sensorId,
        uint8 _damageLevel,
        uint8 _urgencyScore
    ) private {
        emit CBSNotified(_sensorId, _damageLevel, _urgencyScore, block.timestamp);
    }
    
    /**
     * @dev Remove sensor ID from active cases array
     * @param _sensorId Sensor identifier to remove
     */
    function _removeActiveCaseId(string memory _sensorId) private {
        for (uint256 i = 0; i < activeCaseIds.length; i++) {
            if (keccak256(bytes(activeCaseIds[i])) == keccak256(bytes(_sensorId))) {
                activeCaseIds[i] = activeCaseIds[activeCaseIds.length - 1];
                activeCaseIds.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Transfer coordinator role
     * @param _newCoordinator Address of new coordinator
     */
    function transferCoordinator(address _newCoordinator) external onlyCoordinator {
        require(_newCoordinator != address(0), "Invalid address");
        coordinator = _newCoordinator;
    }
    
    /**
     * @dev Emergency override to manually assign teams
     * @param _sensorId Sensor identifier
     * @param _teams Array of teams to assign
     */
    function emergencyOverride(
        string memory _sensorId,
        ResponseTeam[] memory _teams
    ) external onlyCoordinator {
        require(activeCases[_sensorId].triggeredAt != 0, "Emergency case not found");
        
        activeCases[_sensorId].assignedTeams = _teams;
        
        for (uint256 i = 0; i < _teams.length; i++) {
            uint256 estimatedArrival = block.timestamp + (teamConfigs[_teams[i]].responseTime * 1 minutes);
            emit ResponseTeamAssigned(_sensorId, _teams[i], estimatedArrival);
        }
    }
    
    /**
     * @dev Get response team name
     * @param _team Response team enum
     * @return string team name
     */
    function getTeamName(ResponseTeam _team) external view returns (string memory) {
        return teamConfigs[_team].name;
    }
    
    /**
     * @dev Batch resolve multiple emergencies
     * @param _sensorIds Array of sensor IDs to resolve
     * @param _responseTimes Array of response times
     */
    function batchResolveEmergencies(
        string[] memory _sensorIds,
        uint256[] memory _responseTimes
    ) external onlyCoordinator {
        require(_sensorIds.length == _responseTimes.length, "Array lengths must match");
        
        for (uint256 i = 0; i < _sensorIds.length; i++) {
            if (activeCases[_sensorIds[i]].triggeredAt != 0 && !activeCases[_sensorIds[i]].isResolved) {
                activeCases[_sensorIds[i]].isResolved = true;
                activeCases[_sensorIds[i]].responseTime = _responseTimes[i];
                activeCases[_sensorIds[i]].status = "RESOLVED";
                
                emit EmergencyResolved(
                    _sensorIds[i],
                    _responseTimes[i],
                    activeCases[_sensorIds[i]].assignedTeams
                );
                
                _removeActiveCaseId(_sensorIds[i]);
            }
        }
    }
}
