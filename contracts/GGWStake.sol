// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function name() external view returns (string memory);
    function decimals() external view returns (uint8);
    function symbol() external view returns (string memory);
}
contract GGWStake is ReentrancyGuard {
    address public owner;
    address public oracle;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    modifier onlyOwnerOrOracle() {
        require(msg.sender == owner || msg.sender == oracle, "Only owner or oracle");
        _;
    }
    struct Deposit {
        uint256 depositId;
        address owner;
        uint256 amount;
        uint256 monthIndex;
        uint256 depositStart;
        uint256 depositClosed;
        uint256 unlockMonthIndex;
        uint256 lastAccruedMonthIdx;
        uint256 pendingReward;
        bool active;
        bool isSaved; // Deposit closed without reward
        uint256 savedReward;
        bool ownRate; // For lock - ownRate = true, rate = 0 (for tokens after bridge)
        uint256 rate;
    }

    struct MonthConfig {
        uint256 start;
        uint256 end;
        uint256 rateBps; // 0 → use globalRateBps
    }

    // --- Token & Rates ---
    IERC20 public immutable stakingToken;
    uint256 public globalRateBps;
    uint256 public minLockMonths = 1;
    uint256 public minLockAmount = 1 ether;

    // --- Users & Deposits ---
    address[] public allUsers;
    mapping(address => bool) public isUser;
    mapping(address => uint256[]) public userDeposits; // address → depositIds
    uint256 public lastKnownMonthIndex = 0;
    Deposit[] public deposits;
    mapping(uint256 => bool) public byOracle; // Deposit created via oracle for user
    uint256[] public activeDeposits;
    mapping(uint256 => uint256) public activeDepositsIndex;
    uint256 public activeDepositsCount;
    uint256 public depositsAmount;
    uint256 public rewardsPayed;
    uint256 public bankAmount;

    // --- Months ---
    MonthConfig[] public months;
    mapping (uint256 => uint256) public monthDepositsCount;
    mapping (uint256 => uint256) public monthDepositsAmount;
    mapping (uint256 => uint256) public monthRewardsAmount;
    
    // --- Constructor ---
    constructor(address _stakingToken, uint256 _globalRateBps) {
        require(_stakingToken != address(0), "Token: zero");
        require(_globalRateBps <= 10_000, "Rate > 100%");
        owner = msg.sender;
        oracle = msg.sender;
        stakingToken = IERC20(_stakingToken);
        globalRateBps = _globalRateBps;
    }

    // --- Admin: User & Deposit Queries ---
    function getAllUsers() external view returns (address[] memory) {
        return allUsers;
    }
    function getUsersCount() external view returns (uint256) {
        return allUsers.length;
    }
    function getUsers(uint256 _offset, uint256 _limit) external view returns (address[] memory ret) {
        if (_limit == 0) _limit = allUsers.length;
        uint256 iEnd = _offset + _limit;
        if (_offset > allUsers.length) return ret;
        if (iEnd > allUsers.length) iEnd = allUsers.length;

        ret = new address[](iEnd - _offset);
        for (uint256 i = 0; i < iEnd - _offset ; i++) {
            ret[i] = allUsers[
                allUsers.length - i - _offset - 1
            ];
        }

        return ret;
    }
    function getUserDepositsIds(address user) external view returns (uint256[] memory) {
        return userDeposits[user];
    }
    function getUserDepositsCount(address user) external view returns (uint256) {
        return userDeposits[user].length;
    }
    function getUserDeposits(address user, uint256 _offset, uint256 _limit) external view returns (Deposit[] memory ret) {
        if (_limit == 0) _limit = userDeposits[user].length;
        uint256 iEnd = _offset + _limit;
        if (_offset > userDeposits[user].length) return ret;
        if (iEnd > userDeposits[user].length) iEnd = userDeposits[user].length;

        ret = new Deposit[](iEnd - _offset);
        for (uint256 i = 0; i < iEnd - _offset ; i++) {
            ret[i] = deposits[
                userDeposits[user][
                    userDeposits[user].length - i - _offset - 1
                ]
            ];
            ret[i].pendingReward = calculatePendingRewardForDeposit(ret[i].depositId);
        }

        return ret;
    }
    function getActiveDepositsCount() external view returns (uint256) {
        return activeDeposits.length;
    }
    function getActiveDeposits(uint256 _offset, uint256 _limit) external view returns (Deposit[] memory ret) {
        if (_limit == 0) _limit = activeDeposits.length;
        uint256 iEnd = _offset + _limit;
        if (_offset > activeDeposits.length) return ret;
        if (iEnd > activeDeposits.length) iEnd = activeDeposits.length;

        ret = new Deposit[](iEnd - _offset);
        for (uint256 i = 0; i < iEnd - _offset ; i++) {
            ret[i] = deposits[
                activeDeposits[
                    activeDeposits.length - i - _offset - 1
                ]
            ];
            ret[i].pendingReward = calculatePendingRewardForDeposit(ret[i].depositId);
        }

        return ret;
    }

    function getDepositById(uint256 depositId) external view returns (Deposit memory ret) {
        ret = deposits[depositId];
        ret.pendingReward = calculatePendingRewardForDeposit(depositId);
        return ret;
    }

    function getTotalUsers() external view returns (uint256) {
        return allUsers.length;
    }

    function getTotalDeposits() external view returns (uint256) {
        return deposits.length;
    }
    function getDeposits(uint256 _offset, uint256 _limit) external view returns (Deposit[] memory ret) {
        if (_limit == 0) _limit = deposits.length;
        uint256 iEnd = _offset + _limit;
        if (_offset > deposits.length) return ret;
        if (iEnd > deposits.length) iEnd = deposits.length;

        ret = new Deposit[](iEnd - _offset);
        for (uint256 i = 0; i < iEnd - _offset ; i++) {
            ret[i] = deposits[
                deposits.length - i - _offset - 1
            ];
            ret[i].pendingReward = calculatePendingRewardForDeposit(ret[i].depositId);
        }

        return ret;
    }
    // --- Admin: Global Rate ---
    function setGlobalRateBps(uint256 _rateBps) external onlyOwner {
        require(_rateBps <= 10_000, "Rate > 100%");
        globalRateBps = _rateBps;
        emit GlobalRateUpdated(_rateBps);
    }

    function getMonthsCount() public view returns (uint256) {
        return months.length;
    }
    // --- Admin: Months ---
    function addMonth(uint256 start, uint256 end, uint256 rateBps) external onlyOwner {
        _addSingleMonth(start, end, rateBps);
        emit MonthAdded(months.length - 1, start, end, rateBps);
    }

    function addMonthsBatch(
        uint256[] calldata starts,
        uint256[] calldata ends,
        uint256[] calldata rates
    ) external onlyOwner {
        require(starts.length == ends.length && starts.length == rates.length, "Length mismatch");
        require(starts.length > 0, "Empty");

        for (uint256 i = 0; i < starts.length; i++) {
            _addSingleMonth(starts[i], ends[i], rates[i]);
        }
        emit MonthsBatchAdded(months.length - starts.length, months.length - 1);
    }

    function editMonth(uint256 idx, uint256 start, uint256 end, uint256 rateBps) external onlyOwner {
        require(idx < months.length, "Index OOB");
        require(start < end, "Invalid range");
        if (rateBps != 0) require(rateBps <= 10_000, "Rate > 100%");
        require(start > block.timestamp, "Started");

        if (idx > 0) require(start >= months[idx - 1].end, "Seq");
        if (idx + 1 < months.length) require(end <= months[idx + 1].start, "Overlap");

        months[idx] = MonthConfig(start, end, rateBps);
        emit MonthEdited(idx, start, end, rateBps);
    }

    function deleteLastMonth() external onlyOwner {
        require(months.length > 0, "None");
        require(months[months.length - 1].start > block.timestamp, "Started");
        months.pop();
        emit MonthDeleted(months.length);
    }

    function _addSingleMonth(uint256 start, uint256 end, uint256 rateBps) internal {
        require(start < end, "Invalid range");
        if (rateBps != 0) require(rateBps <= 10_000, "Rate > 100%");
        if (months.length > 0) require(start >= months[months.length - 1].end, "Seq");
        months.push(MonthConfig(start, end, rateBps));
    }

    
    function setMinLockAmount(uint256 newMinLockAmount) public onlyOwner {
        minLockAmount = newMinLockAmount;
    }
    function setMinLockMonths(uint256 newMinLockMonths) public onlyOwner {
        minLockMonths = newMinLockMonths;
    }
    // --- User: Create Deposit ---
    function createDeposit(uint256 amount, uint256 lockMonths) external nonReentrant {
        _createDeposit(msg.sender, amount, lockMonths, false, 0, false);
    }
    function createDepositFor(address user, uint256 amount, uint256 lockMonths, bool ownRate, uint256 rate) external nonReentrant onlyOwnerOrOracle {
        if (ownRate) require(rate <= 10_000, "Rate > 100%");
        _createDeposit(user, amount, lockMonths, ownRate, rate, true);
    }
    function _createDeposit(address user, uint256 amount, uint256 lockMonths, bool ownRate, uint256 rate, bool createdByOracle) private {
        require(amount >= minLockAmount, "Min amount");
        require(lockMonths >= minLockMonths, "Lock must be greaer");
        require(months.length > 0, "No months");

        uint256 currentIdx = _getCurrentMonthIndex();
        require(currentIdx < months.length, "Time not covered");

        uint256 unlockMonthIndex = currentIdx + lockMonths;
        require(unlockMonthIndex <= months.length, "Lock period exceeds configured months");

        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // Register user if first deposit
        if (!isUser[user]) {
            isUser[user] = true;
            allUsers.push(user);
        }

        deposits.push(Deposit({
            depositId: deposits.length,
            owner: user,
            amount: amount,
            monthIndex: currentIdx,
            depositStart: block.timestamp,
            depositClosed: 0,
            unlockMonthIndex: unlockMonthIndex,
            lastAccruedMonthIdx: currentIdx,
            pendingReward: 0,
            active: true,
            isSaved: false,
            savedReward: 0,
            ownRate: ownRate,
            rate: rate
        }));

        uint256 depositId = deposits.length - 1;
        byOracle[depositId] = createdByOracle;
        userDeposits[user].push(depositId);

        lastKnownMonthIndex = currentIdx;

        depositsAmount += amount;
        activeDepositsCount++;
        activeDeposits.push(depositId);
        activeDepositsIndex[depositId] = activeDeposits.length - 1;
        monthDepositsCount[currentIdx]++;
        monthDepositsAmount[currentIdx] += amount;
        emit DepositCreated(user, depositId, amount, lockMonths, unlockMonthIndex);
    }

    // --- User: Withdraw ---
    function withdrawRewardsOnly(uint256 depositId) external nonReentrant {
        Deposit storage dep = deposits[depositId];
        require(dep.active, "Inactive");
        require(dep.owner == msg.sender, "Not owner");

        uint256 reward = calculatePendingRewardForDeposit(depositId);
        require(reward > 0, "No rewards");
        require(bankAmount >= reward, "Empty bank");

        uint256 endIdx = _findLastCompletedMonth(dep.lastAccruedMonthIdx, 0);
        dep.lastAccruedMonthIdx = endIdx;
        bankAmount -= reward;
        rewardsPayed += reward;
        monthRewardsAmount[endIdx] += reward;
        require(stakingToken.transfer(msg.sender, reward), "Transfer failed");
        lastKnownMonthIndex = _getCurrentMonthIndex();
        emit RewardsWithdrawn(msg.sender, depositId, reward);
    }

    function withdrawPrincipalAndRewards(uint256 depositId) external nonReentrant {
        Deposit storage dep = deposits[depositId];
        require(dep.active, "Inactive");
        require(dep.owner == msg.sender, "Not owner");

        uint256 currentIdx = _getCurrentMonthIndex();
        require(currentIdx >= dep.unlockMonthIndex, "Locked");

        uint256 reward = calculatePendingRewardForDeposit(depositId);
        require(bankAmount >= reward, "Empty bank");
        uint256 total = dep.amount + reward;

        depositsAmount -= dep.amount;

        dep.active = false;
        dep.depositClosed = block.timestamp;

        uint256 endIdx = _findLastCompletedMonth(dep.lastAccruedMonthIdx, 0);
        dep.lastAccruedMonthIdx = endIdx;
        lastKnownMonthIndex = currentIdx;
        activeDepositsCount--;
        bankAmount -= reward;
        rewardsPayed += reward;
        _removeFromActiveDeposits(depositId);
        monthRewardsAmount[currentIdx] += reward;
        require(stakingToken.transfer(msg.sender, total), "Transfer failed");
        emit PrincipalWithdrawn(msg.sender, depositId, total);
    }
    // User safe deposit tokens, if no reward in bank - user can take back tokens
    function safeDeposit(uint256 depositId) external nonReentrant {
        Deposit storage dep = deposits[depositId];
        require(dep.active, "Inactive");
        require(dep.owner == msg.sender, "Not owner");

        uint256 currentIdx = _getCurrentMonthIndex();
        require(currentIdx >= dep.unlockMonthIndex, "Locked");

        uint256 reward = calculatePendingRewardForDeposit(depositId);

        depositsAmount -= dep.amount;

        dep.active = false;
        dep.isSaved = true;
        dep.savedReward = reward;
        dep.depositClosed = block.timestamp;

        lastKnownMonthIndex = currentIdx;
        activeDepositsCount--;
        _removeFromActiveDeposits(depositId);
        monthRewardsAmount[currentIdx] += reward;
        rewardsPayed += reward;
        require(stakingToken.transfer(dep.owner, dep.amount), "Transfer failed");

        emit SafeDeposit(dep.owner, dep.depositId, dep.amount, reward);
    }
    // cancel deposit created by oracle
    function cancelDeposit(uint256 depositId) external nonReentrant onlyOwner {
        Deposit storage dep = deposits[depositId];
        require(dep.active, "Deposit inactive");
        require(byOracle[dep.depositId], "Can only cancel oracle deposits");

        dep.active = false;
        activeDepositsCount--;
        depositsAmount -= dep.amount;

        require(stakingToken.transfer(msg.sender, dep.amount), "Transfer failed");
        emit DepositCancelled(dep.depositId, msg.sender, dep.amount);
    }
    function getSavedReward(uint256 depositId) external nonReentrant {
        Deposit storage dep = deposits[depositId];
        require(!dep.active, "Is active");
        require(dep.owner == msg.sender, "Not owner");
        require(dep.isSaved, "Not saved");
        require(bankAmount >= dep.savedReward, "Empty bank");

        uint256 reward = dep.savedReward;
        bankAmount -= reward;
        rewardsPayed += reward;
        if (reward > 0) {
            require(stakingToken.transfer(msg.sender, reward), "Transfer failed");
        }

        dep.isSaved = false;
        dep.savedReward = 0;
        emit SavedRewardClaimed(dep.owner, dep.depositId, reward);
    }

    // --- Core Logic ---
    function _getEffectiveRateBps(uint256 monthIndex) internal view returns (uint256) {
        uint256 rate = months[monthIndex].rateBps;
        return rate == 0 ? globalRateBps : rate;
    }


    function calculateReward(
        uint256 amount,
        uint256 startMonthIdx,
        uint256 lockMonths,
        uint256 depositStart
    ) public view returns (uint256) {
        if (amount == 0 || lockMonths == 0 || startMonthIdx >= months.length) {
            return 0;
        }

        uint256 endMonthIdx = startMonthIdx + lockMonths;
        if (endMonthIdx > months.length) {
            endMonthIdx = months.length;
            if (endMonthIdx <= startMonthIdx) return 0;
        }
        if (depositStart == 0) depositStart = block.timestamp;
        // Определяем, до какого месяца можно начислять (только завершённые)
        // Но так как это preview — считаем до endMonthIdx (как будто все месяцы завершены)
        // Однако для consistency с pending-логикой — считаем только завершённые на текущий момент
        // Но вы, скорее всего, хотите "максимальный прогноз", поэтому:
        uint256 actualEnd = endMonthIdx; // предполагаем, что все месяцы пройдут

        uint256 reward = 0;

        for (uint256 i = startMonthIdx; i < actualEnd; i++) {
            if (i >= months.length) break;

            MonthConfig memory month = months[i];
            uint256 rateBps = _getEffectiveRateBps(i);
            uint256 monthlyReward = (amount * rateBps) / 10_000;

            if (i == startMonthIdx) {
                // Пропорционально от depositStart до конца месяца
                uint256 monthStart = month.start;
                uint256 monthEnd = month.end;
                uint256 monthLength = monthEnd - monthStart;

                uint256 effectiveStart = depositStart > monthStart ? depositStart : monthStart;
                uint256 effectiveEnd = monthEnd; // предполагаем, что месяц завершится

                if (effectiveStart >= effectiveEnd) {
                    continue;
                }

                uint256 activeSeconds = effectiveEnd - effectiveStart;
                if (monthLength == 0) continue;

                reward += (monthlyReward * activeSeconds) / monthLength;
            } else {
                // Полный месяц
                reward += monthlyReward;
            }
        }

        return reward;
    }
    function _getCurrentMonthIndexAt(uint256 ts) internal view returns (uint256) {
        for (uint256 i = 0; i < months.length; i++) {
            if (ts >= months[i].start && ts < months[i].end) {
                return i;
            }
        }
        return months.length;
    }
    function estimateRequiredBankReserve() public view returns (uint256 estimatedMonthlyRewards) {
        uint256 maxRateBps = globalRateBps;
        estimatedMonthlyRewards = (depositsAmount * maxRateBps) / 10_000;
    }
    function estimateRequiredBankReservePrecise() public view returns (uint256) {
        uint256 currentMonth = _getCurrentMonthIndex();
        if (currentMonth >= months.length) {
            return 0;
        }

        uint256 rateBps = _getEffectiveRateBps(currentMonth);
        return (depositsAmount * rateBps) / 10_000;
    }
    function calculateRewardByMonths(
        uint256 amount,
        uint256 lockMonths,
        uint256 depositStart
    ) public view returns (uint256) {
        if (amount == 0 || lockMonths == 0) return 0;

        // Найти индекс месяца, в который попадает depositStart
        if (depositStart == 0) depositStart = block.timestamp;
        uint256 startMonthIdx = _getCurrentMonthIndexAt(depositStart);
        if (startMonthIdx >= months.length) return 0;

        uint256 endMonthIdx = startMonthIdx + lockMonths;
        if (endMonthIdx > months.length) {
            endMonthIdx = months.length;
        }
        if (endMonthIdx <= startMonthIdx) return 0;

        uint256 reward = 0;

        for (uint256 i = startMonthIdx; i < endMonthIdx; i++) {
            MonthConfig memory month = months[i];
            uint256 rateBps = _getEffectiveRateBps(i);
            uint256 monthlyReward = (amount * rateBps) / 10_000;

            if (i == startMonthIdx) {
                // Первый месяц — частично
                uint256 effectiveStart = depositStart > month.start ? depositStart : month.start;
                uint256 effectiveEnd = month.end; // предполагаем, что месяц завершится
                if (effectiveStart >= effectiveEnd) continue;

                uint256 activeSeconds = effectiveEnd - effectiveStart;
                uint256 monthLength = month.end - month.start;
                if (monthLength == 0) continue;

                reward += (monthlyReward * activeSeconds) / monthLength;
            } else {
                // Полные месяцы
                reward += monthlyReward;
            }
        }

        return reward;
    }
    function calculatePendingRewardForDeposit(uint256 depositId) public view returns (uint256) {
        Deposit memory dep = deposits[depositId];
        if (dep.isSaved) return dep.savedReward;
        if (dep.amount == 0 || !dep.active) return 0;
        

        uint256 startMonthIdx = dep.lastAccruedMonthIdx;
        uint256 endMonthIdx = _findLastCompletedMonth(startMonthIdx, 0);
        if (endMonthIdx <= startMonthIdx) return 0;

        uint256 reward = 0;
        uint256 amount = dep.amount;

        for (uint256 i = startMonthIdx; i < endMonthIdx; i++) {
            MonthConfig memory month = months[i];
            uint256 rateBps = (dep.ownRate) ? dep.rate : _getEffectiveRateBps(i);
            uint256 monthlyReward = (amount * rateBps) / 10_000;

            // Особая логика только для первого месяца депозита
            if (i == dep.monthIndex) {
                // Депозит начался в этом месяце — считаем долю
                uint256 monthStart = month.start;
                uint256 monthEnd = month.end;
                uint256 monthLength = monthEnd - monthStart;

                // Время, с которого депозит "действует" в этом месяце
                uint256 effectiveStart = dep.depositStart > monthStart ? dep.depositStart : monthStart;
                // Мы считаем только до конца месяца (он завершён, иначе не вошёл бы в endMonthIdx)
                uint256 effectiveEnd = monthEnd;

                if (effectiveStart >= effectiveEnd) {
                    // Депозит начат после окончания месяца — пропуск (теоретически невозможно)
                    continue;
                }

                uint256 activeSeconds = effectiveEnd - effectiveStart;

                // Пропорциональное вознаграждение: (activeSeconds / monthLength) * monthlyReward
                // Избегаем деления до умножения для точности
                reward += (monthlyReward * activeSeconds) / monthLength;
            } else {
                // Полный месяц — полный процент
                reward += monthlyReward;
            }
        }

        return reward;
    }

    function _getCurrentMonthIndex() public view returns (uint256) {
        uint256 ts = block.timestamp;
        for (uint256 i = lastKnownMonthIndex; i < months.length; i++) {
            if (ts >= months[i].start && ts < months[i].end) {
                return i;
            }
        }
        return months.length;
    }

    function _findLastCompletedMonth(uint256 fromIndex, uint256 ts) internal view returns (uint256) {
        if (ts == 0) ts = block.timestamp;
        uint256 i = fromIndex;
        while (i < months.length && months[i].end <=ts) {
            unchecked { i++; }
        }
        return i;
    }
    function _removeFromActiveDeposits(uint256 depositId) internal {
        uint256 pos = activeDepositsIndex[depositId];
        uint256 lastDepositId = activeDeposits[activeDeposits.length - 1];

        activeDeposits[pos] = lastDepositId;
        activeDepositsIndex[lastDepositId] = pos;

        activeDeposits.pop();
        delete activeDepositsIndex[depositId];
    }
    // --- Events ---
    event DepositCreated(address indexed user, uint256 depositId, uint256 amount, uint256 lockMonths, uint256 unlockMonthIndex);
    event PrincipalWithdrawn(address indexed user, uint256 depositId, uint256 amount);
    event RewardsWithdrawn(address indexed user, uint256 depositId, uint256 reward);
    event GlobalRateUpdated(uint256 rateBps);
    event MonthAdded(uint256 indexed monthIndex, uint256 start, uint256 end, uint256 rateBps);
    event MonthsBatchAdded(uint256 startIndex, uint256 endIndex);
    event MonthEdited(uint256 indexed monthIndex, uint256 start, uint256 end, uint256 rateBps);
    event MonthDeleted(uint256 lengthAfterDeletion);
    event SafeDeposit(address indexed user, uint256 depositId, uint256 amount, uint256 savedReward);
    event SavedRewardClaimed(address indexed user, uint256 depositId, uint256 reward);
    event DepositCancelled(uint256 depositId, address indexed recipient, uint256 amount);

    function withdrawBank(uint256 amount) external onlyOwner {
        require(bankAmount >= amount, "E1");
        require(stakingToken.transfer(msg.sender, amount), "E2");
        bankAmount-=amount;
    }
    function addTokensToBank(uint256 amount) external onlyOwnerOrOracle {
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "E1");
        bankAmount+=amount;
    }
    function setOracle(address newOracle) external onlyOwner {
        oracle = newOracle;
    }
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0),"E1");
        owner = newOwner;
    }
    struct SummaryInfo {
        uint256 usersCount;
        uint256 activeDepositsCount;
        uint256 depositsCount;
        uint256 depositsAmount;
        uint256 rewardsPayed;
        uint256 bankAmount;
        uint8 tokenDecimals;
        string tokenName;
        string tokenSymbol;
        address tokenAddress;
        uint256 globalRateBps;
        uint256 minLockMonths;
        uint256 minLockAmount;
        uint256 estimateRequiredBankReserve;
        uint256 estimateRequiredBankReservePrecise;
        uint256 currentMonth;
        uint256 monthsCount;
    }
    function getSummaryInfo() public view returns (SummaryInfo memory) {
        return SummaryInfo({
            usersCount: allUsers.length,
            activeDepositsCount: activeDepositsCount,
            depositsCount: deposits.length,
            depositsAmount: depositsAmount,
            rewardsPayed: rewardsPayed,
            bankAmount: bankAmount,
            tokenDecimals: stakingToken.decimals(),
            tokenName: stakingToken.name(),
            tokenSymbol: stakingToken.symbol(),
            tokenAddress: address(stakingToken),
            globalRateBps: globalRateBps,
            minLockMonths: minLockMonths,
            minLockAmount: minLockAmount,
            estimateRequiredBankReserve: estimateRequiredBankReserve(),
            estimateRequiredBankReservePrecise: estimateRequiredBankReservePrecise(),
            currentMonth: _getCurrentMonthIndex(),
            monthsCount: months.length
        });
    }
    struct MonthSummaryInfo {
        uint256 monthId;
        uint256 start;
        uint256 end;
        uint256 rateBps;
        uint256 depositsCount;
        uint256 depositsAmount;
        uint256 rewardsAmount;
    }
    function getMonths(uint256 _offset, uint256 _limit) external view returns (MonthSummaryInfo[] memory ret) {
        if (_limit == 0) _limit = months.length;
        uint256 iEnd = _offset + _limit;
        if (_offset > months.length) return ret;
        if (iEnd > months.length) iEnd = months.length;

        ret = new MonthSummaryInfo[](iEnd - _offset);
        for (uint256 i = 0; i < iEnd - _offset ; i++) {
            uint256 monthId = months.length - i - _offset - 1;
            ret[i] = MonthSummaryInfo({
                monthId: monthId,
                start: months[monthId].start,
                end: months[monthId].end,
                rateBps: months[monthId].rateBps,
                depositsCount: monthDepositsCount[monthId],
                depositsAmount: monthDepositsAmount[monthId],
                rewardsAmount: monthRewardsAmount[monthId]
            });
        }

        return ret;
    }
    // --- Emergency ---
    function recoverToken(address token, uint256 amount) external onlyOwner {
        require(token != address(stakingToken), "E1");
        require(IERC20(token).transfer(owner, amount), "E2");
    }
}