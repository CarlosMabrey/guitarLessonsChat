import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Directories for storing sample tabs
const SAMPLE_DIR = path.join(process.cwd(), 'tab-samples');

/**
 * Simple endpoint to manually save tab HTML for debugging
 * Similar to how the Python script works
 * @param {Request} request - The HTTP request object
 * @returns {NextResponse} - JSON response with result
 */
export async function GET(request) {
  try {
    // Get URL from request
    const url = new URL(request.url);
    const tabUrl = url.searchParams.get('url');
    
    if (!tabUrl) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }
    
    // Create a filename from the URL
    const filename = tabUrl
      .replace(/^https?:\/\//, '')
      .replace(/\//g, '_')
      .substring(0, 100) + '.html';
    
    // Ensure directory exists
    await fs.mkdir(SAMPLE_DIR, { recursive: true });
    
    // Fetch the HTML directly without any processing
    const response = await fetch(tabUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
        { status: 500 }
      );
    }
    
    // Get raw HTML
    const html = await response.text();
    
    // Save the HTML to a file
    const filePath = path.join(SAMPLE_DIR, filename);
    await fs.writeFile(filePath, html, 'utf8');
    
    // Create a simplified version that's just the <pre> content (like Python script)
    let preContent = '';
    const preRegex = /<pre[^>]*>([\s\S]*?)<\/pre>/gi;
    let match;
    while ((match = preRegex.exec(html)) !== null) {
      preContent += match[1] + '\n\n';
    }
    
    // If we found pre tags, save them separately
    if (preContent.trim()) {
      const preFilePath = path.join(SAMPLE_DIR, 'pre_' + filename);
      await fs.writeFile(preFilePath, preContent, 'utf8');
    }
    
    return NextResponse.json({
      success: true,
      message: `Tab saved to ${filePath}`,
      htmlSize: html.length,
      hasPreTags: preContent.trim().length > 0,
      preContent: preContent.substring(0, 500) + (preContent.length > 500 ? '...' : '')
    });
  } catch (error) {
    console.error('Error saving sample tab:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save sample tab' },
      { status: 500 }
    );
  }
} 