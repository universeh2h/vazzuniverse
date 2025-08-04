import { DebouncedSearch } from "@/components/ui/debouncedSearch";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DATA_LIMIT } from "@/data/data-limit";


interface HeaderLayananProps {
  term: string;
  perPage : number
  setPerPage : (limit : number) => void
  setTerm: (term: string) => void;
  status?: boolean;
  setStatus?: (status: boolean) => void;
  flashSale?: boolean | null;
  setFlashSale?: (flashSale: boolean | null) => void;
}

export function HeaderLayanan({ 
  setTerm, 
  term, 
  status, 
  setStatus, 
  flashSale, 
  setPerPage,
  setFlashSale 
}: HeaderLayananProps) {
  return (
    <section className="flex w-full justify-between items-center gap-4 mb-6">
        <h1 className="text-4xl font-semibold">
            Product
        </h1>
      <div className="flex gap-4">
        <DebouncedSearch 
          term={term}
          setTerm={setTerm}
          placeholder="Search layanan..."
          className="w-[300px]"
          delay={800}
        />
      
        {/* Status Filter */}
        {setStatus && (
          <Select 
            value={status ? 'active' : 'inactive'} 
            onValueChange={(value) => setStatus(value === 'active')}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="w-2 h-2 p-0 rounded-full"></Badge>
                  Active
                </div>
              </SelectItem>
              <SelectItem value="inactive">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="w-2 h-2 p-0 rounded-full"></Badge>
                  Inactive
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        )}

         <DropdownMenu>
          <DropdownMenuTrigger className="w-full max-w-40 bg-card rounded-md active:border-none">
            Select Limit
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {DATA_LIMIT.map((item, idx) => (
              <DropdownMenuItem key={idx} onClick={() => setPerPage(item)}>
                {item}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  );
}
