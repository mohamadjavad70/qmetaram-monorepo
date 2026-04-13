import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Plus, Trash2, Clock, Check, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  title: string;
  module_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ConversationSidebarProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string | null) => void;
  onNewConversation: () => void;
}

export const ConversationSidebar = ({
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationSidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchConversations = async () => {
    try {
      // Fetch conversations - RLS will automatically filter to user's own conversations
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(50); // Limit for performance

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_conversations",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from("chat_conversations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      if (selectedConversationId === id) {
        onNewConversation();
      }

      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed.",
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation.",
        variant: "destructive",
      });
    }
  };

  const startEditing = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditingTitle(title);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const handleRename = async (id: string) => {
    const trimmedTitle = editingTitle.trim();
    if (!trimmedTitle) {
      setEditingId(null);
      return;
    }

    try {
      const { error } = await supabase
        .from("chat_conversations")
        .update({ title: trimmedTitle })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Renamed",
        description: "Conversation renamed successfully.",
      });
    } catch (error) {
      console.error("Error renaming conversation:", error);
      toast({
        title: "Error",
        description: "Failed to rename conversation.",
        variant: "destructive",
      });
    } finally {
      setEditingId(null);
    }
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRename(id);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50">
        <Button
          onClick={onNewConversation}
          className="w-full gap-2"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-muted/30 animate-pulse"
                />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const isSelected = selectedConversationId === conversation.id;
              return (
                <motion.button
                  key={conversation.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full p-3 rounded-xl text-left transition-all group ${
                    isSelected
                      ? "glass border-2 border-primary"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "bg-primary/20"
                          : "bg-muted/50"
                      }`}
                    >
                      <MessageSquare
                        className={`w-4 h-4 ${
                          isSelected ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingId === conversation.id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Input
                            ref={editInputRef}
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, conversation.id)}
                            className="h-6 text-sm py-0 px-1"
                            maxLength={100}
                          />
                          <button
                            onClick={() => handleRename(conversation.id)}
                            className="p-1 rounded hover:bg-primary/20"
                          >
                            <Check className="w-3 h-3 text-primary" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1 rounded hover:bg-destructive/20"
                          >
                            <X className="w-3 h-3 text-destructive" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={(e) => startEditing(conversation.id, conversation.title, e)}
                          className={`font-medium text-sm truncate cursor-text hover:underline ${
                            isSelected ? "text-primary" : ""
                          }`}
                          title="Click to rename"
                        >
                          {conversation.title}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(conversation.updated_at)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(conversation.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
