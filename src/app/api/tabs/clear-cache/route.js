import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Tab cache directory
const TAB_CACHE_DIR = path.join(process.cwd(), 'tab-cache');

/**
 * API endpoint for clearing the tab cache
 * @param {Request} request - The HTTP request object
 * @returns {NextResponse} - JSON response with result
 */
export async function POST() {
  try {
    console.log('Clearing tab cache directory:', TAB_CACHE_DIR);
    
    // Check if the directory exists
    try {
      await fs.access(TAB_CACHE_DIR);
    } catch (err) {
      // Directory doesn't exist, create it
      console.log('Cache directory does not exist, creating it');
      await fs.mkdir(TAB_CACHE_DIR, { recursive: true });
      return NextResponse.json({ message: 'Cache directory created (was empty)' });
    }
    
    // Get all files in the directory
    const files = await fs.readdir(TAB_CACHE_DIR);
    console.log(`Found ${files.length} cached tab files`);
    
    // Delete each file
    for (const file of files) {
      if (file.endsWith('.html')) {
        const filePath = path.join(TAB_CACHE_DIR, file);
        await fs.unlink(filePath);
        console.log(`Deleted: ${filePath}`);
      }
    }
    
    return NextResponse.json({ 
      message: `Cache cleared successfully. Removed ${files.length} files.` 
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: `Failed to clear cache: ${error.message}` },
      { status: 500 }
    );
  }
} 