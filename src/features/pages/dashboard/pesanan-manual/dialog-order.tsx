'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category } from '@/types/category';
import { FormatPrice } from '@/utils/formatPrice';
import { trpc } from '@/utils/trpc';
import { Loader2 } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { toast } from 'sonner';

interface DialogOrderManualProps {
  data?: Category[];
  children: ReactNode;
}

export function DialogOrderManual({ data, children }: DialogOrderManualProps) {
  const [selectCategories, setSelectCategories] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [whatsApp, setWhatsApp] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleSelect = (value: string) => {
    setSelectCategories(value);
  };
  const { mutate } = trpc.order.createManual.useMutation({
    onSuccess: () => {
      toast.success('created successfully');
    },
    onError: () => {
      toast.error('failed to create order');
    },
  });
  const { data: layanans } = trpc.layanans.getLayananByCategory.useQuery({
    category: selectCategories,
  });
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      mutate({
        categoryId: selectCategories,
        layananId: selectedService,
        whatsapp: whatsApp,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Order Manual</DialogTitle>
          <DialogDescription>
            Make a manual order for your customer.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Select Category
              </label>

              <Select value={selectCategories} onValueChange={handleSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    {data?.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {selectCategories && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Services</label>
                {!layanans ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Loading services...
                    </span>
                  </div>
                ) : layanans.layanan.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No services available for this category
                  </div>
                ) : (
                  <Select
                    value={selectedService}
                    onValueChange={(value) =>
                      setSelectedService(value.toString())
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectGroup>
                        <SelectLabel>Services</SelectLabel>
                        {layanans.layanan.map((service) => (
                          <SelectItem
                            key={service.id}
                            value={service.id.toString()}
                            className="flex justify-between"
                          >
                            <div className="flex justify-between w-full">
                              <span>{service.layanan}</span>
                              <span className="text-muted-foreground ml-4">
                                {FormatPrice(service.harga)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="whatsapp
              "
              >
                WhatsApp
              </Label>
              <Input
                id="whatsapp"
                value={whatsApp}
                type={'number'}
                placeholder="6262171118"
                onChange={(e) => setWhatsApp(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={isLoading}
            >
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
