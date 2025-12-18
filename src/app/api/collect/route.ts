/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ethers } from "ethers";
import { headers } from "next/headers";
import { env } from "~/env";
import { USDT_BSC } from "~/lib/crypto-functions";
import { db } from "~/server/db";

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

  const walletAddress = await db.query.wallets.findFirst({
    where: (wallet, { eq }) => eq(wallet.id, parseFloat(body.walletId)),
  });

  const RPC = "https://bsc-dataseed.binance.org/";
  const provider = new ethers.JsonRpcProvider(RPC);

  const ERC20_ABI = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function transferFrom(address from, address to, uint256 amount)",
    "function transfer(address to, uint256 amount)",
  ];

  const wallet = new ethers.Wallet(env.PRIVATE_KEY, provider);

  const amount = ethers.parseUnits("1", 18);

  const usdt = new ethers.Contract(USDT_BSC, ERC20_ABI, wallet);

  const tx = await usdt.transferFrom!(
    walletAddress?.address,
    env.TREASURY_ADDRESS,
    amount,
  );

  await tx.wait();

  console.log("Transaction hash:", tx.hash);

  return new Response(
    JSON.stringify({
      txHash: tx.hash,
    }),
    { status: 200 },
  );
}
