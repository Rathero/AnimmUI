# Recording API Guide for .NET Integration

This guide explains how to integrate with the React viewer's recording functionality from your .NET microservice.

## Overview

The React viewer now supports recording both GIF and video formats (WebM, MP4) with high quality and performance. The recording is triggered from .NET and the resulting media files are sent back to .NET for storage in Azure and database updates.

**Key Features:**

- **Perfect Animation Synchronization**: Rive animations start exactly when recording begins, ensuring the animation is captured from the very beginning
- **Automatic Animation Control**: The system automatically stops the animation before recording and starts it precisely when recording begins
- **Manual Animation Control**: Additional global functions allow manual control of Rive animations for testing and debugging

## Global Functions Available

The following functions are exposed globally on the `window` object when the viewer is loaded:

### Main Recording Functions

```javascript
// Start recording with configuration
window.startRecording(config: RecordingConfig): Promise<RecordingResult>

// Check if recording is currently in progress
window.isRecording(): boolean

// Get the current recording result (poll this for completion)
window.getRecordingResult(): RecordingResult | null

// Get current recording status (progress, time, frames)
window.getRecordingStatus(): RecordingStatus | null

// Manually stop recording
window.stopRecording(): void

// Clear the recording result
window.clearRecordingResult(): void

// Rive Animation Control Functions
window.startRiveAnimation(): void
window.stopRiveAnimation(): void
```

### Legacy GIF Functions (Backward Compatibility)

```javascript
// Legacy GIF recording (still works, but use startRecording for new code)
window.startGifRecording(config: any): Promise<RecordingResult>
window.isGifRecording(): boolean
window.getGifRecordingResult(): RecordingResult | null
window.clearGifRecordingResult(): void
```

## Configuration Types

### RecordingConfig

```typescript
interface RecordingConfig {
  exportId: string; // Unique identifier for the export
  duration: number; // Recording duration in milliseconds
  fps: number; // Frames per second (recommended: 30 for video, 10-15 for GIF)
  format: 'gif' | 'webm' | 'mp4'; // Output format
  quality?: number; // Quality: 1-30 for GIF (lower=better), 0-1 for video
  width?: number; // Output width (optional, uses canvas size if not specified)
  height?: number; // Output height (optional, uses canvas size if not specified)
  bitrate?: number; // Video bitrate in bits per second (for video formats)
}
```

### RecordingResult

```typescript
interface RecordingResult {
  success: boolean; // Whether recording was successful
  data?: Uint8Array; // The recorded media as bytes (if successful)
  error?: string; // Error message (if failed)
  format: string; // The actual format of the recorded file
  size: number; // File size in bytes
  duration: number; // Actual recording duration in milliseconds
}
```

### RecordingStatus

```typescript
interface RecordingStatus {
  isRecording: boolean; // Whether recording is currently active
  progress: number; // Recording progress (0-100)
  currentTime: number; // Current recording time in milliseconds
  totalFrames: number; // Total frames captured so far
}
```

## Usage Examples

### C# Integration Example with PuppeteerSharp

#### Installation

First, install the PuppeteerSharp NuGet package:

```bash
dotnet add package PuppeteerSharp
```

#### Basic Setup

```csharp
// In your Program.cs or Startup.cs
using PuppeteerSharp;

// Download Chromium browser (only needed once)
await new BrowserFetcher().DownloadAsync();
```

#### Service Registration (for Dependency Injection)

```csharp
// In Startup.cs or Program.cs
services.AddSingleton<RecordingService>(provider =>
    new RecordingService("https://your-domain.com"));
```

```csharp
using PuppeteerSharp;
using System.Text.Json;

public class RecordingService
{
    private readonly IBrowser _browser;
    private readonly string _viewerBaseUrl;

    public RecordingService(string viewerBaseUrl)
    {
        _viewerBaseUrl = viewerBaseUrl;
    }

    public async Task<RecordingResult> RecordAnimation(string exportId, int durationMs, int fps, string format)
    {
        // Launch browser if not already launched
        if (_browser == null)
        {
            await new BrowserFetcher().DownloadAsync();
            _browser = await Puppeteer.LaunchAsync(new LaunchOptions
            {
                Headless = true,
                Args = new[] { "--no-sandbox", "--disable-setuid-sandbox" }
            });
        }

        using var page = await _browser.NewPageAsync();

        // Navigate to the viewer
        await page.GoToAsync($"{_viewerBaseUrl}/viewer/{exportId}");

        // Wait for the page to load and recording functions to be available
        await WaitForRecordingFunctions(page);

        // Create recording configuration
        var config = new
        {
            exportId = exportId,
            duration = durationMs,
            fps = fps,
            format = format, // "gif", "webm", or "mp4"
            quality = format == "gif" ? 10 : 0.8,
            bitrate = format != "gif" ? 4000000 : (int?)null // 4Mbps for video
        };

        // Start recording
        await page.EvaluateExpressionAsync($"window.startRecording({JsonSerializer.Serialize(config)})");

        // Poll for completion
        RecordingResult result = null;
        var maxWaitTime = TimeSpan.FromSeconds(durationMs / 1000 + 30); // Add 30s buffer
        var startTime = DateTime.UtcNow;

        while (DateTime.UtcNow - startTime < maxWaitTime)
        {
            await Task.Delay(1000); // Poll every second

            var isRecording = await page.EvaluateExpressionAsync<bool>("window.isRecording()");
            if (!isRecording)
            {
                var resultJson = await page.EvaluateExpressionAsync<string>("JSON.stringify(window.getRecordingResult())");
                if (!string.IsNullOrEmpty(resultJson) && resultJson != "null")
                {
                    result = JsonSerializer.Deserialize<RecordingResult>(resultJson);
                    if (result != null)
                    {
                        break;
                    }
                }
            }
        }

        if (result?.Success == true && result.Data != null)
        {
            // Save to Azure and update database
            await SaveRecordingToAzure(result, exportId, format);
        }

        return result;
    }

    private async Task WaitForRecordingFunctions(IPage page)
    {
        var maxWaitTime = TimeSpan.FromSeconds(30);
        var startTime = DateTime.UtcNow;

        while (DateTime.UtcNow - startTime < maxWaitTime)
        {
            var hasFunctions = await page.EvaluateExpressionAsync<bool>(
                "typeof window.startRecording === 'function'"
            );

            if (hasFunctions)
            {
                return;
            }

            await Task.Delay(1000);
        }

        throw new TimeoutException("Recording functions not available after 30 seconds");
    }

    private async Task SaveRecordingToAzure(RecordingResult result, string exportId, string format)
    {
        // Convert Uint8Array to byte array
        var bytes = Convert.FromBase64String(result.Data);

        // Create form data
        using var formData = new MultipartFormDataContent();
        using var fileContent = new ByteArrayContent(bytes);
        formData.Add(fileContent, "file", $"recording.{format}");
        formData.Add(new StringContent(exportId), "exportId");
        formData.Add(new StringContent(format), "format");
        formData.Add(new StringContent(result.Duration.ToString()), "duration");
        formData.Add(new StringContent("30"), "fps"); // Adjust as needed

        // Send to API
        using var client = new HttpClient();
        var response = await client.PostAsync("https://your-domain.com/api/recording/save", formData);

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Failed to save recording: {response.StatusCode}");
        }
    }

    // Alternative method using page.EvaluateFunctionAsync for better type safety
    public async Task<RecordingResult> RecordAnimationWithFunction(string exportId, int durationMs, int fps, string format)
    {
        using var page = await _browser.NewPageAsync();
        await page.GoToAsync($"{_viewerBaseUrl}/viewer/{exportId}");
        await WaitForRecordingFunctions(page);

        // Start recording using function call
        await page.EvaluateFunctionAsync(@"
            (config) => {
                return window.startRecording(config);
            }", new
        {
            exportId = exportId,
            duration = durationMs,
            fps = fps,
            format = format,
            quality = format == "gif" ? 10 : 0.8,
            bitrate = format != "gif" ? 4000000 : (int?)null
        });

        // Poll for completion with function calls
        RecordingResult result = null;
        var maxWaitTime = TimeSpan.FromSeconds(durationMs / 1000 + 30);
        var startTime = DateTime.UtcNow;

        while (DateTime.UtcNow - startTime < maxWaitTime)
        {
            await Task.Delay(1000);

            var isRecording = await page.EvaluateFunctionAsync<bool>("() => window.isRecording()");
            if (!isRecording)
            {
                var resultJson = await page.EvaluateFunctionAsync<string>("() => JSON.stringify(window.getRecordingResult())");
                if (!string.IsNullOrEmpty(resultJson) && resultJson != "null")
                {
                    result = JsonSerializer.Deserialize<RecordingResult>(resultJson);
                    if (result != null)
                    {
                        break;
                    }
                }
            }
        }

        if (result?.Success == true && result.Data != null)
        {
            await SaveRecordingToAzure(result, exportId, format);
        }

        return result;
    }

    public async Task DisposeAsync()
    {
        if (_browser != null)
        {
            await _browser.CloseAsync();
        }
    }
}

// RecordingResult class for deserialization
public class RecordingResult
{
    public bool Success { get; set; }
    public string Data { get; set; } // Base64 encoded Uint8Array
    public string Error { get; set; }
    public string Format { get; set; }
    public int Size { get; set; }
    public int Duration { get; set; }
}
```

### JavaScript Example (for testing)

```javascript
// Example configuration for GIF recording
const gifConfig = {
  exportId: 'export-123',
  duration: 5000, // 5 seconds
  fps: 10,
  format: 'gif',
  quality: 10,
};

// Example configuration for video recording
const videoConfig = {
  exportId: 'export-123',
  duration: 10000, // 10 seconds
  fps: 30,
  format: 'webm',
  quality: 0.8,
  bitrate: 4000000, // 4Mbps
};

// Start recording
window.startRecording(gifConfig).then(result => {
  if (result.success) {
    console.log(
      `Recording completed: ${result.size} bytes, ${result.duration}ms`
    );
    // Send to .NET API
    sendToDotNet(result);
  } else {
    console.error('Recording failed:', result.error);
  }
});

// Poll for status
const status = window.getRecordingStatus();
if (status) {
  console.log(
    `Progress: ${status.progress}%, Time: ${status.currentTime}ms, Frames: ${status.totalFrames}`
  );
}
```

## Animation Synchronization

### How It Works

The recording system ensures perfect synchronization between the Rive animation and the recording:

1. **Pre-Recording**: The Rive animation is automatically stopped and reset to the beginning
2. **Recording Start**: The animation starts playing exactly when the first frame is captured
3. **Perfect Timing**: This ensures the animation is captured from frame 1, not from wherever it was when recording started

### Manual Animation Control

You can also manually control the Rive animation for testing:

```javascript
// Start the Rive animation manually
window.startRiveAnimation();

// Stop the Rive animation manually
window.stopRiveAnimation();
```

### C# Integration with Animation Control

```csharp
// The recording automatically handles animation synchronization
var result = await RecordAnimation(exportId, duration, fps, format);

// For manual control (optional)
await page.EvaluateExpressionAsync("window.startRiveAnimation()");
await page.EvaluateExpressionAsync("window.stopRiveAnimation()");
```

## Best Practices

### GIF Duration Precision

The GIF recording system now ensures exact duration matching:

- **Frame Delay Calculation**: Each frame's delay is calculated as `totalDuration / totalFrames` to ensure the sum equals exactly the requested duration
- **Frame Count**: The system calculates the exact number of frames needed based on duration and FPS
- **Precise Timing**: The GIF will play for exactly the specified duration, preventing "weird animation" issues

**Example**: For a 1000ms GIF at 10 FPS:

- Total frames: 10 frames
- Frame delay: 100ms per frame
- Total duration: 10 × 100ms = 1000ms (exact)

### Why PuppeteerSharp?

PuppeteerSharp offers several advantages over WebDriver for this use case:

1. **Better Performance**: Direct communication with Chromium without WebDriver overhead
2. **More Reliable**: Built-in wait mechanisms and better error handling
3. **Type Safety**: Strong typing for JavaScript evaluation results
4. **Modern API**: Async/await support and modern C# patterns
5. **Headless Support**: Excellent headless browser support for server environments
6. **Memory Efficiency**: Better memory management for long-running services

### Performance Recommendations

1. **GIF Recording**: Use 10-15 FPS for good quality/size balance
2. **Video Recording**: Use 30 FPS for smooth playback
3. **Quality Settings**:
   - GIF: 10-15 (lower = better quality, larger file)
   - Video: 0.7-0.9 (higher = better quality, larger file)
4. **Duration**: Keep under 30 seconds for optimal performance

### Error Handling

```csharp
try
{
    var result = await RecordAnimation(exportId, duration, fps, format);

    if (!result.Success)
    {
        // Handle recording failure
        _logger.LogError($"Recording failed: {result.Error}");
        return;
    }

    // Process successful recording
    await ProcessRecording(result);
}
catch (TimeoutException ex)
{
    _logger.LogError($"Recording timeout: {ex.Message}");
}
catch (PuppeteerSharp.ProcessException ex)
{
    _logger.LogError($"Browser process error: {ex.Message}");
    // Handle browser crash or startup issues
}
catch (PuppeteerSharp.NavigationException ex)
{
    _logger.LogError($"Navigation error: {ex.Message}");
    // Handle page loading issues
}
catch (Exception ex)
{
    _logger.LogError($"Unexpected error: {ex.Message}");
}
```

### Memory Management

- Always call `window.clearRecordingResult()` after processing
- For long-running services, periodically check for memory leaks
- Consider implementing recording cleanup if the viewer page is refreshed
- Close browser pages after each recording to free memory
- Use `DisposeAsync()` when shutting down the service

### Advanced PuppeteerSharp Configuration

```csharp
// For production environments with specific requirements
var browser = await Puppeteer.LaunchAsync(new LaunchOptions
{
    Headless = true,
    Args = new[]
    {
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu"
    },
    DefaultViewport = new ViewPortOptions
    {
        Width = 1920,
        Height = 1080
    },
    IgnoreHTTPSErrors = true,
    Timeout = 30000
});

// Configure page for better performance
await page.SetViewportAsync(new ViewPortOptions
{
    Width = 1920,
    Height = 1080,
    DeviceScaleFactor = 1
});

// Set user agent if needed
await page.SetUserAgentAsync("Your Custom User Agent");
```

## API Endpoints

### Save Recording

- **URL**: `/api/recording/save`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`

**Form Fields:**

- `file`: The recorded media file
- `exportId`: Unique identifier for the export
- `format`: File format (gif, webm, mp4)
- `duration`: Recording duration in milliseconds
- `fps`: Frames per second used

**Response:**

```json
{
  "success": true,
  "exportId": "export-123",
  "format": "gif",
  "size": 123456,
  "duration": 5000,
  "fps": 10,
  "url": "https://azure-storage.blob.core.windows.net/recordings/export-123.gif"
}
```

## Troubleshooting

### Common Issues

1. **"Canvas element not found"**: Ensure the viewer is fully loaded before starting recording
2. **"Recording already in progress"**: Wait for previous recording to complete or call `stopRecording()`
3. **Large file sizes**: Reduce quality or FPS settings
4. **Recording timeout**: Increase the polling timeout or check for browser issues

### Debug Information

Enable console logging in the browser to see detailed recording progress:

```javascript
// Check if recording functions are available
console.log(
  'startRecording available:',
  typeof window.startRecording === 'function'
);
console.log('isRecording available:', typeof window.isRecording === 'function');

// Check current status
console.log('Current status:', window.getRecordingStatus());
```

## Migration from Old GIF API

If you're migrating from the old GIF-only API:

1. Replace `startGifRecording()` with `startRecording()` and set `format: "gif"`
2. Replace `isGifRecording()` with `isRecording()`
3. Replace `getGifRecordingResult()` with `getRecordingResult()`
4. The old functions still work for backward compatibility

## Support

For issues or questions:

1. Check browser console for error messages
2. Verify all required functions are available before starting recording
3. Ensure the viewer page is fully loaded
4. Check network connectivity for API calls
