// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IRuptura.sol";

/**
 * @title DamageAssessment
 * @dev Earthquake damage assessment and urgency calculation system
 */
contract DamageAssessment is IDamageAssessment {
    
    // Building type multipliers for urgency calculation
    mapping(string => uint256) private buildingMultipliers;
    
    // JMA intensity scale thresholds
    mapping(uint8 => string) public jmaDescriptions;
    
    constructor() {
        _initializeBuildingMultipliers();
        _initializeJMADescriptions();
    }
    
    /**
     * @dev Initialize building type multipliers
     */
    function _initializeBuildingMultipliers() private {
        buildingMultipliers["hospital"] = 200;      // 2.0x multiplier
        buildingMultipliers["school"] = 180;        // 1.8x multiplier
        buildingMultipliers["mall"] = 160;          // 1.6x multiplier
        buildingMultipliers["office"] = 120;        // 1.2x multiplier
        buildingMultipliers["residential"] = 100;   // 1.0x multiplier
        buildingMultipliers["industrial"] = 80;     // 0.8x multiplier
    }
    
    /**
     * @dev Initialize JMA intensity descriptions
     */
    function _initializeJMADescriptions() private {
        jmaDescriptions[1] = "Slight earthquake";
        jmaDescriptions[2] = "Weak earthquake";
        jmaDescriptions[3] = "Rather strong earthquake";
        jmaDescriptions[4] = "Strong earthquake";
        jmaDescriptions[5] = "Very strong earthquake";
        jmaDescriptions[6] = "Disastrous earthquake";
        jmaDescriptions[7] = "Destructive earthquake";
    }
    
    /**
     * @dev Assess damage based on sensor readings
     * @param _displacement Structural displacement in millimeters
     * @param _jmaIntensity JMA seismic intensity (1-7)
     * @param _collapseFlag Whether structural collapse is detected
     * @param _buildingType Type of building being monitored
     * @return AssessmentResult containing damage analysis
     */
    function assessDamage(
        uint256 _displacement,
        uint8 _jmaIntensity,
        bool _collapseFlag,
        string memory _buildingType
    ) external pure returns (AssessmentResult memory) {
        require(_jmaIntensity >= 1 && _jmaIntensity <= 7, "Invalid JMA intensity");
        
        // Calculate base damage level
        uint8 damageLevel = _calculateDamageLevel(_displacement, _jmaIntensity, _collapseFlag);
        
        // Calculate urgency score
        uint8 urgencyScore = _calculateUrgencyScoreInternal(damageLevel, _buildingType);
        
        // Calculate confidence based on data quality
        uint256 confidence = _calculateConfidence(_displacement, _jmaIntensity, _collapseFlag);
        
        // Determine if emergency response is required
        bool requiresEmergencyResponse = damageLevel >= 4 || urgencyScore >= 80;
        
        return AssessmentResult({
            damageLevel: damageLevel,
            urgencyScore: urgencyScore,
            confidence: confidence,
            timestamp: block.timestamp,
            requiresEmergencyResponse: requiresEmergencyResponse
        });
    }
    
    /**
     * @dev Calculate damage level using JMA-based algorithm
     * @param _displacement Structural displacement in mm
     * @param _jmaIntensity JMA seismic intensity
     * @param _collapseFlag Structural collapse detected
     * @return uint8 damage level (1-5)
     */
    function _calculateDamageLevel(
        uint256 _displacement,
        uint8 _jmaIntensity,
        bool _collapseFlag
    ) private pure returns (uint8) {
        // Level 5: Structural collapse detected
        if (_collapseFlag) {
            return 5;
        }
        
        // Level 4: Severe damage (JMA 6-7 or very high displacement)
        if (_jmaIntensity >= 6 || _displacement > 100) {
            return 4;
        }
        
        // Level 3: Moderate damage (JMA 5 or high displacement)
        if (_jmaIntensity == 5 || (_displacement > 50 && _jmaIntensity >= 4)) {
            return 3;
        }
        
        // Level 2: Light damage (JMA 4 or moderate displacement)
        if (_jmaIntensity == 4 || (_displacement > 20 && _jmaIntensity >= 3)) {
            return 2;
        }
        
        // Level 1: Minimal damage
        return 1;
    }
    
    /**
     * @dev Calculate urgency score based on damage level and building type
     * @param _damageLevel Calculated damage level (1-5)
     * @param _buildingType Type of building
     * @return uint8 urgency score (0-100)
     */
    function calculateUrgencyScore(
        uint8 _damageLevel, 
        string memory _buildingType
    ) external view returns (uint8) {
        return _calculateUrgencyScoreInternal(_damageLevel, _buildingType);
    }
    
    /**
     * @dev Internal function to calculate urgency score
     */
    function _calculateUrgencyScoreInternal(
        uint8 _damageLevel,
        string memory _buildingType
    ) private view returns (uint8) {
        require(_damageLevel >= 1 && _damageLevel <= 5, "Invalid damage level");
        
        // Base score calculation (damage level * 20)
        uint256 baseScore = uint256(_damageLevel) * 20;
        
        // Apply building type multiplier
        uint256 multiplier = buildingMultipliers[_buildingType];
        if (multiplier == 0) {
            multiplier = 100; // Default multiplier for unknown building types
        }
        
        // Calculate final score
        uint256 finalScore = (baseScore * multiplier) / 100;
        
        // Cap at 100
        return finalScore > 100 ? 100 : uint8(finalScore);
    }
    
    /**
     * @dev Calculate confidence level based on data quality
     * @param _displacement Displacement reading
     * @param _jmaIntensity JMA intensity
     * @param _collapseFlag Collapse detection flag
     * @return uint256 confidence percentage (0-100)
     */
    function _calculateConfidence(
        uint256 _displacement,
        uint8 _jmaIntensity,
        bool _collapseFlag
    ) private pure returns (uint256) {
        uint256 confidence = 50; // Base confidence
        
        // Higher confidence for extreme readings
        if (_collapseFlag) {
            confidence += 30;
        } else if (_jmaIntensity >= 6 || _displacement > 80) {
            confidence += 25;
        } else if (_jmaIntensity >= 4 || _displacement > 40) {
            confidence += 15;
        }
        
        // Additional confidence for consistent readings
        if (_jmaIntensity >= 5 && _displacement > 60) {
            confidence += 10;
        }
        
        return confidence > 100 ? 100 : confidence;
    }
    
    /**
     * @dev Get damage level description
     * @param _damageLevel Damage level (1-5)
     * @return string description of damage level
     */
    function getDamageLevelDescription(uint8 _damageLevel) 
        external 
        pure 
        returns (string memory) 
    {
        if (_damageLevel == 1) return "Minimal damage - Monitoring recommended";
        if (_damageLevel == 2) return "Light damage - Safety inspection required";
        if (_damageLevel == 3) return "Moderate damage - Structural assessment needed";
        if (_damageLevel == 4) return "Severe damage - Emergency response activated";
        if (_damageLevel == 5) return "Critical damage - Full emergency protocol";
        
        return "Invalid damage level";
    }
    
    /**
     * @dev Get JMA intensity description
     * @param _jmaIntensity JMA intensity (1-7)
     * @return string description of JMA intensity
     */
    function getJMADescription(uint8 _jmaIntensity) 
        external 
        view 
        returns (string memory) 
    {
        return jmaDescriptions[_jmaIntensity];
    }
    
    /**
     * @dev Calculate structural safety index
     * @param _displacement Displacement in mm
     * @param _jmaIntensity JMA intensity
     * @return uint8 safety index (0-100, where 100 is safest)
     */
    function calculateStructuralSafetyIndex(
        uint256 _displacement,
        uint8 _jmaIntensity
    ) external pure returns (uint8) {
        require(_jmaIntensity >= 1 && _jmaIntensity <= 7, "Invalid JMA intensity");
        
        uint256 safetyIndex = 100;
        
        // Reduce safety based on JMA intensity
        if (_jmaIntensity >= 7) {
            safetyIndex -= 80;
        } else if (_jmaIntensity >= 6) {
            safetyIndex -= 60;
        } else if (_jmaIntensity >= 5) {
            safetyIndex -= 40;
        } else if (_jmaIntensity >= 4) {
            safetyIndex -= 25;
        } else if (_jmaIntensity >= 3) {
            safetyIndex -= 15;
        }
        
        // Reduce safety based on displacement
        if (_displacement > 100) {
            safetyIndex -= 30;
        } else if (_displacement > 60) {
            safetyIndex -= 20;
        } else if (_displacement > 30) {
            safetyIndex -= 10;
        }
        
        return safetyIndex > 100 ? 0 : uint8(safetyIndex);
    }
    
    /**
     * @dev Get building type multiplier
     * @param _buildingType Type of building
     * @return uint256 multiplier (scaled by 100)
     */
    function getBuildingMultiplier(string memory _buildingType) 
        external 
        view 
        returns (uint256) 
    {
        return buildingMultipliers[_buildingType];
    }
    
    /**
     * @dev Set building type multiplier (for contract upgrades)
     * @param _buildingType Type of building
     * @param _multiplier Multiplier value (scaled by 100)
     */
    function setBuildingMultiplier(
        string memory _buildingType, 
        uint256 _multiplier
    ) external {
        require(_multiplier > 0 && _multiplier <= 300, "Invalid multiplier range");
        buildingMultipliers[_buildingType] = _multiplier;
    }
    
    /**
     * @dev Batch assessment for multiple readings
     * @param _displacements Array of displacement values
     * @param _jmaIntensities Array of JMA intensities
     * @param _collapseFlags Array of collapse flags
     * @param _buildingTypes Array of building types
     * @return AssessmentResult[] array of assessment results
     */
    function batchAssessment(
        uint256[] memory _displacements,
        uint8[] memory _jmaIntensities,
        bool[] memory _collapseFlags,
        string[] memory _buildingTypes
    ) external pure returns (AssessmentResult[] memory) {
        require(
            _displacements.length == _jmaIntensities.length &&
            _jmaIntensities.length == _collapseFlags.length &&
            _collapseFlags.length == _buildingTypes.length,
            "Array lengths must match"
        );
        
        AssessmentResult[] memory results = new AssessmentResult[](_displacements.length);
        
        for (uint256 i = 0; i < _displacements.length; i++) {
            uint8 damageLevel = _calculateDamageLevel(
                _displacements[i], 
                _jmaIntensities[i], 
                _collapseFlags[i]
            );
            
            uint8 urgencyScore = _calculateUrgencyScoreInternal(
                damageLevel, 
                _buildingTypes[i]
            );
            
            uint256 confidence = _calculateConfidence(
                _displacements[i], 
                _jmaIntensities[i], 
                _collapseFlags[i]
            );
            
            results[i] = AssessmentResult({
                damageLevel: damageLevel,
                urgencyScore: urgencyScore,
                confidence: confidence,
                timestamp: block.timestamp,
                requiresEmergencyResponse: damageLevel >= 4 || urgencyScore >= 80
            });
        }
        
        return results;
    }
}
