/*
  Warnings:

  - A unique constraint covering the columns `[steamId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[steamLinkToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "steamLinkRequestedAt" TIMESTAMP(3),
ADD COLUMN     "steamLinkToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_steamId_key" ON "User"("steamId");

-- CreateIndex
CREATE UNIQUE INDEX "User_steamLinkToken_key" ON "User"("steamLinkToken");
