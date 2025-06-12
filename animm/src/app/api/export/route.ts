import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  let browser;
  try {
    const { id, variables } = await request.json();

    // Ensure exports directory exists
    const exportsDir = join(process.cwd(), 'public', 'exports');
    if (!existsSync(exportsDir)) {
      await mkdir(exportsDir, { recursive: true });
    }

    // Launch browser with better performance settings
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
      ],
    });

    // Create new page
    const page = await browser.newPage();

    // Set viewport to match animation size with higher DPI
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2, // Higher resolution
    });

    // Construct URL with variables
    const queryParams = new URLSearchParams(variables).toString();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const url = `${baseUrl}/viewer/${id}?${queryParams}`;

    // Navigate to the viewer page with more lenient settings
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000, // Increase timeout to 60 seconds
    });

    // Wait for animation to load with a more specific selector
    try {
      await page.waitForSelector('#MainCanvas canvas', {
        timeout: 10000,
        visible: true,
      });
    } catch (error) {
      console.error('Canvas not found:', error);
      throw new Error('Animation canvas not found');
    }

    // Add a small delay to ensure animation is ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Record the animation
    const videoPath = join(exportsDir, `${id}.webm`);
    // Start recording with improved settings
    await page.evaluate(() => {
      const canvas = document.querySelector('#MainCanvas canvas');
      if (!canvas) {
        throw new Error('Canvas element not found');
      }

      const stream = (canvas as HTMLCanvasElement).captureStream(60); // 60 FPS for smoother animation

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9', // Use VP9 codec for better quality
        videoBitsPerSecond: 40000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, {
          type: 'video/webm;codecs=vp9',
        });
        const formData = new FormData();
        formData.append('video', blob);
        formData.append('id', window.location.pathname.split('/').pop() || '');

        try {
          const response = await fetch('/api/export/save', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to save video');
          }
        } catch (error) {
          console.error('Error saving video:', error);
        }
      };

      const riveInstance = (window as any).__RIVE_INSTANCE__;
      if (riveInstance) {
        riveInstance.play('SM');
        mediaRecorder.start(); // Get data every 100ms
      }

      setTimeout(() => {
        mediaRecorder.stop();
      }, 10000); // Adjust duration as needed
    });

    // Wait for recording to complete with extra buffer time
    await new Promise(resolve => setTimeout(resolve, 10000 + 2000));

    return NextResponse.json({
      success: true,
      videoUrl: `/exports/${id}.webm`,
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to export video',
      },
      { status: 500 }
    );
  } finally {
    // Always close the browser
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        console.error('Error closing browser:', error);
      }
    }
  }
}
