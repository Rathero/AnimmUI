'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Shirt } from 'lucide-react';

interface SimplifiedClothingItem {
  type: string;
  dominantColor: {
    name: string;
    hex: string;
  };
  confidence: number;
}

interface ClothingAnalysisProps {
  analysis: {
    items: SimplifiedClothingItem[];
    timestamp: string;
  };
}

export function ClothingAnalysis({ analysis }: ClothingAnalysisProps) {
  const { items, timestamp } = analysis;

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Shirt className="h-8 w-8 mx-auto mb-2" />
        <p>No clothing detected</p>
        <p className="text-sm">Position yourself in front of the camera</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Detected Clothing</h3>

      {items.map((item, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shirt className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">{item.type}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: item.dominantColor.hex }}
                    />
                    <span className="text-sm text-muted-foreground capitalize">
                      {item.dominantColor.name}
                    </span>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {Math.round(item.confidence * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="text-xs text-muted-foreground text-center">
        Last updated: {new Date(timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
