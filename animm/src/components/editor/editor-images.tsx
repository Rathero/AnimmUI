import { TemplateImage } from '@/types/collections';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

import { ImageMinus, ImageUpscale } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/src/ReactCrop.scss';

export default function EditorImages({ images }: { images: TemplateImage[] }) {
  const [imgSrc, setImgSrc] = useState<string[]>([]);
  const [originalSrc, setOriginalSrc] = useState<string[]>([]);
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [crop, setCrop] = useState<Crop | undefined>({
    unit: '%', // Can be 'px' or '%'
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });

  useEffect(() => {
    setImgSrc([]);
    setOriginalSrc([]);
    images.forEach(x => {
      setImgSrc([...imgSrc, x.image]);
      setOriginalSrc([...originalSrc, x.image]);
    });
  }, [images]);

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const newImgSrc = [...imgSrc];
        newImgSrc[index] = reader.result?.toString() || '';
        setImgSrc(newImgSrc);
        const newOriginalSrc = [...originalSrc];
        newOriginalSrc[index] = reader.result?.toString() || '';
        setOriginalSrc(newOriginalSrc);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  }
  async function cropImage(index: number) {
    const image = imgRef.current;
    if (!image || !crop) {
      throw new Error('Crop canvas does not exist');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const offscreen = new OffscreenCanvas(
      crop.width * scaleX,
      crop.height * scaleY
    );
    const ctx = offscreen.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    const pixelRatio = window.devicePixelRatio;

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;

    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();

    ctx.translate(-cropX, -cropY);
    ctx.translate(centerX, centerY);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight
    );
    const blob = await offscreen.convertToBlob({
      type: 'image/png',
    });

    const newImgSrc = [...imgSrc];
    newImgSrc[index] = URL.createObjectURL(blob);
    setImgSrc(newImgSrc);
  }
  return (
    <>
      {imgSrc.length > 0 && (
        <div className="space-y-2">
          <Separator className="my-4" />
          <p className="text-sm">Images</p>
          <div className="grid grid-cols-2 gap-2 ps-2">
            {imgSrc.map((y: string, index) => {
              return (
                <Popover key={'image' + index}>
                  <PopoverTrigger asChild>
                    <Image
                      width={100}
                      height={100}
                      alt=""
                      className="cursor-pointer rounded-md border transition-opacity hover:opacity-75"
                      loader={() => y}
                      src={y}
                    ></Image>
                  </PopoverTrigger>
                  <PopoverContent
                    side="left"
                    align="start"
                    className="w-48 p-2"
                  >
                    <div className="grid gap-1.5">
                      <div className="relative size-fit">
                        <div className="absolute size-full grid items-center justify-center bg-background/25 transition-opacity opacity-0 hover:opacity-100 z-50 cursor-pointer">
                          <input
                            ref={hiddenFileInput}
                            type="file"
                            accept="image/*"
                            onChange={e => {
                              onSelectFile(e, index);
                            }}
                            style={{ display: 'none' }}
                          ></input>
                          <Button
                            variant={'secondary'}
                            className="text-xs p-3 h-8 rounded-lg"
                            onClick={() => {
                              if (hiddenFileInput.current != null)
                                hiddenFileInput.current.click();
                            }}
                          >
                            Upload Image
                          </Button>
                        </div>
                        <Image
                          width={200}
                          height={200}
                          alt=""
                          className="cursor-pointer rounded-lg border transition-opacity hover:opacity-75 relative blur-0 hover:blur-2xl"
                          loader={() => imgSrc[index]}
                          src={imgSrc[index]}
                        ></Image>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <Dialog>
                          <TooltipProvider>
                            <Tooltip>
                              <DialogTrigger>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant={'secondary'}
                                    className="w-full"
                                  >
                                    Crop
                                  </Button>
                                </TooltipTrigger>
                              </DialogTrigger>

                              <TooltipContent>
                                <p>Crop Image</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Crop Image</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <ReactCrop
                                crop={crop}
                                onChange={c => {
                                  setCrop(c);
                                }}
                              >
                                <Image
                                  ref={imgRef}
                                  width={300}
                                  height={100}
                                  alt=""
                                  className="cursor-pointer rounded-lg border transition-opacity hover:opacity-75 relative"
                                  src={originalSrc[index]}
                                ></Image>
                              </ReactCrop>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => {
                                  cropImage(index);
                                }}
                              >
                                Save changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant={'secondary'}>
                                <ImageMinus />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>AI Remove Background</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant={'secondary'}>
                                <ImageUpscale />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>AI Extend Image</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
