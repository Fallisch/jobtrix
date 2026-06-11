-- CreateEnum
CREATE TYPE "AccessPackage" AS ENUM ('none', 'limited', 'lifetime');

-- CreateTable
CREATE TABLE "Access" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "freeGenerationUsed" BOOLEAN NOT NULL DEFAULT false,
    "package" "AccessPackage" NOT NULL DEFAULT 'none',
    "validUntil" TIMESTAMP(3),
    "stripePaymentId" TEXT,

    CONSTRAINT "Access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Access_userId_key" ON "Access"("userId");

-- AddForeignKey
ALTER TABLE "Access" ADD CONSTRAINT "Access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
