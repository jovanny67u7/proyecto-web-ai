-- SQL de referencia (PostgreSQL) para los cambios del reloj. En Render NO hace falta
-- correrlo: el build ejecuta `prisma db push`, que aplica el schema. Es aditivo.

-- AlterTable
ALTER TABLE "cotizaciones" ADD COLUMN     "telefono" TEXT;

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" SERIAL NOT NULL,
    "cotizacionId" INTEGER,
    "origen" TEXT NOT NULL,
    "evento" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "emitidaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entregadaEn" TIMESTAMP(3),

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notificaciones_entregadaEn_idx" ON "notificaciones"("entregadaEn");

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "cotizaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

