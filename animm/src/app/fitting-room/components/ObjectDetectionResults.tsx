'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Eye, EyeOff, Shirt, User, ShoppingBag } from 'lucide-react';

interface DetectionResult {
  class: string;
  score: number;
  bbox: [number, number, number, number];
}

interface ObjectDetectionResultsProps {
  results: DetectionResult[];
  isDetecting: boolean;
}

const CLOTHING_CLASSES = [
  'person',
  'tie',
  'handbag',
  'backpack',
  'suitcase',
  'frisbee',
  'skis',
  'snowboard',
  'sports ball',
  'kite',
  'baseball bat',
  'baseball glove',
  'skateboard',
  'surfboard',
  'tennis racket',
];

const getConfidenceColor = (score: number) => {
  if (score >= 0.8) return 'bg-green-500';
  if (score >= 0.6) return 'bg-yellow-500';
  return 'bg-red-500';
};

const formatClassName = (className: string) => {
  return className
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getClassIcon = (className: string) => {
  switch (className) {
    case 'person':
      return <User className="h-4 w-4" />;
    case 'tie':
    case 'handbag':
    case 'backpack':
    case 'suitcase':
      return <ShoppingBag className="h-4 w-4" />;
    default:
      return <Shirt className="h-4 w-4" />;
  }
};

export function ObjectDetectionResults({
  results,
  isDetecting,
}: ObjectDetectionResultsProps) {
  if (isDetecting) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">
            Detecting objects...
          </span>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <EyeOff className="h-8 w-8 mx-auto mb-2" />
        <p>No objects detected</p>
        <p className="text-sm">Try capturing a new image</p>
      </div>
    );
  }

  const clothingItems = results.filter(item =>
    CLOTHING_CLASSES.includes(item.class)
  );

  const otherItems = results.filter(
    item => !CLOTHING_CLASSES.includes(item.class)
  );

  return (
    <div className="space-y-4">
      {/* Clothing Items */}
      {clothingItems.length > 0 && (
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">
            Clothing & Accessories ({clothingItems.length})
          </h4>
          <div className="space-y-2">
            {clothingItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${getConfidenceColor(
                      item.score
                    )}`}
                  />
                  {getClassIcon(item.class)}
                  <span className="font-medium">
                    {formatClassName(item.class)}
                  </span>
                </div>
                <Badge variant="outline">{Math.round(item.score * 100)}%</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Objects */}
      {otherItems.length > 0 && (
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">
            Other Objects ({otherItems.length})
          </h4>
          <div className="space-y-2">
            {otherItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${getConfidenceColor(
                      item.score
                    )}`}
                  />
                  <span className="font-medium">
                    {formatClassName(item.class)}
                  </span>
                </div>
                <Badge variant="outline">{Math.round(item.score * 100)}%</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Detection Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Objects</p>
              <p className="font-medium">{results.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Clothing Items</p>
              <p className="font-medium">{clothingItems.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
