import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TemplateSelector } from '@/types/selectors';
import { FileAsset } from '@rive-app/react-webgl2';

export function EditorTemplateSelector({
  selector,
  assets,
  onImageChange,
  onTextChange,
}: {
  selector: TemplateSelector;
  assets: FileAsset[];
  onImageChange: (imageName: string, newImageUrl: string) => void;
  onTextChange: (textName: string, newText: string) => void;
}) {
  const handleValueChange = async (selectedValue: string) => {
    // Find the index of the selected value
    const valueIndex = selector.Values.indexOf(selectedValue);

    if (valueIndex === -1) return;

    // Update all images for this selector
    for (const imageMapping of selector.ImagesToChange) {
      for (const [imageName, imageVariants] of Object.entries(imageMapping)) {
        if (imageVariants[valueIndex]) {
          // Construct the full image URL - assuming images are in the public folder
          const newImageUrl = `https://animmfilesv2.blob.core.windows.net/img/templates/${selector.TemplateId}/${imageVariants[valueIndex]}.webp`;
          try {
            onImageChange(imageName, newImageUrl);
          } catch (error) {
            console.error(`Failed to replace image ${imageName}:`, error);
          }
        }
      }
    }

    // Update all texts for this selector
    if (selector.TextToChange) {
      for (const textMapping of selector.TextToChange) {
        for (const [textName, textVariants] of Object.entries(textMapping)) {
          if (textVariants[valueIndex]) {
            const newText = textVariants[valueIndex];
            try {
              onTextChange(textName, newText);
            } catch (error) {
              console.error(`Failed to replace text ${textName}:`, error);
            }
          }
        }
      }
    }
  };

  return (
    <div className="grid w-full gap-1.5">
      <Label className="text-sm text-muted-foreground">{selector.Name}</Label>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-full !text-left">
          <SelectValue placeholder={`Select ${selector.Name}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {selector.Values.map(value => (
              <SelectItem value={value} key={value}>
                {value}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
