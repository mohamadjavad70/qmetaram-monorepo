import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FileCheck, Eye, Check, X, Clock } from 'lucide-react';

interface KYCVerification {
  id: string;
  user_id: string;
  status: string | null;
  document_type: string | null;
  document_front_url: string | null;
  document_back_url: string | null;
  selfie_url: string | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  profiles?: {
    email: string | null;
    full_name: string | null;
  };
}

export const AdminKYCApprovals = () => {
  const [kycRequests, setKycRequests] = useState<KYCVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKYC, setSelectedKYC] = useState<KYCVerification | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [signedUrls, setSignedUrls] = useState<Record<string, string | null>>({});
  const [maskedDocNumber, setMaskedDocNumber] = useState<string | null>(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  useEffect(() => {
    fetchKYCRequests();
  }, []);

  const fetchKYCRequests = async () => {
    setIsLoading(true);
    try {
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_verifications')
        .select('id, user_id, status, document_type, document_front_url, document_back_url, selfie_url, rejection_reason, submitted_at, updated_at, verified_at, verified_by')
        .order('submitted_at', { ascending: false });

      if (kycError) throw kycError;

      // Fetch profiles separately to avoid FK relationship issue
      const userIds = kycData?.map(k => k.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      
      const enrichedData = kycData?.map(k => ({
        ...k,
        profiles: profilesMap.get(k.user_id) || { email: null, full_name: null }
      })) || [];

      setKycRequests(enrichedData);
    } catch (error) {
      console.error('Error fetching KYC requests:', error);
      toast.error('Failed to fetch KYC requests');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSignedUrls = async (kycId: string) => {
    setIsLoadingDocs(true);
    setSignedUrls({});
    setMaskedDocNumber(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-kyc-documents?action=get-signed-urls`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ kyc_id: kycId }),
        }
      );

      if (!response.ok) throw new Error('Failed to fetch signed URLs');
      const result = await response.json();
      setSignedUrls(result.signed_urls || {});
      setMaskedDocNumber(result.masked_document_number || null);
    } catch (error) {
      console.error('Error fetching signed URLs:', error);
      toast.error('Failed to load document previews');
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const updateKYCStatus = async (id: string, status: string, reason?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'approved') {
        updateData.verified_at = new Date().toISOString();
        updateData.verified_by = user?.id;
      }

      if (status === 'rejected' && reason) {
        updateData.rejection_reason = reason;
      }

      const { error } = await supabase
        .from('kyc_verifications')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setKycRequests(prev => prev.map(k => 
        k.id === id ? { ...k, status, rejection_reason: reason || k.rejection_reason } : k
      ));
      
      toast.success(`KYC ${status}`);
      setSelectedKYC(null);
      setIsRejectDialogOpen(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Error updating KYC:', error);
      toast.error('Failed to update KYC status');
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'under_review':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Under Review</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getDocumentTypeLabel = (type: string | null) => {
    switch (type) {
      case 'passport': return 'Passport';
      case 'id_card': return 'ID Card';
      case 'drivers_license': return "Driver's License";
      default: return type || '-';
    }
  };

  return (
    <>
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            KYC Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>User</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading KYC requests...
                    </TableCell>
                  </TableRow>
                ) : kycRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No KYC requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  kycRequests.map((kyc) => (
                    <TableRow key={kyc.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{kyc.profiles?.full_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{kyc.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getDocumentTypeLabel(kyc.document_type)}</TableCell>
                      <TableCell>{getStatusBadge(kyc.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {kyc.submitted_at ? new Date(kyc.submitted_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedKYC(kyc); fetchSignedUrls(kyc.id); }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {kyc.status === 'pending' || kyc.status === 'under_review' ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-400 hover:text-green-300"
                                onClick={() => updateKYCStatus(kyc.id, 'approved')}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300"
                                onClick={() => {
                                  setSelectedKYC(kyc);
                                  setIsRejectDialogOpen(true);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-yellow-400 hover:text-yellow-300"
                                onClick={() => updateKYCStatus(kyc.id, 'under_review')}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* KYC Details Dialog */}
      <Dialog open={!!selectedKYC && !isRejectDialogOpen} onOpenChange={() => setSelectedKYC(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>KYC Verification Details</DialogTitle>
          </DialogHeader>
          {selectedKYC && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">User</p>
                  <p className="font-medium">{selectedKYC.profiles?.full_name || 'Unknown'}</p>
                  <p className="text-sm">{selectedKYC.profiles?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Document</p>
                  <p className="font-medium">{getDocumentTypeLabel(selectedKYC.document_type)}</p>
                  <p className="text-sm">{maskedDocNumber || '****'}</p>
                </div>
              </div>
              
              {isLoadingDocs ? (
                <div className="text-center py-8 text-muted-foreground">Loading documents...</div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {signedUrls.document_front_url && (
                    <div className="border border-border rounded-lg p-2">
                      <p className="text-xs text-muted-foreground mb-2">Front</p>
                      <img src={signedUrls.document_front_url} alt="Document front" className="w-full rounded" />
                    </div>
                  )}
                  {signedUrls.document_back_url && (
                    <div className="border border-border rounded-lg p-2">
                      <p className="text-xs text-muted-foreground mb-2">Back</p>
                      <img src={signedUrls.document_back_url} alt="Document back" className="w-full rounded" />
                    </div>
                  )}
                  {signedUrls.selfie_url && (
                    <div className="border border-border rounded-lg p-2">
                      <p className="text-xs text-muted-foreground mb-2">Selfie</p>
                      <img src={signedUrls.selfie_url} alt="Selfie" className="w-full rounded" />
                    </div>
                  )}
                  {!signedUrls.document_front_url && !signedUrls.document_back_url && !signedUrls.selfie_url && (
                    <div className="col-span-3 text-center py-4 text-muted-foreground text-sm">
                      No documents available or storage bucket not configured
                    </div>
                  )}
                </div>
              )}

              {selectedKYC.rejection_reason && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-sm text-red-400">Rejection Reason: {selectedKYC.rejection_reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Verification</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedKYC && updateKYCStatus(selectedKYC.id, 'rejected', rejectionReason)}
              disabled={!rejectionReason.trim()}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
