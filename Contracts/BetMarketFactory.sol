// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./BetCampaign.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title BetMarketFactory
 * @notice Trustless factory: anyone can deploy a BetCampaign. On creation,
 *         the caller pays a fixed USDC "creation stake". Factory pulls it
 *         from the creator (requires prior approval), then:
 *           - sends 95% to the new campaign and records it as initial pot
 *           - sends 5% to the treasury
 */
contract BetMarketFactory {
    using SafeERC20 for IERC20;

    event CampaignDeployed(
        uint256 indexed id,
        address indexed creator,
        address campaignAddress,
        uint64 endTime,
        uint16 feeBps,
        uint256 creationStake,
        uint256 toCampaign,
        uint256 toTreasury
    );

    IERC20  public immutable usdc;          // USDC token
    address public immutable treasury;      // protocol fee receiver
    address public immutable oracle;        // backend/oracle

    uint256 public immutable creationStake; // amount of USDC required from creator

    // 95% to campaign initial pool, 5% to treasury
    uint16 public constant CREATION_TO_POOL_BPS    = 9500;
    uint16 public constant CREATION_TO_TREASURY_BPS= 500;

    uint256 public nextId = 1;
    mapping(uint256 => address) public campaigns; // id => campaign address

    constructor(
        address _usdc,
        address _treasury,
        address _oracle,
        uint256 _creationStake
    ) {
        require(_usdc != address(0), "usdc=0");
        require(_treasury != address(0), "treasury=0");
        require(_oracle != address(0), "oracle=0");
        require(_creationStake > 0, "stake=0");

        usdc           = IERC20(_usdc);
        treasury       = _treasury;
        oracle         = _oracle;
        creationStake  = _creationStake;
    }

    /**
     * @notice Deploy a new BetCampaign. Caller (msg.sender) becomes the creator.
     *         Requires caller to have approved `creationStake` USDC to this factory.
     *         Factory will split 95/5: to campaign initial pot / treasury.
     */
    function createCampaign(
        string memory name,
        string memory symbol,
        uint64 endTime,
        uint16 feeBps
    ) external returns (address campaign) {
        // 1) Deploy campaign (records factory as deployer)
        uint256 id = nextId++;
        BetCampaign c = new BetCampaign(
            msg.sender,   // creator is the caller
            address(usdc),
            treasury,
            oracle,
            name,
            symbol,
            endTime,
            feeBps
        );
        campaigns[id] = address(c);

        // 2) Pull creation stake from creator (must be approved to factory)
        usdc.safeTransferFrom(msg.sender, address(this), creationStake);

        // 3) Split 95/5
        uint256 toTreasury = (creationStake * CREATION_TO_TREASURY_BPS) / 10_000;
        uint256 toCampaign = creationStake - toTreasury;

        // 4) Send funds
        if (toTreasury > 0) usdc.safeTransfer(treasury, toTreasury);
        if (toCampaign > 0) {
            usdc.safeTransfer(address(c), toCampaign);
            // 5) Notify campaign to record initial pot
            c.seedInitialPot(toCampaign);
        }

        emit CampaignDeployed(
            id,
            msg.sender,
            address(c),
            endTime,
            feeBps,
            creationStake,
            toCampaign,
            toTreasury
        );

        return address(c);
    }

    function getCampaign(uint256 id) external view returns (address) {
        return campaigns[id];
    }
}
