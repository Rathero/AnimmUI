import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const video = formData.get('video') as Blob;
    const id = formData.get('id') as string;
    
    if (!video || !id) {
      return NextResponse.json({ 
        success: false, 
        error: 'No video data or ID received' 
      }, { status: 400 });
    }
    
    // Ensure exports directory exists
    const exportsDir = join(process.cwd(), 'public', 'exports');
    if (!existsSync(exportsDir)) {
      await mkdir(exportsDir, { recursive: true });
    }
    
    // Convert blob to buffer
    const buffer = Buffer.from(await video.arrayBuffer());
    
    // Save the file
    const filePath = join(exportsDir, `${id}.webm`);
    await writeFile(filePath, buffer);
    
    return NextResponse.json({ 
      success: true,
      filePath: `/exports/${id}.webm`
    });
    
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save video' 
    }, { status: 500 });
  }
} 