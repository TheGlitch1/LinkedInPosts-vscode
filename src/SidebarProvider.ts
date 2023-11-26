import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { createCarbonImage, openImageInFile } from './extension';
import { sharePostInLinkedIn } from './linkedInShare';
import { openLinkedInShare } from './linkedInShare';
import axios from 'axios';
import extension = require('./extension');

export class LinkedInPostSidebarProvider implements vscode.WebviewViewProvider {
    _view?: vscode.WebviewView;
    _doc?: vscode.TextDocument;
    private _imagePathLocal?: string;

    constructor(private readonly _extensionUri: vscode.Uri, private _context: vscode.ExtensionContext) {}

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        console.log("Resolving WebviewView");
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this.getWebviewContent(webviewView.webview);

        //Listner postMessage
         // Listen for messages from the webview
         webviewView.webview.onDidReceiveMessage(async (message) => {
             const { code } = message;
            if(message.command == 'showError'){
                 vscode.window.showErrorMessage(message.message);
                 return;
            }
            else if(message.command == 'createImage') {
                const imageData = await createCarbonImage(code);
                if (imageData === null) {
                    vscode.window.showErrorMessage('Failed to create image using all available API alternatives');
                    webviewView.webview.postMessage({ command: 'imageCreationFailed' });
                    return;
                }
                let imagePath = await openImageInFile(this._context, imageData);
                const imagePathUri = webviewView.webview.asWebviewUri(vscode.Uri.file(imagePath));
                webviewView.webview.postMessage({ command: 'imageReady', imagePath: imagePathUri?.toString() }); //hideLoader
                this._imagePathLocal = imagePath;
                console.log("_imagePathLocal set to:", this._imagePathLocal);
            }
            else if (message.command == 'sharePost'){
                console.log('proceess to sharing post')
                console.log("_imagePathLocal set to:", this._imagePathLocal);
                if (!this._imagePathLocal) {
                    console.error('Image path is not defined');
                    return;
                }            
                // Read the image file from the provided path
                const imagePath = this._imagePathLocal;
                const description = message.description;
                const fs = require('fs');
                const imageData = fs.readFileSync(imagePath);
                console.log("Sharing post with description:", description, "and image:", imagePath);
            
                const authServerURL = 'http://localhost:3000/auth/linkedin';
                const tokenServerURL = 'http://localhost:3000/get-access-token';
                
                // Open auth url to allow user to login
                vscode.env.openExternal(vscode.Uri.parse(authServerURL));
            
                // Poll for access token
                
                // let accessToken;
                console.log("Reaching for token in 6sec")
                const getAccessToken = async () => {
                    try {
                        console.log("Checking the global state for the access token");
                        
                        // Poll for the access token from the global state
                        let accessToken = extension.accessToken;
                        console.log('Received access token:', accessToken);
                
                        // If the access token exists, proceed with sharing the post
                        if (accessToken) {
                            const sharePostData = { description, imagePath };
                            const result = await sharePostInLinkedIn(sharePostData, accessToken);
                            // Handle the response from your server (e.g., show a success message, update the UI).
                        }
                    } catch (error) {
                        // Handle the error case (e.g., show an error message).
                        console.error('Failed to get access token', error);
                    }
                }
                
                // Wait for 5 seconds before requesting the token to give the user time to authenticate
                setTimeout(getAccessToken, 10000);
                // Request the access token
                /* //Attempt 2 NOT USED ANYMORE FOR NOW  
                const getAccessToken = async () => {
                    try {
                        console.log("Checking the tokenURL from /after-auth");
                        const response = await axios.get('http://localhost:3000/after-auth');
                        const accessToken = response.data.accessToken;
                        console.log('Received access token:', accessToken);

                        // If the access token exists, proceed with sharing the post
                        if (accessToken) {
                            const sharePostData = { description, imagePath };
                            const result = await sharePostInLinkedIn(sharePostData, accessToken);
                            // Handle the response from your server (e.g., show a success message, update the UI).
                        }
                    } catch (error) {
                        // Handle the error case (e.g., show an error message).
                        console.error('Failed to get access token', error);
                        if (error.response) {
                            // The request was made and the server responded with a status code
                            // that falls out of the range of 2xx
                            console.log(error.response.data);
                            console.log(error.response.status);
                            console.log(error.response.headers);
                          } else if (error.request) {
                            // The request was made but no response was received
                            console.log(error.request);
                          } else {
                            // Something happened in setting up the request that triggered an Error
                            console.log('Error', error.message);
                          }
                          console.log(error.config);
                    }
                }

                 // Wait for 5 seconds before requesting the token to give the user time to authenticate
                setTimeout(getAccessToken, 10000);*/

                //Enable when want to test Polling func
            /* setTimeout(() => {
                const pollForToken = async () => {
                    try {
                        const response = await axios.get(tokenServerURL);
                        const accessToken = response.data.accessToken;
                        console.log("Response of axios is", response.data);
                        console.log('Received access token:', accessToken);
                        if(accessToken){
                            // If the access token exists, proceed with sharing the post
                            const sharePostData = { description, imagePath };
                            const result = await sharePostInLinkedIn(sharePostData, accessToken);
                            // Handle the response from your server (e.g., show a success message, update the UI).
                        } else {
                            // If the access token is not yet available, try again after a delay
                            setTimeout(pollForToken, 2000);
                        }
                    } catch (error) {
                        // Handle the error case (e.g., show an error message).
                        console.error('Failed to get access token', error);
                    }
                }
                
                pollForToken();
            },6000); */
            }
            else if (message.command == 'sharePostOLD'){
                //TODO: I need to implement the LinkedIn API calls here.
                console.log('proceess to sharing post')
                console.log("_imagePathLocal set to:", this._imagePathLocal);
                // Read the image file from the provided path
                const imagePath = this._imagePathLocal;
                const description = message.description;
                // openLinkedInShare(description); // NOT WORKING
                const fs = require('fs');
                const imageData = fs.readFileSync(imagePath);
                console.log("Sharing post with description:", description, "and image:", imagePath);
                //TODO: authenticate your app, obtain access tokens, and use the LinkedIn API to upload the image
                const serverURL = 'http://localhost:3000/auth/linkedin/callback';
                //Stock token returned.
                vscode.env.openExternal(vscode.Uri.parse(serverURL));
                if(imagePath){
                    const sharePostData = { description, imagePath };
                    try {
                        const result = await sharePostInLinkedIn(sharePostData,""); // changed the function to include the token 
                        // Handle the response from your server (e.g., show a success message, update the UI).
                    } catch (error) {
                        // Handle the error case (e.g., show an error message).
                    }
                }
                
            }
        });
    }

    private getWebviewContent(webview: vscode.Webview) {
        // const sidebarHtmlPath = path.join(this._extensionUri.fsPath, 'resources', 'sidebar.html');
        // const sidebarHtmlContent = fs.readFileSync(sidebarHtmlPath, 'utf-8');
        // return sidebarHtmlContent;
        // const loaderPath = this._extensionUri + "/resources/loading.svg";
        const loaderPath  =  webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources/assets/', 'loading.svg'));
        const cssPath = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources/pages', 'sidebar.css'));
        const jsPath = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources/pages', 'sidebar.js'));

        console.log(this._extensionUri.fsPath);
        console.log("loader path",loaderPath);

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>LinkedIn Post</title>
            <link rel="stylesheet" type="text/css" href="${cssPath}">           
        </head>
        <body>
            <div>
                <label for="description">Description:</label>
                <textarea id="description" rows="4" cols="10" maxlength="1300"></textarea>
            </div>
            <div>
                <label for="code">Code:</label>
                <textarea id="code" rows="4" cols="10" maxlength="800"></textarea>
                <img id="loader" src="${loaderPath}" alt="Loading..." width="50" height="50" />
                <div id="imageContainer"></div>
            </div>
            <button id="createPost">Create Post</button>
            <button id="newPost">New Post</button>
            <button id="sharePost">share Post</button>
            <script src="${jsPath}"></script>
        </body>
        </html>`;
    }
}

// function getWebViewContent() {
//     return `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>LinkedIn Post</title>
//       </head>
//       <body>
//           <textarea id="code" rows="10" cols="60" maxlength="600"></textarea>
//           <button id="createPost">Create Post</button>
  
//           <script>
//               const vscode = acquireVsCodeApi();
  
//               document.getElementById('createPost').addEventListener('click', () => {
//                   const code = document.getElementById('code').value;
//                   vscode.postMessage({ command: 'createImage', code: code });
//               });
//           </script>
//       </body>
//       </html>`;
// }