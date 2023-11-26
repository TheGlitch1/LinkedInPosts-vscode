const vscode = acquireVsCodeApi();
var description, code, loader, imageContainer, btnGeneratePost, btnNewPost, btnSharePost, imagePath;
document.addEventListener('DOMContentLoaded', initilise(), false);

function initilise() {
    description = document.getElementById('description');
    code = document.getElementById('code');
    loader = document.getElementById('loader');
    imageContainer = document.getElementById('imageContainer');
    btnGeneratePost = document.getElementById('createPost');
    btnNewPost = document.getElementById('newPost');
    btnSharePost = document.getElementById('sharePost');

    btnNewPost.style.display = 'none';
    btnSharePost.style.display = 'none';
    imagePath = "";
}

document.getElementById('createPost').addEventListener('click', () => {
    // const description = document.getElementById('description').value;
    // const code = document.getElementById('code').value;
    loader.style.display = 'block';
    if (!description.value.trim() || !code.value.trim()) {
        // alert('Please fill in both the description and code fields.');
        loader.style.display = 'none';
        vscode.postMessage({ command: 'showError', message: 'Please fill in both the description and code fields.' });
        return;
    }
    code.style.display = 'none'
    imageContainer.innerHTML = "";
    const readDescription = description.value,
        readCode = code.value
    const postData = { command: 'createImage', description: readDescription, code: readCode };
    vscode.postMessage(postData);
    btnGeneratePost.style.display = 'none';

});

document.getElementById('sharePost').addEventListener('click', () => {
    const description = document.getElementById('description').value;
    const code = document.getElementById('code').value;
    const sharePostData = { command: 'sharePost', description };
    vscode.postMessage(sharePostData);
});

window.addEventListener('message', (event) => {
    const message = event.data;
    resteSidePanel();
    if (message.command === 'imageReady') {

        // code.value = '';
        code.style.display = 'none';
        loader.style.display = 'none';
        // console.log("image path from html", message.imagePath);
        imageContainer.innerHTML = `<img src="${message.imagePath}" alt="Generated Image" />`;
        // imagePath = message.imagePathLocal;
        btnGeneratePost.style.display = 'none';
        btnNewPost.style.display = 'block';
        btnSharePost.style.display = 'block';
    }
    //When no ImageData generated
    else if (message.command === 'imageCreationFailed') {
        loader.style.display = 'none';
        btnGeneratePost.style.display = 'block';
        // if you want to show an error message to the user, you can do that here
        // alert('Failed to create image. Please try again.');
        vscode.postMessage({ command: 'showError', message: 'Failed to create image. Please try again.' });
    }
});

btnNewPost.addEventListener('click', () => {
    resteSidePanel()

});

function resteSidePanel() {
    code.style.display = 'block';
    code.value = '';
    btnGeneratePost.style.display = 'block';
    imageContainer.innerHTML = ""

    btnNewPost.style.display = 'none';
    btnSharePost.style.display = 'none';
}