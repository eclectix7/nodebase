import { generateSlug } from "random-word-slugs";
import prisma from "@/lib/db";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";
import z from "zod";
import { userAgent } from "next/server";
import { Input } from "@/components/ui/input";

export const workflowsRouter = createTRPCRouter({
  create: premiumProcedure.mutation(({ ctx }) => {
    return prisma.workflow.create({
      data: {
        name: generateSlug(3), // TODO add name
        userId: ctx.auth.user.id,
      },
    });
  }), // create
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return prisma.workflow.delete({
        where: {
          // match given props
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }), // remove
  updateName: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(({ ctx, input }) => {
      return prisma.workflow.update({
        where: { id: input.id, userId: ctx.auth.user.id },
        data: { name: input.name },
      });
    }), // updateName
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return prisma.workflow.findUnique({
        where: { id: input.id, userId: ctx.auth.user.id },
      });
    }), // getOne
  getMany: protectedProcedure
    // .input(z.object({ id: z.string() }))
    .query(({ ctx }) => {
      return prisma.workflow.findMany({
        where: { userId: ctx.auth.user.id },
      });
    }), // getMany
});
