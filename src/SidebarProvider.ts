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
            const imageData = await createCarbonImage(code);
            let imagePath = await openImageInFile(this._context, imageData);
            const imagePathUri = webviewView.webview.asWebviewUri(vscode.Uri.file(imagePath));
            webviewView.webview.postMessage({ command: 'imageReady', imagePath: imagePathUri.toString() }); //hideLoader
        });
    }

    private getWebviewContent(webview: vscode.Webview) {
        // const sidebarHtmlPath = path.join(this._extensionUri.fsPath, 'resources', 'sidebar.html');
        // const sidebarHtmlContent = fs.readFileSync(sidebarHtmlPath, 'utf-8');
        // return sidebarHtmlContent;
        // const loaderPath = this._extensionUri + "/resources/loading.svg";
        const loaderPath  =  webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources', 'loading.svg'));
        console.log(this._extensionUri.fsPath)
        console.log("loader path",loaderPath);

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>LinkedIn Post</title>
            <style>
                body {
                    padding: 15px;
                    font-family: Arial, sans-serif;
                }
                textarea {
                    width: 100%;
                    height: 200px;
                    resize: none;
                }
                button {
                    margin-top: 10px;
                    padding: 5px 15px;
                    font-size: 16px;
                    cursor: pointer;
                }
                #loader {
                    display: none;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            </style>
        </head>
        <body>
            <div>
                <label for="description">Description:</label>
                <input id="description" type="text" />
            </div>
            <div>
                <label for="code">Code:</label>
                <textarea id="code" rows="4" cols="10"></textarea>
                <img id="loader" src="${loaderPath}" alt="Loading..." width="50" height="50" />
                <div id="imageContainer"></div>
            </div>
            <button id="createPost">Create Post</button>
            <script>
                const vscode = acquireVsCodeApi();
                document.getElementById('createPost').addEventListener('click', () => {
                    const description = document.getElementById('description').value;
                    const code = document.getElementById('code').value;
                    const loader = document.getElementById('loader');
                    const imageContainer = document.getElementById('imageContainer');
                    const postData = { description, code };
                    loader.style.display = 'block';
                    vscode.postMessage(postData);
                });

                window.addEventListener('message', (event) => {
                    const message = event.data;
                    if (message.command === 'imageReady') {
                        const loader = document.getElementById('loader');
                        const imageContainer = document.getElementById('imageContainer');
                        loader.style.display = 'none';
                        console.log("image path from html",message.imagePath.path );
                        imageContainer.innerHTML = \`<img src="\${message.imagePath}" alt="Generated Image" />\`;
                    }
                });
            </script>
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