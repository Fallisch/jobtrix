-- CreateTable
CREATE TABLE "ArchivedPayment" (
    "id" TEXT NOT NULL,
    "stripePaymentId" TEXT NOT NULL,
    "package" "AccessPackage" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchivedPayment_pkey" PRIMARY KEY ("id")
);
