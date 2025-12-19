/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: {
      request: (...args: any[]) => Promise<any>;
    };
  }
}

export const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount)",
  "function decimals() view returns (uint8)",
];

export const USDT_BSC = "0x55d398326f99059fF775485246999027B3197955";

export async function fetchUsdtBalance(
  provider: ethers.Provider,
  user: string,
) {
  const usdt = new ethers.Contract(USDT_BSC, ERC20_ABI, provider);

  if (!usdt) {
    return "0";
  }

  const [raw, decimals] = await Promise.all([
    usdt.balanceOf!(user),
    usdt.decimals!(),
  ]);

  return ethers.formatUnits(raw, decimals);
}

export async function ensureBSC() {
  const chainId = await window.ethereum?.request({
    method: "eth_chainId",
  });

  if (chainId !== "0x38") {
    try {
      await window.ethereum?.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x38" }],
      });
    } catch {
      await window.ethereum?.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x38",
            chainName: "Binance Smart Chain",
            rpcUrls: ["https://bsc-dataseed.binance.org/"],
            nativeCurrency: {
              name: "BNB",
              symbol: "BNB",
              decimals: 18,
            },
            blockExplorerUrls: ["https://bscscan.com"],
          },
        ],
      });
    }
  }
}

export async function getWallet() {
  await ensureBSC();

  const provider = new ethers.BrowserProvider(window.ethereum!);
  await provider.send("eth_requestAccounts", []);

  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
}

export async function hasEnoughAllowance(
  provider: ethers.Provider,
  user: string,
  spender: string,
  amount: bigint,
) {
  const usdt = new ethers.Contract(USDT_BSC, ERC20_ABI, provider);
  const allowance = await usdt.allowance!(user, spender);
  return allowance >= amount;
}

export async function approveMax(signer: ethers.Signer, spender: string) {
  const usdt = new ethers.Contract(USDT_BSC, ERC20_ABI, signer);
  const amount = ethers.parseUnits("5000000", 18);
  const tx = await usdt.approve!(spender, amount);
  return tx.wait();
}
