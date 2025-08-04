import { Button } from "@/components/ui/button";
import { Transaction } from "@/features/pages/dashboard/recent-transactions";
import { formatDate } from "@/utils/formatPrice";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

interface ExportToExcelProps {
  data: Transaction[];
  status: string;
  date: string;
  onClick: () => void;
}


export function ExportToExcel({ data, status, date, onClick }: ExportToExcelProps) {
  const handleExport = () => {
    onClick();
    const formattedData = data.map((transaction) => {
      return {
        OrderID: transaction.orderId,
        Username: transaction.username || "-",
        Layanan: transaction.layanan,
        "Harga Beli" : transaction.hargaBeli,
        "Harga Jual": transaction.hargaJual,
        "Fee": transaction.fee,
        "Profit (Rp)": transaction.profit,
        Status: transaction.status,
        Tanggal: formatDate(transaction.createdAt as string) || "-",
        MetodePembayaran: transaction.method || "-",
        NoPembeli: transaction.noPembeli || "-",
        Zone: transaction.zone || "-",
        UserID: transaction.userId || "-",
        Nickname: transaction.nickname || "-",
      };
    });

    const totalProfit = formattedData.reduce((sum, transaction) => {
      return sum + transaction["Profit (Rp)"];
    }, 0);

    const totalRow = {
      ID: "",
      OrderID: "",
      Username: "",
      Layanan: "Total Profit",
      "Harga Beli" : "",
      "Harga Jual": "",
      "Fee" : "",
      "Profit (Rp)": totalProfit,
      Status: "",
      Tanggal: "",
      MetodePembayaran: "",
      NoPembeli: "",
      Zone: "",
      UserID: "",
      Nickname: "",
    };

    const finalData = [...formattedData, totalRow];

    const worksheet = XLSX.utils.json_to_sheet(finalData);

    worksheet["!cols"] = [
      { wch: 20 }, // OrderI
      { wch: 15 }, // Username
      { wch: 40 }, // Layanan
      { wch: 15 }, // Harga
      { wch: 15 }, // Harga
      { wch: 15 }, // Harga
      { wch: 15 }, // Profit (Rp)
      { wch: 15 }, // Profit (%)
      { wch: 15 }, // Status
      { wch: 30 }, // Tanggal
      { wch: 30 }, // MetodePembayaran
      { wch: 20 }, // NoPembeli
      { wch: 10 }, // Zone
      { wch: 15 }, // UserID
      { wch: 15 }, // Nickname
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");

    // Ekspor ke file Excel
    XLSX.writeFile(workbook, `${status}-${date}.xlsx`);
  };

  return (
    <Button onClick={handleExport} className="text-xs flex items-center gap-2">
      <Download className="w-4 h-4" />
      Export to Excel
    </Button>
  );
}