"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { submitFeedback } from "@/app/[locale]/dashboard/settings/actions";
import { MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function FeedbackSection() {
  const t = useTranslations("settings");
  const [type, setType] = useState<"bug" | "improvement">("bug");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [subjectError, setSubjectError] = useState("");
  const [messageError, setMessageError] = useState("");

  const validate = (): boolean => {
    let valid = true;
    setSubjectError("");
    setMessageError("");

    if (!subject.trim()) {
      setSubjectError(t("feedback.error.subject_required"));
      valid = false;
    } else if (subject.length > 200) {
      setSubjectError(t("feedback.error.subject_too_long"));
      valid = false;
    }

    if (!message.trim()) {
      setMessageError(t("feedback.error.message_required"));
      valid = false;
    } else if (message.length > 2000) {
      setMessageError(t("feedback.error.message_too_long"));
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const result = await submitFeedback({ type, subject, message });
      if (result.success) {
        toast.success(t("feedback.success"));
        setType("bug");
        setSubject("");
        setMessage("");
      } else {
        toast.error(t("feedback.error.generic"));
      }
    } catch {
      toast.error(t("feedback.error.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {t("feedback.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type radio */}
          <div className="space-y-3">
            <Label>{t("feedback.type.label")}</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="feedback-type"
                  value="bug"
                  checked={type === "bug"}
                  onChange={() => setType("bug")}
                  className="accent-primary"
                />
                <span className="text-sm">{t("feedback.type.bug")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="feedback-type"
                  value="improvement"
                  checked={type === "improvement"}
                  onChange={() => setType("improvement")}
                  className="accent-primary"
                />
                <span className="text-sm">{t("feedback.type.improvement")}</span>
              </label>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="feedback-subject">{t("feedback.subject.label")}</Label>
            <input
              id="feedback-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("feedback.subject.placeholder")}
              disabled={loading}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text placeholder:text-text-muted disabled:opacity-50"
            />
            {subjectError && (
              <p className="text-sm text-destructive">{subjectError}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="feedback-message">{t("feedback.message.label")}</Label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("feedback.message.placeholder")}
              disabled={loading}
              rows={5}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text placeholder:text-text-muted disabled:opacity-50 resize-none"
            />
            {messageError && (
              <p className="text-sm text-destructive">{messageError}</p>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("feedback.submit")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
