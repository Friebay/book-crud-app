-- CreateTable
CREATE TABLE "CollectedBook" (
    "id" SERIAL NOT NULL,
    "book_name" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "hyperlink" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "seller" TEXT NOT NULL,
    "found_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectedBook_pkey" PRIMARY KEY ("id")
);
