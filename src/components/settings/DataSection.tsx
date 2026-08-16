"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadUserData } from "@/app/[locale]/dashboard/settings/actions";

interface DataSectionProps {
  userId: string;
}

export function DataSection({ userId }: DataSectionProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadJson = async () => {
    setDownloading(true);
    try {
      const { data } = await downloadUserData(userId);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nosmoking-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const handleExportCsv = () => {
    // CSV export placeholder — will be implemented with timeline data
    const csv = "type,detail,createdAt\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nosmoking-timeline-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button onClick={handleDownloadJson} disabled={downloading} variant="outline">
              {downloading ? "Descargando..." : "📥 Descargar mis datos"}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleExportCsv} variant="outline">
              📊 Exportar timeline
            </Button>
          </div>
        </div>

        {/* GDPR */}
        <div className="rounded-lg border border-border p-4 space-y-3">
          <h3 className="text-sm font-medium text-text">Privacidad (GDPR)</h3>
          <p className="text-xs text-text-muted">
            Tienes derecho a acceder, rectificar o eliminar tus datos personales.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" disabled>
              Solicitar acceso
            </Button>
            <Button variant="destructive" size="sm" disabled>
              Solicitar eliminación
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
