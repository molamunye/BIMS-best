import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Trash2 } from 'lucide-react';

interface VerificationNote {
  _id: string;
  note: string;
  createdAt: string;
}

export default function VerificationTaskNote() {
  const [notes, setNotes] = useState<VerificationNote[]>([]);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/verification-notes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error("Failed to fetch verification notes", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNote = async () => {
    setIsSaving(true);
    try {
        const token = JSON.parse(localStorage.getItem('user') || '{}').token;
        if (!token) return;

        const response = await fetch('http://localhost:5000/api/verification-notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ note }),
        });

        if (response.ok) {
            setNote('');
            fetchNotes(); // Refresh notes list
        } else {
            console.error("Failed to save note");
        }
    } catch (error) {
        console.error("Failed to save note", error);
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
        const token = JSON.parse(localStorage.getItem('user') || '{}').token;
        if (!token) return;

        const response = await fetch(`http://localhost:5000/api/verification-notes/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            fetchNotes(); // Refresh notes list
        } else {
            console.error("Failed to delete note");
        }
    } catch (error) {
        console.error("Failed to delete note", error);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Verification Task Note</CardTitle>
          <CardDescription>Create a new note for your verification tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-2">
            <Textarea
              placeholder="Type your verification note here."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button onClick={handleSaveNote} disabled={isSaving || !note.trim()}>
              {isSaving ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Verification Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading notes...</p>
          ) : notes.length > 0 ? (
            <div className="space-y-4">
              {notes.map((n) => (
                <Card key={n._id}>
                  <CardContent className="p-4 flex justify-between items-start">
                    <div>
                      <p className="text-sm">{n.note}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteNote(n._id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p>No verification notes found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
