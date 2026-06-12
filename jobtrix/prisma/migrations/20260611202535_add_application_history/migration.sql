-- CreateTable
CREATE TABLE "ApplicationHistoryEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobTitle" TEXT,
    "companyName" TEXT,
    "emailSubject" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "cv" TEXT NOT NULL,
    "profileSnapshot" JSONB NOT NULL,

    CONSTRAINT "ApplicationHistoryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApplicationHistoryEntry_userId_idx" ON "ApplicationHistoryEntry"("userId");

-- AddForeignKey
ALTER TABLE "ApplicationHistoryEntry" ADD CONSTRAINT "ApplicationHistoryEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
