import { useEffect, useState } from "react";
// Supabase import removed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";

interface Listing {
  id: string;
  title: string;
  type: string;
  verification_status: string;
  assigned_broker_id: string | null;
  broker_id: string;
  created_at: string;
  metadata?: any;
  brokerName?: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface Broker {
  id: string;
  full_name: string;
  email: string;
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ExternalLink } from "lucide-react";

// ... Listing Verification update

export default function ListingVerification() {
  console.log('Rendering ListingVerification component');
  const [pendingListings, setPendingListings] = useState<Listing[]>([]);
  const [assignedListings, setAssignedListings] = useState<Listing[]>([]);
  const [approvedListings, setApprovedListings] = useState<Listing[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Helper to fetch and return array or empty array
      const fetchArray = async (url: string) => {
        try {
          const res = await api.get(url);
          if (res.status !== 200) return [];
          const data = res.data;
          return Array.isArray(data) ? data : [];
        } catch (e) {
          console.error(`Error fetching ${url}:`, e);
          return [];
        }
      };

      // Load data in parallel
      const [pendingData, assignedData, approvedData, brokersData] = await Promise.all([
        fetchArray('/listings?pendingVerification=true'),
        fetchArray('/listings?verificationStatus=assigned'),
        fetchArray('/listings?status=active'),
        fetchArray('/brokers')
      ]);

      const mappedBrokers = brokersData.map((b: any) => ({
        id: b._id || b.id,
        full_name: b.fullName || 'Broker',
        email: b.email || ''
      }));

      const mapListing = (l: any) => ({
        id: l._id || l.id,
        title: l.title || 'Untitled',
        type: l.type || 'property',
        verification_status: l.verificationStatus || 'pending',
        assigned_broker_id: l.assignedBroker?._id || l.assignedBroker?.id || l.assignedBroker,
        broker_id: l.owner?._id || l.owner?.id,
        created_at: l.createdAt,
        metadata: l.metadata,
        profiles: {
          full_name: l.owner?.fullName || 'Unknown',
          email: l.owner?.email || ''
        },
        brokerName: l.assignedBroker?.fullName
      });

      setPendingListings(pendingData.map(mapListing));
      setAssignedListings(assignedData.map(mapListing));
      setApprovedListings(approvedData.map(mapListing));
      setBrokers(mappedBrokers);
    } catch (error) {
      console.error("Failed to load data", error);
      toast.error("Failed to load verification data");
    } finally {
      setLoading(false);
    }
  };

  const assignBroker = async (listingId: string, brokerId: string) => {
    try {
      const response = await api.put(`/listings/${listingId}/assign`, { brokerId });

      if (response.status !== 200) {
        toast.error(response.data.message || "Failed to assign broker");
        return;
      }

      toast.success("Broker assigned successfully");
      loadData();
    } catch (error) {
      console.error('Assignment request error:', error);
      toast.error("An error occurred during assignment");
    }
  };

  const handleAddNote = async (listing: any) => {
    const text = window.prompt(`Write verification note for "${listing.title}"`, "");
    if (!text || !text.trim()) return;
    try {
      const res = await api.post('/verification-notes', { listingId: listing.id, listingTitle: listing.title, note: text.trim() });
      if (res.status !== 201 && res.status !== 200) throw new Error('Failed to save note');
      toast.success('Note saved');
      window.dispatchEvent(new CustomEvent('verificationNotesUpdated'));
    } catch (error) {
      console.error('Failed to add note', error);
      toast.error('Failed to add note');
    }
  };

  const getStatusBadge = (status: string) => {
    // ... same implementation
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      pending: "secondary",
      assigned: "outline",
      approved: "default",
      rejected: "secondary"
    };
    return <Badge variant={variants[status] || "default"}>{status.toUpperCase()}</Badge>;
  };

  const openDocument = (url: string) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Listing Verification</h2>
        <p className="text-muted-foreground">Assign brokers to verify client listings</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingListings.length})</TabsTrigger>
          <TabsTrigger value="assigned">Assigned ({assignedListings.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedListings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Assignments</CardTitle>
              <CardDescription>Listings waiting for a broker</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingListings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No listings pending assignment</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Document</TableHead>
                      <TableHead>Assign To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingListings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium">{listing.title}</TableCell>
                        <TableCell className="capitalize">{listing.type}</TableCell>
                        <TableCell>{listing.profiles?.full_name || 'Unknown'}</TableCell>
                        <TableCell>
                          {listing.metadata?.license_document ? (
                            <Button variant="ghost" size="sm" onClick={() => openDocument(listing.metadata.license_document)}>
                              <FileText className="w-4 h-4 mr-2" /> View PDF
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">No Doc</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={listing.assigned_broker_id || ""}
                            onValueChange={(brokerId) => {
                              if (brokerId !== listing.assigned_broker_id) {
                                assignBroker(listing.id, brokerId);
                              } else {
                                toast.info("Listing already assigned to this broker");
                              }
                            }}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Select broker..." />
                            </SelectTrigger>
                            <SelectContent>
                              {brokers.length === 0 ? (
                                <SelectItem value="none" disabled>
                                  No brokers available
                                </SelectItem>
                              ) : (
                                brokers.map((broker) => (
                                  <SelectItem key={broker.id} value={broker.id}>
                                    {broker.full_name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>

                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleAddNote(listing)}>Add Note</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assigned">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Listings</CardTitle>
              <CardDescription>Listings currently under verification by brokers</CardDescription>
            </CardHeader>
            <CardContent>
              {assignedListings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No listings currently assigned</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Assigned Broker</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignedListings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium">{listing.title}</TableCell>
                        <TableCell className="capitalize">{listing.type}</TableCell>
                        <TableCell>{listing.profiles?.full_name}</TableCell>
                        <TableCell>
                          {/* Try to use populated name, fallback to lookup */}
                          {listing.brokerName || brokers.find(b => b.id === listing.assigned_broker_id)?.full_name || 'Unknown'}
                        </TableCell>
                        <TableCell>{getStatusBadge(listing.verification_status)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleAddNote(listing)}>Add Note</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Listings</CardTitle>
              <CardDescription>Listings that have been successfully verified and are active</CardDescription>
            </CardHeader>
            <CardContent>
              {approvedListings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No approved listings found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Assigned Broker</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedListings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium">{listing.title}</TableCell>
                        <TableCell className="capitalize">{listing.type}</TableCell>
                        <TableCell>{listing.profiles?.full_name}</TableCell>
                        <TableCell>
                          {listing.brokerName || brokers.find(b => b.id === listing.assigned_broker_id)?.full_name || 'N/A'}
                        </TableCell>
                        <TableCell>{getStatusBadge(listing.verification_status)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleAddNote(listing)}>Add Note</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
