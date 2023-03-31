const vscode = acquireVsCodeApi();
var description, code, loader, btnGeneratePost, btnNewPost, btnSharePost;
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
    } else {
        code.style.display = 'none'
        imageContainer.innerHTML = "";
        const postData = { description: description.value, code: code.value };
        vscode.postMessage(postData);
        btnGeneratePost.style.display = 'none';
    }
});

window.addEventListener('message', (event) => {
    const message = event.data;
    if (message.command === 'imageReady') {

        code.value = '';
        code.style.display = 'none';
        loader.style.display = 'none';
        console.log("image path from html", message.imagePath.path);
        imageContainer.innerHTML = `<img src="${message.imagePath}" alt="Generated Image" />`;
        btnGeneratePost.style.display = 'none';
        btnNewPost.style.display = 'block';
        btnSharePost.style.display = 'block';
    }
});

btnNewPost.addEventListener('click', () => {
    code.style.display = 'block';
    code.value = '';
    btnGeneratePost.style.display = 'block';

    btnNewPost.style.display = 'none';
    btnSharePost.style.display = 'none';
});