// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BetCampaign
 * @notice Single campaign for binary betting using USDC and ERC-721 tickets.
 * @dev Deployed only by BetMarketFactory. The factory seeds initial pot.
 */
contract BetCampaign is ERC721, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum Side { FalseSide, TrueSide }
    enum State { Open, Resolved, Canceled }

    struct Ticket {
        uint256 id;
        Side side;
        uint256 stake;
        bool claimed;
    }

    // ---- Immutable params ----
    IERC20  public immutable usdc;
    address public immutable treasury;
    address public immutable oracle;     // backend oracle address
    address public immutable creator;    // campaign owner (EOA who created it)
    address public immutable factory;    // deploying factory

    uint64  public immutable endTime;
    uint16  public immutable feeBps;

    // ---- State ----
    State   public state = State.Open;
    bool    public outcomeTrue;
    uint256 public totalTrue;
    uint256 public totalFalse;
    uint256 public totalInitialPot;      // seeded by factory at creation
    uint256 public protocolFeeAccrued;

    uint256 public nextTicketId = 1;
    mapping(uint256 => Ticket) public tickets;

    // ---- Events ----
    event Joined(address indexed user, uint256 indexed ticketId, Side side, uint256 amount);
    event Resolved(bool outcomeTrue, uint256 pool, uint256 fee);
    event Canceled();
    event Claimed(uint256 indexed ticketId, address indexed user, uint256 payout);
    event Refunded(uint256 indexed ticketId, address indexed user, uint256 amount);
    event InitialPotSeeded(uint256 amount);

    // ---- Constructor ----
    constructor(
        address _creator,
        address _usdc,
        address _treasury,
        address _oracle,
        string memory _name,
        string memory _symbol,
        uint64 _endTime,
        uint16 _feeBps
    ) ERC721(_name, _symbol) Ownable(_creator) {
        require(_creator != address(0), "creator=0");
        require(_usdc != address(0), "usdc=0");
        require(_treasury != address(0), "treasury=0");
        require(_oracle != address(0), "oracle=0");
        require(_feeBps <= 1000, "fee>10%");
        require(_endTime > block.timestamp + 60, "end soon");

        factory  = msg.sender;    // the factory is the deployer
        usdc     = IERC20(_usdc);
        treasury = _treasury;
        oracle   = _oracle;
        creator  = _creator;
        endTime  = _endTime;
        feeBps   = _feeBps;
    }

    // ---- Modifiers ----
    modifier onlyOracle() {
        require(msg.sender == oracle, "not oracle");
        _;
    }
    modifier onlyOpen() {
        require(state == State.Open, "not open");
        _;
    }
    modifier onlyFactory() {
        require(msg.sender == factory, "not factory");
        _;
    }

    // ---- Factory hook to record initial pot (factory already transferred USDC to this contract) ----
    function seedInitialPot(uint256 amount) external onlyFactory {
        require(state == State.Open, "bad state");
        require(amount > 0, "amount=0");
        totalInitialPot += amount;
        emit InitialPotSeeded(amount);
    }

    // ---- Join / Tickets ----
    function join(Side side, uint256 amount) external nonReentrant onlyOpen {
        require(block.timestamp < endTime, "ended");
        require(amount > 0, "amount=0");

        usdc.safeTransferFrom(msg.sender, address(this), amount);

        if (side == Side.TrueSide) totalTrue += amount;
        else totalFalse += amount;

        uint256 ticketId = nextTicketId++;
        _safeMint(msg.sender, ticketId);
        tickets[ticketId] = Ticket(ticketId, side, amount, false);

        emit Joined(msg.sender, ticketId, side, amount);
    }

    // ---- Resolve / Cancel ----
    function resolve(bool _outcomeTrue) external onlyOracle onlyOpen {
        require(block.timestamp >= endTime, "too early");
        state = State.Resolved;
        outcomeTrue = _outcomeTrue;

        uint256 pool = totalTrue + totalFalse + totalInitialPot;
        uint256 fee  = (pool * feeBps) / 10_000;
        protocolFeeAccrued = fee;

        emit Resolved(_outcomeTrue, pool, fee);
    }

    function cancel() external onlyOracle onlyOpen {
        state = State.Canceled;
        emit Canceled();
    }

    // ---- Claim / Refund ----
    function claim(uint256 ticketId) external nonReentrant {
        require(ownerOf(ticketId) == msg.sender, "not owner");
        Ticket storage t = tickets[ticketId];
        require(!t.claimed, "already");
        require(state == State.Resolved, "not resolved");

        bool win = (outcomeTrue && t.side == Side.TrueSide)
                || (!outcomeTrue && t.side == Side.FalseSide);
        require(win, "lose");

        t.claimed = true;
        _burn(ticketId);

        uint256 winnersTot   = outcomeTrue ? totalTrue : totalFalse;
        uint256 pool         = totalTrue + totalFalse + totalInitialPot;
        uint256 fee          = (pool * feeBps) / 10_000;
        uint256 distributable= pool - fee;
        uint256 payout       = (t.stake * distributable) / winnersTot;

        usdc.safeTransfer(msg.sender, payout);
        emit Claimed(ticketId, msg.sender, payout);
    }

    function refund(uint256 ticketId) external nonReentrant {
        require(ownerOf(ticketId) == msg.sender, "not owner");
        Ticket storage t = tickets[ticketId];
        require(!t.claimed, "already");
        require(state == State.Canceled, "not canceled");

        t.claimed = true;
        _burn(ticketId);
        usdc.safeTransfer(msg.sender, t.stake);
        emit Refunded(ticketId, msg.sender, t.stake);
    }

    function withdrawFees() external nonReentrant {
        require(state == State.Resolved, "not resolved");
        uint256 amt = protocolFeeAccrued;
        require(amt > 0, "no fees");
        protocolFeeAccrued = 0;
        usdc.safeTransfer(treasury, amt);
    }
}
