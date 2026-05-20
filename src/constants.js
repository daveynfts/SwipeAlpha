export const TOKEN_ADDRESS = "0x2880D31c613a8c2F3216064765b0C1E4d3D375A6"; // Replace with your deployed $DAVEYTEST address
export const STAKING_ADDRESS = "0x251615574BFD224450147B1eE815F0cc28Cc8D6d"; // Replace with your deployed Staking address
export const MOCK_MOE_ROUTER_ADDRESS = "0x5ddeea646Ed2DF37345d8987099A33e60879Bed4";

export const MANTLE_SEPOLIA_CHAIN_ID = 5003;

export const MOCK_MOE_ROUTER_ABI = [
  "function swap(address tokenIn, uint256 amountIn, string calldata tokenOutSymbol, address to) external returns (uint256)",
  "function swapMNT(string calldata tokenOutSymbol, address to) external payable returns (uint256)",
  "event SwapExecuted(address indexed user, address indexed tokenIn, string tokenOutSymbol, uint256 amountIn, uint256 amountOutSimulated)",
  "event SwapMNTExecuted(address indexed user, string tokenOutSymbol, uint256 amountInMNT, uint256 amountOutSimulated)"
];

export const TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
  "function approve(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export const STAKING_ABI = [
  "function stake(uint256 _amount)",
  "function unstake(uint256 _amount)",
  "function claimReward()",
  "function calculateReward(address _user) view returns (uint256)",
  "function stakers(address) view returns (uint256 stakedAmount, uint256 lastStakeTime, uint256 pendingRewards)",
  "function totalStaked() view returns (uint256)",
  "function APY() view returns (uint256)",
  "function stakingToken() view returns (address)"
];
