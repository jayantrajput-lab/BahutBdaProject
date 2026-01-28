import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * ExtractedDataDisplay - Shows extracted transaction fields
 * Can be editable for USER role to fill missing fields
 */
export const ExtractedDataDisplay = ({ 
  data, 
  editable = false, 
  onFieldChange 
}) => {
  const fields = [
    { key: 'accountNumber', label: 'Account Number' },
    { key: 'amount', label: 'Amount Transferred' },
    { key: 'type', label: 'Credit / Debit' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'transactionId', label: 'Transaction ID' },
    { key: 'bankName', label: 'Bank Name' },
  ];

  const isMissing = (value) => value === '-1' || !value;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Extracted Transaction Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <Label htmlFor={key} className="text-sm text-muted-foreground">
                {label}
              </Label>
              {editable && isMissing(data[key]) ? (
                <Input
                  id={key}
                  value={data[key] === '-1' ? '' : data[key]}
                  placeholder="-1 (missing)"
                  onChange={(e) => onFieldChange?.(key, e.target.value || '-1')}
                  className="h-9"
                />
              ) : (
                <div className={`p-2 rounded border bg-muted/50 text-sm ${isMissing(data[key]) ? 'text-muted-foreground italic' : ''}`}>
                  {data[key]}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
