import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * API endpoint for logging client-side events
 * Useful for tracking and debugging tab fetching issues
 */
export async function POST(request) {
  try {
    // Get log data from request
    const data = await request.json();
    
    // Add timestamp
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...data
    };
    
    // Ensure logs directory exists
    const logsDir = path.join(process.cwd(), 'logs');
    try {
      await fs.mkdir(logsDir, { recursive: true });
    } catch (err) {
      console.error('Error creating logs directory:', err);
    }
    
    // Write log to file
    const logFile = path.join(logsDir, `tab-debug-${new Date().toISOString().split('T')[0]}.log`);
    
    // Append to log file
    try {
      await fs.appendFile(
        logFile, 
        JSON.stringify(logEntry) + '\n',
        'utf8'
      );
      
      console.log(`Logged event: ${data.event || 'unknown'}`);
      
      return NextResponse.json({ success: true });
    } catch (writeErr) {
      console.error('Error writing to log file:', writeErr);
      return NextResponse.json(
        { error: 'Error writing to log file' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Logging API error:', error);
    return NextResponse.json(
      { error: 'Failed to process log request' },
      { status: 400 }
    );
  }
} 