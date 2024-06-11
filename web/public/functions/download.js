/* eslint-disable no-undef */
/* eslint-disable no-loop-func */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.cid === "screenshot") {
        const { image, x, y, w, h } = request; // base64
        const canvas = document.createElement("canvas");
        canvas.width = document.documentElement.clientWidth;
        canvas.height = document.documentElement.clientHeight;
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.src = image;
        img.onload = () => {
            ctx.drawImage(img, 0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
            const link = document.createElement('a');
            link.download = `${Date.now()}.png`;
            link.href = canvas.toDataURL()
            link.click();
        }
    }
});

async function downloadHTML(element, ask = true) {


    // Documentation - https://searchcode.com/file/293905669/wp-content/plugins/wp-user-frontend/assets/vendor/sweetalert2/dist/sweetalert2.js/
    const result = ask ? await new swal({
        title: `Download Content`,
        text: 'Are you sure you want to download content?',
        icon: 'info',
        confirmButtonText: 'Download',
        confirmButtonColor: '#3085d6',
        cancelButtonText: 'Cancel',
        showCancelButton: true,
        cancelButtonColor: '#aaa'
    }) : { isConfirmed: true };

    console.log(result);
    if (result.isConfirmed) {
        const bound = element.getBoundingClientRect();
        const x = bound.left;
        const y = bound.top;
        const w = bound.width;
        const h = bound.height;
        chrome.runtime.sendMessage({ cid: "screenshot", x, y, w, h });
    }

}