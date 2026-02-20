// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract ReentrancyGuard {
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }
    function _nonReentrantBefore() private {
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }
        _status = ENTERED;
    }
    function _nonReentrantAfter() private {
        _status = NOT_ENTERED;
    }
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function name() external view returns (string memory);
    function decimals() external view returns (uint8);
    function symbol() external view returns (string memory);
    function approve(address spender, uint256 value) external returns (bool);
}
interface IGGWStake {
    function addTokensToBank(uint256 amount) external;
}
contract GGWStakePoolAcumulate is ReentrancyGuard {
    IERC20 public token;
    address public owner;
    address public oracle;
    IGGWStake public stakeContract;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyOwnerOrOracle() {
        require((msg.sender == owner) || (msg.sender == oracle), "Only owner or oracle");
        _;
    }

    uint256 public totalToStakePoolAmount;

    struct StakePoolInfo {
        uint256 date;
        uint256 amount;
    }

    mapping (uint256 => StakePoolInfo) public stakePoolsHistory;
    uint256 public stakePoolsCount;

    constructor(address _token, address _oracle, address _stakeContract) {
        token = IERC20(_token);
        owner = msg.sender;
        oracle = _oracle;
        stakeContract = IGGWStake(_stakeContract);
    }

    event ToStakePool(uint256 date, uint256 amount);
    
    function toStakePool() public nonReentrant onlyOwnerOrOracle {
        uint256 toStakePoolAmount = token.balanceOf(address(this));
        if (toStakePoolAmount > 0) {
            token.approve(address(stakeContract), toStakePoolAmount);
            stakeContract.addTokensToBank(toStakePoolAmount);
            stakePoolsCount++;
            stakePoolsHistory[stakePoolsCount] = StakePoolInfo({
                date: block.timestamp,
                amount: toStakePoolAmount
            });
            totalToStakePoolAmount += toStakePoolAmount;
            emit ToStakePool(block.timestamp, toStakePoolAmount);
        }
    }

    function getLastStakePoolInfo() public view returns (StakePoolInfo memory) {
        return stakePoolsHistory[stakePoolsCount];
    }

    function getStakePoolsHistory(uint256 offset, uint256 limit) public view returns (StakePoolInfo[] memory) {
        if (offset > stakePoolsCount) return new StakePoolInfo[](0);
        if (offset == 0 && limit == 0) limit = stakePoolsCount;
        if ((offset + limit) > stakePoolsCount) {
            limit = stakePoolsCount - offset;
        }

        StakePoolInfo[] memory ret = new StakePoolInfo[](limit);
        for (uint256 i = 0; i < limit; i++){
            ret[i] = stakePoolsHistory[stakePoolsCount - i - offset]; 
        }
        return ret;
    }

    function balance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function setOracle(address newOracle) public onlyOwner {
        oracle = newOracle;
    }
    function setStakeContract(address newStakeContract) public onlyOwner {
        stakeContract = IGGWStake(newStakeContract);
    }
    function transferOwnership(address newOwner) public onlyOwner {         
        owner = newOwner;
    }
    function recoverWrongToken(address tokenAddress, uint256 amount) external onlyOwner {
        require(tokenAddress != address(token), "Cant recower stake token. Only add to stake pool");
        IERC20(tokenAddress).transfer(owner, amount);
    }

    struct TokenInfo {
        uint8 decimals;
        string symbol;
        string name;
        uint256 balance;
    }

    function getTokenInfo() public view returns (TokenInfo memory) {
        return TokenInfo({
            decimals: token.decimals(),
            symbol: token.symbol(),
            name: token.name(),
            balance: token.balanceOf(address(this))
        });
    }

    struct SummaryInfo {
        uint8 decimals;
        string symbol;
        string name;
        uint256 balance;
        uint256 totalToStakePoolAmount;
        uint256 stakePoolsCount;
        uint256 lastToStakePoolDate;
        uint256 lastToStakePoolAmount;
    }

    function getSummaryInfo() public view returns (SummaryInfo memory) {
        return SummaryInfo({
            decimals: token.decimals(),
            symbol: token.symbol(),
            name: token.name(),
            balance: token.balanceOf(address(this)),
            totalToStakePoolAmount: totalToStakePoolAmount,
            stakePoolsCount: stakePoolsCount,
            lastToStakePoolDate: stakePoolsHistory[stakePoolsCount].date,
            lastToStakePoolAmount: stakePoolsHistory[stakePoolsCount].amount
        });
    }
}