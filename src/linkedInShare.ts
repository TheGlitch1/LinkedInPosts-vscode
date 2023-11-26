import axios from 'axios';
import * as vscode from 'vscode';

async function sharePostInLinkedIn(sharePostData: { description: string; imagePath: string },accessToken: string): Promise<any> {
  try {
    const response = await axios.post('http://localhost:3000/share-post', sharePostData,{
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    // Handle the response from your server (e.g., show a success message, update the UI).
    return response.data;
  } catch (error) {
    // Handle the error case (e.g., show an error message).
    throw new Error('Failed to share post');
  }
}


function openLinkedInShare(description: string) {
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(description)}`;
  vscode.env.openExternal(vscode.Uri.parse(url));
}

export { sharePostInLinkedIn, openLinkedInShare };