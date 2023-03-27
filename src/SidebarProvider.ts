import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class LinkedInPostSidebarProvider implements vscode.WebviewViewProvider {
    _view?: vscode.WebviewView;
    _doc?: vscode.TextDocument;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        console.log("Resolving WebviewView");
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this.getWebviewContent();
    }

    private getWebviewContent() {
        // const sidebarHtmlPath = path.join(this._extensionUri.fsPath, 'resources', 'sidebar.html');
        // const sidebarHtmlContent = fs.readFileSync(sidebarHtmlPath, 'utf-8');
        // return sidebarHtmlContent;
    
        return `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>LinkedIn Post</title>
                </head>
                <body>
                    <h1>Hello, LinkedIn Post Sidebar!</h1>
                    <textarea id="code" rows="10" cols="60" maxlength="600"></textarea>
                    <button id="createPost">Create Post</button>
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