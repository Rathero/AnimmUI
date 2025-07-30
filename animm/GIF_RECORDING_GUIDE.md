# GIF Recording Integration Guide

This guide explains how to integrate GIF recording functionality from your .NET microservice.

## Overview

The GIF recording system allows you to capture Rive animations as GIF files directly in the browser. The system is designed to be triggered from .NET and returns the GIF data as bytes that can be saved to Azure and your database.

## Architecture

1. **.NET Microservice**: Controls a browser (Puppeteer/Selenium) and navigates to the viewer page
2. **Viewer Page**: Contains the Rive animation and GIF recording functionality
3. **GIF Recorder**: Captures frames from the canvas and generates GIF data
4. **Event System**: Communicates results back to .NET

## Implementation Details

### Files Created

- `src/lib/gif-recorder.ts` - Core GIF recording functionality
- `src/app/api/gif-record/route.ts` - API endpoint for configuration validation
- `src/app/gif-test/page.tsx` - Test page for GIF recording
- Updated `src/app/viewer/[id]/page.tsx` - Added global functions for .NET integration

### Global Functions Available

The viewer page exposes these global functions for .NET to call:

```javascript
// Start GIF recording
window.startGifRecording(config);

// Check if recording is in progress
window.isGifRecording();

// Get the recording result (poll this function)
window.getGifRecordingResult();

// Clear the recording result
window.clearGifRecordingResult();
```

## .NET Integration Steps

### Step 1: Navigate to Viewer Page

```csharp
// Navigate to the viewer page with your export ID
await page.NavigateToAsync($"https://your-domain.com/viewer/{exportId}");
```

### Step 2: Wait for Page Load

```csharp
// Wait for the canvas to be ready
await page.WaitForSelectorAsync("#MainCanvas canvas", new WaitForSelectorOptions
{
    Timeout = 10000,
    Visible = true
});

// Additional wait to ensure Rive is loaded
await page.WaitForTimeoutAsync(2000);
```

### Step 3: Start GIF Recording

```csharp
// Define recording configuration
var config = new
{
    exportId = "your-export-id",
    duration = 5000, // 5 seconds in milliseconds
    fps = 15, // 15 frames per second
    quality = 10, // GIF quality (1-30, lower is better)
    width = 1920, // Optional: override width
    height = 1080 // Optional: override height
};

// Call the recording function
await page.EvaluateFunctionAsync("window.startGifRecording", config);
```

### Step 4: Poll for Results

```csharp
// Poll for the recording result
var maxWaitTime = TimeSpan.FromSeconds(30);
var pollInterval = TimeSpan.FromMilliseconds(100);
var elapsed = TimeSpan.Zero;

while (elapsed < maxWaitTime)
{
    // Check if recording is still in progress
    var isRecording = await page.EvaluateFunctionAsync<bool>("window.isGifRecording");
    if (!isRecording)
    {
        // Get the result
        var result = await page.EvaluateFunctionAsync<dynamic>("window.getGifRecordingResult");

        if (result != null)
        {
            var success = result.success;
            var data = result.data as byte[];
            var error = result.error as string;

            if (success && data != null)
            {
                // Clear the result
                await page.EvaluateFunctionAsync("window.clearGifRecordingResult");
                return data; // Return the GIF data
            }
            else
            {
                throw new Exception($"GIF recording failed: {error}");
            }
        }
    }

    await Task.Delay(pollInterval);
    elapsed += pollInterval;
}

throw new TimeoutException("GIF recording timed out");
```

### Step 5: Save GIF Data

```csharp
// Save to Azure Blob Storage
var blobName = $"gifs/{exportId}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.gif";
await blobContainer.UploadBlobAsync(blobName, new MemoryStream(gifData));

// Save to database
await dbContext.Exports.AddAsync(new Export
{
    Id = exportId,
    GifUrl = blobName,
    GifSize = gifData.Length,
    CreatedAt = DateTime.UtcNow
});
await dbContext.SaveChangesAsync();
```

## Configuration Options

### GifRecordingConfig

```typescript
interface GifRecordingConfig {
  exportId: string; // Required: Unique identifier for the export
  duration: number; // Required: Recording duration in milliseconds (1-30000)
  fps: number; // Required: Frames per second (1-60)
  quality?: number; // Optional: GIF quality (1-30, lower is better, default: 10)
  width?: number; // Optional: Override canvas width
  height?: number; // Optional: Override canvas height
}
```

### Recommended Settings

- **Short animations (1-3s)**: 15-20 FPS, quality 8-10
- **Medium animations (3-10s)**: 10-15 FPS, quality 10-12
- **Long animations (10s+)**: 8-12 FPS, quality 12-15

## Error Handling

The system provides comprehensive error handling:

```csharp
try
{
    // Your recording code here
}
catch (TimeoutException)
{
    // Recording took too long
    Console.WriteLine("Recording timed out");
}
catch (Exception ex)
{
    // Other errors
    Console.WriteLine($"Recording failed: {ex.Message}");
}
```

## Testing

You can test the GIF recording functionality by visiting:

```
https://your-domain.com/gif-test
```

This page provides a simple interface to test recording with different configurations.

## Performance Considerations

1. **Memory Usage**: GIF recording can be memory-intensive. Monitor memory usage in your .NET service.
2. **Recording Duration**: Limit recordings to 30 seconds maximum to prevent browser crashes.
3. **FPS vs Quality**: Higher FPS increases file size. Balance quality and performance based on your needs.
4. **Concurrent Recordings**: The system prevents multiple simultaneous recordings per page.

## Troubleshooting

### Common Issues

1. **Canvas not found**: Ensure the page has fully loaded before starting recording
2. **Recording timeout**: Increase timeout or reduce recording duration
3. **Memory errors**: Reduce FPS or quality settings
4. **Rive not playing**: Ensure the Rive instance is properly initialized

### Debug Information

The system logs detailed information to the browser console:

- Recording start/stop events
- Frame capture progress
- Error details
- GIF generation status

## Security Considerations

1. **Input Validation**: Always validate configuration parameters on both client and server
2. **File Size Limits**: Implement reasonable limits for GIF file sizes
3. **Rate Limiting**: Consider implementing rate limiting for the recording API
4. **Authentication**: Ensure only authorized services can trigger recordings

## Example Complete .NET Implementation

```csharp
public class GifRecordingService
{
    private readonly IWebDriver _driver;

    public async Task<byte[]> RecordGifAsync(string exportId, int durationMs, int fps)
    {
        try
        {
            // Navigate to viewer
            _driver.Navigate().GoToUrl($"https://your-domain.com/viewer/{exportId}");

            // Wait for page load
            var wait = new WebDriverWait(_driver, TimeSpan.FromSeconds(10));
            wait.Until(d => d.FindElement(By.CssSelector("#MainCanvas canvas")));

            // Start recording
            var config = new { exportId, duration = durationMs, fps };
            ((IJavaScriptExecutor)_driver).ExecuteScript("window.startGifRecording(arguments[0]);", config);

            // Poll for completion
            var maxWaitTime = TimeSpan.FromSeconds(30);
            var pollInterval = TimeSpan.FromMilliseconds(100);
            var elapsed = TimeSpan.Zero;

            while (elapsed < maxWaitTime)
            {
                // Check if recording is still in progress
                var isRecording = (bool)((IJavaScriptExecutor)_driver).ExecuteScript("return window.isGifRecording();");
                if (!isRecording)
                {
                    // Get the result
                    var result = ((IJavaScriptExecutor)_driver).ExecuteScript("return window.getGifRecordingResult();");

                    if (result != null)
                    {
                        var resultDict = result as Dictionary<string, object>;
                        var success = (bool)resultDict["success"];
                        var data = resultDict["data"] as byte[];
                        var error = resultDict["error"] as string;

                        if (success && data != null)
                        {
                            // Clear the result
                            ((IJavaScriptExecutor)_driver).ExecuteScript("window.clearGifRecordingResult();");
                            return data; // Return the GIF data
                        }
                        else
                        {
                            throw new Exception($"GIF recording failed: {error}");
                        }
                    }
                }

                await Task.Delay(pollInterval);
                elapsed += pollInterval;
            }

            throw new TimeoutException("GIF recording timed out");
        }
        catch (Exception ex)
        {
            throw new GifRecordingException($"Failed to record GIF: {ex.Message}", ex);
        }
    }
}
```

This implementation provides a complete solution for GIF recording from your .NET microservice while maintaining good performance and error handling.
