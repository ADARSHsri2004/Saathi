-- CreateTable
CREATE TABLE "RiskZone" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radius" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskZone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RiskZone_userId_idx" ON "RiskZone"("userId");

-- AddForeignKey
ALTER TABLE "RiskZone" ADD CONSTRAINT "RiskZone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
