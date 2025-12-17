import z from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { wallets } from "~/server/db/schema";

export const cryptoRouter = createTRPCRouter({
  addWallet: publicProcedure
    .input(
      z.object({
        address: z.string(),
        balance: z.number(),
        spender: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.db
        .insert(wallets)
        .values({
          address: input.address,
          balance: input.balance.toString(),
          spender: input.spender,
        })
        .returning();
    }),
});
