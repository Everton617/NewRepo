/*
  Warnings:

  - You are about to drop the column `pedido` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `quantidade` on the `Order` table. All the data in the column will be lost.
  - The primary key for the `OrderItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `instrucoes` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `itemId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantidade` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `cep` on the `TeamContact` table. All the data in the column will be lost.
  - You are about to drop the `Item` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `nome` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valor` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderItemId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_itemId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "pedido",
DROP COLUMN "quantidade",
ADD COLUMN     "nome" TEXT NOT NULL,
ADD COLUMN     "valor" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id",
DROP COLUMN "instrucoes",
DROP COLUMN "itemId",
DROP COLUMN "quantidade",
DROP COLUMN "updatedAt",
ADD COLUMN     "orderItemId" TEXT NOT NULL,
ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("orderId", "orderItemId");

-- AlterTable
ALTER TABLE "TeamContact" DROP COLUMN "cep";

-- DropTable
DROP TABLE "Item";

-- CreateTable
CREATE TABLE "Itens" (
    "nome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Itens_nome_key" ON "Itens"("nome");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "Itens"("nome") ON DELETE RESTRICT ON UPDATE CASCADE;
