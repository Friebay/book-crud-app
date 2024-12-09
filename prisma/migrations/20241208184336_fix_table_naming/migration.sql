/*
  Warnings:

  - You are about to drop the `CollectedBook` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "CollectedBook";

-- CreateTable
CREATE TABLE "collectedBook" (
    "id" SERIAL NOT NULL,
    "book_name" TEXT,
    "author_name" TEXT,
    "hyperlink" TEXT,
    "price" TEXT,
    "seller" TEXT,
    "found_time" TEXT,

    CONSTRAINT "collectedBook_pkey" PRIMARY KEY ("id")
);
