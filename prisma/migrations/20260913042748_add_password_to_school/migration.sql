/*
  Warnings:

  - Added the required column `password` to the `schools` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "password" TEXT NOT NULL;
