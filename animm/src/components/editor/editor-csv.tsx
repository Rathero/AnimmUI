import { LinkIcon } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Template } from '@/types/collections';
import { KeyValuePair } from 'tailwindcss/types/config';

export default function EditorCsv({ template }: { template: Template }) {
  const downloadCSV = () => {
    let dataToExport: Record<string, string>[] = [];
    let variables: KeyValuePair<string, string>[] = [];
    template.modules.forEach(module => {
      module.variables.forEach(variable => {
        variables.push({
          key: variable.name,
          value: variable.defaultValue,
        });
      });
      module.images.forEach((variable, i) => {
        variables.push({
          key: 'imagen' + i,
          value: variable.image,
        });
      });
    });
    const row: Record<string, string> = {};
    variables.forEach(variable => {
      row[variable.key] = variable.value;
    });
    dataToExport.push(row);
    if (dataToExport.length === 0) {
      alert('No data to export!');
      return;
    }

    const headers = Object.keys(dataToExport[0]);
    let csvContent = 'data:text/csv;charset=utf-8,';

    csvContent += headers.join(',') + '\r\n';

    dataToExport.forEach(row => {
      const rowValues = headers.map(header => {
        let cell = (row as Record<string, string>)[header];
        if (typeof cell === 'string') {
          cell = cell.replace(/"/g, '""');
          if (cell.includes(',')) {
            cell = `"${cell}"`;
          }
        }
        return cell;
      });
      csvContent += rowValues.join(',') + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'my_data.csv');
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="py-4 border-t">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">
            <LinkIcon />
            Upload CSV
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Uploda CSV</DialogTitle>
            <DialogDescription>Upload CSV</DialogDescription>
          </DialogHeader>

          <div className="flex items-center space-x-2">
            <Label>
              CSV Example: <a onClick={() => downloadCSV()}>Download</a>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="campaign">Campaign</Label>
            <div className="grid flex-1 gap-2">
              <Input
                id="campaign"
                placeholder="Enter a name..."
                className="col-span-4"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Export CSV</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
