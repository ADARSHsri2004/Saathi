-- AlterTable
ALTER TABLE "Onboarding" ADD COLUMN     "frequencyQuantity" INTEGER,
ADD COLUMN     "frequencyUnit" TEXT,
ADD COLUMN     "journeyStartDate" TIMESTAMP(3),
ADD COLUMN     "moneySpentPerDay" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Relapse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "relapseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Relapse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Relapse_userId_idx" ON "Relapse"("userId");

-- AddForeignKey
ALTER TABLE "Relapse" ADD CONSTRAINT "Relapse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
