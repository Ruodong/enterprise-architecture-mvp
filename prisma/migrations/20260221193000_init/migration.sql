-- CreateEnum
CREATE TYPE "LifecycleStatus" AS ENUM ('PLANNED', 'ACTIVE', 'SUNSETTING', 'RETIRED');

-- CreateTable
CREATE TABLE "BusinessCapability" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "owner" TEXT,
    "lifecycleStatus" "LifecycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "BusinessCapability_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BusinessApplication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "owner" TEXT,
    "lifecycleStatus" "LifecycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "BusinessApplication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TechStack" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "lifecycleStatus" "LifecycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "TechStack_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TechPlatform" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vendor" TEXT,
    "description" TEXT,
    "lifecycleStatus" "LifecycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "TechPlatform_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApplicationCapability" (
    "applicationId" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApplicationCapability_pkey" PRIMARY KEY ("applicationId","capabilityId")
);

CREATE TABLE "ApplicationTechStack" (
    "applicationId" TEXT NOT NULL,
    "stackId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApplicationTechStack_pkey" PRIMARY KEY ("applicationId","stackId")
);

CREATE TABLE "ApplicationTechPlatform" (
    "applicationId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApplicationTechPlatform_pkey" PRIMARY KEY ("applicationId","platformId")
);

CREATE UNIQUE INDEX "BusinessCapability_name_key" ON "BusinessCapability"("name");
CREATE UNIQUE INDEX "BusinessApplication_name_key" ON "BusinessApplication"("name");
CREATE UNIQUE INDEX "TechStack_name_key" ON "TechStack"("name");
CREATE UNIQUE INDEX "TechPlatform_name_key" ON "TechPlatform"("name");

CREATE INDEX "BusinessCapability_lifecycleStatus_idx" ON "BusinessCapability"("lifecycleStatus");
CREATE INDEX "BusinessCapability_deletedAt_idx" ON "BusinessCapability"("deletedAt");
CREATE INDEX "BusinessApplication_lifecycleStatus_idx" ON "BusinessApplication"("lifecycleStatus");
CREATE INDEX "BusinessApplication_deletedAt_idx" ON "BusinessApplication"("deletedAt");
CREATE INDEX "TechStack_category_idx" ON "TechStack"("category");
CREATE INDEX "TechStack_lifecycleStatus_idx" ON "TechStack"("lifecycleStatus");
CREATE INDEX "TechStack_deletedAt_idx" ON "TechStack"("deletedAt");
CREATE INDEX "TechPlatform_vendor_idx" ON "TechPlatform"("vendor");
CREATE INDEX "TechPlatform_lifecycleStatus_idx" ON "TechPlatform"("lifecycleStatus");
CREATE INDEX "TechPlatform_deletedAt_idx" ON "TechPlatform"("deletedAt");
CREATE INDEX "ApplicationCapability_capabilityId_idx" ON "ApplicationCapability"("capabilityId");
CREATE INDEX "ApplicationTechStack_stackId_idx" ON "ApplicationTechStack"("stackId");
CREATE INDEX "ApplicationTechPlatform_platformId_idx" ON "ApplicationTechPlatform"("platformId");

ALTER TABLE "ApplicationCapability" ADD CONSTRAINT "ApplicationCapability_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "BusinessApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationCapability" ADD CONSTRAINT "ApplicationCapability_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "BusinessCapability"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationTechStack" ADD CONSTRAINT "ApplicationTechStack_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "BusinessApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationTechStack" ADD CONSTRAINT "ApplicationTechStack_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "TechStack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationTechPlatform" ADD CONSTRAINT "ApplicationTechPlatform_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "BusinessApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationTechPlatform" ADD CONSTRAINT "ApplicationTechPlatform_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "TechPlatform"("id") ON DELETE CASCADE ON UPDATE CASCADE;
