import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exportId, duration, fps, quality, width, height } = body;

    // Validate required parameters
    if (!exportId || !duration || !fps) {
      return NextResponse.json(
        { error: 'Missing required parameters: exportId, duration, fps' },
        { status: 400 }
      );
    }

    // Validate parameter ranges
    if (duration <= 0 || duration > 30000) {
      // Max 30 seconds
      return NextResponse.json(
        { error: 'Duration must be between 1 and 30000 milliseconds' },
        { status: 400 }
      );
    }

    if (fps <= 0 || fps > 60) {
      // Max 60 FPS
      return NextResponse.json(
        { error: 'FPS must be between 1 and 60' },
        { status: 400 }
      );
    }

    // This endpoint is designed to be called by .NET after navigating to the viewer page
    // The actual GIF recording will be triggered by calling window.startGifRecording from .NET
    // and the result will be available via the gifRecordingComplete event

    return NextResponse.json({
      success: true,
      message: 'GIF recording configuration validated',
      instructions: {
        step1: 'Navigate to the viewer page with the export ID',
        step2: 'Wait for the page to load completely',
        step3: 'Call window.startGifRecording with the config',
        step4: 'Listen for the gifRecordingComplete event',
        step5: 'Extract the GIF data from the event detail',
      },
      config: {
        exportId,
        duration,
        fps,
        quality: quality || 10,
        width: width || 1920,
        height: height || 1080,
      },
    });
  } catch (error) {
    console.error('Error in GIF recording API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
