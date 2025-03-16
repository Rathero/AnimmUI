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

export default function EditorUrl({
  generateUrlFunction,
}: {
  generateUrlFunction: (name: string) => void;
}) {
  return (
    <div className="py-4 border-t">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">
            <LinkIcon />
            Generate URL
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate URL</DialogTitle>
            <DialogDescription>
              Give your URL a name to easily find it later.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Label htmlFor="nameUrl">Name</Label>
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
            <Button type="submit" onClick={() => generateUrlFunction('')}>
              Save URL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
