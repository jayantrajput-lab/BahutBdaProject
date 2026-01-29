import { useState, useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, RefreshCw, ArrowDownCircle, ArrowUpCircle, Wallet, CheckCircle2, Database, Save, Filter, Upload, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Category options for filtering
const CATEGORY_OPTIONS = ['ALL', 'FOOD', 'HEALTH', 'SHOPPING', 'TRAVEL', 'ENTERTAINMENT', 'BILLS', 'SALARY', 'TRANSFER', 'OTHER'];

const UserDashboard = () => {
  const [smsTitle, setSmsTitle] = useState('');
  const [sms, setSms] = useState('');
  const [activeTab, setActiveTab] = useState('extract');
  const [isSaving, setIsSaving] = useState(false);
  
  // Bulk SMS states
  const [bulkInput, setBulkInput] = useState('');
  const [bulkSavingIndex, setBulkSavingIndex] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, DEBIT, CREDIT
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // ALL, FOOD, HEALTH, etc.
  
  const { 
    transactions, 
    extractedFields, 
    bulkResults,
    isLoading, 
    isBulkLoading,
    fetchTransactions, 
    findPattern,
    saveTransaction,
    clearExtractedFields,
    bulkParse,
    clearBulkResults
  } = useUserStore();
  const { user } = useAuthStore();

  // Fetch transactions on mount
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      await fetchTransactions();
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions');
    }
  };

  const handleFindPattern = async () => {
    if (!sms.trim() || !smsTitle.trim()) {
      toast.error('Please enter both SMS title and SMS content');
      return;
    }

    try {
      const result = await findPattern(sms, smsTitle);
      if (result.matched) {
        toast.success('Pattern matched successfully!');
      } else {
        toast.error(result.message || 'No matching pattern found');
      }
    } catch (error) {
      toast.error('Failed to find pattern');
    }
  };

  const clearForm = () => {
    setSmsTitle('');
    setSms('');
    clearExtractedFields();
  };

  // Bulk SMS parsing handlers
  const handleBulkParse = async () => {
    if (!bulkInput.trim()) {
      toast.error('Please enter SMS data');
      return;
    }

    try {
      // Parse the input - expects JSON array format
      let smsList;
      try {
        smsList = JSON.parse(bulkInput);
        if (!Array.isArray(smsList)) {
          throw new Error('Input must be a JSON array');
        }
      } catch (parseError) {
        toast.error('Invalid JSON format. Please check the format and try again.');
        return;
      }

      // Validate each item has smsTitle and sms
      for (let i = 0; i < smsList.length; i++) {
        if (!smsList[i].smsTitle || !smsList[i].sms) {
          toast.error(`Item ${i + 1} is missing smsTitle or sms`);
          return;
        }
      }

      const result = await bulkParse(smsList);
      toast.success(`Parsed ${result.totalCount} SMS: ${result.successCount} matched, ${result.failedCount} failed`);
    } catch (error) {
      toast.error('Failed to parse SMS: ' + error.message);
    }
  };

  const clearBulkForm = () => {
    setBulkInput('');
    setUploadedFileName('');
    clearBulkResults();
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['.json', '.txt'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validTypes.includes(fileExtension)) {
      toast.error('Please upload a .json or .txt file');
      return;
    }

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        setBulkInput(content);
        setUploadedFileName(file.name);
        toast.success(`File "${file.name}" loaded successfully`);
      } catch (error) {
        toast.error('Failed to read file');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
  };

  const handleSaveBulkTransaction = async (result) => {
    if (!result.matched) {
      toast.error('Cannot save failed transaction');
      return;
    }

    setBulkSavingIndex(result.index);
    try {
      await saveTransaction({
        msg: result.sms,
        bankName: result.bankName,
        merchantName: result.merchantName,
        amount: result.amount,
        accountNumber: result.accountNumber,
        txType: result.txType,
        msgType: result.msgType,
        msgSubtype: result.msgSubtype,
        date: result.date,
        referenceNo: result.referenceNo,
        availableBalance: result.availableBalance,
      });
      toast.success('Transaction saved!');
    } catch (error) {
      toast.error('Failed to save: ' + error.message);
    } finally {
      setBulkSavingIndex(null);
    }
  };

  const handleSaveAllMatched = async () => {
    if (!bulkResults || bulkResults.successCount === 0) {
      toast.error('No matched transactions to save');
      return;
    }

    const matchedResults = bulkResults.results.filter(r => r.matched);
    let savedCount = 0;
    let failedCount = 0;

    for (const result of matchedResults) {
      try {
        await saveTransaction({
          msg: result.sms,
          bankName: result.bankName,
          merchantName: result.merchantName,
          amount: result.amount,
          accountNumber: result.accountNumber,
          txType: result.txType,
          msgType: result.msgType,
          msgSubtype: result.msgSubtype,
          date: result.date,
          referenceNo: result.referenceNo,
          availableBalance: result.availableBalance,
        });
        savedCount++;
      } catch (error) {
        failedCount++;
      }
    }

    toast.success(`Saved ${savedCount} transactions${failedCount > 0 ? `, ${failedCount} failed` : ''}`);
  };

  // Sample JSON format for bulk input
  const sampleBulkFormat = `[
  {
    "smsTitle": "AD-HDFCBK",
    "sms": "Alert: Your A/c XX5678 debited for INR 2,500.00 on 10-Jan-26 via UPI to AMAZON. Avl Bal: INR 15,420.50. Ref No: 60123456789"
  },
  {
    "smsTitle": "AD-SBIBNK",
    "sms": "Your account XX1234 has been credited with Rs.5000 on 11-Jan-26"
  }
]`;

  const handleSaveTransaction = async () => {
    if (!extractedFields || !extractedFields.matched) {
      toast.error('No valid transaction to save');
      return;
    }

    setIsSaving(true);
    try {
      await saveTransaction({
        msg: sms,
        bankName: extractedFields.bankName,
        merchantName: extractedFields.merchantName,
        amount: extractedFields.amount,
        accountNumber: extractedFields.accountNumber,
        txType: extractedFields.txType,
        msgType: extractedFields.msgType,
        msgSubtype: extractedFields.msgSubtype, // Auto-detected from merchant name
        date: extractedFields.date,
        referenceNo: extractedFields.referenceNo,
        availableBalance: extractedFields.availableBalance,
      });
      toast.success('Transaction saved to history!');
      clearForm();
      setActiveTab('history'); // Switch to history tab to show the saved transaction
    } catch (error) {
      toast.error('Failed to save transaction: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return '-';
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTypeBadge = (type) => {
    if (type === 'DEBITED' || type === 'DEBIT') {
      return <Badge variant="destructive" className="gap-1"><ArrowDownCircle className="h-3 w-3" /> Debit</Badge>;
    } else if (type === 'CREDITED' || type === 'CREDIT') {
      return <Badge className="gap-1 bg-green-600"><ArrowUpCircle className="h-3 w-3" /> Credit</Badge>;
    }
    return <Badge variant="outline">{type || 'Unknown'}</Badge>;
  };

  const calculateTotals = () => {
    const debitTotal = transactions
      .filter(t => t.msgType === 'DEBITED' || t.txType === 'DEBIT')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    const creditTotal = transactions
      .filter(t => t.msgType === 'CREDITED' || t.txType === 'CREDIT')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    return { debitTotal, creditTotal, balance: creditTotal - debitTotal };
  };

  const totals = calculateTotals();

  // Filter transactions based on selected filters
  const filteredTransactions = transactions.filter(t => {
    // Type filter
    if (typeFilter === 'DEBIT' && t.msgType !== 'DEBITED' && t.msgType !== 'DEBIT') {
      return false;
    }
    if (typeFilter === 'CREDIT' && t.msgType !== 'CREDITED' && t.msgType !== 'CREDIT') {
      return false;
    }
    
    // Category filter
    if (categoryFilter !== 'ALL' && t.msgSubtype !== categoryFilter) {
      return false;
    }
    
    return true;
  });

  // Clear all filters
  const clearFilters = () => {
    setTypeFilter('ALL');
    setCategoryFilter('ALL');
  };

  // Field display component that shows if value was parsed or from pattern
  const FieldDisplay = ({ label, value, isParsed = true }) => (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Label className="text-muted-foreground">{label}</Label>
        {value && value !== '-' ? (
          isParsed ? (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" /> Parsed
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-blue-600">
              <Database className="h-3 w-3" /> Pattern Default
            </span>
          )
        ) : (
          <span className="text-xs text-muted-foreground">(not extracted)</span>
        )}
      </div>
      <div className={`p-2 rounded border text-sm ${
        value && value !== '-' 
          ? isParsed 
            ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' 
            : 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800'
          : 'bg-muted/50 border-dashed'
      }`}>
        {value || '-'}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="extract">Parse SMS</TabsTrigger>
            <TabsTrigger value="bulk">
              <Upload className="h-4 w-4 mr-1" />
              Bulk Parse
            </TabsTrigger>
            <TabsTrigger value="history">
              Transactions
              {transactions.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {transactions.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Parse SMS Tab */}
          <TabsContent value="extract" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Parse Transaction SMS</CardTitle>
                <CardDescription>
                  Enter your SMS details to extract transaction information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smsTitle">SMS Title (Sender)</Label>
                  <Input
                    id="smsTitle"
                    value={smsTitle}
                    onChange={(e) => setSmsTitle(e.target.value)}
                    placeholder="e.g., AD-SBIBNK-S, AX-HDFCBK"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sms">SMS Content</Label>
                  <Textarea
                    id="sms"
                    value={sms}
                    onChange={(e) => setSms(e.target.value)}
                    placeholder="Paste your bank SMS here..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleFindPattern} 
                    disabled={isLoading || !sms.trim() || !smsTitle.trim()}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Parsing...
                      </>
                    ) : (
                      'Parse SMS'
                    )}
                  </Button>
                  <Button variant="outline" onClick={clearForm}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Extracted Fields Display */}
            {extractedFields && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Extracted Transaction Details
                    {extractedFields.matched ? (
                      <Badge className="bg-green-500">Matched</Badge>
                    ) : (
                      <Badge variant="destructive">Not Matched</Badge>
                    )}
                  </CardTitle>
                  {extractedFields.matched && (
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" /> Parsed from SMS
                      </span>
                      <span className="flex items-center gap-1 text-blue-600">
                        <Database className="h-4 w-4" /> From Pattern Default
                      </span>
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {extractedFields.matched ? (
                    <div className="space-y-6">
                      {/* Pattern Info */}
                      {extractedFields.patternId && (
                        <div className="p-3 bg-muted/50 rounded-lg border">
                          <p className="text-sm text-muted-foreground">
                            <strong>Matched Pattern ID:</strong> #{extractedFields.patternId}
                          </p>
                        </div>
                      )}

                      {/* Main extracted values - Show ALL fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Amount */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Label className="text-muted-foreground">Amount</Label>
                            {extractedFields.amount ? (
                              <span className="flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle2 className="h-3 w-3" /> Parsed
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">(not extracted)</span>
                            )}
                          </div>
                          <div className={`p-3 rounded border text-lg font-bold ${
                            extractedFields.amount 
                              ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' 
                              : 'bg-muted/50 border-dashed'
                          }`}>
                            {extractedFields.amount ? formatAmount(extractedFields.amount) : '-'}
                          </div>
                        </div>

                        {/* Account Number */}
                        <FieldDisplay 
                          label="Account Number" 
                          value={extractedFields.accountNumber} 
                          isParsed={!!extractedFields.accountNumber}
                        />
                        
                        {/* Bank Name */}
                        <FieldDisplay 
                          label="Bank Name" 
                          value={extractedFields.bankName}
                          isParsed={extractedFields.parsedBankName !== false}
                        />
                        
                        {/* Merchant Name */}
                        <FieldDisplay 
                          label="Merchant Name" 
                          value={extractedFields.merchantName}
                          isParsed={extractedFields.parsedMerchantName !== false}
                        />

                        {/* Transaction Type (UPI, NEFT, etc.) */}
                        <FieldDisplay 
                          label="Transaction Type (UPI/NEFT/etc.)" 
                          value={extractedFields.txType}
                          isParsed={extractedFields.parsedTxType !== false}
                        />

                        {/* Message Type (DEBIT/CREDIT) */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Label className="text-muted-foreground">Message Type (Debit/Credit)</Label>
                            {extractedFields.msgType ? (
                              <span className="flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle2 className="h-3 w-3" /> Parsed
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">(not extracted)</span>
                            )}
                          </div>
                          <div className={`p-2 rounded border ${
                            extractedFields.msgType 
                              ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' 
                              : 'bg-muted/50 border-dashed'
                          }`}>
                            {extractedFields.msgType ? getTypeBadge(extractedFields.msgType) : '-'}
                          </div>
                        </div>

                        {/* Category (Auto-detected from merchant) */}
                        <FieldDisplay 
                          label="Category (Auto-detected)" 
                          value={extractedFields.msgSubtype}
                          isParsed={!!extractedFields.msgSubtype}
                        />

                        {/* Date */}
                        <FieldDisplay 
                          label="Date" 
                          value={extractedFields.date}
                          isParsed={!!extractedFields.date}
                        />

                        {/* Reference Number */}
                        <FieldDisplay 
                          label="Reference Number" 
                          value={extractedFields.referenceNo}
                          isParsed={!!extractedFields.referenceNo}
                        />

                        {/* Available Balance */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Label className="text-muted-foreground">Available Balance</Label>
                            {extractedFields.availableBalance ? (
                              <span className="flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle2 className="h-3 w-3" /> Parsed
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">(not extracted)</span>
                            )}
                          </div>
                          <div className={`p-2 rounded border text-sm font-semibold ${
                            extractedFields.availableBalance 
                              ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' 
                              : 'bg-muted/50 border-dashed'
                          }`}>
                            {extractedFields.availableBalance ? formatAmount(extractedFields.availableBalance) : '-'}
                          </div>
                        </div>
                      </div>

                      {/* Summary section with Save button */}
                      <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">Transaction Summary</h4>
                          <Button 
                            onClick={handleSaveTransaction}
                            disabled={isSaving}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save to History
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <p className="font-semibold">{formatAmount(extractedFields.amount)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <p className="font-semibold">{extractedFields.msgType || '-'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Bank:</span>
                            <p className="font-semibold">{extractedFields.bankName || '-'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">To/From:</span>
                            <p className="font-semibold">{extractedFields.merchantName || '-'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Category:</span>
                            <p className="font-semibold">{extractedFields.msgSubtype || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-lg">{extractedFields.message || 'No matching pattern found for this SMS'}</p>
                      <p className="text-sm mt-2">
                        Make sure the SMS title contains the bank name (e.g., SBI, HDFC) and an approved pattern exists for this bank.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Bulk Parse Tab */}
          <TabsContent value="bulk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Bulk SMS Parser
                </CardTitle>
                <CardDescription>
                  Parse multiple SMS messages at once. Enter SMS data in JSON format.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload Section */}
                <div className="space-y-3">
                  <Label>Upload SMS File (.json or .txt)</Label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1">
                      <div className={`
                        flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer
                        transition-colors hover:border-primary hover:bg-muted/50
                        ${uploadedFileName ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-muted-foreground/25'}
                      `}>
                        {uploadedFileName ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium text-green-600">{uploadedFileName}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Click to upload or drag and drop
                            </span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept=".json,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setBulkInput(sampleBulkFormat)}
                      className="whitespace-nowrap"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Load Sample
                    </Button>
                  </div>
                </div>

                {/* Preview/Edit Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bulkInput">
                      {uploadedFileName ? 'File Content (editable)' : 'Or paste JSON directly'}
                    </Label>
                    {bulkInput && (
                      <span className="text-xs text-muted-foreground">
                        {(() => {
                          try {
                            const parsed = JSON.parse(bulkInput);
                            return `${Array.isArray(parsed) ? parsed.length : 0} SMS entries`;
                          } catch {
                            return 'Invalid JSON';
                          }
                        })()}
                      </span>
                    )}
                  </div>
                  <Textarea
                    id="bulkInput"
                    value={bulkInput}
                    onChange={(e) => {
                      setBulkInput(e.target.value);
                      if (uploadedFileName) setUploadedFileName(''); // Clear filename if manually edited
                    }}
                    placeholder={sampleBulkFormat}
                    className="min-h-[180px] font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: JSON array with objects containing "smsTitle" and "sms" fields
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleBulkParse} 
                    disabled={isBulkLoading || !bulkInput.trim()}
                    className="flex-1"
                  >
                    {isBulkLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Parsing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Parse All SMS
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={clearBulkForm}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bulk Results Display */}
            {bulkResults && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Parsing Results</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Badge variant="secondary">{bulkResults.totalCount}</Badge> Total
                        </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <Badge className="bg-green-600">{bulkResults.successCount}</Badge> Matched
                        </span>
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                          <Badge variant="destructive">{bulkResults.failedCount}</Badge> Failed
                        </span>
                      </CardDescription>
                    </div>
                    {bulkResults.successCount > 0 && (
                      <Button 
                        onClick={handleSaveAllMatched}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save All Matched ({bulkResults.successCount})
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bulkResults.results.map((result) => (
                      <div
                        key={result.index}
                        className={`p-4 rounded-lg border ${
                          result.matched 
                            ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                            : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">#{result.index + 1}</Badge>
                            {result.matched ? (
                              <Badge className="bg-green-600 gap-1">
                                <CheckCircle className="h-3 w-3" /> Matched
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1">
                                <XCircle className="h-3 w-3" /> Failed
                              </Badge>
                            )}
                            <span className="text-sm font-medium">{result.smsTitle}</span>
                          </div>
                          {result.matched && (
                            <Button
                              size="sm"
                              onClick={() => handleSaveBulkTransaction(result)}
                              disabled={bulkSavingIndex === result.index}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {bulkSavingIndex === result.index ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <Save className="h-3 w-3 mr-1" />
                                  Save
                                </>
                              )}
                            </Button>
                          )}
                        </div>

                        {result.matched ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Amount:</span>
                              <p className="font-bold text-lg">{formatAmount(result.amount)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Type:</span>
                              <p>{result.msgType ? getTypeBadge(result.msgType) : '-'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Merchant:</span>
                              <p className="font-medium">{result.merchantName || '-'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Category:</span>
                              <p><Badge variant="secondary">{result.msgSubtype || '-'}</Badge></p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Bank:</span>
                              <p className="font-medium">{result.bankName || '-'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Account:</span>
                              <p className="font-medium">{result.accountNumber || '-'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Date:</span>
                              <p className="font-medium">{result.date || '-'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Tx Type:</span>
                              <p><Badge variant="outline">{result.txType || '-'}</Badge></p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 text-red-600">
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">{result.message}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                SMS: {result.sms}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Transaction History Tab */}
          <TabsContent value="history" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Debits</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatAmount(totals.debitTotal)}
                      </p>
                    </div>
                    <ArrowDownCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Credits</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatAmount(totals.creditTotal)}
                      </p>
                    </div>
                    <ArrowUpCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Net Balance</p>
                      <p className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatAmount(Math.abs(totals.balance))}
                      </p>
                    </div>
                    <Wallet className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transactions List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Transactions</CardTitle>
                    <CardDescription>
                      {filteredTransactions.length === transactions.length 
                        ? `All ${transactions.length} transactions`
                        : `Showing ${filteredTransactions.length} of ${transactions.length} transactions`
                      }
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={loadTransactions}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-1">Refresh</span>
                  </Button>
                </div>

                {/* Filters Section */}
                <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters</span>
                    {(typeFilter !== 'ALL' || categoryFilter !== 'ALL') && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto text-xs h-7">
                        Clear All
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    {/* Type Filter - Buttons */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Transaction Type</Label>
                      <div className="flex gap-1">
                        <Button
                          variant={typeFilter === 'ALL' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTypeFilter('ALL')}
                          className="h-8"
                        >
                          All
                        </Button>
                        <Button
                          variant={typeFilter === 'DEBIT' ? 'destructive' : 'outline'}
                          size="sm"
                          onClick={() => setTypeFilter('DEBIT')}
                          className="h-8"
                        >
                          <ArrowDownCircle className="h-3 w-3 mr-1" />
                          Debits
                        </Button>
                        <Button
                          variant={typeFilter === 'CREDIT' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTypeFilter('CREDIT')}
                          className={`h-8 ${typeFilter === 'CREDIT' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                        >
                          <ArrowUpCircle className="h-3 w-3 mr-1" />
                          Credits
                        </Button>
                      </div>
                    </div>

                    {/* Category Filter - Dropdown */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Category</Label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[150px] h-8">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat === 'ALL' ? 'All Categories' : cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading...</span>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No transactions yet
                    </p>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No transactions match your filters
                    </p>
                    <Button variant="link" onClick={clearFilters} className="mt-2">
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTransactions.map((transaction) => (
                      <div
                        key={transaction.txId}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            {getTypeBadge(transaction.msgType)}
                            <span className="font-semibold text-lg">
                              {formatAmount(transaction.amount)}
                            </span>
                            {transaction.msgSubtype && (
                              <Badge variant="secondary" className="text-xs">
                                {transaction.msgSubtype}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground grid grid-cols-2 gap-x-4">
                            {transaction.merchantName && (
                              <p><strong>Merchant:</strong> {transaction.merchantName}</p>
                            )}
                            {transaction.bankName && (
                              <p><strong>Bank:</strong> {transaction.bankName}</p>
                            )}
                            {transaction.accountNumber && (
                              <p><strong>Account:</strong> {transaction.accountNumber}</p>
                            )}
                            {transaction.date && (
                              <p><strong>Date:</strong> {transaction.date}</p>
                            )}
                            {transaction.referenceNo && (
                              <p><strong>Ref No:</strong> {transaction.referenceNo}</p>
                            )}
                            {transaction.availableBalance && (
                              <p><strong>Avl Bal:</strong> {formatAmount(transaction.availableBalance)}</p>
                            )}
                          </div>
                        </div>
                        {transaction.txType && (
                          <Badge variant="outline">{transaction.txType}</Badge>
                        )}
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

export default UserDashboard;
