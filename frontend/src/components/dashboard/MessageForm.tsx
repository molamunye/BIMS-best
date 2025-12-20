import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
// Supabase import removed
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface MessageFormProps {
  recipientId: string;
  listingId?: string;
  onSuccess: () => void;
}

export default function MessageForm({ recipientId, listingId, onSuccess }: MessageFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setSending(true);

    try {
      const response = await api.post('/messages', {
        recipientId,
        listingId,
        content: content.trim()
      });

      if (response.status !== 201 && response.status !== 200) {
        throw new Error('Failed to send message');
      }

      onSuccess();
      setContent("");
      toast.success("Message sent successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Type your message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        required
      />
      <Button type="submit" className="w-full" disabled={sending}>
        {sending ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
