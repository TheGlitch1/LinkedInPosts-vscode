import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { createCarbonImage, openImageInFile } from './extension';

export class LinkedInPostSidebarProvider implements vscode.WebviewViewProvider {
    _view?: vscode.WebviewView;
    _doc?: vscode.TextDocument;

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
            if(message.command = 'showError'){
                vscode.window.showErrorMessage(message.message);
                return;
            }
            const imageData = await createCarbonImage(code);
            let imagePath = await openImageInFile(this._context, imageData);
            const imagePathUri = webviewView.webview.asWebviewUri(vscode.Uri.file(imagePath));
            webviewView.webview.postMessage({ command: 'imageReady', imagePath: imagePathUri?.toString() }); //hideLoader
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

        console.log(this._extensionUri.fsPath)
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