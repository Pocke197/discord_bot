-- CreateTable
CREATE TABLE "PlaytimeSnapshot" (
    "userId" TEXT NOT NULL,
    "appId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "playtimeForever" INTEGER NOT NULL,

    CONSTRAINT "PlaytimeSnapshot_pkey" PRIMARY KEY ("userId","appId","date")
);

-- CreateIndex
CREATE INDEX "PlaytimeSnapshot_date_idx" ON "PlaytimeSnapshot"("date");

-- AddForeignKey
ALTER TABLE "PlaytimeSnapshot" ADD CONSTRAINT "PlaytimeSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
