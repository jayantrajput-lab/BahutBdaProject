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
import { Loader2, RefreshCw, ArrowDownCircle, ArrowUpCircle, Wallet, CheckCircle2, Database, Save, Filter } from 'lucide-react';
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
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, DEBIT, CREDIT
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // ALL, FOOD, HEALTH, etc.
  
  const { 
    transactions, 
    extractedFields, 
    isLoading, 
    fetchTransactions, 
    findPattern,
    saveTransaction,
    clearExtractedFields 
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
        msgSubtype: extractedFields.msgSubtype,
        date: extractedFields.date,
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
        {value && value !== '-' && (
          isParsed ? (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" /> Parsed
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-blue-600">
              <Database className="h-3 w-3" /> Pattern Default
            </span>
          )
        )}
      </div>
      <div className={`p-2 rounded border text-sm ${
        value && value !== '-' 
          ? isParsed 
            ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' 
            : 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800'
          : 'bg-muted/50'
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

                      {/* Main extracted values */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Label className="text-muted-foreground">Amount</Label>
                            {extractedFields.amount && (
                              <span className="flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle2 className="h-3 w-3" /> Parsed
                              </span>
                            )}
                          </div>
                          <div className="p-3 rounded border bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800 text-lg font-bold">
                            {extractedFields.amount ? formatAmount(extractedFields.amount) : '-'}
                          </div>
                        </div>

                        <FieldDisplay 
                          label="Account Number" 
                          value={extractedFields.accountNumber} 
                          isParsed={!!extractedFields.accountNumber}
                        />
                        
                        <FieldDisplay 
                          label="Bank Name" 
                          value={extractedFields.bankName}
                          isParsed={extractedFields.parsedBankName !== false}
                        />
                        
                        <FieldDisplay 
                          label="Merchant Name" 
                          value={extractedFields.merchantName}
                          isParsed={extractedFields.parsedMerchantName !== false}
                        />

                        <FieldDisplay 
                          label="Transaction Type" 
                          value={extractedFields.txType}
                          isParsed={extractedFields.parsedTxType !== false}
                        />

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Label className="text-muted-foreground">Message Type</Label>
                            {extractedFields.msgType && (
                              <span className="flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle2 className="h-3 w-3" /> Parsed
                              </span>
                            )}
                          </div>
                          <div className="p-2 rounded border bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800">
                            {getTypeBadge(extractedFields.msgType)}
                          </div>
                        </div>

                        <FieldDisplay 
                          label="Message Subtype (Category)" 
                          value={extractedFields.msgSubtype}
                          isParsed={extractedFields.parsedMsgSubtype !== false}
                        />

                        <FieldDisplay 
                          label="Date" 
                          value={extractedFields.date}
                          isParsed={!!extractedFields.date}
                        />

                        {extractedFields.availableBalance && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Label className="text-muted-foreground">Available Balance</Label>
                              <span className="flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle2 className="h-3 w-3" /> Parsed
                              </span>
                            </div>
                            <div className="p-2 rounded border bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800 text-sm font-semibold">
                              {formatAmount(extractedFields.availableBalance)}
                            </div>
                          </div>
                        )}
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                          <div className="text-sm text-muted-foreground">
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
