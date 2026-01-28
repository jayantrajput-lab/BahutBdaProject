import { useState, useEffect } from 'react';
import { useMakerStore } from '@/stores/makerStore';
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
import { Loader2, RefreshCw, Edit, AlertTriangle, XCircle, FileText } from 'lucide-react';

// Transaction type options
const TX_TYPE_OPTIONS = ['UPI', 'NEFT', 'RTGS', 'IMPS', 'CASH', 'CARD', 'ATM', 'OTHER'];

// Message type options
const MSG_TYPE_OPTIONS = ['DEBITED', 'CREDITED'];

// Message subtype options
const MSG_SUBTYPE_OPTIONS = ['FOOD', 'HEALTH', 'SHOPPING', 'TRAVEL', 'ENTERTAINMENT', 'BILLS', 'SALARY', 'TRANSFER', 'OTHER'];

const MakerDashboard = () => {
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
  const [activeTab, setActiveTab] = useState('builder');
  const [draftPatterns, setDraftPatterns] = useState([]);
  const [rejectedPatterns, setRejectedPatterns] = useState([]);
  const [failedPatterns, setFailedPatterns] = useState([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
  const [isLoadingRejected, setIsLoadingRejected] = useState(false);
  const [isLoadingFailed, setIsLoadingFailed] = useState(false);
  const [loadedPatternId, setLoadedPatternId] = useState(null); // Track if editing existing pattern
  
  // Store
  const { 
    extractFields, 
    saveDraft, 
    savePending,
    submitDraft,
    updateDraft,
    fetchDrafts,
    fetchRejected, 
    fetchFailed,
    extractedFields, 
    isLoading,
    clearExtractedFields 
  } = useMakerStore();
  const { user } = useAuthStore();

  // Fetch draft patterns when switching to the drafts tab
  useEffect(() => {
    if (activeTab === 'drafts') {
      loadDraftPatterns();
    }
  }, [activeTab]);

  // Fetch rejected patterns when switching to the rejected tab
  useEffect(() => {
    if (activeTab === 'rejected') {
      loadRejectedPatterns();
    }
  }, [activeTab]);

  // Fetch failed patterns when switching to the failed tab
  useEffect(() => {
    if (activeTab === 'failed') {
      loadFailedPatterns();
    }
  }, [activeTab]);

  const loadDraftPatterns = async () => {
    setIsLoadingDrafts(true);
    try {
      const patterns = await fetchDrafts();
      setDraftPatterns(patterns || []);
    } catch (error) {
      console.error('Failed to fetch draft patterns:', error);
      toast.error('Failed to load draft patterns');
    } finally {
      setIsLoadingDrafts(false);
    }
  };

  const loadRejectedPatterns = async () => {
    setIsLoadingRejected(true);
    try {
      const patterns = await fetchRejected();
      setRejectedPatterns(patterns || []);
    } catch (error) {
      console.error('Failed to fetch rejected patterns:', error);
      toast.error('Failed to load rejected patterns');
    } finally {
      setIsLoadingRejected(false);
    }
  };

  const loadFailedPatterns = async () => {
    setIsLoadingFailed(true);
    try {
      const patterns = await fetchFailed();
      setFailedPatterns(patterns || []);
    } catch (error) {
      console.error('Failed to fetch failed patterns:', error);
      toast.error('Failed to load failed patterns');
    } finally {
      setIsLoadingFailed(false);
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

  const getPatternData = () => ({
    smsTitle,
    pattern: regexPattern,
    sample: sms,
    bankName,
    merchantName,
    txType,
    msgType,
    msgSubtype,
  });

  const handleSaveDraft = async () => {
    if (!regexPattern.trim()) {
      toast.error('Please enter a regex pattern');
      return;
    }

    try {
      if (loadedPatternId) {
        // Update existing draft
        await updateDraft(loadedPatternId, getPatternData());
        toast.success('Draft updated successfully!');
      } else {
        // Create new draft
        await saveDraft(getPatternData());
        toast.success('Draft saved successfully!');
      }
      clearForm();
      loadDraftPatterns(); // Refresh drafts list
    } catch (error) {
      toast.error('Failed to save draft');
    }
  };

  const handleSendForApproval = async () => {
    if (!regexPattern.trim() || !sms.trim()) {
      toast.error('Please fill in pattern and sample SMS');
      return;
    }

    try {
      if (loadedPatternId) {
        // Submit existing draft for approval (update status to PENDING)
        await submitDraft(loadedPatternId, getPatternData());
        toast.success('Draft submitted for approval!');
      } else {
        // Create new pattern with PENDING status
        await savePending(getPatternData());
        toast.success('Submitted for approval!');
      }
      clearForm();
      loadDraftPatterns(); // Refresh drafts list
    } catch (error) {
      toast.error('Failed to submit for approval');
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
    setLoadedPatternId(null); // Reset loaded pattern tracking
    clearExtractedFields();
  };

  // Load a rejected pattern into the builder for editing/resubmitting
  const handleEditRejected = (pattern) => {
    setRegexPattern(pattern.pattern || '');
    setSms(pattern.sample || '');
    setBankName(pattern.bankName || '');
    setMerchantName(pattern.merchantName || '');
    setTxType(pattern.txType || '');
    setMsgType(pattern.msgType || '');
    setMsgSubtype(pattern.msgSubtype || '');
    clearExtractedFields();
    setActiveTab('builder');
    toast.info('Pattern loaded into builder. Edit and resubmit when ready.');
  };

  // Load a failed pattern into the builder
  const handleEditFailed = (pattern) => {
    setRegexPattern(pattern.pattern || '');
    setSms(pattern.sample || '');
    setBankName(pattern.bankName || '');
    setMerchantName(pattern.merchantName || '');
    setTxType(pattern.txType || '');
    setMsgType(pattern.msgType || '');
    setMsgSubtype(pattern.msgSubtype || '');
    clearExtractedFields();
    setActiveTab('builder');
    toast.info('Failed pattern loaded. Fix and resubmit.');
  };

  // Load a draft pattern into the builder
  const handleEditDraft = (pattern) => {
    setLoadedPatternId(pattern.patternId); // Track which draft we're editing
    setRegexPattern(pattern.pattern || '');
    setSms(pattern.sample || '');
    setBankName(pattern.bankName || '');
    setMerchantName(pattern.merchantName || '');
    setTxType(pattern.txType || '');
    setMsgType(pattern.msgType || '');
    setMsgSubtype(pattern.msgSubtype || '');
    clearExtractedFields();
    setActiveTab('builder');
    toast.info(`Editing Draft #${pattern.patternId}. Changes will update this draft.`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="builder">Regex Builder</TabsTrigger>
            <TabsTrigger value="drafts">
              Drafts
              {draftPatterns.length > 0 && (
                <Badge variant="outline" className="ml-2 text-xs bg-blue-100 text-blue-700">
                  {draftPatterns.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="failed">
              Failed
              {failedPatterns.length > 0 && (
                <Badge variant="outline" className="ml-2 text-xs bg-amber-100 text-amber-700">
                  {failedPatterns.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected
              {rejectedPatterns.length > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {rejectedPatterns.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Regex Builder Tab */}
          <TabsContent value="builder" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Regex Builder
                      {loadedPatternId && (
                        <Badge className="bg-blue-500">Editing Draft #{loadedPatternId}</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {loadedPatternId 
                        ? 'Editing existing draft. Save or submit for approval.'
                        : 'Create and test regex patterns for SMS parsing'
                      }
                    </CardDescription>
                  </div>
                  {loadedPatternId && (
                    <Button variant="outline" size="sm" onClick={clearForm}>
                      New Pattern
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Top row fields */}
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

                {/* Dropdown row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Transaction Type</Label>
                    <Select value={txType} onValueChange={setTxType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TX_TYPE_OPTIONS.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
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
                        {MSG_TYPE_OPTIONS.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
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
                        {MSG_SUBTYPE_OPTIONS.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* SMS Title field */}
                <div className="space-y-2">
                  <Label htmlFor="smsTitle">SMS Title</Label>
                  <Input
                    id="smsTitle"
                    value={smsTitle}
                    onChange={(e) => setSmsTitle(e.target.value)}
                    placeholder="e.g., AD-SBIBNK-S"
                  />
                </div>

                {/* Main fields */}
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
                    variant="outline" 
                    onClick={handleSaveDraft}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Save as Draft
                  </Button>
                  <Button 
                    onClick={handleSendForApproval}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Send for Approval
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drafts Tab */}
          <TabsContent value="drafts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Draft Patterns
                    </CardTitle>
                    <CardDescription>
                      Patterns saved as drafts. Continue editing or submit for approval.
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={loadDraftPatterns}
                    disabled={isLoadingDrafts}
                  >
                    {isLoadingDrafts ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-1">Refresh</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingDrafts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading...</span>
                  </div>
                ) : draftPatterns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No draft patterns
                  </div>
                ) : (
                  <div className="space-y-4">
                    {draftPatterns.map((pattern) => (
                      <div
                        key={pattern.patternId}
                        className="p-4 border border-blue-300 rounded-lg bg-blue-50 dark:bg-blue-950/30"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">ID: {pattern.patternId}</Badge>
                              <Badge className="bg-blue-500">DRAFT</Badge>
                              {pattern.bankName && (
                                <Badge variant="outline">{pattern.bankName}</Badge>
                              )}
                            </div>
                            <p className="text-sm font-mono bg-background p-2 rounded border break-all">
                              {pattern.pattern || 'No pattern'}
                            </p>
                            {pattern.sample && (
                              <p className="text-sm mt-2 text-muted-foreground truncate">
                                Sample: {pattern.sample}
                              </p>
                            )}
                          </div>
                          <Button onClick={() => handleEditDraft(pattern)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Failed Patterns Tab */}
          <TabsContent value="failed" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-amber-600" />
                      Failed Patterns
                    </CardTitle>
                    <CardDescription>
                      Patterns that failed to match. Fix and resubmit.
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={loadFailedPatterns}
                    disabled={isLoadingFailed}
                  >
                    {isLoadingFailed ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-1">Refresh</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingFailed ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading...</span>
                  </div>
                ) : failedPatterns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No failed patterns 🎉
                  </div>
                ) : (
                  <div className="space-y-4">
                    {failedPatterns.map((pattern) => (
                      <div
                        key={pattern.patternId}
                        className="p-4 border border-amber-300 rounded-lg bg-amber-50 dark:bg-amber-950/30"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">ID: {pattern.patternId}</Badge>
                              <Badge className="bg-amber-500">FAILED</Badge>
                            </div>
                            <p className="text-sm font-mono bg-background p-2 rounded border break-all">
                              {pattern.pattern || 'No pattern'}
                            </p>
                            {pattern.sample && (
                              <p className="text-sm mt-2 text-muted-foreground">
                                Sample: {pattern.sample}
                              </p>
                            )}
                          </div>
                          <Button onClick={() => handleEditFailed(pattern)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rejected Patterns Tab */}
          <TabsContent value="rejected" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Rejected Patterns
                    </CardTitle>
                    <CardDescription>
                      Patterns rejected by checker. Edit and resubmit.
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={loadRejectedPatterns}
                    disabled={isLoadingRejected}
                  >
                    {isLoadingRejected ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-1">Refresh</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingRejected ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading...</span>
                  </div>
                ) : rejectedPatterns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No rejected patterns 🎉
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rejectedPatterns.map((pattern) => (
                      <div
                        key={pattern.patternId}
                        className="p-4 border border-destructive/30 rounded-lg bg-destructive/5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">ID: {pattern.patternId}</Badge>
                              <Badge variant="destructive">REJECTED</Badge>
                            </div>
                            <p className="text-sm font-mono bg-background p-2 rounded border break-all">
                              {pattern.pattern || 'No pattern'}
                            </p>
                            {pattern.sample && (
                              <p className="text-sm mt-2 text-muted-foreground">
                                Sample: {pattern.sample}
                              </p>
                            )}
                          </div>
                          <Button onClick={() => handleEditRejected(pattern)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit & Resubmit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MakerDashboard;
