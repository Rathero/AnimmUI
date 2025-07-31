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
import { BatchDefinitions, ExportBatchRequest } from '@/types/exports';
import useExportsService from '@/app/services/ExportsService';
import { toast } from 'sonner';

// Utility function to parse a CSV line, handling quoted fields with commas
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export default function EditorCsv({ template }: { template: Template }) {
  const [columnsMatched, setColumnsMatched] = useState<
    KeyValuePair<string, string>[]
  >([]);

  const [csvString, setCsvString] = useState<string>('');
  const variablesToMatch: Array<{ id: number; name: string }> = [];
  template.modules.forEach(module => {
    module.variables.forEach(variable => {
      variablesToMatch.push({ id: variable.id, name: variable.value });
    });
    module.images.forEach((variable, i) => {
      variablesToMatch.push({ id: variable.id, name: 'imagen' + i });
    });
  });
  const [columnsCsvToMatch, setColumnsCsvToMatch] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [campaign, setCampaign] = useState<string>('');
  const [columnsToMatch, setColumnsToMatch] = useState<string[]>([]);

  const downloadCSV = () => {
    const dataToExport: Record<string, string>[] = [];
    const variables: KeyValuePair<string, string>[] = [];
    const variablesToMatch: string[] = [];
    template.modules.forEach(module => {
      module.variables.forEach(variable => {
        variables.push({
          key: variable.value,
          value: variable.defaultValue,
        });
        variablesToMatch.push(variable.value);
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
    // Add required columns: Name, Width, Height, Format, Resize
    row['Name'] = 'Example Name';
    row['Width'] = '1920';
    row['Height'] = '1080';
    row['Format'] = template.static ? 'png' : 'mp4';
    row['Resize'] = '0';
    // Add variable columns
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
  const { createExportBatch } = useExportsService();
  const uploadCsv = () => {
    const lines = csvString.split(/\r\n|\n/);
    const headerColumns = parseCsvLine(lines[0]);

    // Check if "Format" column exists in the CSV
    const formatColumnIndex = headerColumns.findIndex(
      col => col.trim() === 'Format'
    );
    const hasFormatColumn = formatColumnIndex !== -1;

    const exportBatchRequest: ExportBatchRequest = {
      templateId: template.id,
      userId: 0,
      id: 0,
      batchDefinitions: [],
      campaign: campaign,
    };

    // Check if "Resize" column exists in the CSV
    const resizeColumnIndex = headerColumns.findIndex(
      col => col.trim() === 'Resize'
    );
    const hasResizeColumn = resizeColumnIndex !== -1;

    // Remove the first 3 columns (name, width, height), format column, and resize column if they exist
    let variableColumns = headerColumns.slice(3);

    // Collect indices to remove (format and resize columns)
    const indicesToRemove: number[] = [];
    if (hasFormatColumn && formatColumnIndex >= 3) {
      indicesToRemove.push(formatColumnIndex - 3);
    }
    if (hasResizeColumn && resizeColumnIndex >= 3) {
      indicesToRemove.push(resizeColumnIndex - 3);
    }

    // Remove columns in descending order to avoid index shifting
    indicesToRemove
      .sort((a, b) => b - a)
      .forEach(index => {
        variableColumns.splice(index, 1);
      });

    lines.forEach((line, i) => {
      if (i != 0) {
        const columns = parseCsvLine(line);

        // Determine format for this specific row: from CSV column if exists, otherwise from template
        let format = 'png'; // default fallback
        if (hasFormatColumn) {
          const formatValue = columns[formatColumnIndex]?.trim().toLowerCase();
          if (formatValue) {
            format = formatValue;
          }
        } else {
          // Use template default: png for static, mp4 for non-static
          format = template.static ? 'png' : 'mp4';
        }

        // Determine resize value
        let resize = false;
        if (hasResizeColumn) {
          const resizeValue = columns[resizeColumnIndex];
          resize = resizeValue === '1';
        }

        const batchDefinition: BatchDefinitions = {
          resolutions: [
            {
              name: columns[0],
              width: Number.parseInt(columns[1]),
              height: Number.parseInt(columns[2]),
              resize: resize,
              format: format,
            },
          ],
          variables: [],
        };

        // Process variable columns (skip format and resize columns)
        let variableData = columns.slice(3);

        // Collect indices to remove (format and resize columns)
        const dataIndicesToRemove: number[] = [];
        if (hasFormatColumn && formatColumnIndex >= 3) {
          dataIndicesToRemove.push(formatColumnIndex - 3);
        }
        if (hasResizeColumn && resizeColumnIndex >= 3) {
          dataIndicesToRemove.push(resizeColumnIndex - 3);
        }

        // Remove columns in descending order to avoid index shifting
        dataIndicesToRemove
          .sort((a, b) => b - a)
          .forEach(index => {
            variableData.splice(index, 1);
          });

        variableData.forEach((column, y) => {
          batchDefinition.variables.push({
            key:
              variablesToMatch
                .find(x => x.name == variableColumns[y])
                ?.id?.toString() || '',
            value: column,
          });
        });
        exportBatchRequest.batchDefinitions.push(batchDefinition);
      }
    });
    createExportBatch(exportBatchRequest).then(() => {
      toast.success('Export batch created');
    });
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
            setCsvString(text);
            const firstLine = text.split(/\r\n|\n/)[0];
            const headerColumns = parseCsvLine(firstLine);
            let columns = headerColumns.map(col => col.trim());
            columns = columns.slice(3);
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
    <div className="">
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
                value={campaign}
                onChange={e => {
                  setCampaign(e.target.value);
                }}
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
          {/*
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
*/}
          <DialogFooter>
            <Button type="submit" onClick={uploadCsv}>
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
