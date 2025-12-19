import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { Reply } from "lucide-react";
import MessageForm from "./MessageForm";

export default function MessagesPanel() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState<any | null>(null);

  useEffect(() => {
    if (!user) return;
    loadMessages();
    const interval = setInterval(loadMessages, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  const loadMessages = async () => {
    try {
      const response = await api.get('/messages');
      if (response.status === 200) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await api.put(`/messages/${messageId}/read`);
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isRead: true } : m));
      // Notify other components (sidebar / badges) to refresh
      try { window.dispatchEvent(new CustomEvent('messagesUpdated', { detail: { type: 'read', id: messageId } })); } catch (e) { }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!window.confirm('Delete this message? This cannot be undone.')) return;
    try {
      const response = await api.delete(`/messages/${messageId}`);
      if (response.status === 200) {
        setMessages(prev => prev.filter(m => m._id !== messageId));
        // Notify other components to refresh counts
        try { window.dispatchEvent(new CustomEvent('messagesUpdated', { detail: { type: 'delete', id: messageId } })); } catch (e) { }
        toast.success('Message deleted');
        return;
      }
      const body = response.data || {};
      toast.error(body.message || 'Failed to delete message');
    } catch (error) {
      console.error('Failed to delete message', error);
      toast.error('Failed to delete message');
    }
  };

  if (loading) return <div>Loading messages...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Messages</h2>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No messages yet
          </CardContent>
        </Card>
      ) : (
        messages.map((message) => (
          <Card
            key={message._id}
            className={`transition-shadow ${!message.isRead && message.recipient?._id === user?.id ? "border-primary shadow-md" : ""
              }`}
          >
            <div
              className="cursor-pointer"
              onClick={() => message.recipient?._id === user?.id && !message.isRead && markAsRead(message._id)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">
                    <span className="block">From: {message.sender?.fullName || '—'}</span>
                    <span className="block text-sm text-muted-foreground">To: {message.recipient?.fullName || '—'}</span>
                  </CardTitle>
                  <div className="flex gap-2">
                    {!message.isRead && message.recipient?._id === user?.id && (
                      <Badge variant="default">New</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                {message.listing && (
                  <p className="text-sm text-muted-foreground">
                    Re: {message.listing.title}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm border-l-2 border-muted pl-3 py-1 break-words whitespace-pre-wrap">{message.content}</p>
              </CardContent>
            </div>
            <CardFooter className="pt-0 pb-4 flex justify-end gap-2">
              {/* Reply only when current user is not the sender */}
              {message.sender?._id !== user?.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReplyMessage(message);
                  }}
                >
                  <Reply className="w-4 h-4 mr-2" />
                  Reply
                </Button>
              )}

              {/* Show delete button for sender/recipient/admin */}
              {(message.sender?._id === user?.id || message.recipient?._id === user?.id || user?.role === 'admin') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMessage(message._id);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </CardFooter>
          </Card>
        ))
      )}

      {/* Reply Dialog */}
      <Dialog open={!!replyMessage} onOpenChange={(open) => !open && setReplyMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to {replyMessage?.sender?.fullName}</DialogTitle>
            <DialogDescription>Compose your reply to the message below.</DialogDescription>
          </DialogHeader>
          {replyMessage && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground break-words whitespace-pre-wrap">
                <p className="font-semibold text-xs mb-1">Replying to:</p>
                "{replyMessage.content}"
              </div>
              <MessageForm
                recipientId={replyMessage.sender?._id}
                listingId={replyMessage.listing?._id}
                onSuccess={() => {
                  setReplyMessage(null);
                  // Optionally reload messages to show the sent one if we were showing sent messages
                  loadMessages();
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
