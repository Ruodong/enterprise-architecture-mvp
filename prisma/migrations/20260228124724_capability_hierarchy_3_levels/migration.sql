-- AlterTable
ALTER TABLE "BusinessCapability" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "BusinessCapability_parentId_idx" ON "BusinessCapability"("parentId");

-- CreateIndex
CREATE INDEX "BusinessCapability_level_idx" ON "BusinessCapability"("level");

-- AddForeignKey
ALTER TABLE "BusinessCapability" ADD CONSTRAINT "BusinessCapability_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "BusinessCapability"("id") ON DELETE SET NULL ON UPDATE CASCADE;
