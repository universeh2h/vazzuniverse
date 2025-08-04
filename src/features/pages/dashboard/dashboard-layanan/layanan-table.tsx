import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreVertical, Trash2, Check, X, Save } from 'lucide-react';
import { FormatPrice } from '@/utils/formatPrice';
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Layanan } from '@/types/layanans';
import { toast } from 'sonner';
import { trpc } from '@/utils/trpc';
import { useQueryClient } from '@tanstack/react-query';

interface LayananTableProps {
  data: Layanan[];
  onUpdate?: (id: number, data: any) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
}

interface EditingState {
  [key: number]: {
    layanan?: string;
    provider?: string;
    harga?: number;
    hargaBeli?: number;
    hargaPlatinum?: number;
    status?: boolean;
  };
}

export function LayananTable({ 
  data
}: LayananTableProps) {
  const [editingRows, setEditingRows] = useState<Set<number>>(new Set());
  const [editingData, setEditingData] = useState<EditingState>({});
  const [savingRows, setSavingRows] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();

  const {mutate : update}  = trpc.layanans.edit.useMutation({
    mutationKey : ["update-layanan"],
    onSuccess : () => {
      toast.success('Update Layanans berhasil')
    },
    onError : ()  => {
      toast.error("failed to update layanans")
    },
     onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [['layanans', 'getAll']],
      });
    },
  })

    const {mutate : deleted}  = trpc.layanans.delete.useMutation({
    mutationKey : ["delete-layanan"],
    onSuccess : () => {
      toast.success('Delete Layanans berhasil')
    },
    onError : ()  => {
      toast.error("failed to delete layanans")
    },
     onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [['layanans', 'getAll']],
      });
    },
  })



  const startEdit = (layanan: Layanan) => {
    
    setEditingRows(prev => new Set(prev).add(layanan.id));
    setEditingData(prev => ({
      ...prev,
      [layanan.id]: {
        layanan: layanan.layanan,
        provider: layanan.provider,
        harga: layanan.harga,
        hargaBeli: layanan.hargaBeli,
        hargaPlatinum: layanan.hargaPlatinum,
        status: layanan.status,
      }
    }));
  };

  const cancelEdit = (id: number) => {
    
    setEditingRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setEditingData(prev => {
      const newData = { ...prev };
      delete newData[id];
      return newData;
    });
  };

  const saveEdit = async (id: number) => {
    setSavingRows(prev => new Set(prev).add(id));
    try {
       update({
        id : id,
        harga : editingData[id].harga,
        hargaBeli :  editingData[id].hargaBeli,
        hargaPlatinum :  editingData[id].hargaPlatinum,
        layanan :  editingData[id].layanan,
        provider :  editingData[id].provider,
        status :  editingData[id].status ? "active" : "inactive"
      })
    } catch (error) {
      toast.error('Failed to update:');
    } finally {
      setSavingRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const updateEditingData = (id: number, field: string, value: any) => {
    setEditingData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus layanan ini?')) {
      try {
        deleted({
          id
        });
        toast.success('delected successfully')
      } catch (error) {
        toast.error("failed to delete")
      }
    }
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Nama Layanan</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Harga Beli</TableHead>
            <TableHead>Harga Member</TableHead>
            <TableHead>Harga Platinum</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((layanan) => {
            const isEditing =  editingRows.has(layanan.id);
            const isSaving = savingRows.has(layanan.id);
            const editData = editingData[layanan.id] || {};

            return (
              <TableRow 
                key={layanan.id} 
              >
                <TableCell className="font-medium">{layanan.id}</TableCell>
                <TableCell 
                  onClick={() => !isEditing && startEdit(layanan)} 
                  className={!isEditing ? "cursor-pointer hover:bg-muted/50" : ""}
                >
                  {isEditing ? (
                    <Input
                      value={editData.layanan || layanan.layanan}
                      onChange={(e) => updateEditingData(layanan.id, 'layanan', e.target.value)}
                      placeholder="Nama layanan"
                      className="h-8"
                    />
                  ) : (
                    <div className="font-medium">{layanan.layanan}</div>
                  )}
                </TableCell>

                {/* Provider */}
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={editData.provider || layanan.provider}
                      onChange={(e) => updateEditingData(layanan.id, 'provider', e.target.value)}
                      placeholder="Provider"
                      className="h-8"
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {layanan.provider}
                    </div>
                  )}
                </TableCell>

                {/* Harga Beli */}
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.hargaBeli ?? layanan.hargaBeli}
                      onChange={(e) => updateEditingData(layanan.id, 'hargaBeli', parseFloat(e.target.value))}
                      placeholder="Harga Beli"
                      className="h-8"
                    />
                  ) : (
                    FormatPrice(layanan.hargaBeli)
                  )}
                </TableCell>
                
                {/* Harga Member */}
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.harga ?? layanan.harga}
                      onChange={(e) => updateEditingData(layanan.id, 'harga', parseFloat(e.target.value))}
                      placeholder="Harga Member"
                      className="h-8"
                    />
                  ) : (
                    FormatPrice(layanan.harga)
                  )}
                </TableCell>

                {/* Harga Platinum */}
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.hargaPlatinum ?? layanan.hargaPlatinum}
                      onChange={(e) => updateEditingData(layanan.id, 'hargaPlatinum', parseFloat(e.target.value))}
                      placeholder="Harga Platinum"
                      className="h-8"
                    />
                  ) : (
                    FormatPrice(layanan.hargaPlatinum)
                  )}
                </TableCell>

                {/* Status */}
                <TableCell>
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editData.status ?? layanan.status}
                        onCheckedChange={(checked) => {
                          updateEditingData(layanan.id, 'status', checked);
                        }}
                      />
                      <span className="text-sm">
                        {editData.status ?? layanan.status ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ) : (
                    <Badge variant={layanan.status ? 'default' : 'destructive'}>
                      {layanan.status ? 'active' : 'unactive'}
                    </Badge>
                  )}
                </TableCell>

                

                {/* Actions */}
                <TableCell className="text-right">
                  {isEditing ? (
                    // Inline editing mode actions
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => saveEdit(layanan.id)}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelEdit(layanan.id)}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => saveEdit(layanan.id)}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(layanan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}