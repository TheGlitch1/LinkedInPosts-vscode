// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import open from 'open';
import { LinkedInPostSidebarProvider  } from './SidebarProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "linkedinpost" is now active!');
	let disposable = vscode.commands.registerCommand('linkedinpost.helloWorld', () => {

		vscode.window.showInformationMessage('Hello World from LinkedInPost!');
	});
	console.log("TEST TES TEST TEST")
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
		await openImageInFile(context, imageData);
		vscode.window.showInformationMessage('Image created and opened in the default image viewer.');
	  } catch (error:any) {
		vscode.window.showErrorMessage('Failed to create image: ' + error.message);
		console.error(error);
	  }
	});
  
	//showing bar 
	const linkedInPostSidebarProvider = new LinkedInPostSidebarProvider(context.extensionUri,context);
    // context.subscriptions.push(
		const disposable2 = vscode.window.registerWebviewViewProvider("linkedinpost-sidebar", linkedInPostSidebarProvider);
		const disposableExplorer = vscode.window.registerWebviewViewProvider("linkedinpost-explorer", linkedInPostSidebarProvider);
	// );

	// context.subscriptions.push(disposable1);
	context.subscriptions.push(disposable,disposable1,disposable2,disposableExplorer);
}


export async function createCarbonImage(code: string): Promise<string> {
	const response = await axios.post('https://carbonara.vercel.app/api/cook', {
	  code,
	  theme: 'one-dark',
	  exportSize: '2x',
	  backgroundColor: 'rgba(255, 255, 255, 0)',
	}, {
	  responseType: 'arraybuffer',
	});
  
	const imageData = Buffer.from(response.data, 'binary').toString('base64');
	return `data:image/png;base64,${imageData}`;
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
	await open(imagePath.fsPath);
  }

async function openImageInBrowser(url: string) {
	console.log("image url", url);
    await vscode.env.openExternal(vscode.Uri.parse(url));
	// await open(url);
}

// This method is called when your extension is deactivated
export function deactivate() {}
