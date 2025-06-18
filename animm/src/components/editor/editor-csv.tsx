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
import { useRef, useState } from 'react';

export default function EditorCsv({ template }: { template: Template }) {
  const [columnsMatched, setColumnsMatched] = useState<
    KeyValuePair<string, string>[]
  >([]);
  const variablesToMatch: string[] = [];
  template.modules.forEach(module => {
    module.variables.forEach(variable => {
      variablesToMatch.push(variable.name);
    });
    module.images.forEach((variable, i) => {
      variablesToMatch.push('imagen' + i);
    });
  });
  const [columnsCsvToMatch, setColumnsCsvToMatch] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [columnsToMatch, setColumnsToMatch] =
    useState<string[]>(variablesToMatch);
  const downloadCSV = () => {
    const dataToExport: Record<string, string>[] = [];
    const variables: KeyValuePair<string, string>[] = [];
    const variablesToMatch: string[] = [];
    template.modules.forEach(module => {
      module.variables.forEach(variable => {
        variables.push({
          key: variable.name,
          value: variable.defaultValue,
        });
        variablesToMatch.push(variable.name);
      });
      module.images.forEach((variable, i) => {
        variables.push({
          key: 'imagen' + i,
          value: variable.image,
        });
        variablesToMatch.push('imagen' + i);
      });
    });
    setColumnsToMatch(variablesToMatch);
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

  const matchColumns = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files == null || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();

      reader.onload = ev => {
        if (ev.target) {
          const text = ev.target.result;
          if (typeof text === 'string') {
            const firstLine = text.split(/\r\n|\n/)[0];
            const headerColumns = firstLine.split(',');
            const columns = headerColumns.map(col => col.trim());
            setColumnsCsvToMatch(columns);
            columnsToMatch.forEach(col => {
              if (columns.includes(col)) {
                columnsMatched.push({
                  key: col,
                  value: col,
                });
              }
            });
            setColumnsMatched(columnsMatched);
          } else {
          }
        }
      };

      reader.onerror = () => {};

      reader.readAsText(file);
    } else {
    }
  };
  const hiddenFileInput = useRef<HTMLInputElement>(null);
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
            <DialogTitle>Upload CSV</DialogTitle>
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

          <div
            className="size-full grid items-center justify-center bg-background/25 transition-opacity opacity-100 z-50 cursor-pointer"
            onClick={() => {
              if (hiddenFileInput.current != null)
                hiddenFileInput.current.click();
            }}
          >
            <input
              ref={hiddenFileInput}
              type="file"
              accept=".csv"
              onChange={e => {
                matchColumns(e);
              }}
              style={{ display: 'none' }}
            ></input>
            <Button
              variant={'secondary'}
              className="text-xs p-3 h-8 rounded-lg"
            >
              Upload CSV
            </Button>
          </div>
          <div className="w-full grid grid-cols-2 gap-4 p-4">
            {columnsCsvToMatch.length > 0 && (
              <>
                <div className="mt-4">
                  <h3 className="text-sm font-semibold">Columns CSV</h3>
                  <ul className="list-disc pl-5">
                    {columnsCsvToMatch.map((col, index) => (
                      <li
                        key={index}
                        className={`text-sm ${
                          !selectedColumn || selectedColumn != col
                            ? 'text-[#dbdbdb]'
                            : ''
                        } `}
                        onClick={() => {
                          setSelectedColumn(col);
                        }}
                      >
                        {col}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-semibold">Variables template</h3>
                  <ul className="list-disc pl-5">
                    {columnsToMatch.map((col, index) => (
                      <li
                        key={index}
                        onClick={() => {
                          if (selectedColumn) {
                            setColumnsMatched([]);
                            const newColumnsMatched = columnsMatched.filter(
                              m => m.key !== selectedColumn
                            );
                            setColumnsMatched([]);
                            newColumnsMatched.push({
                              key: selectedColumn,
                              value: col,
                            });
                            console.log(newColumnsMatched);
                            setColumnsMatched(newColumnsMatched);
                          }
                        }}
                        className={`text-sm ${
                          !selectedColumn ||
                          !columnsMatched.some(
                            matched =>
                              matched.value === col &&
                              matched.key === selectedColumn
                          )
                            ? 'text-[#dbdbdb]'
                            : ''
                        } `}
                      >
                        {col}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="submit">Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
