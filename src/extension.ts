// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import open from 'open';
import { LinkedInPostSidebarProvider  } from './SidebarProvider';

let quickLinkedIn: vscode.StatusBarItem;
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "linkedinpost" is now active!');
	/* global registration for tokenAccesss */
	let accessToken = '';

	vscode.window.registerUriHandler({
		handleUri(uri: vscode.Uri) {
			if (uri.path === '/after-auth-2') {
				const userId = uri.fragment;

				// Fetch the access token with the user ID
				const tokenServerURL = `http://localhost:3000/get-access-token-2/${userId}`;
				axios.get(tokenServerURL)
					.then(response => {
						accessToken = response.data.accessToken;
						// Now you have the accessToken. Use it as needed.
					})
					.catch(err => {
						// Handle any errors
						console.error('Failed to get access token', err);
					});
			}
		}
	});
	module.exports = {
		accessToken: accessToken
	};
	
	let disposable = vscode.commands.registerCommand('linkedinpost.helloWorld', () => {

		vscode.window.showInformationMessage('Hello World from LinkedInPost!');
	});
	// console.log("TEST TES TEST TEST")

	quickLinkedIn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
	quickLinkedIn.text = "$(beaker) Quick LinkedIn Post";
	quickLinkedIn.command = 'linkedinpost.createImage';
	quickLinkedIn.show();

	const disposable1 = vscode.commands.registerCommand('linkedinpost.createImage', async () => {
	  const editor = vscode.window.activeTextEditor;
	  console.log("Test create image")
	  if (!editor) {
		vscode.window.showInformationMessage('You need to have a code editor open to use this extension.');
		return;
	  }
  
	  const code = editor.document.getText(editor.selection);
	  if (!code) {
		vscode.window.showInformationMessage('You need to select some code to create an image.');
		return;
	  }
  
	  try {
		const imageData = await createCarbonImage(code);
		console.log('Image data received');
		const imagePath = await openImageInFile(context, imageData);
		vscode.window.showInformationMessage('Image created and opened in the default image viewer.');
		
		//send the generated image to the panel
		await vscode.commands.executeCommand("workbench.action.closeSidebar"); //TODO: to test if 
		vscode.commands.executeCommand('linkedinpost-sidebar.focus');
		const imagePathUri = linkedInPostSidebarProvider._view?.webview.asWebviewUri(vscode.Uri.file(imagePath));
		linkedInPostSidebarProvider._view?.webview.postMessage({ command: 'imageReady', imagePath: imagePathUri?.toString() });
		
	  } catch (error:any) {
		vscode.window.showErrorMessage('Failed to create image: ' + error.message);
		console.error(error);
	  }
	});
  
	//showing bar 
	const linkedInPostSidebarProvider = new LinkedInPostSidebarProvider(context.extensionUri,context);
	const disposable2 = vscode.window.registerWebviewViewProvider("linkedinpost-sidebar", linkedInPostSidebarProvider);
	const disposableExplorer = vscode.window.registerWebviewViewProvider("linkedinpost-explorer", linkedInPostSidebarProvider);

	// context.subscriptions.push(disposable1);
	context.subscriptions.push(disposable,disposable1,disposable2,disposableExplorer);
}

export async function createCarbonImage(code: string): Promise<string | null> {
    const apiAlternatives = [
        'https://carbonara.vercel.app/api/cook',
        'https://carbonara.solopov.dev/api/cook',
        'https://carbonara-42.herokuapp.com/api/cook',
    ];

	let ErrorsStack =  []
    for (let i = 0; i < apiAlternatives.length; i++) {
        try {
            const response = await axios.post(apiAlternatives[i], {
                code,
                theme: 'one-dark',
                exportSize: '2x',
                backgroundColor: 'rgba(255, 255, 255, 0)',
            }, {
                responseType: 'arraybuffer',
            });

            if (response.status === 500) {
                continue; // Skip to the next API alternative
            }

            const imageData = Buffer.from(response.data, 'binary').toString('base64');
            return `data:image/png;base64,${imageData}`;
        } catch (error: any) {
			const errorStack= {
				"endPoint":"",
				"status":"",
			}
            if (error.response && error.response.status === 500 || error.response.status > 500 ) {
				errorStack.endPoint=apiAlternatives[i]
				errorStack.status = error.response.status
				ErrorsStack.push(errorStack)
                continue; // Skip to the next API alternative
            } else {
                throw error; // Rethrow the error if it's not a 500 error
            }
        }
    }
	console.log("APIs out of service" , ErrorsStack);
    return null;
	// throw new Error('Failed to create image using all available API alternatives');
}
  
export async function openImageInFile(context: vscode.ExtensionContext, data: string) {
	const base64Data = data.replace(/^data:image\/png;base64,/, '');
  
	const tempDirUri = vscode.Uri.joinPath(context.extensionUri, '.temp');
	try {
	  await vscode.workspace.fs.stat(tempDirUri);
	} catch (error:any) {
	  if (error.code === 'FileNotFound') {
		await vscode.workspace.fs.createDirectory(tempDirUri);
	  } else {
		throw error;
	  }
	}
  
	const imagePath = vscode.Uri.joinPath(tempDirUri, 'code_image.png');
	const buffer = Buffer.from(base64Data, 'base64');
	await vscode.workspace.fs.writeFile(imagePath, buffer);
	
	console.log('Image saved at:', imagePath.fsPath);
	await vscode.commands.executeCommand('vscode.open', imagePath, {
	  preview: false,
	  viewColumn: vscode.ViewColumn.Beside,
	});
	//TODO: enable when you want to open the image in the default image viewer.
	// await open(imagePath.fsPath);
	return imagePath.fsPath;
  }

async function openImageInBrowser(url: string) {
	console.log("image url", url);
    await vscode.env.openExternal(vscode.Uri.parse(url));
	// await open(url);
}

// This method is called when your extension is deactivated
export function deactivate() {
	quickLinkedIn.dispose();
}


