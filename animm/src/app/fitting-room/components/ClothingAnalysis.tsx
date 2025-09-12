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
import { Progress } from '@/components/ui/progress';
import { Palette, Shapes, Shirt, Sparkles, Thermometer } from 'lucide-react';

interface ColorAnalysis {
  dominant: {
    name: string;
    hex: string;
    rgb: [number, number, number];
  };
  secondary: Array<{
    name: string;
    hex: string;
    rgb: [number, number, number];
  }>;
  palette: Array<{
    name: string;
    hex: string;
    rgb: [number, number, number];
  }>;
  saturation: number;
  brightness: number;
  temperature: 'warm' | 'cool';
}

interface ShapeAnalysis {
  type: string;
  confidence: number;
  characteristics: string[];
  proportions: {
    length: number;
    width: number;
    fit: number;
  };
}

interface MaterialAnalysis {
  name: string;
  confidence: number;
}

interface ClothingItem {
  type: string;
  confidence: number;
  colors: ColorAnalysis;
  shape: ShapeAnalysis;
  material: MaterialAnalysis;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface ClothingAnalysisProps {
  analysis: {
    items: ClothingItem[];
    overallStyle: string;
    colorHarmony: number;
    recommendations: string[];
    timestamp: string;
  };
}

const getStyleIcon = (style: string) => {
  switch (style.toLowerCase()) {
    case 'casual':
      return '👕';
    case 'formal':
      return '👔';
    case 'sporty':
      return '⚽';
    case 'elegant':
      return '👗';
    case 'bohemian':
      return '🌸';
    case 'minimalist':
      return '⚪';
    default:
      return '👔';
  }
};

const getTemperatureIcon = (temperature: 'warm' | 'cool') => {
  return temperature === 'warm' ? '🔥' : '❄️';
};

export function ClothingAnalysis({ analysis }: ClothingAnalysisProps) {
  const { items, overallStyle, colorHarmony, recommendations, timestamp } =
    analysis;

  return (
    <div className="space-y-6">
      {/* Overall Style Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Overall Style Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getStyleIcon(overallStyle)}</span>
            <div>
              <h3 className="font-semibold">{overallStyle} Style</h3>
              <p className="text-sm text-muted-foreground">
                Detected from your clothing combination
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Color Harmony</span>
              <span className="text-sm text-muted-foreground">
                {colorHarmony}%
              </span>
            </div>
            <Progress value={colorHarmony} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Individual Clothing Items */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Clothing Items Analysis</h3>
        {items.map((item, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shirt className="h-4 w-4" />
                  {item.type}
                </CardTitle>
                <Badge variant="outline">
                  {Math.round(item.confidence * 100)}% confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Color Analysis */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <Palette className="h-4 w-4" />
                  Colors
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Dominant Color
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: item.colors.dominant.hex }}
                      />
                      <span className="font-medium capitalize">
                        {item.colors.dominant.name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {getTemperatureIcon(item.colors.temperature)}
                      </Badge>
                    </div>
                  </div>

                  {item.colors.secondary.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Secondary Colors
                      </p>
                      <div className="flex gap-2">
                        {item.colors.secondary.map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className="flex items-center gap-1"
                          >
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-xs capitalize">
                              {color.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Saturation</p>
                      <p className="font-medium">
                        {Math.round(item.colors.saturation)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Brightness</p>
                      <p className="font-medium">
                        {Math.round(item.colors.brightness)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shape Analysis */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <Shapes className="h-4 w-4" />
                  Shape & Fit
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Type: {item.shape.type}</span>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(item.shape.confidence * 100)}%
                    </Badge>
                  </div>

                  {item.shape.characteristics.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Characteristics
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {item.shape.characteristics.map((char, charIndex) => (
                          <Badge
                            key={charIndex}
                            variant="outline"
                            className="text-xs"
                          >
                            {char}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Length</p>
                      <p className="font-medium">
                        {Math.round(item.shape.proportions.length)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Width</p>
                      <p className="font-medium">
                        {Math.round(item.shape.proportions.width)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fit</p>
                      <p className="font-medium">
                        {Math.round(item.shape.proportions.fit)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Material Analysis */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <Thermometer className="h-4 w-4" />
                  Material
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm capitalize">
                    {item.material.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(item.material.confidence * 100)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Style Recommendations</CardTitle>
            <CardDescription>
              Suggestions based on your current outfit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground">•</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Analysis Timestamp */}
      <div className="text-xs text-muted-foreground text-center">
        Analysis completed at {new Date(timestamp).toLocaleString()}
      </div>
    </div>
  );
}
