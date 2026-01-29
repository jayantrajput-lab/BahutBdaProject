import { useState, useEffect } from 'react';
import useCheckerStore from '@/stores/checkerStore';
import { useAuthStore } from '@/stores/authStore';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, RefreshCw, Eye, Check, X } from 'lucide-react';

// Transaction type options
const TX_TYPE_OPTIONS = ['UPI', 'NEFT', 'RTGS', 'IMPS', 'CASH', 'CARD', 'ATM','OTHER'];

// Message type options
const MSG_TYPE_OPTIONS = ['DEBITED', 'CREDITED'];

// Message subtype options
const MSG_SUBTYPE_OPTIONS = ['FOOD', 'HEALTH', 'SHOPPING', 'TRAVEL', 'ENTERTAINMENT', 'BILLS', 'SALARY', 'TRANSFER', 'OTHER'];

const CheckerDashboard = () => {
  // Form fields
  const [smsTitle, setSmsTitle] = useState('');
  const [bankName, setBankName] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [txType, setTxType] = useState('');
  const [msgType, setMsgType] = useState('');
  const [msgSubtype, setMsgSubtype] = useState('');
  const [regexPattern, setRegexPattern] = useState('');
  const [sms, setSms] = useState('');
  
  // UI state
  const [activeTab, setActiveTab] = useState('queue');
  const [pendingPatterns, setPendingPatterns] = useState([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [loadedPattern, setLoadedPattern] = useState(null);
  
  // Store
  const { 
    extractFields, 
    approvePattern, 
    rejectPattern, 
    fetchPendings,
    extractedFields, 
    isLoading,
    clearExtractedFields 
  } = useCheckerStore();
  const { user } = useAuthStore();

  // Fetch pending patterns on mount and when switching to queue tab
  useEffect(() => {
    if (activeTab === 'queue') {
      loadPendingPatterns();
    }
  }, [activeTab]);

  useEffect(() => {
    loadPendingPatterns();
  }, []);

  const loadPendingPatterns = async () => {
    setIsLoadingPending(true);
    try {
      const patterns = await fetchPendings();
      setPendingPatterns(patterns || []);
    } catch (error) {
      console.error('Failed to fetch pending patterns:', error);
      toast.error('Failed to load pending patterns');
    } finally {
      setIsLoadingPending(false);
    }
  };

  const handleMatch = async () => {
    if (!regexPattern.trim() || !sms.trim()) {
      toast.error('Please enter both regex pattern and SMS');
      return;
    }

    try {
      const result = await extractFields(regexPattern, sms);
      if (result.matched) {
        toast.success('Pattern matched successfully!');
      } else {
        toast.error(result.message || 'Pattern did not match');
      }
    } catch (error) {
      toast.error('Failed to match pattern');
    }
  };

  // Build pattern data from current form fields
  const buildPatternData = () => ({
    patternId: loadedPattern?.patternId,
    pattern: regexPattern,
    sample: sms,
    smsTitle: smsTitle,
    bankName: bankName,
    merchantName: merchantName,
    txType: txType,
    msgType: msgType,
    msgSubtype: msgSubtype,
  });

  const handleApprove = async () => {
    if (!loadedPattern) {
      toast.error('No pattern loaded for review');
      return;
    }

    try {
      await approvePattern(buildPatternData());
      toast.success('Pattern approved successfully!');
      clearForm();
      loadPendingPatterns();
      setActiveTab('queue');
    } catch (error) {
      toast.error('Failed to approve pattern: ' + error.message);
    }
  };

  const handleReject = async () => {
    if (!loadedPattern) {
      toast.error('No pattern loaded for review');
      return;
    }

    try {
      await rejectPattern(buildPatternData());
      toast.success('Pattern rejected!');
      clearForm();
      loadPendingPatterns();
      setActiveTab('queue');
    } catch (error) {
      toast.error('Failed to reject pattern: ' + error.message);
    }
  };

  const clearForm = () => {
    setSmsTitle('');
    setBankName('');
    setMerchantName('');
    setTxType('');
    setMsgType('');
    setMsgSubtype('');
    setRegexPattern('');
    setSms('');
    setLoadedPattern(null);
    clearExtractedFields();
  };

  // Load a pending pattern into the review form
  const handleLoadForReview = (pattern) => {
    setLoadedPattern(pattern);
    setSmsTitle(pattern.smsTitle || '');
    setRegexPattern(pattern.pattern || '');
    setSms(pattern.sample || '');
    setBankName(pattern.bankName || '');
    setMerchantName(pattern.merchantName || '');
    setTxType(pattern.txType || '');
    setMsgType(pattern.msgType || '');
    setMsgSubtype(pattern.msgSubtype || '');
    clearExtractedFields();
    setActiveTab('review');
    toast.info('Pattern #' + pattern.patternId + ' loaded for review.');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="queue">
              Approval Queue
              {pendingPatterns.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {pendingPatterns.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="review">
              Review & Test
              {loadedPattern && (
                <Badge className="ml-2 text-xs bg-blue-500">
                  #{loadedPattern.patternId}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Approval Queue Tab */}
          <TabsContent value="queue" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pending Approvals</CardTitle>
                    <CardDescription>
                      Patterns submitted by makers waiting for review
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={loadPendingPatterns}
                    disabled={isLoadingPending}
                  >
                    {isLoadingPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-1">Refresh</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingPending ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading...</span>
                  </div>
                ) : pendingPatterns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending patterns to review 🎉
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingPatterns.map((pattern) => (
                      <div
                        key={pattern.patternId}
                        className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">ID: {pattern.patternId}</Badge>
                              <Badge variant="secondary">PENDING</Badge>
                              {pattern.bankName && (
                                <Badge variant="outline">{pattern.bankName}</Badge>
                              )}
                            </div>
                            <p className="text-sm font-mono bg-muted/50 p-2 rounded break-all">
                              {pattern.pattern || 'No pattern'}
                            </p>
                            {pattern.sample && (
                              <p className="text-sm mt-2 text-muted-foreground truncate">
                                Sample: {pattern.sample}
                              </p>
                            )}
                          </div>
                          <Button onClick={() => handleLoadForReview(pattern)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review & Test Tab */}
          <TabsContent value="review" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {loadedPattern ? `Reviewing Pattern #${loadedPattern.patternId}` : 'Review Pattern'}
                </CardTitle>
                <CardDescription>
                  Test the regex pattern before approving or rejecting. You can edit all fields.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Top row fields - EDITABLE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g., SBI, HDFC"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="merchantName">Merchant Name</Label>
                    <Input
                      id="merchantName"
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      placeholder="e.g., Amazon, Swiggy"
                    />
                  </div>
                </div>

                {/* Dropdown row - EDITABLE */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Transaction Type</Label>
                    <Select value={txType} onValueChange={setTxType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TX_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Message Type</Label>
                    <Select value={msgType} onValueChange={setMsgType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {MSG_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Message Subtype</Label>
                    <Select value={msgSubtype} onValueChange={setMsgSubtype}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subtype" />
                      </SelectTrigger>
                      <SelectContent>
                        {MSG_SUBTYPE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* SMS Title field */}
                <div className="space-y-2">
                  <Label htmlFor="smsTitle">SMS Title (for reference)</Label>
                  <Input
                    id="smsTitle"
                    value={smsTitle}
                    onChange={(e) => setSmsTitle(e.target.value)}
                    placeholder="e.g., AD-SBIBNK-S"
                  />
                </div>

                {/* Main fields - EDITABLE */}
                <div className="space-y-2">
                  <Label htmlFor="regex">Regex Pattern</Label>
                  <Textarea
                    id="regex"
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                    placeholder="Enter regex pattern with named groups like (?<amount>\d+)..."
                    className="font-mono text-sm min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sms">Sample SMS</Label>
                  <Textarea
                    id="sms"
                    value={sms}
                    onChange={(e) => setSms(e.target.value)}
                    placeholder="Paste sample SMS here..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* Match Button */}
                <Button 
                  onClick={handleMatch} 
                  disabled={isLoading || !regexPattern.trim() || !sms.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Matching...
                    </>
                  ) : (
                    'Match'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Extracted Fields Display */}
            {extractedFields && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Extracted Fields
                    {extractedFields.matched ? (
                      <Badge className="bg-green-500">Matched</Badge>
                    ) : (
                      <Badge variant="destructive">Not Matched</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {extractedFields.matched ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Amount</Label>
                        <div className="p-2 rounded border bg-muted/50 text-sm">
                          {extractedFields.amount || '-'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Account Number</Label>
                        <div className="p-2 rounded border bg-muted/50 text-sm">
                          {extractedFields.accountNumber || '-'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Bank Name</Label>
                        <div className="p-2 rounded border bg-muted/50 text-sm">
                          {extractedFields.bankName || '-'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Merchant Name</Label>
                        <div className="p-2 rounded border bg-muted/50 text-sm">
                          {extractedFields.merchantName || '-'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Transaction Type</Label>
                        <div className="p-2 rounded border bg-muted/50 text-sm">
                          {extractedFields.txType || '-'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Message Type</Label>
                        <div className="p-2 rounded border bg-muted/50 text-sm">
                          {extractedFields.msgType || '-'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Message Subtype</Label>
                        <div className="p-2 rounded border bg-muted/50 text-sm">
                          {extractedFields.msgSubtype || '-'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Date</Label>
                        <div className="p-2 rounded border bg-muted/50 text-sm">
                          {extractedFields.date || '-'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Reference Number</Label>
                        <div className="p-2 rounded border bg-muted/50 text-sm">
                          {extractedFields.referenceNo || '-'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Available Balance</Label>
                        <div className="p-2 rounded border bg-muted/50 text-sm">
                          {extractedFields.availableBalance || '-'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      {extractedFields.message || 'Pattern did not match the SMS'}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Button 
                    onClick={handleApprove}
                    disabled={isLoading || !loadedPattern}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isLoading || !loadedPattern}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
                {!loadedPattern && (
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    Load a pattern from the Approval Queue first
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CheckerDashboard;
