import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const exportId = formData.get('exportId') as string;
    const format = formData.get('format') as string;
    const duration = parseInt(formData.get('duration') as string);
    const fps = parseInt(formData.get('fps') as string);

    if (!file || !exportId || !format) {
      return NextResponse.json(
        { error: 'Missing required fields: file, exportId, format' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    console.log(`Received ${format} file for export ${exportId}:`, {
      size: uint8Array.length,
      duration,
      fps,
      format,
    });

    // Here you would typically:
    // 1. Save the file to Azure Blob Storage
    // 2. Update the database with the file metadata
    // 3. Return the file URL or ID

    // For now, we'll just return success with the file info
    const result = {
      success: true,
      exportId,
      format,
      size: uint8Array.length,
      duration,
      fps,
      // In a real implementation, you'd return the Azure URL here
      url: `https://your-azure-storage.blob.core.windows.net/recordings/${exportId}.${format}`,
      message:
        'File received successfully. Implement Azure storage and database update in production.',
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving recording:', error);
    return NextResponse.json(
      {
        error: 'Failed to save recording',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Recording save endpoint. Use POST to save recorded media files.',
    supportedFormats: ['gif', 'webm', 'mp4'],
    requiredFields: ['file', 'exportId', 'format', 'duration', 'fps'],
  });
}
