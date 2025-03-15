import { TransactionDetailsType } from '@/types/transaction';

import { useState } from 'react';
import { CalendarIcon, Download, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { formatDate, FormatPrice } from '@/utils/formatPrice';
export function TransactionDetails({ data }: { data: TransactionDetailsType }) {
  const [activeTab, setActiveTab] = useState('details');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">
              Transaction Details
            </CardTitle>
            <CardDescription>Transaction ID: {data.id}</CardDescription>
          </div>
          <Badge className={getStatusColor(data.paymentStatus)}>
            {data.paymentStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="details"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="details">Transaction Details</TabsTrigger>
            <TabsTrigger value="invoice">Invoice Information</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-2 gap-y-2">
                    <span className="text-sm font-medium">Amount:</span>
                    <span className="text-sm">
                      {FormatPrice(data.finalAmount)}
                    </span>

                    <span className="text-sm font-medium">
                      Original Amount:
                    </span>
                    <span className="text-sm">
                      {FormatPrice(data.originalAmount)}
                    </span>

                    <span className="text-sm font-medium">Discount:</span>
                    <span className="text-sm">
                      {FormatPrice(data.discountAmount)}
                    </span>

                    <span className="text-sm font-medium">Payment Code:</span>
                    <span className="text-sm">{data.paymentCode}</span>

                    <span className="text-sm font-medium">Reference:</span>
                    <span className="text-sm">
                      {data.paymentReference || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">
                    Transaction Details
                  </h3>
                  <div className="grid grid-cols-2 gap-y-2">
                    <span className="text-sm font-medium">
                      Merchant Order ID:
                    </span>
                    <span className="text-sm">{data.merchantOrderId}</span>

                    <span className="text-sm font-medium">
                      Transaction Type:
                    </span>
                    <span className="text-sm">{data.transactionType}</span>

                    <span className="text-sm font-medium">Category ID:</span>
                    <span className="text-sm">{data.categoryId}</span>

                    <span className="text-sm font-medium">Service ID:</span>
                    <span className="text-sm">{data.layananId}</span>

                    <span className="text-sm font-medium">WhatsApp:</span>
                    <span className="text-sm">{data.noWa}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">
                    Status Information
                  </h3>
                  <div className="grid grid-cols-2 gap-y-2">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge className={getStatusColor(data.paymentStatus)}>
                      {data.paymentStatus}
                    </Badge>

                    <span className="text-sm font-medium">Status Message:</span>
                    <span className="text-sm">{data.statusMessage}</span>

                    <span className="text-sm font-medium">Created At:</span>
                    <span className="text-sm">
                      {formatDate(data.createdAt)}
                    </span>

                    <span className="text-sm font-medium">Updated At:</span>
                    <span className="text-sm">
                      {formatDate(data.updatedAt)}
                    </span>

                    <span className="text-sm font-medium">Completed At:</span>
                    <span className="text-sm">
                      {formatDate(data.completedAt ?? '')}
                    </span>
                  </div>
                </div>

                {data.qrString && (
                  <div className="bg-muted/40 p-4 rounded-lg">
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">
                      QR Code
                    </h3>
                    <div className="flex justify-center p-4">
                      <Image
                        width={100}
                        height={100}
                        src={`data:image/png;base64,${data.qrString}`}
                        alt="Payment QR Code"
                        className="max-w-[150px] max-h-[150px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="invoice">
            {data.invoice && data.invoice.length > 0 ? (
              <div className="space-y-6">
                {data.invoice.map((inv) => (
                  <Card key={inv.id} className="border border-muted">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg">
                            Invoice #{inv.invoiceNumber}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <CalendarIcon className="h-3 w-3" />
                            Due: {new Date(inv.dueDate).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(inv.status)}>
                          {inv.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-y-2">
                          <span className="text-sm font-medium">Subtotal:</span>
                          <span className="text-sm">
                            {FormatPrice(inv.subtotal)}
                          </span>

                          <span className="text-sm font-medium">Discount:</span>
                          <span className="text-sm">
                            {FormatPrice(inv.discountAmount)}
                          </span>

                          <span className="text-sm font-medium">Tax:</span>
                          <span className="text-sm">
                            {FormatPrice(inv.taxAmount)}
                          </span>

                          <Separator className="col-span-2 my-1" />

                          <span className="text-sm font-medium">
                            Total Amount:
                          </span>
                          <span className="text-sm font-bold">
                            {FormatPrice(inv.totalAmount)}
                          </span>
                        </div>

                        {inv.notes && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-1">Notes:</h4>
                            <p className="text-sm text-muted-foreground">
                              {inv.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(inv.createdAt).toLocaleDateString()}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No invoice information available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Receipt
        </Button>
        <Button onClick={() => window.open(data.paymentUrl, '_blank')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          View Payment
        </Button>
      </CardFooter>
    </Card>
  );
}
