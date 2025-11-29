// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ENSSubdomainRegistrar
 * @dev Contract for registering ENS subdomains under a parent domain
 * This contract allows users to claim subdomains like alice.ourapp.eth
 */
interface IENSRegistry {
    function setSubnodeRecord(
        bytes32 node,
        bytes32 label,
        address owner,
        address resolver,
        uint64 ttl
    ) external;
    
    function setResolver(bytes32 node, address resolver) external;
}

interface IENSResolver {
    function setAddr(bytes32 node, address a) external;
    function addr(bytes32 node) external view returns (address);
}

contract ENSSubdomainRegistrar is Ownable {
    IENSRegistry public immutable ensRegistry;
    IENSResolver public immutable resolver;
    bytes32 public immutable parentNode;
    
    // Mapping of subdomain label hash to owner
    mapping(bytes32 => address) public subdomainOwners;
    
    // Mapping of subdomain label hash to registration timestamp
    mapping(bytes32 => uint256) public registrationTime;
    
    // Fee for registration (can be set by owner)
    uint256 public registrationFee;
    
    event SubdomainRegistered(
        bytes32 indexed label,
        string name,
        address indexed owner,
        address indexed resolver
    );
    
    constructor(
        address _ensRegistry,
        address _resolver,
        bytes32 _parentNode,
        address initialOwner
    ) Ownable(initialOwner) {
        ensRegistry = IENSRegistry(_ensRegistry);
        resolver = IENSResolver(_resolver);
        parentNode = _parentNode;
        registrationFee = 0; // Free by default
    }
    
    /**
     * @dev Register a subdomain
     * @param label The subdomain label (e.g., "alice" for alice.ourapp.eth)
     * @param owner The address that will own the subdomain
     */
    function registerSubdomain(string memory label, address owner) external payable {
        require(msg.value >= registrationFee, "Insufficient fee");
        
        bytes32 labelHash = keccak256(bytes(label));
        
        // Check if subdomain is already registered
        require(subdomainOwners[labelHash] == address(0), "Subdomain already registered");
        
        // Validate label (basic check)
        require(bytes(label).length >= 3 && bytes(label).length <= 20, "Invalid label length");
        
        // Register subdomain with ENS
        ensRegistry.setSubnodeRecord(
            parentNode,
            labelHash,
            owner,
            address(resolver),
            0 // TTL = 0 means use default
        );
        
        // Set address in resolver
        bytes32 node = keccak256(abi.encodePacked(parentNode, labelHash));
        resolver.setAddr(node, owner);
        
        // Record ownership
        subdomainOwners[labelHash] = owner;
        registrationTime[labelHash] = block.timestamp;
        
        emit SubdomainRegistered(labelHash, label, owner, address(resolver));
        
        // Refund excess payment
        if (msg.value > registrationFee) {
            payable(msg.sender).transfer(msg.value - registrationFee);
        }
    }
    
    /**
     * @dev Check if a subdomain is available
     * @param label The subdomain label to check
     * @return true if available
     */
    function isAvailable(string memory label) external view returns (bool) {
        bytes32 labelHash = keccak256(bytes(label));
        return subdomainOwners[labelHash] == address(0);
    }
    
    /**
     * @dev Get owner of a subdomain
     * @param label The subdomain label
     * @return The owner address
     */
    function getSubdomainOwner(string memory label) external view returns (address) {
        bytes32 labelHash = keccak256(bytes(label));
        return subdomainOwners[labelHash];
    }
    
    /**
     * @dev Set registration fee (only owner)
     * @param _fee New registration fee in wei
     */
    function setRegistrationFee(uint256 _fee) external onlyOwner {
        registrationFee = _fee;
    }
    
    /**
     * @dev Withdraw collected fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

