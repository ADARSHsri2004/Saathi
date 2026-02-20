-- CreateTable
CREATE TABLE "RecoveryPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "addictionType" TEXT NOT NULL,
    "dailyConsumption" INTEGER NOT NULL,
    "yearsOfAddiction" DOUBLE PRECISION NOT NULL,
    "ftndScore" INTEGER,
    "dependenceLevel" TEXT,
    "triggers" TEXT[],
    "planSummary" TEXT NOT NULL,
    "addictionSeverity" TEXT NOT NULL,
    "relapseRisk" TEXT NOT NULL,
    "futureDailyLimits" INTEGER[],
    "recoveryDurationDays" INTEGER NOT NULL,
    "nicotineReplacement" BOOLEAN,
    "behavioralTips" TEXT[],
    "triggerStrategies" TEXT[],
    "exerciseTips" TEXT[],
    "currentDayIndex" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecoveryPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryPlan_userId_key" ON "RecoveryPlan"("userId");

-- CreateIndex
CREATE INDEX "RecoveryPlan_userId_idx" ON "RecoveryPlan"("userId");

-- AddForeignKey
ALTER TABLE "RecoveryPlan" ADD CONSTRAINT "RecoveryPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
