//SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

// import "hardhat/console.sol";

contract AirdropFactory is AccessControlUpgradeable, ReentrancyGuardUpgradeable {
  using SafeERC20 for IERC20;

  bytes32 public constant WHITELIST_UPDATER = keccak256("WHITELIST_UPDATER");

  constructor() {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  struct WhiteListAirModifier {
    address wallet;
    uint256 claimAmount;
    bool isClaimed;
  }

  struct AirdropUserData {
    uint256 claimAbleAmount;
    bool isClaimed;
  }

  struct AirdropLaunch {
    address rewardAirToken;
    address treasuryAddress;
    uint256 totalAirCap;
    uint256 currentClaimedAmount;
    bool active;
    uint256 startClaimTime;
    uint256 endClaimTime;
  }

  struct AirdropUserDataDetails {
    address rewardAirToken;
    address treasuryAddress;
    uint256 totalAirCap;
    uint256 currentClaimedAmount;
    bool active;
    uint256 startClaimTime;
    uint256 endClaimTime;
    uint256 launchIndex;
    uint256 claimAbleAmount;
    bool isClaimed;
  }

  mapping(address => mapping(uint256 => AirdropUserData)) public userData;

  mapping(address => bool) public blackList;

  AirdropLaunch[] public launches;

  function createNewAirdropLaunch(
    address _rewardAirToken,
    address _treasuryAddress,
    uint256 _totalAirCap,
    uint256 _startClaimTime,
    uint256 _endClaimTime,
    WhiteListAirModifier[] memory wlData
  ) public onlyRole(WHITELIST_UPDATER) {
    launches.push(
      AirdropLaunch({
        rewardAirToken: _rewardAirToken,
        treasuryAddress: _treasuryAddress,
        totalAirCap: _totalAirCap,
        startClaimTime: _startClaimTime,
        endClaimTime: _endClaimTime,
        currentClaimedAmount: 0,
        active: true
      })
    );

    for (uint256 i = 0; i < wlData.length; i++) {
      userData[wlData[i].wallet][launches.length - 1] = AirdropUserData({
        claimAbleAmount: wlData[i].claimAmount,
        isClaimed: wlData[i].isClaimed
      });
    }
  }

  function updateAirLaunchUserData(uint256 index, WhiteListAirModifier[] memory wlData)
    public
    onlyRole(WHITELIST_UPDATER)
  {
    for (uint256 i = 0; i < wlData.length; i++) {
      userData[wlData[i].wallet][index] = AirdropUserData({
        claimAbleAmount: wlData[i].claimAmount,
        isClaimed: wlData[i].isClaimed
      });
    }
  }

  function updateAirLaunch(
    uint256 index,
    address _rewardAirToken,
    address _treasuryAddress,
    uint256 _totalAirCap,
    uint256 _startClaimTime,
    uint256 _endClaimTime,
    bool _active
  ) public onlyRole(DEFAULT_ADMIN_ROLE) {
    launches[index].rewardAirToken = _rewardAirToken;
    launches[index].treasuryAddress = _treasuryAddress;
    launches[index].totalAirCap = _totalAirCap;
    launches[index].startClaimTime = _startClaimTime;
    launches[index].endClaimTime = _endClaimTime;
    launches[index].active = _active;
  }

  function disableLaunch(uint256 index) public onlyRole(DEFAULT_ADMIN_ROLE) {
    launches[index].active = false;
  }

  function reactiveLaunch(uint256 index) public onlyRole(DEFAULT_ADMIN_ROLE) {
    launches[index].active = true;
  }

  function updateStartTime(uint256 index, uint256 timestamp) public onlyRole(DEFAULT_ADMIN_ROLE) {
    launches[index].startClaimTime = timestamp;
  }

  function updateCloseTime(uint256 index, uint256 timestamp) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require(timestamp > launches[index].startClaimTime, "End claim time invalid");
    launches[index].endClaimTime = timestamp;
  }

  function updateTotalAirCap(uint256 index, uint256 _totalAirCap)
    public
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    launches[index].totalAirCap = _totalAirCap;
  }

  function updateTreasuryAddress(uint256 index, address _treasuryAddress)
    public
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    launches[index].treasuryAddress = _treasuryAddress;
  }

  function updateRewardAirToken(uint256 index, address _rewardAirToken)
    public
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    launches[index].rewardAirToken = _rewardAirToken;
  }

  function getAllAirdropDataFromWallet(address wallet)
    public
    view
    returns (AirdropUserDataDetails[] memory details)
  {
    uint256 avaibleAirdrop = 0;

    for (uint256 i = 0; i < launches.length; i++) {
      if (userData[wallet][i].claimAbleAmount > 0) {
        avaibleAirdrop++;
      }
    }

    details = new AirdropUserDataDetails[](avaibleAirdrop);
    uint256 detailsIndex = 0;

    for (uint256 i = 0; i < launches.length; i++) {
      if (userData[wallet][i].claimAbleAmount > 0) {
        details[detailsIndex] = AirdropUserDataDetails({
          launchIndex: i,
          rewardAirToken: launches[i].rewardAirToken,
          treasuryAddress: launches[i].treasuryAddress,
          totalAirCap: launches[i].totalAirCap,
          currentClaimedAmount: launches[i].currentClaimedAmount,
          active: launches[i].active,
          startClaimTime: launches[i].startClaimTime,
          endClaimTime: launches[i].endClaimTime,
          claimAbleAmount: userData[wallet][i].claimAbleAmount,
          isClaimed: userData[wallet][i].isClaimed
        });

        detailsIndex++;
      }
    }
  }

  function addBlackList(address[] calldata addresses) public onlyRole(DEFAULT_ADMIN_ROLE) {
    for (uint256 i = 0; i < addresses.length; i++) {
      blackList[addresses[i]] = true;
    }
  }

  function delBlackList(address[] calldata addresses) public onlyRole(DEFAULT_ADMIN_ROLE) {
    for (uint256 i = 0; i < addresses.length; i++) {
      delete blackList[addresses[i]];
    }
  }

  function claimAirdrop(uint256 launchIndex) public nonReentrant {
    require(!blackList[msg.sender], "User is in blacklist");
    require(launchIndex < launches.length, "Launchpad not found");
    AirdropLaunch memory _airLaunch = launches[launchIndex];
    require(_airLaunch.active, "Launch disable");
    require(block.timestamp > _airLaunch.startClaimTime, "Launch claim time not start yet");
    require(
      _airLaunch.endClaimTime == 0 || _airLaunch.endClaimTime < block.timestamp,
      "Launch closed"
    );

    AirdropUserData memory _userData = userData[msg.sender][launchIndex];
    require(!_userData.isClaimed, "User already claimed");
    require(_airLaunch.currentClaimedAmount < _airLaunch.totalAirCap, "Max cap reached");

    uint256 userClaimedAmount = (_userData.claimAbleAmount + _airLaunch.currentClaimedAmount <=
      _airLaunch.totalAirCap)
      ? _userData.claimAbleAmount
      : (_airLaunch.totalAirCap - _airLaunch.currentClaimedAmount);

    IERC20(_airLaunch.rewardAirToken).safeTransferFrom(
      _airLaunch.treasuryAddress,
      msg.sender,
      userClaimedAmount
    );

    launches[launchIndex].currentClaimedAmount =
      _airLaunch.currentClaimedAmount +
      userClaimedAmount;
    userData[msg.sender][launchIndex].isClaimed = true;
  }
}
