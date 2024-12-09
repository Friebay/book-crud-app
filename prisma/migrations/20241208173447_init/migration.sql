/*
  Warnings:

  - The `found_time` column on the `CollectedBook` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "CollectedBook" DROP COLUMN "found_time",
ADD COLUMN     "found_time" TIMESTAMP(3);
