-- CreateTable
CREATE TABLE "Producto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "fotoOriginalUrl" TEXT,
    "costoAdquisicion" REAL NOT NULL,
    "precioVenta" REAL NOT NULL,
    "stockActual" INTEGER NOT NULL,
    "fechaIngresoAlmacen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Campana" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productoId" INTEGER NOT NULL,
    "tipoEstrategia" TEXT NOT NULL,
    "descuentoAplicado" REAL,
    "imagenGeneradaUrl" TEXT,
    "copyTexto" TEXT,
    "codigoTrackingWhatsapp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Campana_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VentaHistorial" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productoId" INTEGER NOT NULL,
    "campanaId" INTEGER,
    "cantidad" INTEGER NOT NULL,
    "precioAplicado" REAL NOT NULL,
    "fechaVenta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origen" TEXT,
    CONSTRAINT "VentaHistorial_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VentaHistorial_campanaId_fkey" FOREIGN KEY ("campanaId") REFERENCES "Campana" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Producto_sku_key" ON "Producto"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Campana_codigoTrackingWhatsapp_key" ON "Campana"("codigoTrackingWhatsapp");
