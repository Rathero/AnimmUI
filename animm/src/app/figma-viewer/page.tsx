'use client';

import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import html2canvas from 'html2canvas';
import Head from 'next/head';

// Replace with your Figma personal access token and file key
const FIGMA_TOKEN = 'figd_Z7z85ctjt_nicDUzwKSoJoVP485LOsGvOjXgM0Nv';
const FILE_KEY = 'lYh0MXKnuKSMa8v8WXREIt';

// Helper to fetch Figma file data
async function fetchFigmaFile(fileKey: string) {
  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
    headers: {
      'X-Figma-Token': FIGMA_TOKEN,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch Figma file');
  return res.json();
}

// Helper to fetch Figma image URLs
async function fetchFigmaImages(
  fileKey: string,
  ids: string[],
  format = 'png'
) {
  const res = await fetch(
    `https://api.figma.com/v1/images/${fileKey}?ids=${ids.join(
      ','
    )}&format=${format}`,
    {
      headers: {
        'X-Figma-Token': FIGMA_TOKEN,
      },
    }
  );
  if (!res.ok) throw new Error('Failed to fetch Figma images');
  return res.json();
}

function rgbToRgba({
  r,
  g,
  b,
  a = 1,
}: {
  r: number;
  g: number;
  b: number;
  a?: number;
}) {
  return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(
    b * 255
  )},${a})`;
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return (
    '#' +
    [r, g, b]
      .map(x =>
        Math.round(x * 255)
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  );
}

function hexToRgb(hex: string) {
  const v = hex.replace('#', '');
  return {
    r: parseInt(v.slice(0, 2), 16) / 255,
    g: parseInt(v.slice(2, 4), 16) / 255,
    b: parseInt(v.slice(4, 6), 16) / 255,
  };
}

function dataUrlFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getNodeFill(node: any, edits: any) {
  // Only handle solid color for now
  const fill =
    edits[node.id]?.fill ?? (node.fills?.[0]?.color || { r: 1, g: 1, b: 1 });
  const a = node.fills?.[0]?.color?.a ?? 1;
  return rgbToRgba({ ...fill, a });
}

function getTextStyle(node: any) {
  const style = node.style || {};
  const fills = node.fills || [];
  const fill = fills[0]?.color || { r: 0, g: 0, b: 0, a: 1 };
  const fillOpacity = fills[0]?.opacity ?? 1;
  const nodeOpacity = node.opacity ?? 1;
  return {
    fontFamily: 'Inter, Geist, Arial, sans-serif',
    fontWeight: style.fontWeight || 'normal',
    fontStyle: style.fontStyle || 'normal',
    fontSize: style.fontSize || 16,
    letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
    lineHeight: style.lineHeightPx ? `${style.lineHeightPx}px` : 'normal',
    color: rgbToRgba({ ...fill, a: (fill.a ?? 1) * fillOpacity }),
    opacity: nodeOpacity,
    textAlign: style.textAlignHorizontal?.toLowerCase() || 'left',
    verticalAlign: style.textAlignVertical?.toLowerCase() || 'top',
    resize: 'none',
    padding: 0,
    margin: 0,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  };
}

function VisualNode({
  node,
  edits,
  imageMap,
  onEdit,
  onImageUpload,
  debugLevel = 0,
  offset = { x: 0, y: 0 },
  vectorImages = {},
  instanceImages = {},
}: any) {
  // Offset all children by the frame's x/y
  let absBox = node.absoluteBoundingBox;
  if (absBox) {
    absBox = {
      ...absBox,
      x: absBox.x - offset.x,
      y: absBox.y - offset.y,
    };
  }
  if (!absBox) {
    // Debug: Show placeholder for nodes without absoluteBoundingBox
    return (
      <div style={{ color: 'red', marginLeft: debugLevel * 16 }}>
        [No absoluteBoundingBox] {node.name} ({node.type})
        {node.children &&
          node.children.map((child: any) => (
            <VisualNode
              key={child.id}
              node={child}
              edits={edits}
              imageMap={imageMap}
              onEdit={onEdit}
              onImageUpload={onImageUpload}
              debugLevel={debugLevel + 1}
              offset={offset}
              vectorImages={vectorImages}
              instanceImages={instanceImages}
            />
          ))}
      </div>
    );
  }
  const { x, y, width, height } = absBox;
  const style: React.CSSProperties = {
    position: 'absolute',
    left: x,
    top: y,
    width,
    height,
    overflow: 'hidden',
    boxSizing: 'border-box',
  };
  if (node.type === 'RECTANGLE') {
    const imageFill = node.fills?.find((f: any) => f.type === 'IMAGE');
    const localImage = edits[node.id]?.image;
    if (imageFill) {
      return (
        <div key={node.id} style={{ ...style, padding: 0 }}>
          <img
            src={localImage || imageMap[node.id]}
            alt="Figma Image Fill"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <input
            type="file"
            accept="image/*"
            style={{ position: 'absolute', bottom: 4, left: 4, zIndex: 2 }}
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                onImageUpload(node.id, e.target.files[0]);
              }
            }}
          />
        </div>
      );
    } else {
      return (
        <div
          key={node.id}
          style={{ ...style, background: getNodeFill(node, edits) }}
        >
          <input
            type="color"
            value={rgbToHex(node.fills?.[0]?.color || { r: 1, g: 1, b: 1 })}
            style={{ position: 'absolute', bottom: 4, left: 4, zIndex: 2 }}
            onChange={e => onEdit(node.id, 'fill', hexToRgb(e.target.value))}
          />
        </div>
      );
    }
  }
  if (node.type === 'TEXT') {
    const text = edits[node.id]?.characters ?? node.characters;
    const textStyle = getTextStyle(node);
    return (
      <div
        key={node.id}
        style={{
          ...style,
          background: 'none',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <textarea
          value={text}
          onChange={e => onEdit(node.id, 'characters', e.target.value)}
          style={textStyle as React.CSSProperties}
          rows={1}
          onInput={e => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
        />
      </div>
    );
  }
  if (node.type === 'VECTOR') {
    // Render as an image if available, else as a filled rectangle
    const vectorUrl = vectorImages[node.id];
    if (vectorUrl) {
      return (
        <img
          key={node.id}
          src={vectorUrl}
          alt={node.name}
          style={{ ...style, display: 'block' }}
        />
      );
    }
    // fallback: render as a colored rectangle with a debug border
    const fill = node.fills?.[0]?.color || { r: 0.5, g: 0.5, b: 0.5, a: 1 };
    return (
      <div
        key={node.id}
        style={{
          ...style,
          background: rgbToRgba(fill),
          border: '2px dashed red',
          color: 'red',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
        }}
      >
        VECTOR: {node.name}
      </div>
    );
  }
  if (node.type === 'INSTANCE') {
    // Try to render as an image if available
    const instanceUrl = instanceImages[node.id];
    if (instanceUrl) {
      return (
        <img
          key={node.id}
          src={instanceUrl}
          alt={node.name}
          style={{ ...style, display: 'block' }}
        />
      );
    }
    // Recursively render children as fallback
    return (
      <div key={node.id} style={style}>
        {node.children &&
          node.children.map((child: any) => (
            <VisualNode
              key={child.id}
              node={child}
              edits={edits}
              imageMap={imageMap}
              onEdit={onEdit}
              onImageUpload={onImageUpload}
              debugLevel={debugLevel + 1}
              offset={offset}
              vectorImages={vectorImages}
              instanceImages={instanceImages}
            />
          ))}
      </div>
    );
  }
  if (node.children) {
    return node.children.map((child: any) => (
      <VisualNode
        key={child.id}
        node={child}
        edits={edits}
        imageMap={imageMap}
        onEdit={onEdit}
        onImageUpload={onImageUpload}
        debugLevel={debugLevel + 1}
        offset={offset}
        vectorImages={vectorImages}
        instanceImages={instanceImages}
      />
    ));
  }
  return null;
}

const FigmaViewer: React.FC = () => {
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [edits, setEdits] = useState<any>({});
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [vectorImages, setVectorImages] = useState<Record<string, string>>({});
  const [instanceImages, setInstanceImages] = useState<Record<string, string>>(
    {}
  );
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetchFigmaFile(FILE_KEY)
      .then(async data => {
        setFile(data);
        // Find all rectangles with image fills, VECTORs, and INSTANCEs (recursively)
        const frames =
          data.document.children.filter((n: any) => n.type === 'CANVAS')[0]
            ?.children || [];
        const imageRectIds: string[] = [];
        const vectorIds: string[] = [];
        const instanceIds: string[] = [];
        function findImageAndVectorAndInstanceIds(nodes: any[]) {
          nodes.forEach(node => {
            if (
              node.type === 'RECTANGLE' &&
              node.fills?.some((f: any) => f.type === 'IMAGE')
            ) {
              imageRectIds.push(node.id);
            }
            if (node.type === 'VECTOR') {
              vectorIds.push(node.id);
            }
            if (node.type === 'INSTANCE') {
              instanceIds.push(node.id);
            }
            if (node.children) findImageAndVectorAndInstanceIds(node.children);
          });
        }
        frames.forEach((frame: any) =>
          findImageAndVectorAndInstanceIds([frame])
        );
        // Debug: log all vector and instance IDs
        console.log('VECTOR IDs:', vectorIds);
        console.log('INSTANCE IDs:', instanceIds);
        if (imageRectIds.length > 0) {
          const images = await fetchFigmaImages(FILE_KEY, imageRectIds);
          setImageMap(images.images);
        }
        if (vectorIds.length > 0) {
          const vectors = await fetchFigmaImages(FILE_KEY, vectorIds, 'svg');
          // Debug: log returned vector image URLs
          console.log('VECTOR image URLs:', vectors.images);
          setVectorImages(vectors.images);
        }
        if (instanceIds.length > 0) {
          const instances = await fetchFigmaImages(
            FILE_KEY,
            instanceIds,
            'svg'
          );
          // Debug: log returned instance image URLs
          console.log('INSTANCE image URLs:', instances.images);
          setInstanceImages(instances.images);
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (id: string, prop: string, value: any) => {
    setEdits((prev: any) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [prop]: value,
      },
    }));
  };

  const handleImageUpload = async (id: string, file: File) => {
    const dataUrl = await dataUrlFromFile(file);
    setEdits((prev: any) => ({
      ...prev,
      [id]: {
        ...prev[id],
        image: dataUrl,
      },
    }));
  };

  const handleReset = () => setEdits({});

  const handleExport = async () => {
    if (!viewerRef.current) return;
    const canvas = await html2canvas(viewerRef.current);
    const link = document.createElement('a');
    link.download = 'figma-export.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  if (loading) return <div>Loading Figma file...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!file) return null;

  // Find the first frame in the document
  const frames =
    file.document.children.filter((n: any) => n.type === 'CANVAS')[0]
      ?.children || [];

  return (
    <div style={{ padding: 32 }}>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <h1>Figma File Viewer</h1>
      <div style={{ marginBottom: 16 }}>
        <button onClick={handleReset} style={{ marginRight: 8 }}>
          Reset
        </button>
        <button onClick={handleExport}>Export as PNG</button>
      </div>
      <pre
        style={{
          maxHeight: 300,
          overflow: 'auto',
          background: '#f8f8f8',
          fontSize: 12,
          padding: 8,
          border: '1px solid #eee',
        }}
      >
        {JSON.stringify(frames, null, 2)}
      </pre>
      {frames.map((frame: any) => {
        const { x, y, width, height } = frame.absoluteBoundingBox || {
          x: 0,
          y: 0,
          width: 800,
          height: 600,
        };
        return (
          <div
            key={frame.id}
            ref={viewerRef}
            style={{
              position: 'relative',
              width,
              height,
              background: '#fff',
              border: '1px solid #ccc',
              marginBottom: 32,
              overflow: 'hidden',
            }}
          >
            <VisualNode
              node={frame}
              edits={edits}
              imageMap={imageMap}
              onEdit={handleEdit}
              onImageUpload={handleImageUpload}
              debugLevel={0}
              offset={{
                x: frame.absoluteBoundingBox?.x || 0,
                y: frame.absoluteBoundingBox?.y || 0,
              }}
              vectorImages={vectorImages}
              instanceImages={instanceImages}
            />
          </div>
        );
      })}
    </div>
  );
};

export default FigmaViewer;
