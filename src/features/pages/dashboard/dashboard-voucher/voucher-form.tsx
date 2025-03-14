'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { MultiSelect } from './multi-select';
import { createVoucherSchema } from '@/types/schema/voucher';
import { Label } from '@/components/ui/label';
import { trpc } from '@/utils/trpc';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface VoucherFormProps {
  initialData?: z.infer<typeof createVoucherSchema>;
  onSuccess?: () => void;
}

export function VoucherForm({ initialData, onSuccess }: VoucherFormProps) {
  const { data: categories } = trpc.main.getCategories.useQuery({
    fields: ['id', 'name'],
  });
  const queryClient = useQueryClient();
  const { mutate, isPending } = trpc.voucher.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voucher', 'getAll'] });
      toast.success('created vucher successfully');
    },
    onError: () => {
      queryClient.cancelQueries({ queryKey: ['voucher', 'getAll'] });
      toast.success('failed created vucher ');
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof createVoucherSchema>>({
    resolver: zodResolver(createVoucherSchema),
    defaultValues: initialData || {
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      maxDiscount: null,
      minPurchase: null,
      usageLimit: null,
      isForAllCategories: false,
      isActive: true,
      startDate: new Date(),
      expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      description: '',
      categoryIds: [],
    },
  });

  function onSubmit(values: z.infer<typeof createVoucherSchema>) {
    console.log(values);
    mutate(values);
    if (onSuccess) {
      onSuccess();
    }
  }

  const discountType = watch('discountType');
  const isForAllCategories = watch('isForAllCategories');

  const handleDiscountTypeChange = (checked: boolean) => {
    setValue('discountType', checked ? 'PERCENTAGE' : 'FIXED');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Kode Voucher */}
        <div className="space-y-2 mb-6">
          <Label htmlFor="code">Kode Voucher</Label>
          <Input id="code" placeholder="SUMMER2023" {...register('code')} />
          <p className="text-sm text-muted-foreground">Masukkan kode unik.</p>
          {errors.code && (
            <p className="text-sm font-medium text-destructive">
              {errors.code.message}
            </p>
          )}
        </div>

        {/* Jenis Diskon */}
        <div className="space-y-3 mb-6">
          <Label>Jenis Diskon</Label>
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {discountType === 'PERCENTAGE'
                ? 'Persentase (%)'
                : 'Jumlah Tetap'}
            </span>
            <Switch
              checked={discountType === 'PERCENTAGE'}
              onCheckedChange={handleDiscountTypeChange}
            />
          </div>
          {errors.discountType && (
            <p className="text-sm font-medium text-destructive">
              {errors.discountType.message}
            </p>
          )}
        </div>

        {/* Nilai Diskon */}
        <div className="space-y-2 mb-6">
          <Label htmlFor="discountValue">
            {discountType === 'PERCENTAGE'
              ? 'Persentase Diskon'
              : 'Jumlah Diskon'}
          </Label>
          <Input
            id="discountValue"
            type="number"
            placeholder={discountType === 'PERCENTAGE' ? '10' : '100'}
            {...register('discountValue', {
              valueAsNumber: true,
              onChange: (e) =>
                setValue(
                  'discountValue',
                  Number.parseFloat(e.target.value) || 0
                ),
            })}
          />
          <p className="text-sm text-muted-foreground">
            {discountType === 'PERCENTAGE'
              ? 'Masukkan diskon dalam persen (contoh: 10 => 10%)'
              : 'Masukkan diskon dalam jumlah tetap'}
          </p>
          {errors.discountValue && (
            <p className="text-sm font-medium text-destructive">
              {errors.discountValue.message}
            </p>
          )}
        </div>

        {/* Diskon Maksimum (hanya untuk persentase) */}
        {discountType === 'PERCENTAGE' && (
          <div className="space-y-2 mb-6">
            <Label htmlFor="maxDiscount">Diskon Maksimum</Label>
            <Input
              id="maxDiscount"
              type="number"
              placeholder="Opsional"
              {...register('maxDiscount', {
                setValueAs: (v) =>
                  v === '' ? null : Number.parseFloat(v) || null,
              })}
            />
            <p className="text-sm text-muted-foreground">
              Diskon maksimum yang digunakan (opsional)
            </p>
            {errors.maxDiscount && (
              <p className="text-sm font-medium text-destructive">
                {errors.maxDiscount.message}
              </p>
            )}
          </div>
        )}

        {/* Pembelian Minimum */}
        <div className="space-y-2 mb-6">
          <Label htmlFor="minPurchase">Pembelian Minimum</Label>
          <Input
            id="minPurchase"
            type="number"
            placeholder="Opsional"
            {...register('minPurchase', {
              setValueAs: (v) =>
                v === '' ? null : Number.parseFloat(v) || null,
            })}
          />
          <p className="text-sm text-muted-foreground">
            Jumlah pembelian minimum yang diperlukan untuk menggunakan voucher
            ini (opsional)
          </p>
          {errors.minPurchase && (
            <p className="text-sm font-medium text-destructive">
              {errors.minPurchase.message}
            </p>
          )}
        </div>

        {/* Batas Penggunaan */}
        <div className="space-y-2 mb-6">
          <Label htmlFor="usageLimit">Batas Penggunaan</Label>
          <Input
            id="usageLimit"
            type="number"
            placeholder="Opsional"
            {...register('usageLimit', {
              setValueAs: (v) => (v === '' ? null : Number.parseInt(v) || null),
            })}
          />
          <p className="text-sm text-muted-foreground">
            Jumlah maksimum voucher ini dapat digunakan (opsional)
          </p>
          {errors.usageLimit && (
            <p className="text-sm font-medium text-destructive">
              {errors.usageLimit.message}
            </p>
          )}
        </div>

        {/* Rentang Tanggal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Tanggal Mulai */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Tanggal Mulai</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="startDate"
                  variant={'outline'}
                  className={cn(
                    'w-full pl-3 text-left font-normal',
                    !watch('startDate') && 'text-muted-foreground'
                  )}
                  onClick={(e) => e.preventDefault()}
                >
                  {watch('startDate') ? (
                    format(watch('startDate'), 'PPP') // Hanya untuk display
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={watch('startDate')}
                  onSelect={(date) => setValue('startDate', date as Date)} // Nilai tetap sebagai Date
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.startDate && (
              <p className="text-sm font-medium text-destructive">
                {errors.startDate.message}
              </p>
            )}
          </div>

          {/* Tanggal Kadaluarsa */}
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Tanggal Kadaluarsa</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="expiryDate"
                  variant={'outline'}
                  className={cn(
                    'w-full pl-3 text-left font-normal',
                    !watch('expiryDate') && 'text-muted-foreground'
                  )}
                  onClick={(e) => e.preventDefault()}
                >
                  {watch('expiryDate') ? (
                    format(watch('expiryDate'), 'PPP') // Hanya untuk display
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={watch('expiryDate')}
                  onSelect={(date) => setValue('expiryDate', date as Date)} // Nilai tetap sebagai Date
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.expiryDate && (
              <p className="text-sm font-medium text-destructive">
                {errors.expiryDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Berlaku untuk Semua Kategori */}
        <div className="flex flex-row items-center justify-between rounded-lg border p-4 mb-6">
          <div className="space-y-0.5">
            <Label className="text-base">Berlaku untuk Semua Kategori</Label>
            <p className="text-sm text-muted-foreground">
              Saat diaktifkan, voucher ini akan berlaku untuk semua kategori
              produk
            </p>
          </div>
          <Switch
            checked={isForAllCategories}
            onCheckedChange={(checked) =>
              setValue('isForAllCategories', checked)
            }
          />
        </div>

        {/* Kategori (hanya jika tidak berlaku untuk semua kategori) */}
        {!isForAllCategories && categories && (
          <div className="space-y-2 mb-6">
            <Label htmlFor="categoryIds">Kategori</Label>
            <MultiSelect
              options={categories.data.map((cat) => ({
                value: cat.id.toString(),
                label: cat.name,
              }))}
              selected={watch('categoryIds')?.map((id) => id.toString()) || []}
              onChange={(values) =>
                setValue(
                  'categoryIds',
                  values.map((v) => Number.parseInt(v))
                )
              }
              placeholder="Pilih kategori"
            />
            <p className="text-sm text-muted-foreground">
              Pilih kategori yang berlaku untuk voucher ini
            </p>
            {errors.categoryIds && (
              <p className="text-sm font-medium text-destructive">
                {errors.categoryIds.message}
              </p>
            )}
          </div>
        )}

        {/* Deskripsi */}
        <div className="space-y-2 mb-6">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            placeholder="Masukkan deskripsi voucher (opsional)"
            className="resize-none"
            {...register('description')}
          />
          <p className="text-sm text-muted-foreground">
            Berikan detail tambahan tentang voucher ini
          </p>
          {errors.description && (
            <p className="text-sm font-medium text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Status Aktif */}
        <div className="flex flex-row items-center justify-between rounded-lg border p-4 mb-6">
          <div className="space-y-0.5">
            <Label className="text-base">Status Aktif</Label>
            <p className="text-sm text-muted-foreground">
              Aktifkan atau nonaktifkan voucher ini
            </p>
          </div>
          <Switch
            checked={watch('isActive')}
            onCheckedChange={(checked) => setValue('isActive', checked)}
          />
        </div>

        {/* Aksi Form */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Batal
          </Button>
          <Button type="submit" disabled={isPending}>
            {initialData ? 'Perbarui Voucher' : 'Buat Voucher'}
          </Button>
        </div>
      </form>
    </div>
  );
}
