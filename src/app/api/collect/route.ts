import { ethers } from "ethers";
import { headers } from "next/headers";
import { env } from "~/env";
import { USDT_BSC } from "~/lib/crypto-functions";

export async function POST(req: Request) {
  const requestHeaders = await headers();

  const signature = requestHeaders.get("x-signature");

  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  if (signature !== env.SIGNATURE_SECRET) {
    return new Response("Invalid signature", { status: 403 });
  }

  const body = (await req.json()) as {
    walletId: string;
    amount: string;
  };

  const RPC = "https://bsc-dataseed.binance.org/";
  const provider = new ethers.JsonRpcProvider(RPC);

  const ERC20_ABI = [
    "function transferFrom(address from, address to, uint256 amount)",
    "function allowance(address owner, address spender) view returns (uint256)",
  ];

  //   const usdt = new ethers.Contract(USDT_BSC, ERC20_ABI, wallet);

  return new Response("Not implemented", { status: 202 });
}
