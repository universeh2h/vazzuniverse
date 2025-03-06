import {
  ClipboardList,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
} from 'lucide-react';

export interface NavItem {
  nama: string;
  path?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}
export const dataNavAdmin: NavItem[] = [
  {
    nama: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    nama: 'Pesanan',
    icon: <ShoppingCart className="h-5 w-5" />,
    children: [
      {
        nama: 'Semua Pesanan',
        path: '/dashboard/pesanan',
      },
      {
        nama: 'Pesanan Joki',
        path: '/dashboard/data/joki',
      },
      {
        nama: 'Pesanan Gift Skin',
        path: '/dashboard/data/skin',
      },
      {
        nama: 'Pesanan Vilog',
        path: '/dashboard/data/dmvilog',
      },
    ],
  },
  {
    nama: 'Member',
    icon: <Users className="h-5 w-5" />,
    children: [
      {
        nama: 'Member Deposit',
        path: '/dashboard/member/user-deposit',
      },
      {
        nama: 'Kelola Member',
        path: '/dashboard/member',
      },
    ],
  },
  {
    nama: 'Produk',
    icon: <Package className="h-5 w-5" />,
    children: [
      {
        nama: 'Kategori',
        path: '/dashboard/produk/kategori',
      },
      {
        nama: 'Sub - Kategori',
        path: '/dashboard/produk/sub-kategori',
      },
      {
        nama: 'Layanan',
        path: '/dashboard/produk/layanan',
      },
      {
        nama: 'Voucher',
        path: '/dashboard/produk/voucher',
      },
    ],
  },
  {
    nama: 'Pesanan Manual',
    path: '/dashboard/pesanan-manual',
    icon: <ClipboardList className="h-5 w-5" />,
  },
];
