"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { downloadUserData } from "@/app/[locale]/dashboard/settings/actions";
import { Download, FileSpreadsheet } from "lucide-react";

interface DataSectionProps {
  userId: string;
}

export function DataSection({ userId }: DataSectionProps) {
  const t = useTranslations("settings");
  const [downloading, setDownloading] = useState(false);

  const handleDownloadJson = async () => {
    setDownloading(true);
    try {
      const { data } = await downloadUserData();
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
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          {t("data.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button onClick={handleDownloadJson} disabled={downloading} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {downloading ? t("data.downloading") : t("data.downloadData")}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleExportCsv} variant="outline">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              {t("data.exportTimeline")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
