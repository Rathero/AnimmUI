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
import { toast } from 'sonner';

export default function EditorCsv() {
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
            <Label htmlFor="nameUrl">Campaign</Label>
            <div className="grid flex-1 gap-2">
              <Input
                id="nameUrl"
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
